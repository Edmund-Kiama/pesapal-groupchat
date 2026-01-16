"use client";

import React, { PropsWithChildren } from "react";
import { UserContextProvider } from "./user-context";
import { SidebarProvider } from "./sidebar-context";
import { WorkflowContextProvider } from "./workflows-context";

function AppContext({ children }: PropsWithChildren) {
  return (
    <UserContextProvider>
      <SidebarProvider>
        <WorkflowContextProvider>{children}</WorkflowContextProvider>
      </SidebarProvider>
    </UserContextProvider>
  );
}

export default AppContext;
