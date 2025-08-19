"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProcessingOptions, SubtitleStyle } from "@/types/types"
import { Zap, Clock, Star, Smartphone, Monitor, Film } from "lucide-react"

interface ExportPresetsProps {
  onApplyPreset: (style: SubtitleStyle, options: ProcessingOptions) => void
}

interface Preset {
  name: string
  description: string
  icon: React.ReactNode
  style: SubtitleStyle
  options: ProcessingOptions
  tags: string[]
}

export function ExportPresets({ onApplyPreset }: ExportPresetsProps) {
  const presets: Preset[] = [
    {
      name: "Fast & Simple",
      description: "Quick processing with standard quality for everyday use",
      icon: <Zap className="h-4 w-4" />,
      style: {
        fontSize: 24,
        fontColor: "#FFFFFF",
        fontFamily: "Arial",
        position: "bottom",
        alignment: "center",
        outlineColor: "#000000",
        outlineWidth: 2,
        shadow: true,
        opacity: 1
      },
      options: {
        quality: "fast",
        crf: 28,
        memoryLimit: 500,
        threads: 0,
        useDiskCache: true
      },
      tags: ["Fast", "Standard"]
    },
    {
      name: "High Quality",
      description: "Best quality output with advanced processing",
      icon: <Star className="h-4 w-4" />,
      style: {
        fontSize: 26,
        fontColor: "#FFFFFF",
        fontFamily: "Roboto",
        position: "bottom",
        alignment: "center",
        outlineColor: "#000000",
        outlineWidth: 2.5,
        shadow: true,
        opacity: 0.95,
        backgroundColor: "rgba(0,0,0,0.7)"
      },
      options: {
        quality: "high",
        crf: 20,
        memoryLimit: 500,
        threads: 0,
        useDiskCache: true
      },
      tags: ["Quality", "Advanced"]
    },
    {
      name: "Mobile Optimized",
      description: "Optimized for mobile viewing with larger fonts",
      icon: <Smartphone className="h-4 w-4" />,
      style: {
        fontSize: 28,
        fontColor: "#FFFF00",
        fontFamily: "Open Sans",
        position: "bottom",
        alignment: "center",
        outlineColor: "#000000",
        outlineWidth: 3,
        shadow: true,
        opacity: 1,
        marginY: -20
      },
      options: {
        quality: "balanced",
        crf: 25,
        memoryLimit: 500,
        threads: 0,
        useDiskCache: true
      },
      tags: ["Mobile", "Large Text"]
    },
    {
      name: "Cinema Style",
      description: "Cinema-style subtitles with elegant styling",
      icon: <Film className="h-4 w-4" />,
      style: {
        fontSize: 22,
        fontColor: "#FFFFFF",
        fontFamily: "Merriweather",
        position: "bottom",
        alignment: "center",
        outlineColor: "#000000",
        outlineWidth: 1.5,
        shadow: false,
        opacity: 0.9,
        backgroundColor: "rgba(0,0,0,0.8)",
        marginY: -30
      },
      options: {
        quality: "high",
        crf: 18,
        memoryLimit: 500,
        threads: 0,
        useDiskCache: true
      },
      tags: ["Cinema", "Advanced", "Elegant"]
    },
    {
      name: "Gaming/Streaming",
      description: "Bright, readable subtitles for gaming content",
      icon: <Monitor className="h-4 w-4" />,
      style: {
        fontSize: 30,
        fontColor: "#00FF00",
        fontFamily: "Poppins",
        position: "bottom",
        alignment: "center",
        outlineColor: "#000000",
        outlineWidth: 4,
        shadow: true,
        opacity: 1
      },
      options: {
        quality: "fast",
        crf: 26,
        memoryLimit: 500,
        threads: 0,
        useDiskCache: true
      },
      tags: ["Gaming", "Streaming", "Bright"]
    },
    {
      name: "Accessibility",
      description: "High contrast, large text for accessibility",
      icon: <Clock className="h-4 w-4" />,
      style: {
        fontSize: 32,
        fontColor: "#FFFF00",
        fontFamily: "Roboto",
        position: "bottom",
        alignment: "center",
        outlineColor: "#000000",
        outlineWidth: 4,
        shadow: true,
        opacity: 1,
        backgroundColor: "rgba(0,0,0,0.9)"
      },
      options: {
        quality: "balanced",
        crf: 23,
        memoryLimit: 500,
        threads: 0,
        useDiskCache: true
      },
      tags: ["Accessibility", "High Contrast"]
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Presets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onApplyPreset(preset.style, preset.options)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {preset.icon}
                  <h3 className="font-semibold text-sm">{preset.name}</h3>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">
                {preset.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {preset.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Font: {preset.style.fontFamily} {preset.style.fontSize}px</div>
                <div>Quality: {preset.options.quality} (CRF {preset.options.crf})</div>
                <div>Threads: {preset.options.threads === 0 ? 'Auto' : preset.options.threads}</div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={(e) => {
                  e.stopPropagation()
                  onApplyPreset(preset.style, preset.options)
                }}
              >
                Apply Preset
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}