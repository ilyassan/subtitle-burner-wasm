/**
 * Service for persisting application state during page reload for cancellation
 */

export interface PersistedState {
  // Tab state
  activeTab: 'quick' | 'advanced'
  
  // Control settings
  fontSize: string
  fontColor: string
  fontFamily: string
  outputFormat: string
  
  // Advanced settings (if applicable)
  quality?: 'fast' | 'balanced' | 'high'
  crf?: number
  threads?: number
  useDiskCache?: boolean
  
  // UI state (removed scroll position as we'll scroll to tabs instead)
  
  // Logs
  logs: Array<{
    id: string
    message: string
    timestamp: number
    type: 'info' | 'warning' | 'error' | 'success'
  }>
  
  // File information (for recovery)
  videoFileName?: string
  subtitleFileName?: string
  
  // Processing state
  wasProcessing: boolean
  wasCancelled: boolean
  
  // Timestamp when state was saved
  savedAt: number
}

const STORAGE_KEY = 'subtitle-burner-state'
const STATE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

export class StatePersistenceService {
  /**
   * Save current application state to localStorage
   */
  static saveState(state: Partial<PersistedState>): void {
    try {
      const currentState = this.getState() || {} as PersistedState
      
      const mergedState: PersistedState = {
        ...currentState,
        ...state,
        savedAt: Date.now()
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedState))
      console.log('✅ State saved to localStorage:', mergedState)
    } catch (error) {
      console.error('❌ Failed to save state:', error)
    }
  }
  
  /**
   * Retrieve and clear persisted state from localStorage
   */
  static getAndClearState(): PersistedState | null {
    try {
      const stateStr = localStorage.getItem(STORAGE_KEY)
      if (!stateStr) return null
      
      const state: PersistedState = JSON.parse(stateStr)
      
      // Check if state is expired
      if (Date.now() - state.savedAt > STATE_EXPIRY_MS) {
        this.clearState()
        return null
      }
      
      // Clear state after retrieval
      this.clearState()
      
      console.log('✅ State retrieved and cleared from localStorage:', state)
      return state
    } catch (error) {
      console.error('❌ Failed to retrieve state:', error)
      this.clearState()
      return null
    }
  }
  
  /**
   * Get state without clearing (for checking)
   */
  static getState(): PersistedState | null {
    try {
      const stateStr = localStorage.getItem(STORAGE_KEY)
      if (!stateStr) return null
      
      const state: PersistedState = JSON.parse(stateStr)
      
      // Check if state is expired
      if (Date.now() - state.savedAt > STATE_EXPIRY_MS) {
        this.clearState()
        return null
      }
      
      return state
    } catch (error) {
      console.error('❌ Failed to get state:', error)
      return null
    }
  }
  
  /**
   * Clear persisted state
   */
  static clearState(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('✅ State cleared from localStorage')
    } catch (error) {
      console.error('❌ Failed to clear state:', error)
    }
  }
  
  // Removed updateState method - only save complete state during cancellation
  
  /**
   * Scroll to tabs section after cancellation
   */
  static scrollToTabsSection(): void {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Try to find the tabs section and scroll to it
      const tabsElement = document.querySelector('[role="tablist"]') || 
                         document.querySelector('.tabs') ||
                         document.querySelector('[data-tabs]')
      
      if (tabsElement) {
        tabsElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      } else {
        // Fallback: scroll to a reasonable position near the top
        window.scrollTo({
          top: 200,
          behavior: 'smooth'
        })
      }
    })
  }
  
  /**
   * Check if we should restore state (e.g., after page reload for cancellation)
   */
  static shouldRestoreState(): boolean {
    const state = this.getState()
    return state?.wasCancelled === true
  }
  
  /**
   * Mark that cancellation is in progress
   */
  static markCancellationInProgress(): void {
    const currentState = this.getState() || {} as PersistedState
    this.saveState({ 
      ...currentState,
      wasCancelled: true,
      wasProcessing: true
    })
  }
}