"use client"

import React from "react"

import { Card } from "@/components/ui/card"
import { Gauge } from "lucide-react"

interface CircularPerformanceMonitorProps {
  memoryUsage: number
  memoryLimit?: number
  isProcessing: boolean
  className?: string
}

export const CircularPerformanceMonitor: React.FC<CircularPerformanceMonitorProps> = ({
  memoryUsage,
  memoryLimit = 500,
  isProcessing,
  className = ""
}) => {
  const memoryMB = memoryUsage / (1024 * 1024)
  const memoryPercentage = Math.min((memoryMB / memoryLimit) * 100, 100)
  
  // Create circular path for the progress
  const radius = 35
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (memoryPercentage / 100) * circumference

  const getStatusColor = () => {
    if (!isProcessing) return "text-gray-400"
    if (memoryPercentage > 80) return "text-red-500"
    if (memoryPercentage > 60) return "text-yellow-500"
    return "text-primary"
  }

  const getProgressColor = () => {
    if (!isProcessing) return "#e5e7eb"
    if (memoryPercentage > 80) return "#ef4444"
    if (memoryPercentage > 60) return "#eab308"
    return "oklch(0.647 0.164 42.18)" // Primary color
  }

  return (
    <div
      className={`fixed top-6 right-6 z-50 ${className}`}
      
      
      
      
      
    >
      <Card className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Background circle */}
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90"
            width="80"
            height="80"
          >
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#f3f4f6"
              strokeWidth="3"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={getProgressColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.3s ease-in-out'
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="relative flex flex-col items-center justify-center">
            <div>
              <Gauge className={`w-5 h-5 ${getStatusColor()}`} />
            </div>
            <div className="text-[10px] font-medium text-gray-600 mt-1 leading-none text-center">
              <div>{Math.round(memoryMB)}MB</div>
              <div className="text-[8px] text-gray-400">
                {Math.round(memoryPercentage)}%
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}