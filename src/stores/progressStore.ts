import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ProcessingPhase } from '@/lib/ProgressManager'

interface ProgressState {
  // Progress data
  progress: number // 0-100 for current phase
  phase: ProcessingPhase
  phaseNumber: number // 1 or 2
  totalPhases: number // Always 2
  progressStage: string
  progressPhase: string
  progressETA: string
  
  // Progress metadata
  processedTime?: number
  totalDuration?: number
  currentSubtitle?: number
  totalSubtitles?: number
  
  // Logs
  logs: string[]
  
  // Processing status
  isProcessing: boolean
  isComplete: boolean
  hasError: boolean
  
  // Performance
  memoryUsage: number
  memoryLimit: number
}

interface ProgressActions {
  // Progress actions
  setProgress: (progress: number) => void
  setPhase: (phase: ProcessingPhase) => void
  setPhaseNumber: (number: number) => void
  setProgressStage: (stage: string) => void
  setProgressPhase: (phase: string) => void
  setProgressETA: (eta: string) => void
  
  // Metadata actions
  setProgressMetadata: (metadata: {
    processedTime?: number
    totalDuration?: number
    currentSubtitle?: number
    totalSubtitles?: number
  }) => void
  
  // Log actions
  addLog: (message: string) => void
  clearLogs: () => void
  setLogs: (logs: string[]) => void
  
  // Status actions
  setIsProcessing: (processing: boolean) => void
  setIsComplete: (complete: boolean) => void
  setHasError: (error: boolean) => void
  
  // Performance actions
  setMemoryUsage: (usage: number) => void
  setMemoryLimit: (limit: number) => void
  
  // Reset actions
  resetProgress: () => void
  resetAll: () => void
  
  // Complex actions
  updateProgress: (data: {
    progress: number
    phase?: ProcessingPhase
    phaseNumber?: number
    stage?: string
    phaseDisplay?: string
    eta?: string
    metadata?: {
      processedTime?: number
      totalDuration?: number
      currentSubtitle?: number
      totalSubtitles?: number
    }
  }) => void
}

type ProgressStore = ProgressState & ProgressActions

const initialState: ProgressState = {
  // Progress data
  progress: 0,
  phase: 'parsing-subtitles',
  phaseNumber: 1,
  totalPhases: 2,
  progressStage: '',
  progressPhase: '',
  progressETA: '',
  
  // Progress metadata
  processedTime: undefined,
  totalDuration: undefined,
  currentSubtitle: undefined,
  totalSubtitles: undefined,
  
  // Logs
  logs: [],
  
  // Processing status
  isProcessing: false,
  isComplete: false,
  hasError: false,
  
  // Performance
  memoryUsage: 0,
  memoryLimit: 500
}

export const useProgressStore = create<ProgressStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      // Progress actions
      setProgress: (progress) => set({ progress }, false, 'setProgress'),
      setPhase: (phase) => set({ phase }, false, 'setPhase'),
      setPhaseNumber: (number) => set({ phaseNumber: number }, false, 'setPhaseNumber'),
      setProgressStage: (stage) => set({ progressStage: stage }, false, 'setProgressStage'),
      setProgressPhase: (phase) => set({ progressPhase: phase }, false, 'setProgressPhase'),
      setProgressETA: (eta) => set({ progressETA: eta }, false, 'setProgressETA'),
      
      // Metadata actions
      setProgressMetadata: (metadata) => set((state) => ({
        processedTime: metadata.processedTime ?? state.processedTime,
        totalDuration: metadata.totalDuration ?? state.totalDuration,
        currentSubtitle: metadata.currentSubtitle ?? state.currentSubtitle,
        totalSubtitles: metadata.totalSubtitles ?? state.totalSubtitles
      }), false, 'setProgressMetadata'),
      
      // Log actions
      addLog: (message) => set((state) => ({
        logs: [...state.logs, message]
      }), false, 'addLog'),
      
      clearLogs: () => set({ logs: [] }, false, 'clearLogs'),
      
      setLogs: (logs) => set({ logs }, false, 'setLogs'),
      
      // Status actions
      setIsProcessing: (processing) => set({ isProcessing: processing }, false, 'setIsProcessing'),
      setIsComplete: (complete) => set({ isComplete: complete }, false, 'setIsComplete'),
      setHasError: (error) => set({ hasError: error }, false, 'setHasError'),
      
      // Performance actions
      setMemoryUsage: (usage) => set({ memoryUsage: usage }, false, 'setMemoryUsage'),
      setMemoryLimit: (limit) => set({ memoryLimit: limit }, false, 'setMemoryLimit'),
      
      // Reset actions
      resetProgress: () => set({
        progress: 0,
        phase: 'parsing-subtitles',
        phaseNumber: 1,
        progressStage: '',
        progressPhase: '',
        progressETA: '',
        processedTime: undefined,
        totalDuration: undefined,
        currentSubtitle: undefined,
        totalSubtitles: undefined,
        isComplete: false,
        hasError: false
      }, false, 'resetProgress'),
      
      resetAll: () => set(initialState, false, 'resetAll'),
      
      // Complex actions
      updateProgress: (data) => set(() => {
        const updates: Partial<ProgressState> = {
          progress: data.progress
        }
        
        if (data.phase) updates.phase = data.phase
        if (data.phaseNumber) updates.phaseNumber = data.phaseNumber
        if (data.stage) updates.progressStage = data.stage
        if (data.phaseDisplay) updates.progressPhase = data.phaseDisplay
        if (data.eta) updates.progressETA = data.eta
        
        if (data.metadata) {
          if (data.metadata.processedTime !== undefined) updates.processedTime = data.metadata.processedTime
          if (data.metadata.totalDuration !== undefined) updates.totalDuration = data.metadata.totalDuration
          if (data.metadata.currentSubtitle !== undefined) updates.currentSubtitle = data.metadata.currentSubtitle
          if (data.metadata.totalSubtitles !== undefined) updates.totalSubtitles = data.metadata.totalSubtitles
        }
        
        return updates
      }, false, 'updateProgress')
    }),
    {
      name: 'progress-store'
    }
  )
)