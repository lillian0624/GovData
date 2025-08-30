import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface DatasetWhereConditions {
  domains?: { contains: string }
  agency?: { code: string }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const domain = searchParams.get('domain')
  const agency = searchParams.get('agency')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const whereConditions: DatasetWhereConditions = {}

    if (domain) {
      whereConditions.domains = {
        contains: domain
      }
    }

    if (agency) {
      whereConditions.agency = {
        code: agency
      }
    }

    const datasets = await prisma.dataset.findMany({
      where: whereConditions,
      include: {
        agency: true,
        tags: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const total = await prisma.dataset.count({ where: whereConditions })

    // Process datasets to parse JSON fields
    const processedDatasets = datasets.map(dataset => ({
      ...dataset,
      keywords: JSON.parse(dataset.keywords || '[]'),
      domains: JSON.parse(dataset.domains || '[]')
    }))

    return NextResponse.json({
      datasets: processedDatasets,
      total,
      limit,
      offset
    })

  } catch (error) {
    console.error('Datasets fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const dataset = await prisma.dataset.create({
      data: {
        name: body.name,
        description: body.description,
        agencyId: body.agencyId,
        collectionDate: body.collectionDate ? new Date(body.collectionDate) : null,
        frequency: body.frequency,
        accessibility: body.accessibility,
        format: body.format,
        apiEndpoint: body.apiEndpoint,
        downloadUrl: body.downloadUrl,
        dataPortalUrl: body.dataPortalUrl,
        keywords: JSON.stringify(body.keywords || []),
        domains: JSON.stringify(body.domains || [])
      },
      include: {
        agency: true,
        tags: true
      }
    })

    return NextResponse.json(dataset, { status: 201 })

  } catch (error) {
    console.error('Dataset creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
