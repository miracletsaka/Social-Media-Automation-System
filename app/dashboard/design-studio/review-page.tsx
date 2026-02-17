'use client'

import { useRef, useState } from 'react'
import { Template, CampaignData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import TemplateCanvas from '@/components/template-canvas'
import { ChevronLeft, Download, MessageSquare } from 'lucide-react'

interface ReviewPageProps {
  template: Template
  campaignData: CampaignData
  onBack: () => void
  onEdit: () => void
}

export default function ReviewPage({
  template,
  campaignData,
  onBack,
  onEdit
}: ReviewPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [instructions, setInstructions] = useState('')
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleExportPNG = () => {
    if (!canvasRef.current) return
    fitCanvas()
    const link = document.createElement('a')
    link.href = canvasRef.current.toDataURL('image/png')
    link.download = `${campaignData.companyName || 'campaign'}-${Date.now()}.png`
    link.click()
  }

  const fitCanvas = () => {
    setZoom(1) 
    setPan({ x: 0, y: 0 })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 max-w-full mx-auto">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Review & Export</h1>
            <p className="text-xs text-muted-foreground">Step 3 of 3 - Review your design and export</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-border bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Content
            </Button>
            <Button
              onClick={handleExportPNG}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Preview */}
          <div className="col-span-2">
            <Card className="border-border p-4">
              <div className="bg-white rounded border border-border overflow-auto flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                <TemplateCanvas
                  ref={canvasRef}
                  zoom={zoom}
                  setZoom={setZoom}
                  pan={pan}
                  setPan={setPan}
                  shapes={template.shapes}
                  backgroundImage={template.backgroundImage}
                  campaignData={campaignData}
                  canvasWidth={1200}
                  canvasHeight={675}
                  isEditable={false}
                />
              </div>
            </Card>

            {/* Campaign Data Summary */}
            <Card className="border-border p-4 mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Content Summary</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-foreground">Hook:</span>
                  <p className="text-muted-foreground">{campaignData.hook || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">Subheading:</span>
                  <p className="text-muted-foreground">{campaignData.subheading || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">Bullets:</span>
                  <ul className="text-muted-foreground list-disc list-inside">
                    {campaignData.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet || 'Empty'}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Instructions & Actions */}
          <div className="space-y-4">
            <Card className="border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Add Instructions</h3>
              <Textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Add any final instructions, notes, or requested revisions..."
                className="min-h-32"
              />
            </Card>

            <Card className="border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Next Steps</h3>
              <div className="space-y-2">
                <Button
                  onClick={handleExportPNG}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as PNG
                </Button>
                <Button
                  onClick={onEdit}
                  variant="outline"
                  className="w-full border-border bg-transparent"
                >
                  Edit Content
                </Button>
              </div>
            </Card>

            {instructions && (
              <Card className="border-border p-4 bg-secondary/50">
                <div className="flex gap-2">
                  <MessageSquare className="w-5 h-5 text-accent flex-shrink-0" />
                  <div className="text-sm">
                    <h4 className="font-semibold text-foreground mb-1">Instructions</h4>
                    <p className="text-muted-foreground">{instructions}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
