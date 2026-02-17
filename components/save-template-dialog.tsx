'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextElement } from '@/components/canvas-editor'
import { saveTemplate, updateTemplate, Template } from '@/lib/template-storage'

interface SaveTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  textElements: TextElement[]
  onSave: (template: Template) => void
  editingTemplate?: Template | null
}

export default function SaveTemplateDialog({
  isOpen,
  onClose,
  textElements,
  onSave,
  editingTemplate
}: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState(editingTemplate?.name || '')
  const [templateDescription, setTemplateDescription] = useState(
    editingTemplate?.description || ''
  )
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name')
      return
    }

    setIsSaving(true)

    try {
      let template: Template | null

      if (editingTemplate) {
        template = updateTemplate(
          editingTemplate.id,
          templateName,
          textElements,
          templateDescription
        )
      } else {
        template = saveTemplate(templateName, textElements, templateDescription)
      }

      if (template) {
        onSave(template)
        handleClose()
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setTemplateName('')
    setTemplateDescription('')
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border rounded-lg shadow-lg z-50 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {editingTemplate ? 'Update Template' : 'Save as Template'}
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Environmental Campaign"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe this template..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground resize-none"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Template includes:</p>
            <ul className="mt-2 space-y-1">
              <li>• {textElements.length} text element{textElements.length !== 1 ? 's' : ''}</li>
              <li>• All font styles and colors</li>
              <li>• Text positioning and sizing</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !templateName.trim()}
          >
            {isSaving ? 'Saving...' : editingTemplate ? 'Update Template' : 'Save Template'}
          </Button>
        </div>
      </div>
    </>
  )
}
