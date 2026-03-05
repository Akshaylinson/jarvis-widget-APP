'use client'

import { useEffect, useState } from 'react'
import { getConversations } from '../../../services/apiHelpers'

interface Conversation {
  id: string
  tenant_id: string
  user_query: string
  assistant_response: string
  timestamp: string
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    tenant_id: '',
    keyword: '',
    date: ''
  })

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations(filters)
        setConversations(data)
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <div className="text-center py-8">Loading conversations...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Conversation Monitoring</h1>
        <div className="text-sm text-gray-600">Total: {conversations.length}</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Filter by Tenant ID"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.tenant_id}
            onChange={(e) => handleFilterChange('tenant_id', e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by keyword"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
          />
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {conversations.map((conversation) => (
          <div key={conversation.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm text-gray-600">Tenant: {conversation.tenant_id}</span>
                <span className="ml-4 text-sm text-gray-600">
                  {new Date(conversation.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">User Query:</div>
                <div className="text-gray-900">{conversation.user_query}</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-800 mb-2">Assistant Response:</div>
                <div className="text-gray-900">{conversation.assistant_response}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}