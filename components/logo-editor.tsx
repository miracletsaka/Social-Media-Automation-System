'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import ImageUploader from '@/components/image-uploader'
import {
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Trash2,
} from 'lucide-react'

interface LogoPlacement {
  url: string
  x: number
  y: number
  width: number
  height: number
  opacity: number
}

interface LogoEditorProps {
  logo?: LogoPlacement
  onLogoChange: (logo: LogoPlacement | undefined) => void
}

type HorizontalAlign = 'left' | 'center' | 'right'
type VerticalAlign = 'top' | 'middle' | 'bottom'

export default function LogoEditor({ logo, onLogoChange }: LogoEditorProps) {
  const [selectedLogo, setSelectedLogo] = useState<LogoPlacement | undefined>(logo)

  const handleLogoUpload = (imageUrl: string) => {
    if (imageUrl) {
      const newLogo: LogoPlacement = {
        url: imageUrl,
        x: 20,
        y: 20,
        width: 80,
        height: 80,
        opacity: 1,
      }
      setSelectedLogo(newLogo)
      onLogoChange(newLogo)
    } else {
      setSelectedLogo(undefined)
      onLogoChange(undefined)
    }
  }

  const updateLogo = (updates: Partial<LogoPlacement>) => {
    if (selectedLogo) {
      const updated = { ...selectedLogo, ...updates }
      setSelectedLogo(updated)
      onLogoChange(updated)
    }
  }

  const alignHorizontal = (align: HorizontalAlign, canvasWidth: number = 1200) => {
    if (!selectedLogo) return
    let x = selectedLogo.x
    switch (align) {
      case 'left':
        x = 20
        break
      case 'center':
        x = (canvasWidth - selectedLogo.width) / 2
        break
      case 'right':
        x = canvasWidth - selectedLogo.width - 20
        break
    }
    updateLogo({ x })
  }

  const alignVertical = (align: VerticalAlign, canvasHeight: number = 675) => {
    if (!selectedLogo) return
    let y = selectedLogo.y
    switch (align) {
      case 'top':
        y = 20
        break
      case 'middle':
        y = (canvasHeight - selectedLogo.height) / 2
        break
      case 'bottom':
        y = canvasHeight - selectedLogo.height - 20
        break
    }
    updateLogo({ y })
  }

  return (
    <Card className="p-4 border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3">Logo & Branding</h3>

      {!selectedLogo ? (
        <ImageUploader onImageSelect={handleLogoUpload} />
      ) : (
        <div className="space-y-4">
          {/* Logo Preview */}
          <div className="bg-secondary/50 p-3 rounded border border-border">
            <img
              src={selectedLogo.url || "/placeholder.svg"}
              alt="Logo preview"
              className="w-full h-20 object-contain"
            />
          </div>

          {/* Size Controls */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Dimensions</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Width</label>
                <Input
                  type="number"
                  min="20"
                  max="400"
                  value={Math.round(selectedLogo.width)}
                  onChange={(e) => updateLogo({ width: parseFloat(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Height</label>
                <Input
                  type="number"
                  min="20"
                  max="400"
                  value={Math.round(selectedLogo.height)}
                  onChange={(e) => updateLogo({ height: parseFloat(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Position Controls */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Position</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">X</label>
                <Input
                  type="number"
                  min="0"
                  value={Math.round(selectedLogo.x)}
                  onChange={(e) => updateLogo({ x: parseFloat(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Y</label>
                <Input
                  type="number"
                  min="0"
                  value={Math.round(selectedLogo.y)}
                  onChange={(e) => updateLogo({ y: parseFloat(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium">Opacity</label>
              <span className="text-xs text-muted-foreground">
                {Math.round(selectedLogo.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedLogo.opacity}
              onChange={(e) => updateLogo({ opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Alignment Tools */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Alignment</label>
            <div className="space-y-2">
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 bg-transparent"
                  onClick={() => alignHorizontal('left')}
                >
                  <AlignStartHorizontal className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 bg-transparent"
                  onClick={() => alignHorizontal('center')}
                >
                  <AlignCenterHorizontal className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 bg-transparent"
                  onClick={() => alignHorizontal('right')}
                >
                  <AlignEndHorizontal className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 bg-transparent"
                  onClick={() => alignVertical('top')}
                >
                  <AlignStartVertical className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 bg-transparent"
                  onClick={() => alignVertical('middle')}
                >
                  <AlignCenterVertical className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 bg-transparent"
                  onClick={() => alignVertical('bottom')}
                >
                  <AlignEndVertical className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Remove Logo */}
          <Button
            variant="destructive"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() => {
              setSelectedLogo(undefined)
              onLogoChange(undefined)
            }}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Remove Logo
          </Button>
        </div>
      )}
    </Card>
  )
}
