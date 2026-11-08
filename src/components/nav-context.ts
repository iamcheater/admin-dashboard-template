import { createContext, useContext } from "react";

export interface NavControl {
  openNav: () => void;
}

export const NavContext = createContext<NavControl | null>(null);

export const useNav = () => useContext(NavContext);
