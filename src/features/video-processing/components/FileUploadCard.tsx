"use client"

import React, { useState } from 'react'
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
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    onFileChange(selectedFile)
  }

  const handleFileSelect = (selectedFile: File) => {
    onFileChange(selectedFile)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev - 1)
    if (dragCounter === 1) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setDragCounter(0)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const droppedFile = files[0]
      // Validate file type
      const acceptedTypes = accept.split(',').map(type => type.trim())
      const isValidType = acceptedTypes.some(acceptType => {
        if (acceptType.startsWith('.')) {
          return droppedFile.name.toLowerCase().endsWith(acceptType.toLowerCase())
        }
        return droppedFile.type.match(acceptType.replace('*', '.*'))
      })
      
      if (isValidType) {
        handleFileSelect(droppedFile)
      } else {
        alert(`Please select a valid file type: ${accept}`)
      }
    }
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
          className={`cursor-pointer border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all duration-200 ${
            isDragOver 
              ? 'border-primary bg-primary/10 scale-105' 
              : 'border-primary/30 hover:bg-secondary/50 hover:border-primary/50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Icon className={`w-8 h-8 mb-2 transition-colors ${
            isDragOver ? 'text-primary' : 'text-primary'
          }`} />
          <span className={`text-sm transition-colors ${
            isDragOver ? 'text-primary font-medium' : 'text-gray-600'
          }`}>
            {isDragOver 
              ? `Drop ${label.toLowerCase()} here` 
              : file 
                ? file.name 
                : `Drop ${label.toLowerCase()} here or click to browse`
            }
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {accept.includes('video') ? 'MP4, WebM, MOV' : 'SRT, VTT, ASS, SSA'}
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