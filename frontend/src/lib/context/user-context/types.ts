import { Tokens } from "@/lib/typings/auth-typings";
import { User } from "@/lib/typings/models";

export type UserContextOptions = {
  user: User | null;
  tokens: Tokens | null;
  setUser: (user: User | null) => void;
  setTokens: (tokens: Tokens | null) => void;
};
