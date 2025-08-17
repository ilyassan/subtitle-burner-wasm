/**
 * Global initialization state to prevent multiple initializations
 * across all components and hook instances
 */

let isGloballyInitialized = false
let isGloballyInitializing = false
let globalInitPromise: Promise<void> | null = null

export function isGlobalInitialized(): boolean {
  return isGloballyInitialized
}

export function isGlobalInitializing(): boolean {
  return isGloballyInitializing
}

export function setGlobalInitializing(value: boolean): void {
  isGloballyInitializing = value
}

export function setGlobalInitialized(value: boolean): void {
  isGloballyInitialized = value
}

export function getGlobalInitPromise(): Promise<void> | null {
  return globalInitPromise
}

export function setGlobalInitPromise(promise: Promise<void> | null): void {
  globalInitPromise = promise
}

export function resetGlobalState(): void {
  isGloballyInitialized = false
  isGloballyInitializing = false
  globalInitPromise = null
}