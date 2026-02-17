'use client'

import { useState } from 'react'
import { Template, CampaignData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import CampaignDataForm from '@/components/campaign-data-form'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ContentUploadPageProps {
  template: Template
  onContentReady: (data: CampaignData) => void
  onBack: () => void
}

export default function ContentUploadPage({
  template,
  onContentReady,
  onBack
}: ContentUploadPageProps) {
  const [campaignData, setCampaignData] = useState<CampaignData>({
    hook: '',
    subheading: '',
    bullets: ['', '', ''],
    proof: '',
    cta: '',
    ctaLink: '',
    hashtags: '',
    companyName: '',
    location: '',
    links: []
  })

  const handleContinue = () => {
    onContentReady(campaignData)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 max-w-full mx-auto">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Content Upload</h1>
            <p className="text-xs text-muted-foreground">Step 2 of 3 - Fill in your campaign content</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-border bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Design
            </Button>
            <Button
              onClick={handleContinue}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Preview & Review
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-6">
        <Card className="p-6 border-border">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Template: {template.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {template.description}
            </p>
          </div>

          <CampaignDataForm
            data={campaignData}
            onChange={setCampaignData}
          />
        </Card>
      </div>
    </main>
  )
}
