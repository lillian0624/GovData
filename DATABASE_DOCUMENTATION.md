

# GovConnect Database Architecture & Integration Documentation

## 📊 Overview

**GovConnect** is a comprehensive government data discovery platform that integrates multiple Australian government datasets with real-time ABS data access and intelligent recommendations. This document provides complete technical documentation of the database architecture, data integration, and system capabilities.

---

## 🗄️ Database Architecture

### Primary Database: SQLite with Prisma ORM

**Location**: `prisma/dev.db`
**Technology**: SQLite 3 with Prisma ORM
**Schema Definition**: `prisma/schema.prisma`

### Core Database Models

#### 1. **Agency Model**
```prisma
model Agency {
  id          String   @id @default(cuid())
  code        String   @unique // ABS, AIHW, DoE, etc.
  name        String
  description String?
  website     String?
  datasets    Dataset[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Purpose**: Represents government agencies providing data
**Relationships**: One-to-many with Dataset
**Current Agencies**:
- **ABS**: Australian Bureau of Statistics
- **AIHW**: Australian Institute of Health and Welfare
- **DoE**: Department of Education, Skills and Employment

#### 2. **Dataset Model**
```prisma
model Dataset {
  id            String   @id @default(cuid())
  name          String
  description   String
  agencyId      String
  agency        Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)

  // Metadata fields
  collectionDate DateTime?
  frequency      String? // annual, monthly, quarterly, one-off
  accessibility  String  // public, api, request-only
  format         String  // CSV, API, PDF, data-cube

  // Access information
  apiEndpoint    String?
  downloadUrl    String?
  dataPortalUrl  String?

  // Search and categorization
  keywords       String // JSON array of searchable keywords
  domains        String // JSON array of domains: education, housing, health, labour, ageing, inequality
  tags           Tag[]

  // Relationships
  relatedFrom    DatasetRelation[] @relation("from")
  relatedTo      DatasetRelation[] @relation("to")

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([name, agencyId])
}
```

**Key Features**:
- **JSON Storage**: Keywords and domains stored as JSON arrays
- **Tag System**: Many-to-many relationship with Tag model
- **Relationship Mapping**: Supports complex dataset interconnections
- **Metadata Rich**: Comprehensive metadata for discovery and filtering

#### 3. **Tag Model**
```prisma
model Tag {
  id        String    @id @default(cuid())
  name      String    @unique
  datasets  Dataset[]
  createdAt DateTime @default(now())
}
```

**Current Tags**:
- `labour-market`, `aged-care`, `workforce`
- `housing`, `population`, `education`
- `skills`, `inequality`, `ageing`, `health`

#### 4. **DatasetRelation Model**
```prisma
model DatasetRelation {
  id          String @id @default(cuid())
  fromId      String
  toId        String
  relationType String // feeds-into, related-to, depends-on, etc.
  description String?

  from        Dataset @relation("from", fields: [fromId], references: [id], onDelete: Cascade)
  to          Dataset @relation("to", fields: [toId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())

  @@unique([fromId, toId, relationType])
}
```

**Relationship Types**:
- `feeds-into`: One dataset provides data that flows into another
- `related-to`: Datasets are thematically connected
- `depends-on`: One dataset requires data from another

#### 5. **SearchQuery Model**
```prisma
model SearchQuery {
  id          String   @id @default(cuid())
  query       String
  userId      String? // For future user tracking
  results     Int      @default(0)
  timestamp   DateTime @default(now())

  @@index([query])
  @@index([timestamp])
}
```

**Purpose**: Analytics and search optimization tracking

---

## 🔗 Database Connectivity & Tag Integration

### Tag System Architecture

#### **Many-to-Many Relationships**
```typescript
// Dataset-Tag relationship structure
Dataset {
  tags: Tag[]
}

Tag {
  datasets: Dataset[]
}
```

#### **Tag Connection Methods**

1. **Prisma Connect Syntax**:
```typescript
// Connecting tags during dataset creation
await prisma.dataset.create({
  data: {
    name: "Labour Force Data",
    tags: {
      connect: [
        { name: 'labour-market' },
        { name: 'workforce' }
      ]
    }
  }
})
```

2. **Tag-Based Queries**:
```typescript
// Find datasets by tag
const labourDatasets = await prisma.dataset.findMany({
  where: {
    tags: {
      some: {
        name: 'labour-market'
      }
    }
  }
})
```

3. **Tag Aggregation**:
```typescript
// Get tag statistics
const tagStats = await prisma.tag.findMany({
  include: {
    _count: {
      select: { datasets: true }
    }
  }
})
```

### JSON Field Processing

#### **Keywords Field**
```typescript
// Storage format
keywords: JSON.stringify(['employment', 'unemployment', 'labour force'])

// Query format
where: {
  keywords: {
    contains: 'employment'
  }
}
```

#### **Domains Field**
```typescript
// Storage format
domains: JSON.stringify(['labour', 'economy', 'inequality'])

// Query format
where: {
  domains: {
    contains: 'labour'
  }
}
```

---

## 🔍 Search & Discovery System

### NLP-Powered Search

#### **Query Processing Pipeline**

1. **Input Processing**: `processQuery(query)`
   - Tokenizes search terms
   - Identifies domains and entities
   - Extracts keywords and intent

2. **Search Execution**:
```typescript
// Multi-field search with OR conditions
const orConditions = [
  { name: { contains: query } },
  { description: { contains: query } },
  { keywords: { contains: term } },
  {
    tags: {
      some: {
        name: { contains: term }
      }
    }
  }
]
```

3. **Relevance Scoring**:
```typescript
function calculateRelevanceScore(dataset, query, searchTerms) {
  let score = 0

  // Exact name matches: +100 points
  // Description matches: +50 points
  // Keyword matches: +25 points each
  // Tag matches: +20 points each
  // Relationship bonus: +10 points per relation

  return score
}
```

### Filter System

#### **Available Filters**:
- **Domain**: labour, health, education, housing, etc.
- **Agency**: ABS, AIHW, DoE
- **Accessibility**: public, api, request-only
- **Format**: CSV, API, PDF, data-cube

#### **Filter Implementation**:
```typescript
const whereConditions = {
  OR: orConditions,
  ...(domain && { domains: { contains: domain } }),
  ...(agency && { agency: { code: agency } })
}
```

---

## 🚀 ABS Real-Time Data Integration

### ABS API Architecture

#### **API Endpoint Structure**
```typescript
// Route: /api/abs
// Methods: GET (fetch data), POST (search datasets)

const ABS_BASE_URL = 'https://api.data.abs.gov.au'
const ABS_API_KEY = process.env.ABS_API_KEY // Optional authentication
```

#### **SDMX Query Format**
```javascript
// ABS API URL structure
const absUrl = `https://data.api.abs.gov.au/rest/data/${dataflow},${dataset},1.0.0/all`

// Example: Business Indicators
const qbUrl = `https://data.api.abs.gov.au/rest/data/ABS,QBIS,1.0.0/all?dimensionAtObservation=AllDimensions`
```

#### **Request Configuration**
```typescript
const response = await axios.get(finalUrl, {
  headers: {
    'Accept': 'application/vnd.sdmx.data+json;version=2.0.0',
    ...(ABS_API_KEY && { 'Authorization': `Bearer ${ABS_API_KEY}` })
  },
  timeout: 30000
})
```

### Working ABS Datasets

#### **✅ Confirmed Working Datasets**

| Dataset ID | Name | Dataflow | Dataset | Status |
|------------|------|----------|---------|--------|
| QBIS | Business Indicators | ABS | QBIS | ✅ Working |
| LABOUR_FORCE | Labour Force | ABS | LABOUR_FORCE | 🔄 Testing |
| CPI | Consumer Price Index | ABS | CPI | 🔄 Testing |
| WPI | Wage Price Index | ABS | WPI | 🔄 Testing |

#### **Data Structure**
```json
{
  "source": "ABS Data API",
  "dataflow": "ABS",
  "dataset": "QBIS",
  "data": {
    "dataSets": [...],
    "structure": {
      "dimensions": {...},
      "measures": {...},
      "attributes": {...}
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📊 Visualization & Data Presentation

### ABS Data Visualization

#### **Data Rendering Pipeline**

1. **Raw Data Reception**:
```typescript
const absData: ABSDataResponse | null = null

interface ABSDataResponse {
  source: string
  dataflow: string
  dataset: string
  data: any // SDMX-JSON format
  timestamp: string
}
```

2. **Visualization Components**:
```typescript
function renderDataVisualization(absData: ABSDataResponse) {
  // Process SDMX data structure
  // Extract dimensions, measures, observations
  // Generate appropriate chart types
}
```

#### **Supported Chart Types**
- **Time Series**: Line charts for historical data
- **Categorical**: Bar charts for comparisons
- **Geographic**: State/territory breakdowns
- **Cross-sectional**: Multi-dimensional analysis

### Dataset Cards & Metadata Display

#### **Dataset Information Display**
```typescript
interface DatasetCardProps {
  dataset: {
    id: string
    name: string
    description: string
    agency: Agency
    tags: Tag[]
    keywords: string[]
    domains: string[]
    accessibility: string
    format: string
    collectionDate?: Date
    frequency?: string
  }
}
```

#### **Rich Metadata Presentation**
- **Agency Attribution**: Clear source identification
- **Tag Visualization**: Colored tag badges
- **Accessibility Indicators**: API, Download, Request-only
- **Update Frequency**: Monthly, Quarterly, Annual
- **Relationship Indicators**: Related datasets

---

## 🤖 Intelligent Recommendations Engine

### Recommendation Types

#### **1. Direct Relationships**
```typescript
// Based on explicit dataset relationships
const directRelations = [
  ...dataset.relatedFrom.map(r => r.to),
  ...dataset.relatedTo.map(r => r.from)
]
```

#### **2. Domain-Based Recommendations**
```typescript
// Same domain datasets
const domainDatasets = await prisma.dataset.findMany({
  where: {
    domains: { contains: domainName },
    id: { not: currentDataset.id }
  }
})
```

#### **3. Similarity-Based Recommendations**
```typescript
function calculateSimilarity(dataset1, dataset2) {
  // Domain overlap: 30% weight
  // Keyword overlap: 20% weight
  // Tag overlap: 25% weight
  // Same agency: 10% bonus
  // API accessibility: 15% bonus
}
```

#### **4. Search-Based Recommendations**
```typescript
// Based on search terms and user context
const searchRecommendations = await getSearchRecommendations({
  searchQuery,
  domains,
  keywords
})
```

### Recommendation Scoring

#### **Scoring Algorithm**
```typescript
interface DatasetRecommendation {
  dataset: any
  score: number      // 0.0 to 1.0
  reason: string     // Human-readable explanation
  type: 'related' | 'domain' | 'keyword' | 'agency'
}
```

---

## 🔧 System Integration & APIs

### Internal API Endpoints

#### **1. Search API**
```typescript
// GET /api/search?q=query&domain=labour&agency=ABS
{
  query: "aged care workforce",
  results: [...],
  total: 15,
  nlp: {
    processedQuery: {...},
    relatedTerms: [...],
    suggestions: [...]
  }
}
```

#### **2. ABS Data API**
```typescript
// GET /api/abs?dataflow=ABS&dataset=QBIS
{
  source: "ABS Data API",
  dataflow: "ABS",
  dataset: "QBIS",
  data: { /* SDMX-JSON data */ },
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

#### **3. Recommendations API**
```typescript
// GET /api/recommendations?datasetId=xyz
[
  {
    dataset: {...},
    score: 0.85,
    reason: "Same domain: health",
    type: "domain"
  }
]
```

### External Data Sources

#### **ABS API Integration**
- **Base URL**: `https://data.api.abs.gov.au`
- **Protocol**: SDMX 2.0 REST API
- **Authentication**: API Key (optional)
- **Data Format**: SDMX-JSON
- **Rate Limits**: Applied by ABS

#### **Agency Data Sources**
- **ABS**: Live statistical data via API
- **AIHW**: Health and welfare datasets
- **DoE**: Education and skills data

---

## 📈 Analytics & Performance

### Search Analytics

#### **Query Tracking**
```typescript
await prisma.searchQuery.create({
  data: {
    query: "aged care workforce",
    results: 15,
    timestamp: new Date()
  }
})
```

#### **Performance Metrics**
- Search response times
- Dataset popularity (based on relationships)
- User engagement patterns
- API call success rates

### Data Quality Metrics

#### **Dataset Completeness**
- Metadata completeness scores
- Relationship density
- Tag coverage
- API accessibility status

---

## 🔒 Security & Access Control

### Data Privacy

#### **ABS Data Handling**
- No user data stored
- API keys encrypted
- Request logging for analytics only
- No sensitive data caching

#### **Access Patterns**
- Public datasets: Full access
- API datasets: Rate limited
- Request-only: Contact information provided

### API Security

#### **Request Validation**
```typescript
// Input sanitization
const dataflow = searchParams.get('dataflow')
const dataset = searchParams.get('dataset')

if (!dataflow || !dataset) {
  return NextResponse.json({
    error: 'Both dataflow and dataset parameters are required'
  }, { status: 400 })
}
```

#### **Error Handling**
```typescript
try {
  // API call
} catch (error) {
  if (error.response) {
    return NextResponse.json({
      error: 'ABS API request failed',
      status: error.response.status
    }, { status: error.response.status })
  }
}
```

---

## 🚀 Future Enhancements

### Planned Features

#### **1. Enhanced Visualization**
- Interactive charts with Chart.js/D3.js
- Geographic data mapping
- Time series analysis tools
- Export capabilities (PNG, PDF, CSV)

#### **2. Advanced Search**
- Faceted search interface
- Saved search queries
- Search result personalization
- Semantic search improvements

#### **3. Expanded Data Sources**
- Additional government agencies
- International datasets
- Private sector data integration
- Real-time data streams

#### **4. Machine Learning**
- Automated dataset categorization
- Relationship discovery algorithms
- User behavior analysis
- Recommendation optimization

### Technical Improvements

#### **Database Enhancements**
- Full-text search indexing
- Cached query results
- Relationship graph database
- Time-series data optimization

#### **API Improvements**
- GraphQL API implementation
- WebSocket real-time updates
- Bulk data export endpoints
- API versioning system

---

## 📚 Usage Examples

### Basic Dataset Search
```javascript
// Search for labour market data
const response = await fetch('/api/search?q=labour market&domain=labour')
const data = await response.json()
```

### ABS Data Retrieval
```javascript
// Get business indicators
const response = await fetch('/api/abs?dataflow=ABS&dataset=QBIS')
const absData = await response.json()
```

### Related Dataset Discovery
```javascript
// Get recommendations for a dataset
const response = await fetch('/api/recommendations?datasetId=dataset-123')
const recommendations = await response.json()
```

---

## 🛠️ Development & Deployment

### Environment Setup

#### **Required Environment Variables**
```bash
# Database
DATABASE_URL="file:./dev.db"

# ABS API (optional)
ABS_API_KEY="your-abs-api-key-here"
```

### Database Operations

#### **Schema Migration**
```bash
npx prisma generate
npx prisma db push
```

#### **Data Seeding**
```bash
npx prisma db seed
```

### Application Startup

#### **Development Mode**
```bash
npm run dev
# Access at http://localhost:3001
```

#### **Production Build**
```bash
npm run build
npm start
```

---

## 📞 Support & Documentation

### Getting Help

#### **API Documentation**
- Complete endpoint reference in `/api/` routes
- Request/response examples
- Error handling guide

#### **Database Schema**
- Full schema documentation in `prisma/schema.prisma`
- Model relationships and constraints
- Index optimization details

#### **Integration Guide**
- ABS API integration details
- Tag system usage patterns
- Search and recommendation algorithms

---

*This documentation is maintained automatically and reflects the current state of the GovConnect platform. For the latest updates, check the codebase directly.*
