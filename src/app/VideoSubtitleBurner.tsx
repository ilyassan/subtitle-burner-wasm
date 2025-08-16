"use client"

import React, { useState } from "react"
import Script from "next/script"
import { Zap, Settings, Eye } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Clock } from 'lucide-react'
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { CircularPerformanceMonitor } from "@/components/CircularPerformanceMonitor"
import { AdvancedSubtitleControls } from "@/components/AdvancedSubtitleControls"
import { SubtitlePreviewCanvas } from "@/components/SubtitlePreviewCanvas"

// Feature imports
import { 
  VideoProcessingProvider, 
  useVideoProcessing,
  VideoUploadSection,
  SubtitleUploadSection,
  ProcessingProgress,
  VideoResult,
  ProcessingButton
} from "@/features/video-processing"
import { TabNavigation, TabContent, PageSection } from "@/features/ui"

/**
 * Quick Start Tab Component
 * Simplified interface for basic video processing
 */
function QuickStartTab() {
  const { 
    downloadUrl, 
    isProcessing,
    progress,
    progressStage,
    progressPhase,
    progressETA,
    isCancelling,
    memoryUsage,
    processingOptions,
    cancelProcessing,
    outputFormat
  } = useVideoProcessing()

  return (
    <div className="grid lg:grid-cols-2 gap-8 mb-8">
      {/* Left Side - Quick Start */}
      <PageSection title="Quick Start" icon={Zap}>
        <div className="space-y-4">
          <VideoUploadSection />
          <SubtitleUploadSection />
        </div>

        <div className="space-y-4">
          <ProcessingButton className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl text-lg" />
          
          {/* Show processing progress if active */}
          <ProcessingProgress
            progress={progress}
            progressStage={progressStage}
            progressPhase={progressPhase}
            progressETA={progressETA}
            isProcessing={isProcessing}
            isCancelling={isCancelling}
            memoryUsage={memoryUsage}
            memoryLimit={processingOptions.memoryLimit}
            onCancel={cancelProcessing}
          />
        </div>
      </PageSection>

      {/* Right Side - Video Preview */}
      <PageSection title="Video Result" icon={Eye}>
        <VideoResult 
          downloadUrl={downloadUrl}
          outputFormat={outputFormat}
          showTitle={false}
        />
      </PageSection>
    </div>
  )
}

/**
 * Advanced Tab Component
 * Full-featured interface with all controls
 */
function AdvancedTab() {
  const { 
    subtitleStyle, 
    updateSubtitleStyle,
    processingOptions, 
    updateProcessingOptions,
    downloadUrl,
    outputFormat,
    isProcessing,
    progress,
    progressStage,
    progressPhase,
    progressETA,
    isCancelling,
    memoryUsage,
    cancelProcessing
  } = useVideoProcessing()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* File Upload Grid */}
      <div className="text-center mb-8">
        <PageSection 
          title="Advanced Controls" 
          description="Fine-tune your subtitle processing with professional options"
          icon={Settings}
        >
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <VideoUploadSection />
            <SubtitleUploadSection />
          </div>
        </PageSection>
      </div>

      {/* Advanced Controls and Preview */}
      <div className="grid xl:grid-cols-2 gap-8 mb-8">
        {/* Left Side - Advanced Controls */}
        <div className="space-y-6 order-2 xl:order-1">
          <AdvancedSubtitleControls
            style={subtitleStyle}
            onStyleChange={updateSubtitleStyle}
            processingOptions={processingOptions}
            onProcessingOptionsChange={updateProcessingOptions}
          />
        </div>

        {/* Right Side - Live Preview */}
        <div className="space-y-6 order-1 xl:order-2">
          <SubtitlePreviewCanvas style={subtitleStyle} />
        </div>
      </div>

      {/* Process Button */}
      <div className="text-center space-y-4">
        <ProcessingButton className="bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-8 rounded-xl text-lg" />
        
        {/* Show processing progress if active */}
        <ProcessingProgress
          progress={progress}
          progressStage={progressStage}
          progressPhase={progressPhase}
          progressETA={progressETA}
          isProcessing={isProcessing}
          isCancelling={isCancelling}
          memoryUsage={memoryUsage}
          memoryLimit={processingOptions.memoryLimit}
          onCancel={cancelProcessing}
        />
      </div>

      {/* Video Result - Below Advanced Controls */}
      <PageSection title="Video Result" icon={Eye}>
        <VideoResult 
          downloadUrl={downloadUrl}
          outputFormat={outputFormat}
          showTitle={false}
          className="max-w-4xl mx-auto"
        />
      </PageSection>
    </div>
  )
}

/**
 * Smart Alerts Component
 * Displays contextual alerts based on processing state
 */
function SmartAlerts() {
  const { error, subtitleStats } = useVideoProcessing()

  return (
    <div className="space-y-4 mb-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Smart Processing Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Smart Processing:</strong> Automatically filters subtitles to only process those within your video duration, saving time and resources.
        </AlertDescription>
      </Alert>

      {/* Optimization Alert */}
      {subtitleStats && subtitleStats.filtered > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Optimization Active:</strong> {subtitleStats.filtered} subtitles filtered out (only processing {subtitleStats.relevant}/{subtitleStats.total} relevant subtitles)
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/**
 * Main Video Subtitle Burner Component
 * Clean, organized component using proper composition and the new refactored architecture
 */
function VideoSubtitleBurnerCore() {
  const [activeTab, setActiveTab] = useState("quickstart")
  const { setScriptLoaded, setError, addLog, memoryUsage, processingOptions, isProcessing } = useVideoProcessing()

  const tabs = [
    { id: "quickstart", label: "Quick Start", icon: Zap },
    { id: "advanced", label: "Advanced", icon: Settings }
  ]

  return (
    <div className="p-8 relative">
      {/* Circular Performance Monitor */}
      <CircularPerformanceMonitor
        memoryUsage={memoryUsage}
        memoryLimit={processingOptions.memoryLimit}
        isProcessing={isProcessing}
      />

      {/* FFmpeg Script Loading */}
      <Script
        src="https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true)
          addLog("ffmpeg-core.js loaded")
        }}
        onError={(e: Error) => {
          setError(`Failed to load ffmpeg-core.js: ${e.message}`)
          addLog(`ffmpeg-core.js load error: ${e.message}`)
        }}
      />

      {/* Smart Alerts */}
      <SmartAlerts />

      {/* Tab Navigation */}
      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <TabContent tabId="quickstart" activeTab={activeTab}>
        <QuickStartTab />
      </TabContent>

      <TabContent tabId="advanced" activeTab={activeTab}>
        <AdvancedTab />
      </TabContent>
    </div>
  )
}

/**
 * Wrapped component with provider and error boundary
 * This is the new refactored VideoSubtitleBurner using enterprise architecture
 */
const VideoSubtitleBurner = () => {
  return (
    <ErrorBoundary>
      <VideoProcessingProvider>
        <VideoSubtitleBurnerCore />
      </VideoProcessingProvider>
    </ErrorBoundary>
  )
}

export default VideoSubtitleBurner