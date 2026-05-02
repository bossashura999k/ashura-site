export type ChessColor = "white" | "black";

export interface ChessUser {
  username: string;
  password: string;
  color: ChessColor;
}

export const USERS: ChessUser[] = [
  {
    username: process.env.WHITE_USERNAME ?? "white",
    password: process.env.CHESS_PASSWORD ?? "white123",
    color: "white",
  },
  {
    username: process.env.BLACK_USERNAME ?? "black",
    password: process.env.CHESS_PASSWORD ?? "black123",
    color: "black",
  },
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
