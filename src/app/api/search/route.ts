import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { processQuery, getRelatedTerms, generateSuggestions, ProcessedQuery } from '@/lib/nlp'

interface SearchWhereConditions {
  OR?: Array<{
    name?: { contains: string }
    description?: { contains: string }
    keywords?: { contains: string }
    tags?: { some: { name: { contains: string } } }
    domains?: { contains: string }
  }>
  domains?: { contains: string }
  agency?: { code: string }
}

interface DatasetWithAgency {
  id: string
  name: string
  description: string
  keywords: string
  tags: Array<{ name: string }>
  agency: { name: string }
  relatedFrom: Array<{ id: string }>
  relatedTo: Array<{ id: string }>
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const domain = searchParams.get('domain')
  const agency = searchParams.get('agency')

  console.log('Search request received:', { query, domain, agency })

  if (!query) {
    console.log('Search failed: No query parameter')
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {

    // Process query with NLP (with error handling)
    let processedQuery: ProcessedQuery | undefined
    let relatedTerms: string[]
    let suggestions: string[]
    try {
      processedQuery = processQuery(query)
      relatedTerms = getRelatedTerms(query)
      suggestions = generateSuggestions(query)
    } catch (nlpError) {
      console.error('NLP processing error:', nlpError)
      processedQuery = { originalQuery: query, keywords: query.split(' '), domains: [], intent: 'search', entities: [], confidence: 0.5 }
      relatedTerms = []
      suggestions = []
    }

    // Build search conditions (will be set later with OR conditions)

    // Build comprehensive search conditions
    const orConditions = []

    // Search in dataset name and description
    orConditions.push({
      name: {
        contains: query
      }
    })

    orConditions.push({
      description: {
        contains: query
      }
    })

    // Search using processed keywords
    processedQuery.keywords.forEach(term => {
      orConditions.push({
        keywords: {
          contains: term
        }
      })
    })

    // Search in tags with processed keywords
    processedQuery.keywords.forEach(term => {
      orConditions.push({
        tags: {
          some: {
            name: {
              contains: term
            }
          }
        }
      })
    })

    // Domain-specific search
    if (processedQuery.domains.length > 0) {
      processedQuery.domains.forEach(domainName => {
        orConditions.push({
          domains: {
            contains: domainName
          }
        })
      })
    }

    const whereConditions: SearchWhereConditions = {
      OR: orConditions
    }

    // Add domain filter if specified
    if (domain) {
      whereConditions.domains = {
        contains: domain
      }
    }

    // Add agency filter if specified
    if (agency) {
      whereConditions.agency = {
        code: agency
      }
    }

    const datasets = await prisma.dataset.findMany({
      where: whereConditions,
      include: {
        agency: true,
        tags: true,
        relatedFrom: {
          include: {
            to: {
              include: {
                agency: true
              }
            }
          }
        },
        relatedTo: {
          include: {
            from: {
              include: {
                agency: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 20
    })

    // Process datasets to parse JSON fields and add relevance scoring
    const processedDatasets = datasets.map(dataset => {
      try {
        return {
          ...dataset,
          keywords: JSON.parse(dataset.keywords || '[]'),
          domains: JSON.parse(dataset.domains || '[]'),
          relevanceScore: calculateRelevanceScore(dataset, query, processedQuery.keywords)
        }
      } catch (parseError) {
        console.error('JSON parse error for dataset:', dataset.id, parseError)
        return {
          ...dataset,
          keywords: [],
          domains: [],
          relevanceScore: 1
        }
      }
    })

    // Sort by relevance score
    processedDatasets.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Log search query for analytics
    await prisma.searchQuery.create({
      data: {
        query,
        results: processedDatasets.length
      }
    })

    return NextResponse.json({
      query,
      results: processedDatasets,
      total: processedDatasets.length,
      nlp: {
        processedQuery,
        relatedTerms,
        suggestions
      }
    })

  } catch (error) {
    console.error('Search error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateRelevanceScore(dataset: DatasetWithAgency, query: string, searchTerms: string[]): number {
  let score = 0

  // Exact matches in name get highest score
  if (dataset.name.toLowerCase().includes(query.toLowerCase())) {
    score += 100
  }

  // Matches in description
  if (dataset.description.toLowerCase().includes(query.toLowerCase())) {
    score += 50
  }

  // Keyword matches
  const keywords = JSON.parse(dataset.keywords || '[]')
  searchTerms.forEach(term => {
    if (keywords.some((keyword: string) => keyword.toLowerCase().includes(term))) {
      score += 25
    }
  })

  // Tag matches
  dataset.tags.forEach((tag) => {
    if (tag.name.toLowerCase().includes(query.toLowerCase())) {
      score += 20
    }
  })

  // Boost score for datasets with relationships
  const totalRelations = dataset.relatedFrom.length + dataset.relatedTo.length
  score += totalRelations * 10

  return score
}
