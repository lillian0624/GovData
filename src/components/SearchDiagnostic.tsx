'use client'

import React, { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'

interface DiagnosticResult {
  test: string
  status: 'pending' | 'running' | 'success' | 'error'
  message: string
  details?: any
}

export default function SearchDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const runDiagnostic = async () => {
    setIsRunning(true)
    setResults([])

    const tests = [
      {
        name: 'Basic API Connectivity',
        run: async () => {
          try {
            const response = await fetch('/api/search?q=test')
            if (response.ok) {
              const data = await response.json()
              return { success: true, message: 'API responded successfully', details: data }
            } else {
              return { success: false, message: `HTTP ${response.status}: ${response.statusText}` }
            }
          } catch (error) {
            return { success: false, message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` }
          }
        }
      },
      {
        name: 'Database Connection',
        run: async () => {
          try {
            const response = await fetch('/api/datasets')
            if (response.ok) {
              const data = await response.json()
              return { success: true, message: `Found ${data.length || 0} datasets`, details: data }
            } else {
              return { success: false, message: `HTTP ${response.status}: ${response.statusText}` }
            }
          } catch (error) {
            return { success: false, message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` }
          }
        }
      },
      {
        name: 'Search with Results',
        run: async () => {
          try {
            const response = await fetch('/api/search?q=census')
            if (response.ok) {
              const data = await response.json()
              const hasResults = data.results && data.results.length > 0
              return {
                success: hasResults,
                message: hasResults ? `Found ${data.results.length} results` : 'No results found',
                details: data
              }
            } else {
              return { success: false, message: `HTTP ${response.status}: ${response.statusText}` }
            }
          } catch (error) {
            return { success: false, message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` }
          }
        }
      },
      {
        name: 'NLP Processing',
        run: async () => {
          try {
            const response = await fetch('/api/search?q=aged+care+workforce')
            if (response.ok) {
              const data = await response.json()
              const hasNLP = data.nlp && data.nlp.processedQuery
              return {
                success: hasNLP,
                message: hasNLP ? 'NLP processing successful' : 'NLP processing failed',
                details: data.nlp
              }
            } else {
              return { success: false, message: `HTTP ${response.status}: ${response.statusText}` }
            }
          } catch (error) {
            return { success: false, message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` }
          }
        }
      }
    ]

    for (const test of tests) {
      setResults(prev => [...prev, { test: test.name, status: 'running', message: 'Running...' }])

      try {
        const result = await test.run()
        setResults(prev => prev.map(r =>
          r.test === test.name
            ? {
                test: test.name,
                status: result.success ? 'success' : 'error',
                message: result.message,
                details: result.details
              }
            : r
        ))
      } catch (error) {
        setResults(prev => prev.map(r =>
          r.test === test.name
            ? {
                test: test.name,
                status: 'error',
                message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
              }
            : r
        ))
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'running': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'running': return '⏳'
      default: return '⏸️'
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Search Diagnostic</span>
          <div className="flex space-x-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Expand"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                // Remove from DOM by setting a flag or similar
                const element = document.querySelector('[data-diagnostic]')
                if (element) {
                  element.style.display = 'none'
                }
              }}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50" data-diagnostic>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Search Diagnostic</h3>
        <div className="flex space-x-2">
          <button
            onClick={runDiagnostic}
            disabled={isRunning}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Tests'}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Minimize"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const element = document.querySelector('[data-diagnostic]')
              if (element) {
                element.style.display = 'none'
              }
            }}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {results.map((result, index) => (
          <div key={index} className="flex items-start space-x-2 text-sm">
            <span className="mt-0.5">{getStatusIcon(result.status)}</span>
            <div className="flex-1">
              <div className="font-medium">{result.test}</div>
              <div className={`text-xs ${getStatusColor(result.status)}`}>
                {result.message}
              </div>
              {result.details && (
                <details className="mt-1">
                  <summary className="text-xs text-gray-500 cursor-pointer">Details</summary>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <p className="text-sm text-gray-600">
          Click "Run Tests" to diagnose search functionality issues.
        </p>
      )}
    </div>
  )
}
