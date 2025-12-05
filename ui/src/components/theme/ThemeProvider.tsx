"use client";

import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <div className="min-h-screen bg-background text-text-primary">{children}</div>;
}
