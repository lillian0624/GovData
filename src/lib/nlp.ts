// Natural Language Processing utilities for search queries

export interface ProcessedQuery {
  originalQuery: string
  keywords: string[]
  domains: string[]
  intent: 'search' | 'question' | 'comparison' | 'trend'
  entities: string[]
  confidence: number
}

// Domain mappings for different government data areas
const DOMAIN_KEYWORDS = {
  labour: [
    'employment', 'unemployment', 'workforce', 'job', 'labor', 'labour', 'occupation',
    'wage', 'salary', 'income', 'participation', 'work', 'career', 'skill', 'training'
  ],
  health: [
    'health', 'medical', 'hospital', 'disease', 'wellbeing', 'mental', 'aged care',
    'elderly', 'nursing', 'doctor', 'patient', 'treatment', 'medicine'
  ],
  housing: [
    'housing', 'home', 'property', 'rent', 'mortgage', 'affordable', 'homeless',
    'accommodation', 'dwelling', 'real estate', 'rental', 'household'
  ],
  education: [
    'education', 'school', 'university', 'training', 'learning', 'student',
    'teacher', 'qualification', 'degree', 'course', 'skill development'
  ],
  ageing: [
    'ageing', 'elderly', 'senior', 'retirement', 'pension', 'aged', 'population ageing',
    'longevity', 'geriatric', 'older people'
  ],
  inequality: [
    'inequality', 'poverty', 'wealth', 'disparity', 'gap', 'distribution', 'equity',
    'socioeconomic', 'disadvantage', 'income distribution'
  ],
  population: [
    'population', 'demographic', 'census', 'birth', 'death', 'migration', 'fertility',
    'mortality', 'age structure', 'regional'
  ]
}

// Question patterns for intent detection
const QUESTION_PATTERNS = [
  { pattern: /\b(what|which|where|how many|how much)\b/i, intent: 'search' as const },
  { pattern: /\b(show me|tell me|give me)\b/i, intent: 'search' as const },
  { pattern: /\b(compare|versus|vs|difference)\b/i, intent: 'comparison' as const },
  { pattern: /\b(trend|change|over time|since|from.*to)\b/i, intent: 'trend' as const }
]

// Entity recognition patterns
const ENTITY_PATTERNS = [
  { pattern: /\b(act|nsw|qld|sa|tas|vic|wa|nt)\b/gi, type: 'state' },
  { pattern: /\b(201\d|202\d)\b/g, type: 'year' },
  { pattern: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi, type: 'month' }
]

export function processQuery(query: string): ProcessedQuery {
  const normalizedQuery = query.toLowerCase().trim()

  // Extract keywords
  const keywords = extractKeywords(normalizedQuery)

  // Detect domains
  const domains = detectDomains(normalizedQuery, keywords)

  // Detect intent
  const intent = detectIntent(normalizedQuery)

  // Extract entities
  const entities = extractEntities(normalizedQuery)

  // Calculate confidence score
  const confidence = calculateConfidence(keywords, domains, entities)

  return {
    originalQuery: query,
    keywords,
    domains,
    intent,
    entities,
    confidence
  }
}

function extractKeywords(query: string): string[] {
  // Remove common stop words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall']

  const words = query
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))

  // Remove duplicates and return
  return [...new Set(words)]
}

function detectDomains(query: string, keywords: string[]): string[] {
  const detectedDomains: string[] = []
  const domainScores: Record<string, number> = {}

  // Check each domain's keywords against the query
  Object.entries(DOMAIN_KEYWORDS).forEach(([domain, domainKeywords]) => {
    let score = 0

    keywords.forEach(keyword => {
      if (domainKeywords.some(dk => dk.includes(keyword) || keyword.includes(dk))) {
        score += 1
      }
    })

    // Also check direct domain mentions
    if (query.includes(domain)) {
      score += 2
    }

    if (score > 0) {
      domainScores[domain] = score
    }
  })

  // Return domains sorted by score (highest first)
  return Object.entries(domainScores)
    .sort(([,a], [,b]) => b - a)
    .map(([domain]) => domain)
}

function detectIntent(query: string): ProcessedQuery['intent'] {
  for (const { pattern, intent } of QUESTION_PATTERNS) {
    if (pattern.test(query)) {
      return intent
    }
  }

  // Default to search intent
  return 'search'
}

function extractEntities(query: string): string[] {
  const entities: string[] = []

  ENTITY_PATTERNS.forEach(({ pattern }) => {
    const matches = query.match(pattern)
    if (matches) {
      entities.push(...matches)
    }
  })

  return [...new Set(entities)]
}

function calculateConfidence(keywords: string[], domains: string[], entities: string[]): number {
  let confidence = 0.5 // Base confidence

  // More keywords increase confidence
  confidence += Math.min(keywords.length * 0.1, 0.3)

  // Domain detection increases confidence
  confidence += domains.length * 0.1

  // Entity detection increases confidence
  confidence += entities.length * 0.1

  // Cap at 0.9
  return Math.min(confidence, 0.9)
}

// Helper function to get related terms for a query
export function getRelatedTerms(query: string): string[] {
  const processed = processQuery(query)
  const relatedTerms: string[] = []

  // Add related terms from detected domains
  processed.domains.forEach(domain => {
    const domainTerms = DOMAIN_KEYWORDS[domain as keyof typeof DOMAIN_KEYWORDS] || []
    relatedTerms.push(...domainTerms.slice(0, 3))
  })

  // Add synonyms for key terms
  const synonyms: Record<string, string[]> = {
    'employment': ['jobs', 'workforce', 'labor'],
    'unemployment': ['jobless', 'out of work'],
    'housing': ['accommodation', 'shelter', 'dwelling'],
    'aged care': ['elderly care', 'senior care', 'geriatric care'],
    'education': ['learning', 'training', 'qualification'],
    'inequality': ['disparity', 'gap', 'imbalance']
  }

  processed.keywords.forEach(keyword => {
    Object.entries(synonyms).forEach(([term, syns]) => {
      if (keyword.includes(term) || term.includes(keyword)) {
        relatedTerms.push(...syns)
      }
    })
  })

  return [...new Set(relatedTerms)]
}

// Function to generate search suggestions
export function generateSuggestions(query: string): string[] {
  const suggestions: string[] = []
  const processed = processQuery(query)

  // Add domain-specific suggestions
  processed.domains.forEach(domain => {
    switch (domain) {
      case 'labour':
        suggestions.push(
          `${query} by state`,
          `${query} trends`,
          `${query} by age group`,
          `${query} and skills`
        )
        break
      case 'health':
        suggestions.push(
          `${query} by region`,
          `${query} statistics`,
          `${query} and demographics`
        )
        break
      case 'housing':
        suggestions.push(
          `${query} affordability`,
          `${query} by location`,
          `${query} and income`
        )
        break
    }
  })

  // Add time-based suggestions if no year detected
  if (!processed.entities.some(e => /\d{4}/.test(e))) {
    suggestions.push(`${query} in 2023`, `${query} since 2015`)
  }

  return suggestions.slice(0, 4)
}
