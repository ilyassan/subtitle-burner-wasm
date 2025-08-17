"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProcessingProgressProps } from '../types'

/**
 * Processing progress display component
 * Shows detailed progress information with cancel option
 */
export function ProcessingProgress({
  progress,
  progressPhase,
  progressETA,
  isProcessing,
  isCancelling,
  memoryUsage,
  memoryLimit,
  onCancel
}: ProcessingProgressProps) {
  if (!isProcessing) return null

  return (
    <div className="mb-8">
      <Card className="border-primary/20 bg-gradient-to-r from-secondary/50 to-primary/10">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header with progress info */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {progressPhase || "Processing Video..."}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-primary">
                  {progress.toFixed(1)}%
                </span>
                {progressETA && (
                  <div className="text-xs text-gray-500">
                    {progressETA}
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <Progress value={progress} className="w-full h-3" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>

            {/* Footer with memory and status */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                Memory: {memoryUsage > 0 ? (memoryUsage / (1024 * 1024)).toFixed(1) : '~50'}MB
                {memoryLimit && ` / ${memoryLimit}MB`}
              </span>
              <div className="flex items-center gap-2">
                {isCancelling && <Badge variant="destructive">Cancelling...</Badge>}
                {isProcessing && !isCancelling && (
                  <span className="text-primary font-medium">
                    ● Processing
                  </span>
                )}
              </div>
            </div>

            {/* Cancel button */}
            {isProcessing && !isCancelling && (
              <div className="pt-2">
                <Button
                  onClick={onCancel}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  Cancel Processing
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}