export type ChessColor = "white" | "black";

export interface ChessUser {
  username: string;
  password: string;
  color: ChessColor;
}

export const USERS: ChessUser[] = [
  { username: "white", password: "white123", color: "white" },
  { username: "black", password: "black123", color: "black" },
];

export function findUser(
  username: string,
  password: string,
): ChessUser | null {
  const user = USERS.find(
    (u) => u.username === username && u.password === password,
  );
  return user ?? null;
}

export function findUserByName(username: string): ChessUser | null {
  return USERS.find((u) => u.username === username) ?? null;
}
