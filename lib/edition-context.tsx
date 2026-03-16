"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Edition = "personal" | "enterprise" | "government";

interface EditionContextType {
  edition: Edition;
  setEdition: (e: Edition) => void;
}

const EditionContext = createContext<EditionContextType>({
  edition: "personal",
  setEdition: () => {},
});

export function EditionProvider({ children }: { children: ReactNode }) {
  const [edition, setEditionState] = useState<Edition>("personal");

  useEffect(() => {
    const saved = localStorage.getItem("smarttravel-edition") as Edition | null;
    if (saved && ["personal", "enterprise", "government"].includes(saved)) {
      setEditionState(saved);
    }
  }, []);

  const setEdition = (e: Edition) => {
    setEditionState(e);
    localStorage.setItem("smarttravel-edition", e);
  };

  return (
    <EditionContext.Provider value={{ edition, setEdition }}>
      {children}
    </EditionContext.Provider>
  );
}

export function useEdition() {
  return useContext(EditionContext);
}
