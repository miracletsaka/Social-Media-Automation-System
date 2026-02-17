'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CampaignDataForm from '@/components/campaign-data-form'
import TemplateManagerV2 from '@/components/template-manager-v2'
import { Template, CampaignData } from '@/lib/types'
import { ArrowRight, ImagePlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

/** ✅ use your existing api helper */
import { getTopicChat } from '@/lib/api' // must return background_images

type DraftStructured = {
  hook?: string | null
  subheading?: string | null
  bullets?: string[] | string | null
  proof?: string | null
  cta?: string | null
  hashtags?: string | string[] | null
  companyName?: string | null
  location?: string | null
  ctaLink?: string | null
}

function safeArray(v: any): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v.map((x) => String(x || '').trim()).filter(Boolean)
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v)
      if (Array.isArray(parsed)) return parsed.map((x) => String(x || '').trim()).filter(Boolean)
    } catch {}
    if (v.includes(',')) return v.split(',').map((x) => x.trim()).filter(Boolean)
    if (v.includes('\n')) return v.split('\n').map((x) => x.trim()).filter(Boolean)
    return [v.trim()].filter(Boolean)
  }
  return []
}

function safeHashtags(v: any): string {
  if (!v) return ''
  if (Array.isArray(v)) return v.map((x) => String(x || '').trim()).filter(Boolean).join(' ')
  return String(v || '').trim()
}

export default function ContentUploadPage(props: {
  background_images?: string[]
  structured?: DraftStructured | null
  topicId?: string
  activeId?: string
}) {
  const router = useRouter()

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  // ✅ topic chat background library
  const [bgImages, setBgImages] = useState<string[]>([])
  const [bgLoading, setBgLoading] = useState(false)
  const [bgErr, setBgErr] = useState<string | null>(null)

  // ✅ user selection
  const [selectedBg, setSelectedBg] = useState<string>('') // empty = auto/random

  const [campaignData, setCampaignData] = useState<CampaignData>({
    hook: 'Unlock the Power of AI: Automate Your Blog with WhatsApp!',
    subheading: 'Streamline Your Content Creation Process',
    bullets: [
      'Save time by automating blog posts with AI technology.',
      'Engage with your audience through effortless WhatsApp updates.',
      'Transform your blogging approach - innovate with simplicity!',
    ],
    proof: 'Businesses using AI tools for content create 60% more posts than their competitors.',
    cta: 'Embrace automation and revolutionize your blogging experience today!',
    ctaLink: 'https://example.com',
    hashtags: '#AI #Blogging #WhatsApp #ContentCreation #Automation',
    companyName: 'NEUROFLOW',
    location: 'MARKETING',
  })

  // ✅ Dialog state for "Generate Image"
  const [openGen, setOpenGen] = useState(false)
  const [genPrompt, setGenPrompt] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [genErr, setGenErr] = useState<string | null>(null)

  // ✅ apply structured props into campaignData
  useEffect(() => {
    const s = props.structured
    if (!s) return

    setCampaignData((prev) => ({
      ...prev,
      hook: (s.hook ?? prev.hook) as any,
      subheading: (s.subheading ?? prev.subheading) as any,
      bullets: safeArray(s.bullets).length ? (safeArray(s.bullets) as any) : prev.bullets,
      proof: (s.proof ?? prev.proof) as any,
      cta: (s.cta ?? prev.cta) as any,
      hashtags: safeHashtags(s.hashtags) || prev.hashtags,
      companyName: (s.companyName ?? prev.companyName) as any,
      location: (s.location ?? prev.location) as any,
      ctaLink: (s.ctaLink ?? prev.ctaLink) as any,
    }))
  }, [props.structured])

  // ✅ load topic backgrounds when topicId exists
  useEffect(() => {
    const topicId = props.topicId
    if (!topicId) return

    let cancelled = false

    const run = async () => {
      setBgLoading(true)
      setBgErr(null)
      try {
        const clean = props.background_images?.map(String).map((x) => x.trim()).filter(Boolean) || []
        if (!cancelled) setBgImages(clean)
      } catch (e: any) {
        if (!cancelled) setBgErr(e?.message || 'Failed to load background images')
      } finally {
        if (!cancelled) setBgLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [props.topicId])

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    // reset background selection each time a new template is picked (optional)
    setSelectedBg('')
  }

  const pickRandomBg = (list: string[]) => {
    if (!list.length) return ''
    const idx = Math.floor(Math.random() * list.length)
    return list[idx]
  }

  const handleProceedToGenerate = () => {
    if (!selectedTemplate || !props.activeId || !props.topicId) return

    // ✅ if user didn't choose, random
    const bg = selectedBg || pickRandomBg(bgImages)

    const params = new URLSearchParams()
    params.set('q', props.activeId)
    params.set('topic', props.topicId)
    params.set('templateId', selectedTemplate.id)
    if (bg) params.set('bg', bg)

    router.push(`/dashboard/design-studio/user/generate?${params.toString()}`)
  }

  const defaultPrompt = useMemo(() => {
    const bullets = (campaignData?.bullets || []).slice(0, 3).join(' | ')
    const tags = (campaignData?.hashtags || '').trim()
    return [
      `Create a premium ad background image for ${campaignData.companyName || 'a brand'}.`,
      `Headline: ${campaignData.hook}`,
      `Subheading: ${campaignData.subheading}`,
      bullets ? `Key points: ${bullets}` : '',
      tags ? `Hashtags/context: ${tags}` : '',
      'Style: clean, minimal, soft lighting, commercial photography feel, leave empty space for headline text, no text rendered on the image.',
    ]
      .filter(Boolean)
      .join('\n')
  }, [campaignData])

  const openGenerateDialog = () => {
    setGenErr(null)
    setGenPrompt(defaultPrompt)
    setOpenGen(true)
  }

  const handleGenerateImage = async () => {
    setGenErr(null)
    setGenLoading(true)
    try {
      // hook to your image generation (later)
      setOpenGen(false)
    } catch (e: any) {
      setGenErr(e?.message || 'Failed to generate image')
    } finally {
      setGenLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
                  Create Campaign
                </h1>
                <p className="text-gray-600">
                  Select a template, choose a background, then generate.
                </p>
              </div>

              <Button
                onClick={openGenerateDialog}
                variant="outline"
                className="border-gray-300 bg-white hover:bg-gray-50"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Generate Image
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {/* Left: Template Selection */}
          <div className="bg-white shadow-sm rounded-lg p-6 space-y-1">
              <div>
                <h2 className="font-semibold text-gray-900 mb-4 text-lg">Select Template</h2>
                <TemplateManagerV2 
                  selectedTemplateId={selectedTemplate?.id || null}
                  onSelectTemplate={handleSelectTemplate}
                />
              </div>

              {/* ✅ Background chooser (only after template selected) */}
              {selectedTemplate && (
                <div className="pt-6 border-t border-gray-200 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Selected template</p>
                    <p className="font-semibold text-gray-900">{selectedTemplate.name}</p>
                    {selectedTemplate.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedTemplate.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">Choose Background</p>
                      <button
                        className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                        onClick={() => setSelectedBg('')}
                        type="button"
                      >
                        Auto (random)
                      </button>
                    </div>

                    {bgLoading ? (
                      <div className="text-sm text-gray-500 text-center py-4">Loading backgrounds…</div>
                    ) : bgErr ? (
                      <div className="text-sm text-red-600 bg-red-50 rounded p-3">{bgErr}</div>
                    ) : bgImages.length === 0 ? (
                      <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        No backgrounds uploaded for this topic chat yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {bgImages.slice(0, 9).map((url) => {
                          const active = selectedBg === url
                          return (
                            <button
                              key={url}
                              type="button"
                              onClick={() => setSelectedBg(url)}
                              className={[
                                'relative rounded-lg overflow-hidden border-2 transition-all',
                                active ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' : 'border-gray-200 hover:border-gray-300',
                              ].join(' ')}
                              title="Select background"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="bg" className="h-20 w-full object-cover" />
                              {active && (
                                <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
                      {selectedBg
                        ? '✓ Using selected background'
                        : bgImages.length
                          ? 'No selection → will pick a random background'
                          : 'No backgrounds available → generation will use template/default background'}
                    </div>
                  </div>

                  <Button
                    onClick={handleProceedToGenerate}
                    disabled={!selectedTemplate || !props.activeId || !props.topicId}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 font-medium"
                  >
                    Proceed to Generate
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>

          {/* Right: Content Form */}
          <div className="bg-white shadow">
            <h2 className="font-semibold text-gray-900 mb-4 text-lg">Campaign Content</h2>
            <CampaignDataForm data={campaignData} onChange={setCampaignData} />
          </div>
        </div>
      </div>

      {/* ✅ Generate Image Dialog */}
      <Dialog open={openGen} onOpenChange={setOpenGen}>
        <DialogContent className="sm:max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Generate Image</DialogTitle>
            <DialogDescription className="text-gray-600">
              This will generate a background image using your current campaign content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Prompt (editable)
              </label>
              <textarea
                className="w-full min-h-[220px] border border-gray-200 rounded-lg p-4 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
              />
            </div>

            {genErr && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                {genErr}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300 bg-white hover:bg-gray-50"
              onClick={() => setOpenGen(false)}
              disabled={genLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateImage} 
              disabled={genLoading || !genPrompt.trim()}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {genLoading ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
