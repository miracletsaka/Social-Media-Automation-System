'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, Edit2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Template, getTemplates, deleteTemplate } from '@/lib/template-storage'

interface TemplateManagerProps {
  onSelectTemplate: (template: Template) => void
  onEditTemplate?: (template: Template) => void
}

export default function TemplateManager({
  onSelectTemplate,
  onEditTemplate
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const loaded = getTemplates()
    setTemplates(loaded)
  }, [])

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(templateId)
      setTemplates(getTemplates())
    }
  }

  const handleCopy = (templateId: string) => {
    setCopied(templateId)
    setTimeout(() => setCopied(null), 2000)
  }

  if (templates.length === 0) {
    return (
      <div className="p-6 text-center bg-card rounded-lg border border-border">
        <p className="text-muted-foreground mb-2">No templates saved yet</p>
        <p className="text-xs text-muted-foreground">
          Create a design and save it as a template to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {templates.map(template => (
        <div
          key={template.id}
          className="p-4 bg-card border border-border rounded-lg hover:border-accent transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {template.name}
              </h3>
              {template.description && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {template.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {template.textElements.length} text element{template.textElements.length !== 1 ? 's' : ''}
                {' '} • Updated {new Date(template.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectTemplate(template)}
                className="whitespace-nowrap"
              >
                <Copy className="w-4 h-4 mr-1" />
                Apply
              </Button>

              {onEditTemplate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditTemplate(template)}
                  className="p-2"
                  title="Edit template"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(template.id)}
                className="p-2"
                title="Delete template"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
