import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params
    const apiKey = process.env.BANNERBEAR_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Bannerbear API key not configured' }, { status: 500 })
    }

    // Check status of banner generation
    const response = await fetch(`https://api.bannerbear.com/v2/images/${imageId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch banner status' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      id: data.id,
      render_status: data.render_status,
      image_url: data.image_url,
      created_at: data.created_at
    })
  } catch (error) {
    console.error('Error fetching banner status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banner status', details: String(error) },
      { status: 500 }
    )
  }
}
