'use client'

import { useEffect, useState } from 'react'
import { getAnalytics } from '../../../services/apiHelpers'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics()
        setAnalytics(data)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <div className="text-center py-8">Loading analytics...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">AI Usage Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Gemini API Calls</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics?.gemini_calls || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Fallback Calls</h3>
          <p className="text-3xl font-bold text-orange-600">{analytics?.fallback_calls || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Avg Response Time</h3>
          <p className="text-3xl font-bold text-green-600">{analytics?.avg_response_time || 0}ms</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Tokens</h3>
          <p className="text-3xl font-bold text-purple-600">{analytics?.total_tokens || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Daily Query Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.daily_queries || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="queries" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Model Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.model_usage || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}