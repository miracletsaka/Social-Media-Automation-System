import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { backgroundImage, campaignData, templateId } = await request.json()

    if (!backgroundImage || !campaignData || !templateId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = process.env.BANNERBEAR_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Bannerbear API key not configured' }, { status: 500 })
    }

    // Build the modifications array for Bannerbear API
    // Map campaign data to template layers
    const modifications = [
      {
        name: 'hook',
        text: campaignData.hook
      },
      {
        name: 'subheading',
        text: campaignData.subheading
      },
      {
        name: 'bullet1',
        text: campaignData.bullets[0] || ''
      },
      {
        name: 'bullet2',
        text: campaignData.bullets[1] || ''
      },
      {
        name: 'bullet3',
        text: campaignData.bullets[2] || ''
      },
      {
        name: 'proof',
        text: campaignData.proof
      },
      {
        name: 'company',
        text: campaignData.companyName
      },
      {
        name: 'location',
        text: campaignData.location
      },
      {
        name: 'cta',
        text: campaignData.cta
      },
      {
        name: 'hashtags',
        text: campaignData.hashtags
      },
      {
        name: 'background_image',
        image_url: backgroundImage
      }
    ]

    // Call Bannerbear API
    const response = await fetch('https://api.bannerbear.com/v2/images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template: templateId,
        modifications: modifications.filter(m => m.text || m.image_url)
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Bannerbear API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate banner with Bannerbear', details: error },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      imageUrl: data.image_url,
      imageId: data.id,
      renderStatus: data.render_status
    })
  } catch (error) {
    console.error('Error processing banner request:', error)
    return NextResponse.json(
      { error: 'Failed to process banner request', details: String(error) },
      { status: 500 }
    )
  }
}
