import { createContext, useContext, useState, ReactNode } from "react";

type SubscriptionType = "none" | "module" | "annual";

interface SubscriptionState {
  type: SubscriptionType;
  unlockedModules: string[];
}

interface SubscriptionContextType {
  subscription: SubscriptionState;
  unlockModule: (moduleId: string) => void;
  unlockAnnual: () => void;
  isModuleUnlocked: (moduleId: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    type: "none",
    unlockedModules: [],
  });

  const unlockModule = (moduleId: string) => {
    setSubscription((prev) => ({
      ...prev,
      type: prev.type === "annual" ? "annual" : "module",
      unlockedModules: prev.unlockedModules.includes(moduleId)
        ? prev.unlockedModules
        : [...prev.unlockedModules, moduleId],
    }));
  };

  const unlockAnnual = () => {
    setSubscription({
      type: "annual",
      unlockedModules: [],
    });
  };

  const isModuleUnlocked = (moduleId: string) => {
    return subscription.type === "annual" || subscription.unlockedModules.includes(moduleId);
  };

  return (
    <SubscriptionContext.Provider value={{ subscription, unlockModule, unlockAnnual, isModuleUnlocked }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
