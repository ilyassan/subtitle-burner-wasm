"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUploadProps } from '../types'

/**
 * Reusable file upload card component
 * Handles all file upload UI patterns consistently
 */
export function FileUploadCard({ 
  file, 
  onFileChange, 
  accept, 
  label, 
  icon: Icon, 
  className = "",
  children 
}: FileUploadProps & { children?: React.ReactNode }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    onFileChange(selectedFile)
  }

  const inputId = `${label.toLowerCase().replace(/\s+/g, '-')}-upload`

  return (
    <Card className={`border-primary/20 hover:border-primary/40 transition-colors bg-gradient-to-br from-white to-secondary/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Label
          htmlFor={inputId}
          className="cursor-pointer border-2 border-dashed border-primary/30 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-secondary/50 transition-colors"
        >
          <Icon className="w-8 h-8 text-primary mb-2" />
          <span className="text-sm text-gray-600">
            {file ? file.name : `Upload ${label.toLowerCase()}`}
          </span>
          {children}
          <Input
            id={inputId}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
        </Label>
      </CardContent>
    </Card>
  )
}