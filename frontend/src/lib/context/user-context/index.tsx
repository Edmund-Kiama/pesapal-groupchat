import { createContext, useContext, PropsWithChildren } from "react";
import { useSessionStorage } from "usehooks-ts";
import { UserContextOptions } from "./types";
import { Tokens } from "@/lib/typings/auth-typings";
import { User } from "@/lib/typings/models";

const UserContext = createContext<UserContextOptions | undefined>(undefined);

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useSessionStorage<User | null>("user-session", null);
  const [tokens, setTokens] = useSessionStorage<Tokens | null>(
    "session-tokens",
    null
  );

  return (
    <UserContext.Provider value={{ user, tokens, setTokens, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContext) as UserContextOptions;
  return ctx;
};
