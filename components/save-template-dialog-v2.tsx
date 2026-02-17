'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getTemplateById, saveTemplate, updateTemplate } from '@/lib/template-storage'
import { TemplateShape, Template } from '@/lib/types'

interface SaveTemplateDialogV2Props {
  isOpen: boolean
  onClose: () => void
  shapes: TemplateShape[]
  canvasWidth: number
  canvasHeight: number
  backgroundImage?: string | null  // Add | null
  logoPlacement?: Template['logoPlacement']
  onSave?: (template: Template) => void
  editingTemplate?: Template | null
}

export default function SaveTemplateDialogV2({
  isOpen,
  onClose,
  shapes,
  canvasWidth,
  canvasHeight,
  backgroundImage,
  logoPlacement,
  onSave,
  editingTemplate,
}: SaveTemplateDialogV2Props) {
  const [templateName, setTemplateName] = useState(editingTemplate?.name || '')
  const [templateDescription, setTemplateDescription] = useState(editingTemplate?.description || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name')
      return
    }

    setIsLoading(true)
    try {
      let savedTemplate: Template

      if (editingTemplate) {
        const updatedRes = await updateTemplate(
          editingTemplate.id,
          templateName,
          shapes,
          canvasWidth,
          canvasHeight,
          templateDescription,
          backgroundImage,
          logoPlacement
        );

        if (!updatedRes?.ok) throw new Error("Failed to update template");

        // ✅ refetch full template (so UI updates correctly)
        const fresh = await getTemplateById(editingTemplate.id);
        savedTemplate = fresh as Template;

      } else {
        savedTemplate = await saveTemplate(
          templateName,
          shapes,
          canvasWidth,
          canvasHeight,
          templateDescription,
          backgroundImage,
          logoPlacement
        )
      }

      onSave?.(savedTemplate)
      setTemplateName('')
      setTemplateDescription('')
      onClose()
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTemplate ? 'Update Template' : 'Save as Template'}
          </DialogTitle>
          <DialogDescription>
            {editingTemplate
              ? 'Update your template with the current design.'
              : 'Save your current design as a reusable template.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Template Name *
            </label>
            <Input
              placeholder="e.g., Environmental Campaign v1"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description (optional)
            </label>
            <Textarea
              placeholder="Describe this template's purpose..."
              value={templateDescription}
              onChange={e => setTemplateDescription(e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="bg-muted/50 p-3 rounded text-sm space-y-1">
            <p className="font-medium text-foreground">Template Content</p>
            <p className="text-muted-foreground">{shapes.length} shapes</p>
            <p className="text-muted-foreground">
              Canvas: {canvasWidth} × {canvasHeight}px
            </p>
            {backgroundImage && (
              <p className="text-muted-foreground">Background image included</p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !templateName.trim()}
              className="bg-accent hover:bg-accent/90"
            >
              {isLoading ? 'Saving...' : editingTemplate ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
