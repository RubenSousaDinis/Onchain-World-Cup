'use client'

import dynamic from 'next/dynamic'
import { openApiSpec } from '@/lib/openapi'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocsPage() {
  // Only show in development
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_API_DOCS !== 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">API Documentation</h1>
          <p className="text-gray-600">
            API documentation is only available in development mode.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <div className="mb-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Onchain World Cup API Documentation
          </h1>
          <p className="text-gray-600">
            Interactive API documentation powered by Swagger UI
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This documentation is generated from the OpenAPI specification.
              All endpoints require proper authentication in production.
            </p>
          </div>
        </div>
        <SwaggerUI spec={openApiSpec} />
      </div>
    </div>
  )
}
