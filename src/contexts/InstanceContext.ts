/**
 * InstanceContext - Global singleton for managing current Wiki.js instance
 *
 * This context eliminates the need to pass instance as a parameter to every function.
 * It works for both CLI and TUI modes.
 *
 * Usage:
 * - Set instance: InstanceContext.setInstance('myinstance')
 * - Get instance: InstanceContext.getInstance()
 * - Subscribe to changes: InstanceContext.subscribe((instance) => { ... })
 */

type InstanceListener = (instance: string | null) => void;

class InstanceContextManager {
  private currentInstance: string | null = null;
  private listeners = new Set<InstanceListener>();

  /**
   * Get the current active instance
   * @throws Error if no instance is set (should only happen during setup)
   */
  getInstance(): string {
    if (!this.currentInstance) {
      throw new Error("No instance set - this should not happen outside of setup");
    }
    return this.currentInstance;
  }

  /**
   * Set the current active instance
   * This will notify all subscribers of the change
   */
  setInstance(instance: string | null): void {
    if (this.currentInstance !== instance) {
      this.currentInstance = instance;
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to instance changes
   * Returns an unsubscribe function
   */
  subscribe(listener: InstanceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of the current instance
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentInstance);
    });
  }

  /**
   * Reset instance to null (useful for testing)
   */
  reset(): void {
    this.setInstance(null);
  }
}

// Export singleton instance
export const InstanceContext = new InstanceContextManager();
