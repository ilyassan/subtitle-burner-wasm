"use client"

import React, { useState, useRef } from "react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubtitleStyle } from "@/types/types"
import { Edit3 } from "lucide-react"

interface SubtitlePreviewCanvasProps {
  style: SubtitleStyle
  className?: string
}

export const SubtitlePreviewCanvas: React.FC<SubtitlePreviewCanvasProps> = ({
  style,
  className = ""
}) => {
  const [previewText, setPreviewText] = useState("This is how the subtitle will look like")
  const canvasRef = useRef<HTMLDivElement>(null)

  // Calculate position based on style settings
  const getPositionStyles = () => {
    let textAlign: 'left' | 'center' | 'right' = 'center'
    let leftPosition = '50%'
    let transform = 'translateX(-50%)'

    // Handle alignment properly to match canvas behavior
    if (style.alignment === 'left') {
      textAlign = 'left'
      leftPosition = '5%'
      transform = 'none'
    } else if (style.alignment === 'right') {
      textAlign = 'right'
      leftPosition = '95%'
      transform = 'translateX(-100%)'
    } else {
      // Center alignment - this matches canvas textAlign: 'center' behavior
      textAlign = 'center'
      leftPosition = '50%'
      transform = 'translateX(-50%)'
    }

    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      left: leftPosition,
      transform,
      width: '90%',
      textAlign,
      wordWrap: 'break-word',
      maxWidth: '90%'
    }

    // Add margin offsets
    if (style.marginX) {
      if (style.alignment === 'left') {
        baseStyles.left = `calc(5% + ${style.marginX}px)`
      } else if (style.alignment === 'right') {
        baseStyles.left = `calc(95% + ${style.marginX}px)`
      } else {
        baseStyles.left = `calc(50% + ${style.marginX}px)`
      }
    }

    switch (style.position) {
      case 'top':
        baseStyles.top = style.marginY ? `${20 + (style.marginY || 0)}px` : '20px'
        break
      case 'center':
        baseStyles.top = '50%'
        // Update transform to handle both X and Y positioning with margins
        const xTransform = style.alignment === 'left' ? '0' : 
                          style.alignment === 'right' ? '-100%' : '-50%'
        const yTransform = style.marginY ? `calc(-50% + ${style.marginY}px)` : '-50%'
        baseStyles.transform = `translate(${xTransform}, ${yTransform})`
        break
      case 'bottom':
      default:
        baseStyles.bottom = style.marginY ? `${20 + Math.abs(style.marginY || 0)}px` : '20px'
        break
    }

    return baseStyles
  }

  // Create text shadow for outline effect
  const getTextShadow = () => {
    const outlineWidth = style.outlineWidth || 0
    const outlineColor = style.outlineColor || '#000000'
    
    if (outlineWidth === 0) return style.shadow ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none'
    
    // Create multiple shadows for outline effect
    const shadows = []
    for (let x = -outlineWidth; x <= outlineWidth; x++) {
      for (let y = -outlineWidth; y <= outlineWidth; y++) {
        if (x !== 0 || y !== 0) {
          shadows.push(`${x}px ${y}px 0px ${outlineColor}`)
        }
      }
    }
    
    // Add drop shadow if enabled
    if (style.shadow) {
      shadows.push('2px 2px 4px rgba(0,0,0,0.8)')
    }
    
    return shadows.join(', ')
  }

  const subtitleStyles: React.CSSProperties = {
    fontSize: `${style.fontSize || 24}px`,
    color: style.fontColor || '#FFFFFF',
    fontFamily: `'${style.fontFamily || 'Arial'}', sans-serif`,
    fontWeight: 'bold',
    lineHeight: '1.4',
    textShadow: getTextShadow(),
    opacity: style.opacity || 1,
    backgroundColor: style.backgroundColor || 'transparent',
    padding: style.backgroundColor && style.backgroundColor !== 'transparent' ? '8px 12px' : '0',
    borderRadius: style.backgroundColor && style.backgroundColor !== 'transparent' ? '4px' : '0',
    display: 'inline-block',
    ...getPositionStyles()
  }

  return (
    <div className={className}>
      <Card className="border-primary/20 bg-gradient-to-br from-white to-secondary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Subtitle Preview
          </CardTitle>
          <div className="space-y-2">
            <Label htmlFor="preview-text" className="text-sm font-medium text-gray-700">
              Preview Text
            </Label>
            <Input
              id="preview-text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Enter text to preview..."
              className="text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={canvasRef}
            className="relative bg-black rounded-lg overflow-hidden w-full"
            style={{ 
              aspectRatio: '16/9',
              minHeight: '200px',
              maxHeight: '400px',
              background: 'linear-gradient(45deg, #0a0a0a 25%, transparent 25%), linear-gradient(-45deg, #0a0a0a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #0a0a0a 75%), linear-gradient(-45deg, transparent 75%, #0a0a0a 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
            
            
            
          >
            {/* Video placeholder overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 flex items-center justify-center">
              <div className="text-gray-600 text-center">
                <div className="text-sm font-medium">Video Preview Area</div>
                <div className="text-xs mt-1">Subtitle styling will be applied over your video</div>
              </div>
            </div>

            {/* Subtitle overlay */}
            <div
              style={subtitleStyles}
              key={JSON.stringify(style) + previewText}
              
              
              
            >
              {previewText || "This is how the subtitle will look like"}
            </div>

            {/* Grid overlay for positioning reference */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          {/* Style Information */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
            <div className="bg-gray-50 rounded p-2">
              <div className="font-medium">Font</div>
              <div>{style.fontSize}px {style.fontFamily}</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="font-medium">Position</div>
              <div>{style.position} {style.alignment}</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="font-medium">Outline</div>
              <div>{style.outlineWidth}px</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="font-medium">Opacity</div>
              <div>{Math.round((style.opacity || 1) * 100)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}