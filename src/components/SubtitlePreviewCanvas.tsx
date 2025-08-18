"use client"

import React, { useState, useRef, useEffect } from "react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubtitleStyle } from "@/types/types"
import { Edit3 } from "lucide-react"
import { useVideoProcessing } from "@/hooks/useVideoProcessing"

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
  const { videoInfo } = useVideoProcessing()

  // Store both container dimensions and scale factor
  const [dimensions, setDimensions] = useState({
    containerWidth: 0,
    containerHeight: 0,
    scale: 0.5
  })

  useEffect(() => {
    const updateDimensions = () => {
      const container = canvasRef.current
      if (!container) return
      
      const containerWidth = container.clientWidth || 0
      const containerHeight = container.clientHeight || 0
      
      // Default video dimensions if not available
      const referenceVideoWidth = videoInfo?.width || 1920
      const referenceVideoHeight = videoInfo?.height || 1080
      
      if (referenceVideoWidth > 0 && referenceVideoHeight > 0 && containerWidth > 0 && containerHeight > 0) {
        // Calculate scale factor: how much smaller is the preview compared to the actual video
        const widthScale = containerWidth / referenceVideoWidth
        const heightScale = containerHeight / referenceVideoHeight
        // Use minimum scale to maintain aspect ratio
        const scale = Math.min(widthScale, heightScale)
        
        setDimensions({
          containerWidth,
          containerHeight,
          scale
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    // Also update when video info changes
    const timer = setTimeout(updateDimensions, 100)
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
      clearTimeout(timer)
    }
  }, [videoInfo?.width, videoInfo?.height])

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
      // Center alignment
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

    // Add scaled margin offsets
    if (style.marginX) {
      const scaledMarginX = style.marginX * dimensions.scale
      if (style.alignment === 'left') {
        baseStyles.left = `calc(5% + ${scaledMarginX}px)`
      } else if (style.alignment === 'right') {
        baseStyles.left = `calc(95% - ${scaledMarginX}px)`
      } else {
        baseStyles.left = `calc(50% + ${scaledMarginX}px)`
      }
    }

    // Scale the base offset and margins proportionally
    const scaledBaseOffset = 50 * dimensions.scale
    const scaledMarginY = (style.marginY || 0) * dimensions.scale

    switch (style.position) {
      case 'top':
        baseStyles.top = `${scaledBaseOffset + scaledMarginY}px`
        break
      case 'center':
        baseStyles.top = '50%'
        const xTransform = style.alignment === 'left' ? '0' : 
                          style.alignment === 'right' ? '-100%' : '-50%'
        const yOffset = scaledMarginY ? `calc(-50% + ${scaledMarginY}px)` : '-50%'
        baseStyles.transform = `translate(${xTransform}, ${yOffset})`
        break
      case 'bottom':
      default:
        baseStyles.bottom = `${scaledBaseOffset + Math.abs(scaledMarginY)}px`
        break
    }

    return baseStyles
  }

  // Create text shadow for outline effect
  const getTextShadow = () => {
    const outlineWidth = style.outlineWidth || 0
    const outlineColor = style.outlineColor || '#000000'
    
    if (outlineWidth === 0) return style.shadow ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none'
    
    // Scale outline width proportionally
    const scaledOutline = outlineWidth * dimensions.scale
    const shadows = []
    
    // Create outline effect with multiple shadows
    const steps = Math.ceil(scaledOutline)
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      const x = Math.cos(angle) * scaledOutline
      const y = Math.sin(angle) * scaledOutline
      shadows.push(`${x}px ${y}px 0px ${outlineColor}`)
    }
    
    // Add drop shadow if enabled
    if (style.shadow) {
      shadows.push(`${2 * dimensions.scale}px ${2 * dimensions.scale}px ${4 * dimensions.scale}px rgba(0,0,0,0.8)`)
    }
    
    return shadows.join(', ')
  }

  // Calculate accurate font size that matches video output appearance
  const getAccurateFontSize = () => {
    const baseFontSize = style.fontSize || 24
    
    // The key fix: Scale the font size proportionally to the container vs video size ratio
    // This ensures that a 24px font on a 1920x1080 video looks the same relative size
    // as it would in the smaller preview container
    return baseFontSize * dimensions.scale
  }

  // Calculate scaled padding for background
  const getScaledPadding = () => {
    if (!style.backgroundColor || style.backgroundColor === 'transparent') {
      return '0'
    }
    const paddingY = 8 * dimensions.scale
    const paddingX = 12 * dimensions.scale
    return `${paddingY}px ${paddingX}px`
  }

  const subtitleStyles: React.CSSProperties = {
    fontSize: `${getAccurateFontSize()}px`,
    color: style.fontColor || '#FFFFFF',
    fontFamily: `'${style.fontFamily || 'Arial'}', sans-serif`,
    fontWeight: 'bold',
    lineHeight: '1.4',
    textShadow: getTextShadow(),
    opacity: style.opacity || 1,
    backgroundColor: style.backgroundColor || 'transparent',
    padding: getScaledPadding(),
    borderRadius: style.backgroundColor && style.backgroundColor !== 'transparent' ? `${4 * dimensions.scale}px` : '0',
    display: 'inline-block',
    ...getPositionStyles()
  }

  // Get display values for the info panel
  const getVideoInfoDisplay = () => {
    const videoWidth = videoInfo?.width || 1920
    const videoHeight = videoInfo?.height || 1080
    const actualFontSize = style.fontSize || 24
    const previewFontSize = getAccurateFontSize()
    
    return {
      videoDimensions: `${videoWidth}×${videoHeight}`,
      previewDimensions: `${Math.round(dimensions.containerWidth)}×${Math.round(dimensions.containerHeight)}`,
      actualFontSize: `${actualFontSize}px`,
      previewFontSize: `${previewFontSize.toFixed(1)}px`,
      scaleRatio: `${(dimensions.scale * 100).toFixed(1)}%`
    }
  }

  const displayInfo = getVideoInfoDisplay()

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
              aspectRatio: videoInfo?.width && videoInfo?.height ? `${videoInfo.width}/${videoInfo.height}` : '16/9',
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
                <div className="text-xs mt-1">
                  {displayInfo.videoDimensions} → {displayInfo.previewDimensions} ({displayInfo.scaleRatio})
                </div>
              </div>
            </div>

            {/* Subtitle overlay */}
            <div
              style={subtitleStyles}
              key={JSON.stringify(style) + previewText + dimensions.scale}
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

          {/* Style Information with scaling details */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
            <div className="bg-gray-50 rounded p-2">
              <div className="font-medium">Font (Video)</div>
              <div>{style.fontSize}px {style.fontFamily}</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="font-medium">Font (Preview)</div>
              <div>{displayInfo.previewFontSize} scaled</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="font-medium">Position</div>
              <div>{style.position} {style.alignment}</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="font-medium">Outline</div>
              <div>{style.outlineWidth}px</div>
            </div>
          </div>

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-gray-500 bg-gray-100 rounded p-2">
              <div>Video: {displayInfo.videoDimensions} | Preview: {displayInfo.previewDimensions}</div>
              <div>Scale Factor: {displayInfo.scaleRatio} | Font: {displayInfo.actualFontSize} → {displayInfo.previewFontSize}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}