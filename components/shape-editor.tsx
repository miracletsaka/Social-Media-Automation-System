'use client'

import { useState, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TemplateShape, CampaignData } from '@/lib/types'
import { CampaignContext } from '@/lib/campaign-context'
import { Trash2, Plus } from 'lucide-react'

interface ShapeEditorProps {
  shapes: TemplateShape[]
  selectedShapeId: string | null
  onShapeUpdate: (shape: TemplateShape) => void
  onShapeDelete: (id: string) => void
  onShapeAdd: (type: TemplateShape['type']) => void
  campaignData: CampaignData
}

export default function ShapeEditor({
  shapes,
  selectedShapeId,
  onShapeUpdate,
  onShapeDelete,
  onShapeAdd,
  campaignData,
}: ShapeEditorProps) {
  const selectedShape = shapes.find(s => s.id === selectedShapeId)

  if (!selectedShape) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Select a shape to edit</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onShapeAdd('text')}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <Plus className="w-3 h-3 mr-1" />
            Text
          </Button>
          <Button
            onClick={() => onShapeAdd('rectangle')}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <Plus className="w-3 h-3 mr-1" />
            Rectangle
          </Button>
          <Button
            onClick={() => onShapeAdd('rounded-rect')}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <Plus className="w-3 h-3 mr-1" />
            Rounded Box
          </Button>
          <Button
            onClick={() => onShapeAdd('circle')}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <Plus className="w-3 h-3 mr-1" />
            Circle
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Shape Properties</h3>
        <Button
          onClick={() => onShapeDelete(selectedShape.id)}
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Position & Size */}
      <div className="space-y-2">
        <label className="text-xs font-medium">Position & Size</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">X</label>
            <Input
              type="number"
              value={Math.round(selectedShape.x)}
              onChange={e =>
                onShapeUpdate({ ...selectedShape, x: parseFloat(e.target.value) })
              }
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Y</label>
            <Input
              type="number"
              value={Math.round(selectedShape.y)}
              onChange={e =>
                onShapeUpdate({ ...selectedShape, y: parseFloat(e.target.value) })
              }
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Width</label>
            <Input
              type="number"
              value={Math.round(selectedShape.width)}
              onChange={e =>
                onShapeUpdate({ ...selectedShape, width: parseFloat(e.target.value) })
              }
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Height</label>
            <Input
              type="number"
              value={Math.round(selectedShape.height)}
              onChange={e =>
                onShapeUpdate({ ...selectedShape, height: parseFloat(e.target.value) })
              }
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <label className="text-xs font-medium">Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedShape.backgroundColor || '#ffffff'}
            onChange={e =>
              onShapeUpdate({ ...selectedShape, backgroundColor: e.target.value })
            }
            className="h-8 w-12 rounded cursor-pointer"
          />
          <Input
            value={selectedShape.backgroundColor || '#ffffff'}
            onChange={e =>
              onShapeUpdate({ ...selectedShape, backgroundColor: e.target.value })
            }
            className="h-8 text-xs flex-1"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Border */}
      <div className="space-y-2">
        <label className="text-xs font-medium">Border</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedShape.borderColor || '#000000'}
                onChange={e =>
                  onShapeUpdate({ ...selectedShape, borderColor: e.target.value })
                }
                className="h-7 w-10 rounded cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Width (px)</label>
            <Input
              type="number"
              min="0"
              value={selectedShape.borderWidth || 0}
              onChange={e =>
                onShapeUpdate({ ...selectedShape, borderWidth: parseFloat(e.target.value) })
              }
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Border Radius */}
      {(selectedShape.type === 'rounded-rect' || selectedShape.type === 'circle') && (
        <div className="space-y-2">
          <label className="text-xs font-medium">Border Radius</label>
          <Input
            type="number"
            min="0"
            value={selectedShape.borderRadius || 0}
            onChange={e =>
              onShapeUpdate({ ...selectedShape, borderRadius: parseFloat(e.target.value) })
            }
            className="h-8 text-xs"
          />
        </div>
      )}

      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs font-medium">Opacity</label>
          <span className="text-xs text-muted-foreground">{Math.round((selectedShape.opacity || 1) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={selectedShape.opacity || 1}
          onChange={e =>
            onShapeUpdate({ ...selectedShape, opacity: parseFloat(e.target.value) })
          }
          className="w-full"
        />
      </div>

      {/* Shadow */}
      <div className="space-y-2 border-t pt-3">
        <label className="text-xs font-medium">Shadow Effect</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Color</label>
            <input
              type="color"
              value={selectedShape.shadowColor || '#000000'}
              onChange={e =>
                onShapeUpdate({ ...selectedShape, shadowColor: e.target.value })
              }
              className="h-6 w-10 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Blur (px)</label>
            <Input
              type="number"
              min="0"
              max="50"
              value={selectedShape.shadowBlur || 0}
              onChange={e =>
                onShapeUpdate({ ...selectedShape, shadowBlur: parseFloat(e.target.value) })
              }
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Offset X</label>
              <Input
                type="number"
                min="-20"
                max="20"
                value={selectedShape.shadowX || 0}
                onChange={e =>
                  onShapeUpdate({ ...selectedShape, shadowX: parseFloat(e.target.value) })
                }
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Offset Y</label>
              <Input
                type="number"
                min="-20"
                max="20"
                value={selectedShape.shadowY || 0}
                onChange={e =>
                  onShapeUpdate({ ...selectedShape, shadowY: parseFloat(e.target.value) })
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Text Properties */}
      {selectedShape.type === 'text' && (
        <div className="space-y-3 border-t pt-3">
          <div className="space-y-2">
            <label className="text-xs font-medium">Data Source</label>
            <Select
              value={selectedShape.dataField || 'hook'}
              onValueChange={value =>
                onShapeUpdate({
                  ...selectedShape,
                  dataField: value as TemplateShape['dataField'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hook">Hook (Title)</SelectItem>
                <SelectItem value="subheading">Subheading</SelectItem>
                <SelectItem value="bullet-0">Bullet 1</SelectItem>
                <SelectItem value="bullet-1">Bullet 2</SelectItem>
                <SelectItem value="bullet-2">Bullet 3</SelectItem>
                <SelectItem value="proof">Proof/Statistic</SelectItem>
                <SelectItem value="cta">Call to Action</SelectItem>
                <SelectItem value="hashtags">Hashtags</SelectItem>
                <SelectItem value="companyName">Company Name</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Font Family</label>
            <Select
              value={selectedShape.fontFamily || 'Arial'}
              onValueChange={value =>
                onShapeUpdate({ ...selectedShape, fontFamily: value })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Courier">Courier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Font Size</label>
              <Input
                type="number"
                min="8"
                max="120"
                value={selectedShape.fontSize || 16}
                onChange={e =>
                  onShapeUpdate({ ...selectedShape, fontSize: parseFloat(e.target.value) })
                }
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Font Weight</label>
              <Select
                value={String(selectedShape.fontWeight || 400)}
                onValueChange={value =>
                  onShapeUpdate({ ...selectedShape, fontWeight: parseFloat(value) })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400">Normal</SelectItem>
                  <SelectItem value="600">Semi Bold</SelectItem>
                  <SelectItem value="700">Bold</SelectItem>
                  <SelectItem value="800">Extra Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedShape.textColor || '#000000'}
                onChange={e =>
                  onShapeUpdate({ ...selectedShape, textColor: e.target.value })
                }
                className="h-8 w-12 rounded cursor-pointer"
              />
              <Input
                value={selectedShape.textColor || '#000000'}
                onChange={e =>
                  onShapeUpdate({ ...selectedShape, textColor: e.target.value })
                }
                className="h-8 text-xs flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Text Alignment</label>
            <Select
              value={selectedShape.textAlign || 'left'}
              onValueChange={value =>
                onShapeUpdate({
                  ...selectedShape,
                  textAlign: value as 'left' | 'center' | 'right',
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Padding</label>
            <Input
              type="number"
              min="0"
              value={selectedShape.padding || 0}
              onChange={e =>
                onShapeUpdate({ ...selectedShape, padding: parseFloat(e.target.value) })
              }
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}

      {/* Z-Index */}
      <div className="space-y-2">
        <label className="text-xs font-medium">Z-Index (Layer Order)</label>
        <Input
          type="number"
          value={selectedShape.zIndex || 1}
          onChange={e =>
            onShapeUpdate({ ...selectedShape, zIndex: parseFloat(e.target.value) })
          }
          className="h-8 text-xs"
        />
      </div>
    </div>
  )
}
