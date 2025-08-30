import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id: params.id },
      include: {
        agency: true,
        tags: true,
        relatedFrom: {
          include: {
            to: {
              include: {
                agency: true,
                tags: true
              }
            }
          }
        },
        relatedTo: {
          include: {
            from: {
              include: {
                agency: true,
                tags: true
              }
            }
          }
        }
      }
    })

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    // Process dataset to parse JSON fields
    const processedDataset = {
      ...dataset,
      keywords: JSON.parse(dataset.keywords || '[]'),
      domains: JSON.parse(dataset.domains || '[]')
    }

    return NextResponse.json(processedDataset)

  } catch (error) {
    console.error('Dataset fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
