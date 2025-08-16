"use client"

import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PerformanceMetrics } from "@/types/types"
import { Activity, Clock, Zap, HardDrive } from "lucide-react"

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics[]
  memoryUsage: number
  isProcessing: boolean
}

export function PerformanceMonitor({ metrics, memoryUsage, isProcessing }: PerformanceMonitorProps) {
  const [currentMemory, setCurrentMemory] = useState(memoryUsage)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMemory(memoryUsage)
    }, 1000)

    return () => clearInterval(interval)
  }, [memoryUsage])

  const latestMetric = metrics[metrics.length - 1]
  const avgProcessingTime = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.processingTime, 0) / metrics.length / 1000
    : 0

  const formatMemory = (bytes: number) => {
    if (!bytes || isNaN(bytes) || bytes <= 0) return '~50MB'
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
    return `${Math.round(bytes / (1024 * 1024))}MB`
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.round((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                Memory Usage
              </span>
              <span className="text-xs text-muted-foreground">
                {formatMemory(currentMemory)}
              </span>
            </div>
            <Progress 
              value={Math.min((currentMemory / (100 * 1024 * 1024)) * 100, 100)} 
              className="w-full"
            />
          </div>

          {latestMetric && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last Processing
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(latestMetric.processingTime)}
                </span>
              </div>
              <Progress 
                value={Math.min((latestMetric.processingTime / 60000) * 100, 100)} 
                className="w-full"
              />
            </div>
          )}
        </div>

        {metrics.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-lg font-semibold">{metrics.length}</div>
              <div className="text-xs text-muted-foreground">Jobs Completed</div>
            </div>
            
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-lg font-semibold">{Math.round(avgProcessingTime)}s</div>
              <div className="text-xs text-muted-foreground">Avg Time</div>
            </div>
            
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-lg font-semibold">
                {Math.round(metrics.reduce((sum, m) => sum + m.subtitlesProcessed, 0) / metrics.length)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Subtitles</div>
            </div>
          </div>
        )}

        {latestMetric && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {latestMetric.strategy}
            </Badge>
            <Badge variant="secondary">
              {Math.round(latestMetric.avgTimePerSubtitle)}ms/subtitle
            </Badge>
            <Badge variant={isProcessing ? "default" : "secondary"}>
              {isProcessing ? "Processing..." : "Ready"}
            </Badge>
          </div>
        )}

        {metrics.length > 1 && (
          <div className="space-y-1">
            <div className="text-sm font-medium">Recent Jobs</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {metrics.slice(-5).reverse().map((metric, index) => (
                <div key={index} className="flex justify-between text-xs bg-muted/50 p-2 rounded">
                  <span>{metric.subtitlesProcessed} subtitles ({metric.strategy})</span>
                  <span>{formatTime(metric.processingTime)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}