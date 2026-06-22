"use client";
import { createContext, useContext } from "react";
import type { Plan } from "@/lib/plan";

type ModullerContextType = {
  moduller: Record<string, string>;
  setModul: (key: string, value: string) => void;
  plan: Plan;
};

export const ModullerContext = createContext<ModullerContextType>({
  moduller: {},
  setModul: () => {},
  plan: "pro",
});

export const useModuller = () => useContext(ModullerContext);
