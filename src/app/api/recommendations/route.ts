import { NextRequest, NextResponse } from 'next/server'
import {
  getRelatedRecommendations,
  getSearchRecommendations,
  getTrendingDatasets,
  getComplementaryDatasets
} from '@/lib/recommendations'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')
  const datasetId = searchParams.get('datasetId')
  const query = searchParams.get('query')
  const domains = searchParams.get('domains')?.split(',')
  const keywords = searchParams.get('keywords')?.split(',')
  const datasetIds = searchParams.get('datasetIds')?.split(',')
  const limit = parseInt(searchParams.get('limit') || '5')

  try {
    let recommendations = []

    switch (type) {
      case 'related':
        if (!datasetId) {
          return NextResponse.json({ error: 'datasetId is required for related recommendations' }, { status: 400 })
        }
        recommendations = await getRelatedRecommendations(datasetId, limit)
        break

      case 'search':
        recommendations = await getSearchRecommendations({
          searchQuery: query || undefined,
          domains,
          keywords
        }, limit)
        break

      case 'trending':
        const trending = await getTrendingDatasets(limit)
        recommendations = trending.map(dataset => ({
          dataset,
          score: dataset.trendScore || 0.5,
          reason: 'Trending dataset',
          type: 'trending'
        }))
        break

      case 'complementary':
        if (!datasetIds || datasetIds.length === 0) {
          return NextResponse.json({ error: 'datasetIds are required for complementary recommendations' }, { status: 400 })
        }
        recommendations = await getComplementaryDatasets(datasetIds)
        break

      default:
        return NextResponse.json({ error: 'Invalid recommendation type' }, { status: 400 })
    }

    return NextResponse.json({
      type,
      recommendations,
      total: recommendations.length
    })

  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
