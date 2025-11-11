import { needsSetup, getAvailableInstances } from "@/config/dynamicConfig";
import { logger } from "@/utils/logger";
import type { AppMode } from "@/tui/AppContent";

interface InitializeAppOptions {
  currentInstance: string | null;
  setCurrentMode: (mode: AppMode) => void;
  setCurrentInstance: (instance: string | null) => void;
  setCheckingSetup: (checking: boolean) => void;
}

export async function initializeApp({
  currentInstance,
  setCurrentMode,
  setCurrentInstance,
  setCheckingSetup,
}: InitializeAppOptions): Promise<void> {
  try {
    const setupRequired = await needsSetup();
    if (setupRequired) {
      setCurrentMode("setup" as AppMode);
    } else {
      // If no instance is specified, use the first available one
      if (!currentInstance) {
        const availableInstances = await getAvailableInstances();
        if (availableInstances.length > 0) {
          setCurrentInstance(availableInstances[0] ?? null);
        }
      }
    }
  } catch (error) {
    logger.error({ err: error }, "Error initializing app");
  } finally {
    setCheckingSetup(false);
  }
}
