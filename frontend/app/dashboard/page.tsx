'use client'

import { useEffect, useState } from 'react'
import { getDashboardMetrics } from '../../services/apiHelpers'
import MetricCard from '../../components/MetricCard'
import DashboardCharts from '../../components/DashboardCharts'

interface DashboardMetrics {
  totalTenants: number
  activeAssistants: number
  totalConversations: number
  dailyQueries: number
  geminiUsage: number
  fallbackUsage: number
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getDashboardMetrics()
        setMetrics(data)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Tenants"
          value={metrics?.totalTenants || 0}
          icon="👥"
          color="blue"
        />
        <MetricCard
          title="Active Assistants"
          value={metrics?.activeAssistants || 0}
          icon="🤖"
          color="green"
        />
        <MetricCard
          title="Total Conversations"
          value={metrics?.totalConversations || 0}
          icon="💬"
          color="purple"
        />
        <MetricCard
          title="Daily Queries"
          value={metrics?.dailyQueries || 0}
          icon="📊"
          color="yellow"
        />
        <MetricCard
          title="Gemini API Usage"
          value={metrics?.geminiUsage || 0}
          icon="🧠"
          color="indigo"
        />
        <MetricCard
          title="Fallback Usage"
          value={metrics?.fallbackUsage || 0}
          icon="🔄"
          color="red"
        />
      </div>

      <DashboardCharts />
    </div>
  )
}