// Recommendation engine for related datasets

import { prisma } from './db'

interface DatasetType {
  id: string
  name: string
  description: string
  keywords: string
  domains: string
  tags: Array<{ name: string }>
  agencyId: string
  agency: { name: string }
  accessibility: string
}

export interface DatasetRecommendation {
  dataset: DatasetType
  score: number
  reason: string
  type: 'related' | 'domain' | 'keyword' | 'agency' | 'trending'
}

export interface RecommendationContext {
  currentDataset?: DatasetType
  searchQuery?: string
  domains?: string[]
  keywords?: string[]
  userHistory?: string[]
}

// Calculate similarity between two datasets
function calculateSimilarity(dataset1: DatasetType, dataset2: DatasetType): number {
  let similarity = 0

  // Domain overlap
  const domains1 = JSON.parse(dataset1.domains || '[]')
  const domains2 = JSON.parse(dataset2.domains || '[]')
  const domainOverlap = domains1.filter((d: string) => domains2.includes(d)).length
  similarity += domainOverlap * 0.3

  // Keyword overlap
  const keywords1 = JSON.parse(dataset1.keywords || '[]')
  const keywords2 = JSON.parse(dataset2.keywords || '[]')
  const keywordOverlap = keywords1.filter((k: string) =>
    keywords2.some((k2: string) => k2.includes(k) || k.includes(k2))
  ).length
  similarity += keywordOverlap * 0.2

  // Tag overlap
  const tags1 = dataset1.tags.map((t) => t.name)
  const tags2 = dataset2.tags.map((t) => t.name)
  const tagOverlap = tags1.filter((t: string) => tags2.includes(t)).length
  similarity += tagOverlap * 0.25

  // Same agency bonus
  if (dataset1.agencyId === dataset2.agencyId) {
    similarity += 0.1
  }

  // Accessibility bonus (prefer API-accessible datasets)
  if (dataset1.accessibility === 'api' && dataset2.accessibility === 'api') {
    similarity += 0.15
  }

  return similarity
}

// Get recommendations based on current dataset
export async function getRelatedRecommendations(
  datasetId: string,
  limit: number = 5
): Promise<DatasetRecommendation[]> {
  const currentDataset = await prisma.dataset.findUnique({
    where: { id: datasetId },
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

  if (!currentDataset) {
    return []
  }

  const recommendations: DatasetRecommendation[] = []

  // 1. Direct relationships (highest priority)
  const directRelations = [
    ...currentDataset.relatedFrom.map(r => ({ dataset: r.to, relationType: r.relationType, description: r.description })),
    ...currentDataset.relatedTo.map(r => ({ dataset: r.from, relationType: r.relationType, description: r.description }))
  ]

  directRelations.forEach(({ dataset, relationType, description }) => {
    recommendations.push({
      dataset: {
        ...dataset,
        keywords: (() => {
          try { return JSON.parse(dataset.keywords || '[]') } catch { return [] }
        })(),
        domains: (() => {
          try { return JSON.parse(dataset.domains || '[]') } catch { return [] }
        })()
      },
      score: 1.0,
      reason: `${relationType}: ${description || 'Direct relationship'}`,
      type: 'related'
    })
  })

  // 2. Same domain recommendations
  const domains = JSON.parse(currentDataset.domains || '[]')
  if (domains.length > 0) {
    const domainDatasets = await prisma.dataset.findMany({
      where: {
        id: { not: datasetId },
        domains: {
          contains: domains[0] // Primary domain
        }
      },
      include: {
        agency: true,
        tags: true
      },
      take: 10
    })

    domainDatasets.forEach(dataset => {
      const similarity = calculateSimilarity(currentDataset, dataset)
      if (similarity > 0.3) {
        recommendations.push({
          dataset: {
            ...dataset,
            keywords: JSON.parse(dataset.keywords || '[]'),
            domains: JSON.parse(dataset.domains || '[]')
          },
          score: similarity * 0.8,
          reason: `Same domain: ${domains[0]}`,
          type: 'domain'
        })
      }
    })
  }

  // 3. Same agency recommendations
  const agencyDatasets = await prisma.dataset.findMany({
    where: {
      id: { not: datasetId },
      agencyId: currentDataset.agencyId
    },
    include: {
      agency: true,
      tags: true
    },
    take: 5
  })

  agencyDatasets.forEach(dataset => {
    const similarity = calculateSimilarity(currentDataset, dataset)
    recommendations.push({
      dataset: {
        ...dataset,
        keywords: (() => {
          try { return JSON.parse(dataset.keywords || '[]') } catch { return [] }
        })(),
        domains: (() => {
          try { return JSON.parse(dataset.domains || '[]') } catch { return [] }
        })()
      },
      score: similarity * 0.6,
      reason: `From same agency: ${currentDataset.agency.name}`,
      type: 'agency'
    })
  })

  // Sort by score and remove duplicates
  const uniqueRecommendations = recommendations
    .filter((rec, index, self) =>
      index === self.findIndex(r => r.dataset.id === rec.dataset.id)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return uniqueRecommendations
}

// Get recommendations based on search context
export async function getSearchRecommendations(
  context: RecommendationContext,
  limit: number = 5
): Promise<DatasetRecommendation[]> {
  const recommendations: DatasetRecommendation[] = []

  if (context.domains && context.domains.length > 0) {
    // Domain-based recommendations
    const domainDatasets = await prisma.dataset.findMany({
      where: {
        domains: {
          contains: context.domains[0]
        }
      },
      include: {
        agency: true,
        tags: true
      },
      take: 10
    })

    domainDatasets.forEach(dataset => {
      recommendations.push({
        dataset: {
          ...dataset,
          keywords: JSON.parse(dataset.keywords || '[]'),
          domains: JSON.parse(dataset.domains || '[]')
        },
        score: 0.7,
        reason: `Popular in ${context.domains && context.domains.length > 0 ? context.domains[0] : 'general'} domain`,
        type: 'domain'
      })
    })
  }

  if (context.keywords && context.keywords.length > 0) {
    // Keyword-based recommendations
    const keywordConditions = context.keywords.map(keyword => ({
      keywords: { contains: keyword }
    }))

    const keywordDatasets = await prisma.dataset.findMany({
      where: {
        OR: keywordConditions
      },
      include: {
        agency: true,
        tags: true
      },
      take: 8
    })

    keywordDatasets.forEach(dataset => {
      const keywordMatches = context.keywords!.filter(keyword =>
        JSON.parse(dataset.keywords || '[]').some((k: string) => k.includes(keyword))
      ).length

      recommendations.push({
        dataset: {
          ...dataset,
          keywords: JSON.parse(dataset.keywords || '[]'),
          domains: JSON.parse(dataset.domains || '[]')
        },
        score: 0.5 + (keywordMatches * 0.1),
        reason: `Matches ${keywordMatches} search terms`,
        type: 'keyword'
      })
    })
  }

  // API-accessible datasets bonus
  const apiDatasets = await prisma.dataset.findMany({
    where: {
      accessibility: 'api',
      apiEndpoint: { not: null }
    },
    include: {
      agency: true,
      tags: true
    },
    take: 3
  })

  apiDatasets.forEach(dataset => {
    recommendations.push({
      dataset: {
        ...dataset,
        keywords: (() => {
          try { return JSON.parse(dataset.keywords || '[]') } catch { return [] }
        })(),
        domains: (() => {
          try { return JSON.parse(dataset.domains || '[]') } catch { return [] }
        })()
      },
      score: 0.6,
      reason: 'Live data available via API',
      type: 'keyword'
    })
  })

  // Remove duplicates and sort
  const uniqueRecommendations = recommendations
    .filter((rec, index, self) =>
      index === self.findIndex(r => r.dataset.id === rec.dataset.id)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return uniqueRecommendations
}

// Get trending/popular datasets
export async function getTrendingDatasets(limit: number = 5): Promise<DatasetRecommendation[]> {
  // Get datasets with most relationships (indicating importance)
  const trending = await prisma.dataset.findMany({
    include: {
      agency: true,
      tags: true,
      _count: {
        select: {
          relatedFrom: true,
          relatedTo: true
        }
      }
    },
    orderBy: {
      // This would ideally be based on search frequency, but for now use relationship count
      updatedAt: 'desc'
    },
    take: limit
  })

  return trending.map(dataset => ({
    dataset: {
      ...dataset,
      keywords: (() => {
        try { return JSON.parse(dataset.keywords || '[]') } catch { return [] }
      })(),
      domains: (() => {
        try { return JSON.parse(dataset.domains || '[]') } catch { return [] }
      })()
    },
    score: (dataset._count.relatedFrom + dataset._count.relatedTo) * 10,
    reason: 'Trending dataset based on relationships',
    type: 'trending' as const
  }))
}

// Get datasets that complement each other
export async function getComplementaryDatasets(datasetIds: string[]): Promise<DatasetRecommendation[]> {
  const recommendations: DatasetRecommendation[] = []

  for (const datasetId of datasetIds) {
    const related = await getRelatedRecommendations(datasetId, 2)
    recommendations.push(...related)
  }

  // Remove duplicates and original datasets
  return recommendations
    .filter((rec, index, self) =>
      index === self.findIndex(r => r.dataset.id === rec.dataset.id) &&
      !datasetIds.includes(rec.dataset.id)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}
