"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Terminal, 
  Copy, 
  Download, 
  Activity,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn } from "@/lib/utils"

interface LogsDialogProps {
  logs: string[]
  isProcessing: boolean
  trigger?: React.ReactNode
}

/**
 * LogsDialog component displays FFmpeg processing logs in a modal dialog
 * Features:
 * - Live updating logs during processing
 * - Auto-scroll to latest log
 * - Copy logs to clipboard
 * - Download logs as text file
 * - Wide layout with overflow protection
 * - Single-line log entries with ellipsis
 */
export function LogsDialog({ logs, isProcessing, trigger }: LogsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastLogRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && lastLogRef.current) {
      lastLogRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  // Get log level icon and color based on message content
  const getLogType = (message: string) => {
    if (message.includes('✅') || message.includes('completed') || message.includes('success')) {
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' }
    }
    if (message.includes('❌') || message.includes('error') || message.includes('failed')) {
      return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' }
    }
    if (message.includes('⚠️') || message.includes('warning') || message.includes('warn')) {
      return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' }
    }
    if (message.includes('🎥') || message.includes('🖼️') || message.includes('🔄')) {
      return { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' }
    }
    return { icon: Info, color: 'text-gray-600', bg: 'bg-gray-50' }
  }

  // Format timestamp for display
  const formatTime = (index: number) => {
    const now = new Date()
    const logTime = new Date(now.getTime() - (logs.length - index - 1) * 2000) // Approximate time
    return logTime.toLocaleTimeString()
  }

  // Copy logs to clipboard
  const copyLogs = async () => {
    const logsText = logs.map((log, index) => `[${formatTime(index)}] ${log}`).join('\n')
    await navigator.clipboard.writeText(logsText)
  }

  // Download logs as file
  const downloadLogs = () => {
    const logsText = logs.map((log, index) => `[${formatTime(index)}] ${log}`).join('\n')
    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ffmpeg-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const hasLogs = logs.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 bg-white/90 hover:bg-white shadow-sm">
            <Terminal className="h-4 w-4" />
            Logs
            {hasLogs && (
              <Badge variant="secondary" className="ml-1">
                {logs.length}
              </Badge>
            )}
            {isProcessing && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1" />
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-7xl md:min-w-[80vw] max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            FFmpeg Processing Logs
            {isProcessing && (
              <Badge variant="default" className="gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Log Controls */}
          <div className="flex items-center justify-between gap-2 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className={cn("gap-1", autoScroll && "text-primary")}
              >
                <Activity className="h-4 w-4" />
                Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyLogs}
                disabled={!hasLogs}
                className="gap-1"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadLogs}
                disabled={!hasLogs}
                className="gap-1"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {/* Logs Display */}
          <Card className="flex-1 min-h-0 overflow-hidden">
            <CardContent className="p-0 h-full overflow-hidden">
              {!hasLogs ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <div className="text-center">
                    <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="mb-2">No logs yet.</p>
                    <p className="text-xs">Upload a video and subtitle file, then start processing to see FFmpeg output here.</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[450px] p-4" ref={scrollAreaRef}>
                  <div className="space-y-2">
                    {logs.map((log, index) => {
                      const { icon: Icon, color, bg } = getLogType(log)
                      
                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border text-sm",
                            bg,
                            "hover:shadow-sm transition-shadow"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", color)} />
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{log}</span>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatTime(index)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    
                    <div ref={lastLogRef} />
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Log Stats */}
          {hasLogs && (
            <div className="flex items-center justify-between text-xs text-gray-500 mt-3 flex-shrink-0">
              <span>Total: {logs.length} log entries</span>
              <span>
                {isProcessing ? 'Updating live...' : 'Processing completed'}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}