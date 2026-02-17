'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function EditorTutorial() {
  const [expanded, setExpanded] = useState(true)

  const steps = [
    {
      title: '1. Add Shapes',
      description: 'Click "Text", "Rectangle", "Circle", or "Rounded" buttons to add shapes to your canvas. You can add as many as you need.',
      tips: ['Click buttons in the Design tab on the left', 'Shapes will appear on the canvas', 'Each shape gets a unique ID']
    },
    {
      title: '2. Drag & Position Shapes',
      description: 'Click and drag any shape on the canvas to move it around. The shape will follow your mouse cursor.',
      tips: ['Click on the shape and hold', 'Drag it to the position you want', 'Release to place it', 'Watch the X/Y position values in the property panel update in real-time']
    },
    {
      title: '3. Resize Shapes',
      description: 'Move your cursor to the bottom-right corner of a shape to see the resize handle. Click and drag to change the width and height.',
      tips: ['Hover near the bottom-right corner of a shape', 'Drag outward to make it larger', 'Drag inward to make it smaller', 'Width and Height values update automatically']
    },
    {
      title: '4. Change Font Size (Text Only)',
      description: 'Select a text shape, go to the "Text" tab in the property panel. Find the "Size" field and type a number or use the input controls.',
      tips: ['Click on a text shape to select it', 'Click the "Text" tab in the right panel', 'Look for the "Size" field (range: 8-120)', 'Change the number to increase/decrease font size', 'Watch the text on the canvas update immediately']
    },
    {
      title: '5. Bind Text to Campaign Data',
      description: 'In the "Text" tab, use "Bind to Data" dropdown to connect your shape to a campaign field. The text will automatically populate from your campaign content.',
      tips: ['Select a text shape', 'Go to Text tab', 'Choose from: Hook, Subheading, Bullets, Proof, CTA, Hashtags, Company Name, Location', 'The shape will now show content from Campaign Data tab']
    },
    {
      title: '6. Edit Campaign Content',
      description: 'Go to the "Content" tab (middle left) to edit all your campaign text, bullets, and other content. Changes appear instantly on the canvas.',
      tips: ['Click the "Content" tab in the left panel', 'Edit the Hook, Subheading, Bullets, etc.', 'All bound text shapes will update automatically', 'Perfect for AI-generated or user-inputted content']
    },
    {
      title: '7. Style Shapes with Colors',
      description: 'Select a shape and go to the "Effects" tab to change background color, border color, opacity, and shadow effects.',
      tips: ['Click a shape to select it', 'Go to Effects tab', 'Click the color boxes to pick colors', 'Adjust opacity slider (0-100%)', 'Add shadows with blur and offset controls']
    },
    {
      title: '8. Save as Template',
      description: 'Once you\'re happy with your design, go to the "Templates" tab and click "Save Template". This layout can be reused with different campaign content.',
      tips: ['Finish designing your layout', 'Click Templates tab', 'Click "Save Template"', 'Give it a name and description', 'Templates save locally in your browser']
    },
    {
      title: '9. Apply Template to New Content',
      description: 'Upload a new background image, change your campaign content, then apply a saved template. The entire layout and styling applies instantly.',
      tips: ['Upload a new background image in the Design tab', 'Edit campaign content in the Content tab', 'Go to Templates tab and click "Apply" on a saved template', 'All shapes, positions, colors, and fonts apply instantly']
    },
    {
      title: '10. Export Your Design',
      description: 'Click "Export PNG" at the top to download your final campaign design as a high-quality image.',
      tips: ['Complete your design', 'Click Export PNG button at top', 'Image downloads as campaign-[timestamp].png', 'Ready to share or use in marketing']
    }
  ]

  return (
    <Card className="border-border bg-card">
      <div
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="font-semibold text-foreground">How to Use Campaign Designer</h2>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Follow these steps to create your first campaign template:
          </p>

          {steps.map((step, index) => (
            <div key={index} className="space-y-2 pb-4 border-b border-border last:border-0">
              <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              <div className="bg-secondary/30 rounded p-3 space-y-1">
                {step.tips.map((tip, tipIndex) => (
                  <div key={tipIndex} className="text-xs text-foreground flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-accent/10 border border-accent/20 rounded p-3">
            <p className="text-xs text-foreground">
              <strong>Pro Tip:</strong> Use the keyboard to quickly navigate:
            </p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <li>• Click and drag on canvas to move shapes</li>
              <li>• Drag from bottom-right corner to resize</li>
              <li>• Use number inputs for exact positioning</li>
              <li>• Templates save automatically in your browser</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  )
}
