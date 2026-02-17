'use client'

import { CampaignData } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus } from 'lucide-react'

interface CampaignDataFormProps {
  data: CampaignData
  onChange: (data: CampaignData) => void
}

export default function CampaignDataForm({ data, onChange }: CampaignDataFormProps) {
  const handleFieldChange = (field: keyof CampaignData, value: string | string[]) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...data.bullets]
    newBullets[index] = value
    handleFieldChange('bullets', newBullets)
  }

  const addBullet = () => {
    handleFieldChange('bullets', [...data.bullets, ''])
  }

  const removeBullet = (index: number) => {
    handleFieldChange(
      'bullets',
      data.bullets.filter((_, i) => i !== index)
    )
  }

  return (
    <div className="space-y-1">
      {/* Hook */}
      <Card className="p-5 border-gray-200 bg-white shadow-sm">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          Hook / Title
        </label>
        <Textarea
          value={data.hook}
          onChange={e => handleFieldChange('hook', e.target.value)}
          placeholder="Your main headline..."
          className="min-h-20 bg-white border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          The main attention-grabbing headline for your campaign
        </p>
      </Card>

      {/* Subheading */}
      <Card className="p-5 border-gray-200 bg-white shadow-sm">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          Subheading
        </label>
        <Textarea
          value={data.subheading}
          onChange={e => handleFieldChange('subheading', e.target.value)}
          placeholder="Supporting headline..."
          className="min-h-16 bg-white border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Supporting text that elaborates on your hook
        </p>
      </Card>

      {/* Bullets */}
      <Card className="p-5 border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
            Key Benefits / Bullets
          </label>
          <Button
            onClick={addBullet}
            size="sm"
            variant="outline"
            className="h-8 border-gray-300 bg-white hover:bg-gray-50 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Bullet
          </Button>
        </div>
        <div className="space-y-3">
          {data.bullets.map((bullet, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 mt-2">
                {index + 1}
              </div>
              <Textarea
                value={bullet}
                onChange={e => handleBulletChange(index, e.target.value)}
                placeholder={`Benefit ${index + 1}...`}
                className="min-h-12 flex-1 bg-white border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              />
              <Button
                onClick={() => removeBullet(index)}
                size="sm"
                variant="ghost"
                className="h-12 w-10 text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          List the key benefits or features of your offering
        </p>
      </Card>

      {/* Proof / Social Proof */}
      <Card className="p-5 border-gray-200 bg-white shadow-sm">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          Proof / Statistic
        </label>
        <Textarea
          value={data.proof}
          onChange={e => handleFieldChange('proof', e.target.value)}
          placeholder="Add a statistic, testimonial, or proof element..."
          className="min-h-16 bg-white border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Add credibility with data, testimonials, or social proof
        </p>
      </Card>

      {/* CTA */}
      <Card className="p-5 border-gray-200 bg-white shadow-sm">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          Call to Action
        </label>
        <Textarea
          value={data.cta}
          onChange={e => handleFieldChange('cta', e.target.value)}
          placeholder="What should the audience do next?"
          className="min-h-16 bg-white border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
        />
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 mt-4">
          CTA Link
        </label>
        <Input
          value={data.ctaLink || ''}
          onChange={e => onChange({ ...data, ctaLink: e.target.value })}
          placeholder="https://example.com"
          type="url"
          className="bg-white border-gray-200 focus:ring-2 focus:ring-gray-900"
        />
        <p className="text-xs text-gray-500 mt-2">
          The action you want viewers to take and where it leads
        </p>
      </Card>

      {/* Hashtags */}
      <Card className="p-5 border-gray-200 bg-white shadow-sm">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          Hashtags
        </label>
        <Input
          value={data.hashtags}
          onChange={e => handleFieldChange('hashtags', e.target.value)}
          placeholder="#example #campaign #hashtags"
          className="bg-white border-gray-200 focus:ring-2 focus:ring-gray-900"
        />
        <p className="text-xs text-gray-500 mt-2">
          Relevant hashtags for social media distribution
        </p>
      </Card>

      {/* Additional Links */}
      <Card className="p-5 border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
            Additional Links
          </label>
          <Button
            onClick={() => onChange({
              ...data,
              links: [...(data.links || []), { label: '', url: '' }]
            })}
            size="sm"
            variant="outline"
            className="h-8 border-gray-300 bg-white hover:bg-gray-50 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Link
          </Button>
        </div>
        {(data.links || []).length > 0 ? (
          <div className="space-y-3">
            {(data.links || []).map((link, index) => (
              <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 space-y-2">
                  <Input
                    value={link.label}
                    onChange={e => {
                      const newLinks = [...(data.links || [])]
                      newLinks[index].label = e.target.value
                      onChange({ ...data, links: newLinks })
                    }}
                    placeholder="Link Label"
                    className="bg-white border-gray-200 focus:ring-2 focus:ring-gray-900"
                  />
                  <Input
                    value={link.url}
                    onChange={e => {
                      const newLinks = [...(data.links || [])]
                      newLinks[index].url = e.target.value
                      onChange({ ...data, links: newLinks })
                    }}
                    placeholder="https://..."
                    type="url"
                    className="bg-white border-gray-200 focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <Button
                  onClick={() => {
                    const newLinks = (data.links || []).filter((_, i) => i !== index)
                    onChange({ ...data, links: newLinks })
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-10 w-10 text-gray-400 hover:text-red-600 hover:bg-red-50 mt-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            No additional links added yet
          </div>
        )}
        <p className="text-xs text-gray-500 mt-3">
          Add supplementary links for more information or resources
        </p>
      </Card>

      {/* Company Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 border-gray-200 bg-white shadow-sm">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Company Name
          </label>
          <Input
            value={data.companyName}
            onChange={e => handleFieldChange('companyName', e.target.value)}
            placeholder="Your company..."
            className="bg-white border-gray-200 focus:ring-2 focus:ring-gray-900"
          />
          <p className="text-xs text-gray-500 mt-2">
            Your brand or company name
          </p>
        </Card>
        <Card className="p-5 border-gray-200 bg-white shadow-sm">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Location
          </label>
          <Input
            value={data.location}
            onChange={e => handleFieldChange('location', e.target.value)}
            placeholder="City, Country..."
            className="bg-white border-gray-200 focus:ring-2 focus:ring-gray-900"
          />
          <p className="text-xs text-gray-500 mt-2">
            Business location or target region
          </p>
        </Card>
      </div>
    </div>
  )
}