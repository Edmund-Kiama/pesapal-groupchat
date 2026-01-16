"use client";

import { createContext, PropsWithChildren, useContext } from "react";

import { useSessionStorage } from "usehooks-ts";
import { SidebarContextOptions, SidebarState } from "./types";

const SidebarContext = createContext<SidebarContextOptions | undefined>(
  undefined
);

export const SidebarProvider = ({ children }: PropsWithChildren) => {
  const [sidebarState, setSidebarState] = useSessionStorage<SidebarState>(
    "sidebar-state",
    SidebarState.expanded
  );

  return (
    <SidebarContext.Provider
      value={{ state: sidebarState, onStateChanged: setSidebarState }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const ctx = useContext(SidebarContext) as SidebarContextOptions;
  return ctx;
};
