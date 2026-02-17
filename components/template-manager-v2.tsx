// ✅ TemplateManagerV2.tsx (UPDATED: styled for gray-100 background with white cards)
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Template } from '@/lib/types'
import { RefreshCcw, Trash2, Pencil, Check } from 'lucide-react'
import { getTemplates, deleteTemplate, updateTemplate } from '@/lib/template-storage'

// shadcn dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface Props {
  brandId?: string
  selectedTemplateId?: string | null
  onSelectTemplate: (t: Template) => void
  onDeleted?: (id: string) => void
  onUpdated?: (t: Template) => void // optional hook for parent
}

export default function TemplateManagerV2({
  brandId,
  selectedTemplateId,
  onSelectTemplate,
  onDeleted,
  onUpdated,
}: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  // delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Template | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setErr(null)
    try {
      const data = await getTemplates(brandId)
      setTemplates(data || [])
    } catch (e: any) {
      setErr(e?.message || 'Failed to load templates')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return templates
    return templates.filter((t) => (t.name || '').toLowerCase().includes(q))
  }, [templates, search])

  const openEdit = (t: Template) => {
    setErr(null)
    setEditing(t)
    setEditName(t.name || '')
    setEditDescription(t.description || '')
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editing) return
    const name = editName.trim()
    const description = editDescription.trim()

    if (!name) {
      setErr('Template name is required.')
      return
    }

    setEditSaving(true)
    setErr(null)
    try {
      const res = await updateTemplate(editing.id, {
        name,
        description: description || null,
      })

      if (!res?.ok) throw new Error('Update failed')

      const updated: Template = {
        ...editing,
        name,
        description: description || undefined,
        updatedAt: new Date().toISOString(),
      }

      setTemplates((prev) => prev.map((t) => (t.id === editing.id ? updated : t)))
      onUpdated?.(updated)

      setEditOpen(false)
      setEditing(null)
    } catch (e: any) {
      setErr(e?.message || 'Failed to update template')
    } finally {
      setEditSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    setErr(null)
    try {
      const ok = await deleteTemplate(deleteId)
      if (!ok) throw new Error('Delete failed')

      setTemplates((prev) => prev.filter((t) => t.id !== deleteId))
      onDeleted?.(deleteId)
      setDeleteId(null)
    } catch (e: any) {
      setErr(e?.message || 'Failed to delete template')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
        <div className="text-sm text-gray-500 text-center">Loading templates…</div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* top row */}
      <div className="flex gap-2">
        <Input
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-sm bg-white border-gray-200 focus:ring-2 focus:ring-gray-900"
        />
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 bg-white border-gray-200 hover:bg-gray-50"
          onClick={refresh}
          title="Refresh"
        >
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>

      {err && (
        <div className="text-xs text-red-600 bg-red-50 rounded-lg p-3">
          {err}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <div className="text-sm text-gray-500 text-center">No templates found.</div>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map((t) => {
            const isSelected = selectedTemplateId === t.id
            const thumb = (t as any).thumbnail_url as string | undefined

            return (
              <Card
                key={t.id}
                className={[
                  'p-0 border-2 cursor-pointer transition-all overflow-hidden',
                  isSelected 
                    ? 'ring-2 ring-gray-900 ring-offset-2 border-gray-900 bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white',
                ].join(' ')}
                onClick={() => onSelectTemplate(t)} // ✅ clicking card selects + fills canvas
              >
                {/* Thumbnail section */}
                {thumb && (
                  <div className="relative aspect-[3/4] bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt={t.name} className="w-full h-full object-cover" />
                    
                    {/* Selected overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
                        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-7 h-7 text-white" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Content section */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    {/* left */}
                    <div className="flex gap-3 min-w-0 flex-1">
                      {!thumb && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 shrink-0 flex items-center justify-center">
                          <div className="text-[10px] text-gray-400">No preview</div>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={[
                            'font-semibold text-sm truncate',
                            isSelected ? 'text-gray-900' : 'text-gray-700'
                          ].join(' ')}>
                            {t.name}
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-900 text-white shrink-0">
                              <Check className="w-3 h-3" strokeWidth={3} />
                              <span>Selected</span>
                            </div>
                          )}
                        </div>

                        {t.description && (
                          <div className="text-xs text-gray-500 line-clamp-2 mb-1">
                            {t.description}
                          </div>
                        )}

                        <div className="text-xs text-gray-400">
                          {(t.shapes?.length ?? 0)} shapes • {t.canvasWidth}×{t.canvasHeight}
                        </div>
                      </div>
                    </div>

                    {/* right actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* ✅ edit */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white border-gray-200 hover:bg-gray-50"
                        title="Edit name/description"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEdit(t)
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>

                      {/* delete */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white border-gray-200 hover:bg-gray-50 hover:border-red-300 hover:text-red-600"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(t.id)
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* inline delete confirm */}
                  {deleteId === t.id && (
                    <div
                      className="mt-3 p-3 rounded-lg border-2 border-red-200 bg-red-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-sm text-red-900 font-semibold mb-2">
                        Delete "{t.name}"?
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-8 bg-red-600 hover:bg-red-700 text-white"
                          onClick={confirmDelete}
                          disabled={deleting}
                        >
                          {deleting ? 'Deleting…' : 'Delete'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-gray-300 bg-white hover:bg-gray-50"
                          onClick={() => setDeleteId(null)}
                          disabled={deleting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ✅ Edit dialog (simple and clean) */}
      <Dialog open={editOpen} onOpenChange={(o) => !editSaving && setEditOpen(o)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Edit template</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update name/description only (layout edits happen on the canvas).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Name</label>
              <Input 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                className="bg-white border-gray-200 focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional"
                className="bg-white border-gray-200 focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {editing && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                <span className="font-semibold">ID:</span>{' '}
                <span className="font-mono break-all">{editing.id}</span>
              </div>
            )}

            {err && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                {err}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="border-gray-300 bg-white hover:bg-gray-50"
              onClick={() => {
                if (editSaving) return
                setEditOpen(false)
                setEditing(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveEdit} 
              disabled={editSaving}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {editSaving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}