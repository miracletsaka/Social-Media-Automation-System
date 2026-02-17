import { createContext } from 'react'
import { CampaignData } from './types'

export const DEFAULT_CAMPAIGN_DATA: CampaignData = {
  hook: 'Unlock the Power of AI: Automate Your Blog with WhatsApp!',
  subheading: 'Streamline Your Content Creation Process',
  bullets: [
    'Save time by automating blog posts with AI technology.',
    'Engage with your audience through effortless WhatsApp updates.',
    'Transform your blogging approach - innovate with simplicity!',
  ],
  proof: 'Businesses using AI tools for content create 60% more posts than their competitors.',
  cta: 'Embrace automation and revolutionize your blogging experience today!',
  hashtags: '#AI #Blogging #WhatsApp #ContentCreation #Automation',
  companyName: 'NEUROFLOW',
  location: 'MARKETING',
}

export interface CampaignContextType {
  campaignData: CampaignData
  setCampaignData: (data: CampaignData) => void
  updateCampaignField: (field: keyof CampaignData, value: string | string[]) => void
  logoUrl: string | null
  setLogoUrl: (url: string | null) => void
}

export const CampaignContext = createContext<CampaignContextType | undefined>(undefined)
