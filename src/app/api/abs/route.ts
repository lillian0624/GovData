import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const ABS_API_KEY = process.env.ABS_API_KEY // You'll need to get this from ABS

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dataflow = searchParams.get('dataflow')
  const dataset = searchParams.get('dataset')

  if (!dataflow || !dataset) {
    return NextResponse.json({
      error: 'Both dataflow and dataset parameters are required'
    }, { status: 400 })
  }

  try {
    // Build ABS API URL - try the structure from user's example
    // Original: ${ABS_BASE_URL}/data/${dataflow}/${dataset}
    const absUrl = `https://data.api.abs.gov.au/rest/data/${dataflow},${dataset},1.0.0/all`

    // Add any additional query parameters
    const queryParams = new URLSearchParams()
    searchParams.forEach((value, key) => {
      if (key !== 'dataflow' && key !== 'dataset') {
        queryParams.append(key, value)
      }
    })

    // Always include dimensionAtObservation parameter
    queryParams.set('dimensionAtObservation', 'AllDimensions')

    const finalUrl = `${absUrl}?${queryParams.toString()}`

    // Make request to ABS API
    const response = await axios.get(finalUrl, {
      headers: {
        'Accept': 'application/vnd.sdmx.data+json;version=2.0.0',
        ...(ABS_API_KEY && { 'Authorization': `Bearer ${ABS_API_KEY}` })
      },
      timeout: 30000 // 30 second timeout
    })

    return NextResponse.json({
      source: 'ABS Data API',
      dataflow,
      dataset,
      data: response.data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('ABS API error:', error instanceof Error ? error.message : 'Unknown error')

    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json({
        error: 'ABS API request failed',
        status: error.response.status,
        message: error.response.data?.message || 'Unknown error'
      }, { status: error.response.status })
    }

    return NextResponse.json({
      error: 'Failed to fetch data from ABS API',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper endpoint to get available ABS datasets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    // This would typically search ABS catalogue
    // For now, return some common ABS datasets
    const absDatasets = [
      {
        dataflow: 'ABS_LABOUR_FORCE',
        dataset: 'M1',
        name: 'Labour Force, Australia',
        description: 'Monthly labour force statistics including employment, unemployment, and participation rates'
      },
      {
        dataflow: 'ABS_POPULATION',
        dataset: 'A1',
        name: 'Estimated Resident Population',
        description: 'Quarterly population estimates by age, sex, and state'
      },
      {
        dataflow: 'ABS_INCOME_INEQUALITY',
        dataset: 'A2',
        name: 'Household Income and Income Distribution',
        description: 'Annual household income statistics and inequality measures'
      }
    ]

    // Simple text search
    const filteredDatasets = absDatasets.filter(dataset =>
      dataset.name.toLowerCase().includes(query.toLowerCase()) ||
      dataset.description.toLowerCase().includes(query.toLowerCase())
    )

    return NextResponse.json({
      query,
      datasets: filteredDatasets,
      total: filteredDatasets.length
    })

  } catch (error) {
    console.error('ABS datasets search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
