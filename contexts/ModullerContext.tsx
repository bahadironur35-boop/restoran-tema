"use client";
import { createContext, useContext } from "react";

type ModullerContextType = {
  moduller: Record<string, string>;
  setModul: (key: string, value: string) => void;
};

export const ModullerContext = createContext<ModullerContextType>({
  moduller: {},
  setModul: () => {},
});

export const useModuller = () => useContext(ModullerContext);
