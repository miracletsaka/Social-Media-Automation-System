'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface TextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold' | '600' | '700'
  color: string
  textAlign: 'left' | 'center' | 'right'
  maxWidth: number
  zIndex: number
}

interface CanvasEditorProps {
  backgroundImage: string | null
  textElements: TextElement[]
  onTextUpdate: (elements: TextElement[]) => void
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
}

export default function CanvasEditor({
  backgroundImage,
  textElements,
  onTextUpdate,
  selectedElementId,
  onSelectElement
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizing, setResizing] = useState<string | null>(null)

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault()
    onSelectElement(elementId)
    
    const element = textElements.find(el => el.id === elementId)
    if (!element) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const canvasX = element.x
    const canvasY = element.y
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setDragOffset({
      x: mouseX - canvasX,
      y: mouseY - canvasY
    })
    setDraggingId(elementId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const newX = Math.max(0, mouseX - dragOffset.x)
    const newY = Math.max(0, mouseY - dragOffset.y)

    const updatedElements = textElements.map(el =>
      el.id === draggingId ? { ...el, x: newX, y: newY } : el
    )
    onTextUpdate(updatedElements)
  }

  const handleMouseUp = () => {
    setDraggingId(null)
  }

  const deleteElement = (id: string) => {
    onTextUpdate(textElements.filter(el => el.id !== id))
    onSelectElement(null)
  }

  return (
    <div
      ref={canvasRef}
      className="relative w-full bg-secondary rounded-lg overflow-hidden border-2 border-border"
      style={{
        aspectRatio: '16 / 9',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Overlay for gradient effect (optional) */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
      )}

      {/* Text Elements */}
      {textElements.map(element => (
        <div
          key={element.id}
          className={`absolute cursor-move transition-all ${
            selectedElementId === element.id ? 'ring-2 ring-accent' : ''
          }`}
          style={{
            left: `${element.x}px`,
            top: `${element.y}px`,
            maxWidth: `${element.maxWidth}px`,
            zIndex: element.zIndex,
            fontFamily: element.fontFamily,
            fontSize: `${element.fontSize}px`,
            fontWeight: element.fontWeight,
            color: element.color,
            textAlign: element.textAlign,
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.4'
          }}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
          onClick={() => onSelectElement(element.id)}
        >
          {element.text}

          {/* Delete button */}
          {selectedElementId === element.id && (
            <button
              className="absolute -top-8 -right-8 bg-destructive text-destructive-foreground p-1 rounded hover:bg-destructive/90"
              onClick={(e) => {
                e.stopPropagation()
                deleteElement(element.id)
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}

      {/* Empty state */}
      {textElements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground/50">
            <p className="text-lg font-medium">Add text elements to begin</p>
            <p className="text-sm">Use the controls below to add and edit text</p>
          </div>
        </div>
      )}
    </div>
  )
}
