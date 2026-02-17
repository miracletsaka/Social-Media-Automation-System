'use client'

import React from "react"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void
  currentImage?: string | null
}

export default function ImageUploader({ onImageSelect, currentImage }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      onImageSelect(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  return (
    <div className="w-full">
      {!currentImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-accent bg-accent/10'
              : 'border-border bg-secondary/30 hover:border-accent/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          <Upload className="w-8 h-8 text-accent mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">Drag and drop your image here</p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Choose Image
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-secondary">
            <img src={currentImage || "/placeholder.svg"} alt="Uploaded" className="w-full h-auto max-h-80 object-cover" />
          </div>
          <Button
            onClick={() => onImageSelect('')}
            variant="outline"
            className="w-full border-border text-foreground hover:bg-secondary"
          >
            <X className="w-4 h-4 mr-2" />
            Change Image
          </Button>
        </div>
      )}
    </div>
  )
}
