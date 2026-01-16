"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Select({
  value,
  onValueChange,
  children,
  disabled,
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  );
}

export function SelectTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className || ""}`}>
      {children}
      <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  );
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return <option value={value}>{children}</option>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <option value="">{placeholder || "Select an option"}</option>;
}
