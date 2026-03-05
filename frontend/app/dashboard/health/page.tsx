'use client'

import { useEffect, useState } from 'react'
import { getSystemHealth } from '../../../services/apiHelpers'

interface HealthStatus {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  response_time?: number
  last_check: string
}

export default function HealthPage() {
  const [healthData, setHealthData] = useState<HealthStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await getSystemHealth()
        setHealthData(data.services || [])
      } catch (error) {
        console.error('Failed to fetch health data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
    const interval = setInterval(fetchHealth, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'unhealthy': return 'bg-red-100 text-red-800'
      case 'degraded': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅'
      case 'unhealthy': return '❌'
      case 'degraded': return '⚠️'
      default: return '❓'
    }
  }

  if (loading) return <div className="text-center py-8">Loading system health...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthData.map((service) => (
          <div key={service.service} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{service.service}</h3>
              <span className="text-2xl">{getStatusIcon(service.status)}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
              
              {service.response_time && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Time:</span>
                  <span className="text-sm font-medium">{service.response_time}ms</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Check:</span>
                <span className="text-sm font-medium">
                  {new Date(service.last_check).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {healthData.filter(s => s.status === 'healthy').length}
            </div>
            <div className="text-sm text-gray-600">Healthy Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {healthData.filter(s => s.status === 'degraded').length}
            </div>
            <div className="text-sm text-gray-600">Degraded Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {healthData.filter(s => s.status === 'unhealthy').length}
            </div>
            <div className="text-sm text-gray-600">Unhealthy Services</div>
          </div>
        </div>
      </div>
    </div>
  )
}