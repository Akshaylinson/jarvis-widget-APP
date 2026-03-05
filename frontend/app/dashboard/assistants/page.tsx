'use client'

import { useEffect, useState } from 'react'
import { getAssistants, updateAssistant } from '../../../services/apiHelpers'

interface Assistant {
  id: string
  name: string
  tenant_id: string
  wake_word: string
  voice_gender: string
  avatar_url: string
  language: string
  is_active: boolean
}

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const data = await getAssistants()
        setAssistants(data)
      } catch (error) {
        console.error('Failed to fetch assistants:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAssistants()
  }, [])

  const toggleAssistant = async (id: string, isActive: boolean) => {
    try {
      await updateAssistant(id, { is_active: !isActive })
      setAssistants(assistants.map(a => 
        a.id === id ? { ...a, is_active: !isActive } : a
      ))
    } catch (error) {
      console.error('Failed to update assistant:', error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading assistants...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Assistant Management</h1>
        <div className="text-sm text-gray-600">Total: {assistants.length}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.map((assistant) => (
          <div key={assistant.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <img
                src={assistant.avatar_url || '/default-avatar.png'}
                alt={assistant.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{assistant.name}</h3>
                <p className="text-sm text-gray-600">Tenant: {assistant.tenant_id}</p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Wake Word:</span>
                <span className="text-sm font-medium">{assistant.wake_word}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Voice:</span>
                <span className="text-sm font-medium">{assistant.voice_gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Language:</span>
                <span className="text-sm font-medium">{assistant.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${assistant.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {assistant.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => toggleAssistant(assistant.id, assistant.is_active)}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  assistant.is_active
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {assistant.is_active ? 'Disable' : 'Enable'}
              </button>
              <button className="px-3 py-1 text-xs font-medium text-indigo-800 bg-indigo-100 rounded hover:bg-indigo-200">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}