# GovConnect - Government Data Discovery Platform

A modern, searchable interface that connects fragmented government datasets across different agencies, allowing users to ask natural questions and discover unexpected links between data sources.

![GovConnect](https://img.shields.io/badge/GovConnect-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)

## 🚀 Quick Start

Get GovConnect running on your local machine in just 5 minutes!

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control

### Step 1: Clone and Install
```bash
# Clone the repository
git clone https://github.com/lillian0624/GovData.git
cd gov-data-discovery

# Install dependencies
npm install
```

### Step 2: Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Create and migrate database
npx prisma db push

# Populate with sample data
npx prisma db seed
```

### Step 3: Start Development Server
```bash
# Start the application
npm run dev
```

### Step 4: Open in Browser
Visit **http://localhost:3001** (or http://localhost:3000 if 3001 is busy)

### 🎯 What You'll See
- **Interactive Search**: Type natural language questions
- **Dataset Discovery**: Browse government datasets
- **Live ABS Data**: Real-time Australian statistics
- **Smart Recommendations**: Related dataset suggestions

### 🔧 Optional: ABS API Key
For enhanced ABS data access, create a `.env` file:
```env
ABS_API_KEY=your_abs_api_key_here
```
Get your key from: https://www.abs.gov.au/statistics/developers/api

### 🐛 Troubleshooting

**Port already in use?**
```bash
# Use a different port
npm run dev -- -p 3002
```

**Database issues?**
```bash
# Reset database
npx prisma db push --force-reset
npx prisma db seed
```

**Permission errors?**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🌟 Features

### ✅ Core Functionality
- **Natural Language Search**: Ask questions in plain English like "aged care workforce trends by region since 2015"
- **Multi-Agency Integration**: Connects 
ABS, AIHW, and Department of Education datasets
- **Smart Recommendations**: Discover datasets you didn't know existed
- **Live Data Access**: Fetch real-time statistics from ABS API
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

### 🎯 Key UX Principles
- **Researcher & Policy Maker Focused**: Designed for users who need to find and connect government data
- **Natural Language Interface**: No need to know technical dataset names or codes
- **Discovery-Driven**: Shows relationships between datasets across agencies
- **API-First**: Ready to integrate new government data sources

### 🚀 Live ABS Data Integration
- **Real-time ABS API**: Direct connection to Australian Bureau of Statistics data
- **SDMX Query Builder**: Developer-friendly visual query builder with dimension selection
- **Business Indicators**: Quarterly economic data including sales, profits, employment
- **Historical Data**: Time series from 1984 to present with future projections
- **Industry Breakdown**: Manufacturing, retail, services, and more
- **Regional Analysis**: State and territory-level statistics
- **API Documentation**: Built-in SDMX format documentation and examples

## 🏗️ Architecture

### Backend
- **Next.js API Routes**: RESTful endpoints for search, datasets, and recommendations
- **Prisma + SQLite**: Database schema for dataset metadata and relationships
- **NLP Processing**: Custom natural language processing for query understanding
- **Recommendation Engine**: ML-inspired algorithm for suggesting related datasets

### Frontend
- **React + TypeScript**: Type-safe, modern React components
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Beautiful, consistent iconography

### Database Schema
```sql
- Agency (ABS, AIHW, Department of Education)
- Dataset (metadata, keywords, domains)
- Tag (categorization system)
- DatasetRelation (relationships between datasets)
- SearchQuery (analytics and optimization)
```

## 📋 Advanced Installation

For detailed setup instructions and production deployment, see the sections below. The Quick Start guide above covers the basic setup.

## 🔍 Usage

### Natural Language Search
Type questions like:
- "aged care workforce trends by region since 2015"
- "housing affordability and labour market data"
- "education outcomes by socioeconomic status"

### Live ABS Data
1. Click "Live ABS Data" button in the header
2. Use pre-configured datasets or enter custom parameters:
   - **Dataflow**: `ABS` (or `ABS_LABOUR_FORCE`, etc.)
   - **Dataset**: `QBIS` (or `M1`, etc.)
3. View real-time visualizations and raw data

### Dataset Discovery
- Browse datasets by agency, domain, or tags
- View detailed dataset information and relationships
- Download data or visit source portals
- See smart recommendations based on your interests

## 🔌 API Endpoints

### Search API
```http
GET /api/search?q=aged+care+workforce&domain=health&agency=AIHW
```

**Response:**
```json
{
  "query": "aged care workforce",
  "results": [...],
  "total": 25,
  "nlp": {
    "processedQuery": {...},
    "relatedTerms": [...],
    "suggestions": [...]
  }
}
```

### Dataset API
```http
GET /api/datasets/[id]
```

**Response:**
```json
{
  "id": "dataset-id",
  "name": "Aged Care Workforce Data",
  "description": "Comprehensive data on aged care workforce...",
  "agency": {...},
  "domains": ["health", "labour", "ageing"],
  "keywords": ["aged care", "workforce", "nursing", "carers"],
  "accessibility": "public",
  "format": "CSV"
}
```

### Recommendations API
```http
GET /api/recommendations?type=search&domains=health,labour&keywords=aged+care
```

### Live ABS Data API
```http
GET /api/abs?dataflow=ABS&dataset=QBIS
```

#### SDMX Query Builder
The ABS Data Viewer includes a developer-friendly SDMX query builder with:
- **Visual Dimension Selection**: Choose states, age groups, sex, and other dimensions
- **Time Period Filters**: Set start and end periods (e.g., 2011, 2020-Q1)
- **Generated URL Preview**: See the exact SDMX query URL before execution
- **Copy to Clipboard**: Easily copy generated URLs for external use
- **Built-in Documentation**: SDMX format examples and dimension codes

**SDMX Query Format:**
```
https://data.api.abs.gov.au/rest/data/DATAFLOW,DATASET,VERSION/DIMENSIONS?PARAMETERS
```

**Example Generated URL:**
```
https://data.api.abs.gov.au/rest/data/ABS_LABOUR_FORCE,M1,1.0.0/3.TT?startPeriod=2011&dimensionAtObservation=AllDimensions
```

## 🎨 Components

### Core Components
- **DataDiscoveryApp**: Main application container
- **DatasetCard**: Individual dataset display with metadata
- **SearchFilters**: Advanced filtering by domain and agency
- **ABSDataViewer**: Enhanced ABS data viewer with SDMX query builder

### Utility Components
- **DatasetDetailModal**: Detailed dataset information popup
- **SearchResults**: Formatted search result display
- **RecommendationsPanel**: Smart dataset suggestions

## 📊 Sample Datasets

### ABS (Australian Bureau of Statistics)
- **Labour Force Statistics**: Employment, unemployment, participation rates
- **Population Estimates**: Quarterly demographic data
- **Business Indicators**: Sales, profits, inventories by industry
- **Census Data**: 2021 Census results and historical trends

### AIHW (Australian Institute of Health and Welfare)
- **Aged Care Workforce**: Staffing levels and qualifications
- **Housing and Homelessness**: Support services and affordability
- **Population Projections**: Age structure forecasts to 2071
- **Health Expenditure**: Government and private health spending

### Department of Education, Skills and Employment
- **Skills Shortages**: Occupational demand analysis
- **Apprenticeships**: Training completions and outcomes
- **Higher Education**: University enrollment and graduate employment
- **Vocational Education**: TAFE and private provider statistics

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Database Management
```bash
npx prisma studio    # Open Prisma Studio (http://localhost:5555)
npx prisma db push   # Apply schema changes
npx prisma db seed   # Populate with sample data
npx prisma generate  # Generate Prisma client
```

### Environment Variables
```env
DATABASE_URL="file:./dev.db"
ABS_API_KEY=your_abs_api_key_here  # Optional for enhanced ABS access
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
1. Set `DATABASE_URL` to your production database
2. Configure `ABS_API_KEY` for live ABS data access
3. Set `NODE_ENV=production`

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Use TypeScript for all new code
- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure accessibility compliance

## 📈 Analytics & Monitoring

### Search Analytics
- Query frequency tracking
- Popular search terms
- User engagement metrics
- Dataset usage statistics

### Performance Monitoring
- API response times
- Database query performance
- User session analytics
- Error tracking and reporting

## 🔒 Security & Privacy

### Data Handling
- No user data collection without consent
- Secure API key management
- HTTPS-only in production
- Input validation and sanitization

### Government Data Compliance
- Respect ABS data usage policies
- Comply with AIHW data sharing agreements
- Follow Department of Education privacy requirements
- Regular security audits

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ABS**: For providing comprehensive statistical data and API access
- **AIHW**: For health and welfare data insights
- **Department of Education**: For skills and employment data
- **Australian Government**: For open data initiatives

---

Built with ❤️ for Australian researchers, policy makers, and data enthusiasts.

**Live Demo**: [http://localhost:3001](http://localhost:3001)

**ABS Live Data**: Real-time Australian Bureau of Statistics integration
**Natural Language Search**: Ask questions in plain English
**Smart Recommendations**: Discover related datasets automatically
**Multi-Agency Integration**: Connect across government departments
