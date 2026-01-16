"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  children: ReactNode;
  defaultValue: string;
}

export function Tabs({ children, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return <div className={`flex border-b ${className || ""}`}>{children}</div>;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TabsTrigger({
  value,
  children,
  className,
  onClick,
}: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      onClick={() => {
        context.setActiveTab(value);
        onClick?.();
      }}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      } ${className || ""}`}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return <div className={className}>{children}</div>;
}
