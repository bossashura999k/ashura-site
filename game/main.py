import pygame
import random
import math
import sys
import asyncio                # ← added for web support
from pygame import mixer

# Initialize pygame
pygame.init()
mixer.init()

# Constants
SCREEN_WIDTH = 1200
SCREEN_HEIGHT = 800
FPS = 60
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 50, 50)
GREEN = (50, 255, 50)
BLUE = (50, 150, 255)
YELLOW = (255, 255, 50)
PURPLE = (180, 70, 255)

class Player:
    def __init__(self):
        self.image = pygame.Surface((50, 40), pygame.SRCALPHA)
        # Draw a simple spaceship shape
        points = [(25, 0), (45, 35), (25, 30), (5, 35)]
        pygame.draw.polygon(self.image, BLUE, points)
        pygame.draw.polygon(self.image, (100, 200, 255), points, 2)
        
        self.rect = self.image.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT-100))
        self.speed = 7
        self.last_shot = 0
        self.shoot_delay = 200  # milliseconds
        self.lives = 3
        self.score = 0
        self.invulnerable = 0
        self.is_alive = True
        
    def update(self, keys, current_time):
        if not self.is_alive:
            return False
            
        # Movement
        if keys[pygame.K_LEFT] and self.rect.left > 0:
            self.rect.x -= self.speed
        if keys[pygame.K_RIGHT] and self.rect.right < SCREEN_WIDTH:
            self.rect.x += self.speed
        if keys[pygame.K_UP] and self.rect.top > 0:
            self.rect.y -= self.speed
        if keys[pygame.K_DOWN] and self.rect.bottom < SCREEN_HEIGHT:
            self.rect.y += self.speed
            
        # Shooting with spacebar
        if keys[pygame.K_SPACE] and current_time - self.last_shot > self.shoot_delay:
            self.last_shot = current_time
            return True
        return False
        
    def draw(self, screen):
        if self.is_alive:
            # Draw invulnerability effect
            if self.invulnerable > 0:
                alpha = 128 + 127 * math.sin(pygame.time.get_ticks() / 100)
                temp_image = self.image.copy()
                temp_image.fill((255, 255, 255, alpha), special_flags=pygame.BLEND_RGBA_MULT)
                screen.blit(temp_image, self.rect)
            else:
                screen.blit(self.image, self.rect)
                
            # Draw engine effect
            if pygame.time.get_ticks() % 200 < 100:
                engine_points = [(self.rect.centerx-5, self.rect.bottom+5),
                               (self.rect.centerx+5, self.rect.bottom+5),
                               (self.rect.centerx, self.rect.bottom+15)]
                pygame.draw.polygon(screen, YELLOW, engine_points)
                
    def take_damage(self):
        if self.invulnerable <= 0:
            self.lives -= 1
            self.invulnerable = 2000  # 2 seconds of invulnerability
            if self.lives <= 0:
                self.is_alive = False
            return True
        return False
        
    def update_invulnerability(self, dt):
        if self.invulnerable > 0:
            self.invulnerable -= dt

class Bullet:
    def __init__(self, x, y, is_player=True):
        self.is_player = is_player
        if is_player:
            self.image = pygame.Surface((4, 20), pygame.SRCALPHA)
            pygame.draw.rect(self.image, GREEN, (0, 0, 4, 20))
            pygame.draw.rect(self.image, YELLOW, (0, 0, 4, 5))
            self.speed = -10
        else:
            self.image = pygame.Surface((8, 15), pygame.SRCALPHA)
            pygame.draw.rect(self.image, RED, (0, 0, 8, 15))
            pygame.draw.ellipse(self.image, YELLOW, (0, 0, 8, 8))
            self.speed = 7
            
        self.rect = self.image.get_rect(center=(x, y))
        
    def update(self):
        self.rect.y += self.speed
        return self.rect.bottom < 0 or self.rect.top > SCREEN_HEIGHT
        
    def draw(self, screen):
        screen.blit(self.image, self.rect)

class Enemy:
    def __init__(self):
        self.size = random.randint(30, 50)
        self.image = pygame.Surface((self.size, self.size), pygame.SRCALPHA)
        
        # Draw alien shape
        pygame.draw.ellipse(self.image, RED, (0, 0, self.size, self.size))
        pygame.draw.ellipse(self.image, (255, 150, 150), (5, 5, self.size-10, self.size-10))
        
        # Alien eyes
        pygame.draw.ellipse(self.image, BLACK, (self.size//4, self.size//3, 8, 8))
        pygame.draw.ellipse(self.image, BLACK, (3*self.size//4-8, self.size//3, 8, 8))
        
        self.rect = self.image.get_rect(center=(random.randint(50, SCREEN_WIDTH-50), -50))
        self.speed = random.uniform(1.5, 3.5)
        self.health = 1
        self.score_value = 10
        
    def update(self):
        self.rect.y += self.speed
        return self.rect.top > SCREEN_HEIGHT
        
    def draw(self, screen):
        # Add floating animation
        offset = math.sin(pygame.time.get_ticks() / 200) * 2
        screen.blit(self.image, (self.rect.x, self.rect.y + offset))
        
    def take_damage(self):
        self.health -= 1
        return self.health <= 0

class Boss:
    def __init__(self):
        self.width = 200
        self.height = 150
        self.image = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        
        # Draw boss shape
        pygame.draw.ellipse(self.image, PURPLE, (0, 0, self.width, self.height))
        pygame.draw.ellipse(self.image, (200, 100, 255), (10, 10, self.width-20, self.height-20))
        
        # Boss details
        for i in range(3):
            x_pos = (i+1) * self.width//4
            pygame.draw.ellipse(self.image, RED, (x_pos-15, 20, 30, 30))
            pygame.draw.ellipse(self.image, BLACK, (x_pos-8, 27, 16, 16))
            
        self.rect = self.image.get_rect(center=(SCREEN_WIDTH//2, 100))
        self.health = 15
        self.max_health = 15
        self.speed = 1.5
        self.direction = 1
        self.last_shot = 0
        self.shoot_delay = 1000  # milliseconds
        self.shots_fired = 0
        
    def update(self, current_time, player_pos):
        # Move side to side
        self.rect.x += self.speed * self.direction
        if self.rect.left <= 50 or self.rect.right >= SCREEN_WIDTH-50:
            self.direction *= -1
            
        # Shooting at player
        if current_time - self.last_shot > self.shoot_delay:
            self.last_shot = current_time
            self.shots_fired += 1
            
            # Fire multiple bullets in different patterns
            bullets = []
            # Direct shot at player
            bullets.append(Bullet(self.rect.centerx, self.rect.bottom, False))
            
            # Patterned shots every few shots
            if self.shots_fired % 3 == 0:
                bullets.append(Bullet(self.rect.left+30, self.rect.bottom, False))
                bullets.append(Bullet(self.rect.right-30, self.rect.bottom, False))
            if self.shots_fired % 5 == 0:
                # Spread shot
                for i in range(-2, 3):
                    bullet = Bullet(self.rect.centerx, self.rect.bottom, False)
                    bullet.speed = 7
                    bullet.rect.x += i * 15
                    bullets.append(bullet)
                    
            return bullets
        return []
        
    def draw(self, screen):
        # Draw boss with pulsing effect when damaged
        if self.health < self.max_health:
            pulse = abs(math.sin(pygame.time.get_ticks() / 200)) * 50
            temp_color = (min(255, PURPLE[0] + pulse), 
                         min(255, PURPLE[1] + pulse), 
                         min(255, PURPLE[2] + pulse))
            temp_image = self.image.copy()
            temp_image.fill(temp_color, special_flags=pygame.BLEND_RGB_ADD)
            screen.blit(temp_image, self.rect)
        else:
            screen.blit(self.image, self.rect)
            
        # Draw health bar
        bar_width = 200
        bar_height = 20
        bar_x = SCREEN_WIDTH//2 - bar_width//2
        bar_y = 20
        
        # Background
        pygame.draw.rect(screen, (50, 50, 50), (bar_x, bar_y, bar_width, bar_height))
        # Health
        health_width = (self.health / self.max_health) * bar_width
        health_color = (int(255 * (1 - self.health/self.max_health)), 
                       int(255 * (self.health/self.max_health)), 
                       0)
        pygame.draw.rect(screen, health_color, (bar_x, bar_y, health_width, bar_height))
        # Border
        pygame.draw.rect(screen, WHITE, (bar_x, bar_y, bar_width, bar_height), 2)
        
        # Boss text
        font = pygame.font.SysFont(None, 36)
        text = font.render("BOSS", True, RED)
        screen.blit(text, (SCREEN_WIDTH//2 - text.get_width()//2, bar_y + 25))
        
    def take_damage(self):
        self.health -= 1
        return self.health <= 0

class Particle:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.color = color
        self.size = random.randint(2, 6)
        self.speed_x = random.uniform(-3, 3)
        self.speed_y = random.uniform(-3, 3)
        self.lifetime = random.randint(20, 40)
        
    def update(self):
        self.x += self.speed_x
        self.y += self.speed_y
        self.lifetime -= 1
        self.size = max(0, self.size - 0.1)
        return self.lifetime <= 0
        
    def draw(self, screen):
        pygame.draw.circle(screen, self.color, (int(self.x), int(self.y)), int(self.size))

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Space Shooter")
        self.clock = pygame.time.Clock()          # kept but not used in the async loop
        self.running = True
        self.game_state = "menu"  # menu, playing, game_over
        self.fullscreen = False
        
        # Game objects
        self.player = None
        self.bullets = []
        self.enemies = []
        self.boss = None
        self.particles = []
        
        # Game variables
        self.enemy_spawn_timer = 0
        self.enemy_spawn_delay = 800  # milliseconds
        self.game_time = 0
        self.boss_spawned = False
        self.boss_defeated = False
        
        # Load sounds (simplified for web)
        self.setup_audio()
        
        # Menu
        self.menu_options = ["Start Game", "Toggle Fullscreen", "Quit"]
        self.selected_option = 0
        
    def setup_audio(self):
        """Simplified audio setup that works in the browser."""
        try:
            # Try to load background music (optional)
            try:
                mixer.music.load('Big-JW.wav')   # if you have this file, place it alongside main.py
                self.has_music = True
            except:
                self.has_music = False
                print("Music file not found – continuing without music")

            # Create silent placeholder sounds for effects
            self.shoot_sound = mixer.Sound(buffer=bytes([0]*1000))
            self.shoot_sound.set_volume(0.5)

            self.explosion_sound = mixer.Sound(buffer=bytes([0]*2000))
            self.explosion_sound.set_volume(0.6)

        except Exception as e:
            print(f"Audio init error: {e} – game will run without sound")
            self.shoot_sound = None
            self.explosion_sound = None
            self.has_music = False

    def create_particle_explosion(self, x, y, color, count=30):
        for _ in range(count):
            self.particles.append(Particle(x, y, color))
            
    def spawn_enemy(self):
        self.enemies.append(Enemy())
        
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
                
            if self.game_state == "menu":
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_UP:
                        self.selected_option = (self.selected_option - 1) % len(self.menu_options)
                    elif event.key == pygame.K_DOWN:
                        self.selected_option = (self.selected_option + 1) % len(self.menu_options)
                    elif event.key == pygame.K_RETURN:
                        if self.selected_option == 0:  # Start Game
                            self.start_game()
                        elif self.selected_option == 1:  # Toggle Fullscreen
                            self.toggle_fullscreen()
                        elif self.selected_option == 2:  # Quit
                            self.running = False
                            
            elif self.game_state == "playing":
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        self.game_state = "menu"
                        mixer.music.stop()
                    elif event.key == pygame.K_f:
                        self.toggle_fullscreen()
                        
            elif self.game_state == "game_over":
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_RETURN:
                        self.game_state = "menu"
                    elif event.key == pygame.K_ESCAPE:
                        self.running = False
                        
    def toggle_fullscreen(self):
        self.fullscreen = not self.fullscreen
        if self.fullscreen:
            self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.FULLSCREEN)
        else:
            self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
            
    def start_game(self):
        self.player = Player()
        self.bullets = []
        self.enemies = []
        self.boss = None
        self.particles = []
        self.game_time = 0
        self.boss_spawned = False
        self.boss_defeated = False
        self.game_state = "playing"
        
        # Start background music only if available
        if self.has_music:
            mixer.music.play(-1)
        
    def update(self, dt):
        if self.game_state != "playing":
            return
            
        current_time = pygame.time.get_ticks()
        keys = pygame.key.get_pressed()
        
        # Update player
        if self.player.is_alive:
            if self.player.update(keys, current_time):
                self.bullets.append(Bullet(self.player.rect.centerx, self.player.rect.top))
                if self.shoot_sound:
                    self.shoot_sound.play()
                
            self.player.update_invulnerability(dt)
            
            # Update game timer and spawn boss after 30 seconds
            self.game_time += dt
            if not self.boss_spawned and self.game_time >= 30000:  # 30 seconds
                self.boss = Boss()
                self.boss_spawned = True
                
        # Spawn enemies
        if current_time - self.enemy_spawn_timer > self.enemy_spawn_delay:
            self.enemy_spawn_timer = current_time
            self.spawn_enemy()
            
        # Update bullets
        for bullet in self.bullets[:]:
            if bullet.update():
                self.bullets.remove(bullet)
                
        # Update enemies
        for enemy in self.enemies[:]:
            if enemy.update():
                self.enemies.remove(enemy)
            else:
                # Check collision with player
                if (self.player.is_alive and self.player.invulnerable <= 0 and 
                    enemy.rect.colliderect(self.player.rect)):
                    if self.player.take_damage():
                        self.create_particle_explosion(self.player.rect.centerx, self.player.rect.centery, BLUE, 50)
                        if self.explosion_sound:
                            self.explosion_sound.play()
                    self.enemies.remove(enemy)
                    self.create_particle_explosion(enemy.rect.centerx, enemy.rect.centery, RED, 30)
                    if self.explosion_sound:
                        self.explosion_sound.play()
                    
        # Update boss
        if self.boss and not self.boss_defeated:
            boss_bullets = self.boss.update(current_time, 
                                           self.player.rect.center if self.player.is_alive else (SCREEN_WIDTH//2, SCREEN_HEIGHT//2))
            self.bullets.extend(boss_bullets)
            
            # Check collision with player
            if (self.player.is_alive and self.player.invulnerable <= 0 and 
                self.boss.rect.colliderect(self.player.rect)):
                if self.player.take_damage():
                    self.create_particle_explosion(self.player.rect.centerx, self.player.rect.centery, BLUE, 50)
                    if self.explosion_sound:
                        self.explosion_sound.play()
                    
        # Update particles
        for particle in self.particles[:]:
            if particle.update():
                self.particles.remove(particle)
                
        # Check collisions between bullets and enemies/boss
        for bullet in self.bullets[:]:
            # Player bullets
            if bullet.is_player:
                # Check collision with enemies
                for enemy in self.enemies[:]:
                    if bullet.rect.colliderect(enemy.rect):
                        if bullet in self.bullets:
                            self.bullets.remove(bullet)
                        if enemy.take_damage():
                            self.player.score += enemy.score_value
                            self.enemies.remove(enemy)
                            self.create_particle_explosion(enemy.rect.centerx, enemy.rect.centery, YELLOW, 40)
                            if self.explosion_sound:
                                self.explosion_sound.play()
                        break
                        
                # Check collision with boss
                if self.boss and not self.boss_defeated and bullet.rect.colliderect(self.boss.rect):
                    if bullet in self.bullets:
                        self.bullets.remove(bullet)
                    if self.boss.take_damage():
                        self.player.score += 500
                        self.boss_defeated = True
                        self.create_particle_explosion(self.boss.rect.centerx, self.boss.rect.centery, PURPLE, 200)
                        if self.explosion_sound:
                            self.explosion_sound.play()
                        
            # Enemy bullets
            else:
                if (self.player.is_alive and self.player.invulnerable <= 0 and 
                    bullet.rect.colliderect(self.player.rect)):
                    if bullet in self.bullets:
                        self.bullets.remove(bullet)
                    if self.player.take_damage():
                        self.create_particle_explosion(self.player.rect.centerx, self.player.rect.centery, BLUE, 50)
                        if self.explosion_sound:
                            self.explosion_sound.play()
                        
        # Game over check
        if not self.player.is_alive or (self.boss_defeated and len(self.enemies) == 0):
            self.game_state = "game_over"
            mixer.music.stop()
            
    def draw_background(self):
        # Starfield background
        self.screen.fill(BLACK)
        
        # Draw stars
        for i in range(100):
            x = (pygame.time.get_ticks() // 20 + i * 100) % SCREEN_WIDTH
            y = (i * 20) % SCREEN_HEIGHT
            size = (i % 3) + 1
            brightness = 150 + 105 * math.sin(pygame.time.get_ticks() / 1000 + i)
            color = (brightness, brightness, brightness)
            pygame.draw.circle(self.screen, color, (int(x), int(y)), size)
            
    def draw_menu(self):
        self.draw_background()
        
        # Title
        title_font = pygame.font.SysFont(None, 80)
        title = title_font.render("SPACE SHOOTER", True, BLUE)
        title_shadow = title_font.render("SPACE SHOOTER", True, WHITE)
        self.screen.blit(title_shadow, (SCREEN_WIDTH//2 - title.get_width()//2 + 3, 103))
        self.screen.blit(title, (SCREEN_WIDTH//2 - title.get_width()//2, 100))
        
        # Draw a ship
        ship_points = [(SCREEN_WIDTH//2, 250), (SCREEN_WIDTH//2+40, 300), 
                      (SCREEN_WIDTH//2, 280), (SCREEN_WIDTH//2-40, 300)]
        pygame.draw.polygon(self.screen, BLUE, ship_points)
        
        # Menu options
        option_font = pygame.font.SysFont(None, 50)
        for i, option in enumerate(self.menu_options):
            color = GREEN if i == self.selected_option else WHITE
            text = option_font.render(option, True, color)
            rect = text.get_rect(center=(SCREEN_WIDTH//2, 400 + i * 60))
            
            # Draw selection indicator
            if i == self.selected_option:
                pygame.draw.rect(self.screen, GREEN, (rect.x-20, rect.y-5, rect.width+40, rect.height+10), 2)
                
            self.screen.blit(text, rect)
            
        # Instructions
        inst_font = pygame.font.SysFont(None, 30)
        instructions = [
            "Use ARROW KEYS to move and SPACE to shoot",
            "Press ESC to return to menu during game",
            "Press F to toggle fullscreen"
        ]
        
        for i, line in enumerate(instructions):
            text = inst_font.render(line, True, YELLOW)
            self.screen.blit(text, (SCREEN_WIDTH//2 - text.get_width()//2, 600 + i * 35))
            
    def draw_game(self):
        self.draw_background()
        
        # Draw all game objects
        for particle in self.particles:
            particle.draw(self.screen)
            
        for bullet in self.bullets:
            bullet.draw(self.screen)
            
        for enemy in self.enemies:
            enemy.draw(self.screen)
            
        if self.boss and not self.boss_defeated:
            self.boss.draw(self.screen)
            
        if self.player.is_alive:
            self.player.draw(self.screen)
            
        # Draw HUD
        self.draw_hud()
        
    def draw_hud(self):
        # Score
        font = pygame.font.SysFont(None, 36)
        score_text = font.render(f"Score: {self.player.score}", True, GREEN)
        self.screen.blit(score_text, (20, 20))
        
        # Lives
        lives_text = font.render(f"Lives: {self.player.lives}", True, GREEN)
        self.screen.blit(lives_text, (20, 60))
        
        # Time
        time_text = font.render(f"Time: {self.game_time//1000}s", True, GREEN)
        self.screen.blit(time_text, (20, 100))
        
        # Boss timer
        if not self.boss_spawned:
            time_left = max(0, 30 - self.game_time//1000)
            boss_timer = font.render(f"Boss in: {time_left}s", True, RED)
            self.screen.blit(boss_timer, (SCREEN_WIDTH - boss_timer.get_width() - 20, 20))
        elif self.boss and not self.boss_defeated:
            boss_text = font.render("BOSS FIGHT!", True, RED)
            self.screen.blit(boss_text, (SCREEN_WIDTH - boss_text.get_width() - 20, 20))
            
        # Controls reminder
        controls_font = pygame.font.SysFont(None, 24)
        controls = controls_font.render("Arrow Keys: Move | Space: Shoot | ESC: Menu | F: Fullscreen", True, YELLOW)
        self.screen.blit(controls, (SCREEN_WIDTH//2 - controls.get_width()//2, SCREEN_HEIGHT - 30))
        
    def draw_game_over(self):
        self.draw_background()
        
        # Game Over text
        font = pygame.font.SysFont(None, 100)
        game_over = font.render("GAME OVER", True, RED)
        self.screen.blit(game_over, (SCREEN_WIDTH//2 - game_over.get_width()//2, 200))
        
        # Score
        score_font = pygame.font.SysFont(None, 60)
        score_text = score_font.render(f"Final Score: {self.player.score}", True, GREEN)
        self.screen.blit(score_text, (SCREEN_WIDTH//2 - score_text.get_width()//2, 320))
        
        # Boss status
        boss_status = ""
        if self.boss_defeated:
            boss_status = "BOSS DEFEATED! +500 points"
        elif self.boss_spawned:
            boss_status = "BOSS ENCOUNTERED"
        else:
            boss_status = f"Reached {self.game_time//1000} seconds"
            
        status_font = pygame.font.SysFont(None, 40)
        status_text = status_font.render(boss_status, True, YELLOW)
        self.screen.blit(status_text, (SCREEN_WIDTH//2 - status_text.get_width()//2, 400))
        
        # Instructions
        inst_font = pygame.font.SysFont(None, 36)
        inst1 = inst_font.render("Press ENTER to return to menu", True, WHITE)
        inst2 = inst_font.render("Press ESC to quit", True, WHITE)
        
        self.screen.blit(inst1, (SCREEN_WIDTH//2 - inst1.get_width()//2, 500))
        self.screen.blit(inst2, (SCREEN_WIDTH//2 - inst2.get_width()//2, 550))

    # NEW ASYNC RUN METHOD
    async def run(self):
        last_time = pygame.time.get_ticks()
        while self.running:
            current_time = pygame.time.get_ticks()
            dt = current_time - last_time
            last_time = current_time

            self.handle_events()

            if self.game_state == "menu":
                self.draw_menu()
            elif self.game_state == "playing":
                self.update(dt)
                self.draw_game()
            elif self.game_state == "game_over":
                self.draw_game_over()

            pygame.display.flip()
            await asyncio.sleep(0)   # critical: lets the browser update

# ENTRY POINT
if __name__ == "__main__":
    game = Game()
    asyncio.run(game.run())
