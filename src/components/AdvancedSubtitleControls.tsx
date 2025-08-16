"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SubtitleStyle, ProcessingOptions } from "@/types/types"

interface AdvancedSubtitleControlsProps {
  style: SubtitleStyle
  onStyleChange: (style: SubtitleStyle) => void
  processingOptions: ProcessingOptions
  onProcessingOptionsChange: (options: ProcessingOptions) => void
}

export function AdvancedSubtitleControls({
  style,
  onStyleChange,
  processingOptions,
  onProcessingOptionsChange
}: AdvancedSubtitleControlsProps) {
  const updateStyle = (updates: Partial<SubtitleStyle>) => {
    onStyleChange({ ...style, ...updates })
  }

  const updateProcessingOptions = (updates: Partial<ProcessingOptions>) => {
    onProcessingOptionsChange({ ...processingOptions, ...updates })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="styling" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="styling">Styling</TabsTrigger>
            <TabsTrigger value="positioning">Positioning</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="styling" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Slider
                  value={[style.fontSize]}
                  onValueChange={([value]) => updateStyle({ fontSize: value })}
                  min={12}
                  max={72}
                  step={1}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground">{style.fontSize}px</span>
              </div>
              
              <div className="space-y-2">
                <Label>Opacity</Label>
                <Slider
                  value={[style.opacity || 1]}
                  onValueChange={([value]) => updateStyle({ opacity: value })}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground">{Math.round((style.opacity || 1) * 100)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Text Color</Label>
                <Input
                  type="color"
                  value={style.fontColor}
                  onChange={(e) => updateStyle({ fontColor: e.target.value })}
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Background Color</Label>
                <Input
                  type="color"
                  value={style.backgroundColor || "#000000"}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Outline Color</Label>
                <Input
                  type="color"
                  value={style.outlineColor || "#000000"}
                  onChange={(e) => updateStyle({ outlineColor: e.target.value })}
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Outline Width</Label>
                <Slider
                  value={[style.outlineWidth || 0]}
                  onValueChange={([value]) => updateStyle({ outlineWidth: value })}
                  min={0}
                  max={5}
                  step={0.5}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground">{style.outlineWidth || 0}px</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="positioning" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={style.position || "bottom"}
                  onValueChange={(value: "bottom" | "top" | "center" | "custom") => updateStyle({ position: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Alignment</Label>
                <Select
                  value={style.alignment || "center"}
                  onValueChange={(value: "left" | "center" | "right") => updateStyle({ alignment: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Margin X</Label>
                <Slider
                  value={[style.marginX || 0]}
                  onValueChange={([value]) => updateStyle({ marginX: value })}
                  min={-100}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground">{style.marginX || 0}px</span>
              </div>
              
              <div className="space-y-2">
                <Label>Margin Y</Label>
                <Slider
                  value={[style.marginY || 0]}
                  onValueChange={([value]) => updateStyle({ marginY: value })}
                  min={-100}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground">{style.marginY || 0}px</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="processing" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quality</Label>
                <Select
                  value={processingOptions.quality}
                  onValueChange={(value: ProcessingOptions['quality']) => updateProcessingOptions({ quality: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Fast (Lower Quality)</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="high">High Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>CPU Threads</Label>
                <Select
                  value={processingOptions.threads?.toString() || "auto"}
                  onValueChange={(value) => updateProcessingOptions({ threads: value === "auto" ? 0 : parseInt(value) })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (All Available)</SelectItem>
                    <SelectItem value="1">1 Thread</SelectItem>
                    <SelectItem value="2">2 Threads</SelectItem>
                    <SelectItem value="4">4 Threads</SelectItem>
                    <SelectItem value="8">8 Threads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Compression (CRF)</Label>
              <Slider
                value={[processingOptions.crf || 23]}
                onValueChange={([value]) => updateProcessingOptions({ crf: value })}
                min={18}
                max={32}
                step={1}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">
                CRF {processingOptions.crf || 23} ({
                  (processingOptions.crf || 23) < 20 ? "High Quality" :
                  (processingOptions.crf || 23) < 26 ? "Balanced" : "Fast"
                })
              </span>
            </div>

            <div className="space-y-2">
              <Label>Memory Limit (MB)</Label>
              <Slider
                value={[processingOptions.memoryLimit || 500]}
                onValueChange={([value]) => updateProcessingOptions({ memoryLimit: value })}
                min={200}
                max={2000}
                step={50}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">
                {processingOptions.memoryLimit || 500}MB limit
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}