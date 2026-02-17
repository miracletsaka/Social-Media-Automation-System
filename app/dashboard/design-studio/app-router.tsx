'use client'

import { useState } from 'react'
import EditorPage from './editor'
import ContentUploadPage from './content-upload'
import ReviewPage from './review-page'
import { Template, CampaignData } from '@/lib/types'

type AppPage = 'design' | 'content' | 'review'

export default function AppRouter() {
  const [currentPage, setCurrentPage] = useState<AppPage>('design')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [campaignData, setCampaignData] = useState<CampaignData>({
    hook: '',
    subheading: '',
    bullets: [],
    proof: '',
    cta: '',
    ctaLink: '',
    hashtags: '',
    companyName: '',
    location: '',
    links: []
  })

  const handleTemplateSelected = (template: Template) => {
    setSelectedTemplate(template)
    setCurrentPage('content')
  }

  const handleContentReady = (data: CampaignData) => {
    setCampaignData(data)
    setCurrentPage('review')
  }

  const handleReviewBack = () => {
    setCurrentPage('content')
  }

  const handleReviewEdit = () => {
    setCurrentPage('design')
  }

  return (
    <>
      {currentPage === 'design' && (
        <EditorPage onTemplateSelected={handleTemplateSelected} />
      )}
      {currentPage === 'content' && selectedTemplate && (
        <ContentUploadPage
          template={selectedTemplate}
          onContentReady={handleContentReady}
          onBack={() => setCurrentPage('design')}
        />
      )}
      {currentPage === 'review' && selectedTemplate && (
        <ReviewPage
          template={selectedTemplate}
          campaignData={campaignData}
          onBack={handleReviewBack}
          onEdit={handleReviewEdit}
        />
      )}
    </>
  )
}
