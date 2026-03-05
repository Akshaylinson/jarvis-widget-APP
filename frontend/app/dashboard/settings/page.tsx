'use client'

import { useEffect, useState } from 'react'
import { getSystemConfig, updateSystemConfig } from '../../../services/apiHelpers'

interface SystemConfig {
  default_llm_provider: string
  fallback_llm_provider: string
  rate_limit_per_minute: number
  query_limit_per_tenant: number
  max_conversation_history: number
  enable_analytics: boolean
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getSystemConfig()
        setConfig(data)
      } catch (error) {
        console.error('Failed to fetch config:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const handleSave = async () => {
    if (!config) return
    
    setSaving(true)
    try {
      await updateSystemConfig(config)
      alert('Configuration updated successfully!')
    } catch (error) {
      console.error('Failed to update config:', error)
      alert('Failed to update configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof SystemConfig, value: any) => {
    if (!config) return
    setConfig({ ...config, [key]: value })
  }

  if (loading) return <div className="text-center py-8">Loading settings...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">LLM Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default LLM Provider
            </label>
            <select
              value={config?.default_llm_provider || ''}
              onChange={(e) => handleChange('default_llm_provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI GPT</option>
              <option value="claude">Anthropic Claude</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fallback LLM Provider
            </label>
            <select
              value={config?.fallback_llm_provider || ''}
              onChange={(e) => handleChange('fallback_llm_provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="openrouter">OpenRouter</option>
              <option value="openai">OpenAI GPT</option>
              <option value="claude">Anthropic Claude</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Rate Limiting</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Limit (requests per minute)
            </label>
            <input
              type="number"
              value={config?.rate_limit_per_minute || 0}
              onChange={(e) => handleChange('rate_limit_per_minute', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Query Limit per Tenant (daily)
            </label>
            <input
              type="number"
              value={config?.query_limit_per_tenant || 0}
              onChange={(e) => handleChange('query_limit_per_tenant', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Conversation History
            </label>
            <input
              type="number"
              value={config?.max_conversation_history || 0}
              onChange={(e) => handleChange('max_conversation_history', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              Number of previous messages to keep in context
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enable_analytics"
              checked={config?.enable_analytics || false}
              onChange={(e) => handleChange('enable_analytics', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="enable_analytics" className="ml-2 block text-sm text-gray-900">
              Enable Analytics Collection
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}