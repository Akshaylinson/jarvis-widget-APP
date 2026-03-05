'use client'

import { useEffect, useState } from 'react'
import { getKnowledge, deleteKnowledge } from '../../../services/apiHelpers'

interface Knowledge {
  id: string
  tenant_id: string
  title: string
  category: string
  content: string
  created_at: string
}

export default function KnowledgePage() {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Knowledge | null>(null)

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const data = await getKnowledge()
        setKnowledge(data)
      } catch (error) {
        console.error('Failed to fetch knowledge:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchKnowledge()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this knowledge item?')) {
      try {
        await deleteKnowledge(id)
        setKnowledge(knowledge.filter(k => k.id !== id))
        if (selectedItem?.id === id) setSelectedItem(null)
      } catch (error) {
        console.error('Failed to delete knowledge:', error)
      }
    }
  }

  if (loading) return <div className="text-center py-8">Loading knowledge base...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base Management</h1>
        <div className="text-sm text-gray-600">Total: {knowledge.length}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Knowledge Items</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {knowledge.map((item) => (
              <div
                key={item.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedItem?.id === item.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">Tenant: {item.tenant_id}</p>
                    <p className="text-sm text-gray-600">Category: {item.category}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item.id)
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Knowledge Content</h2>
          </div>
          <div className="p-6">
            {selectedItem ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedItem.title}</h3>
                  <p className="text-sm text-gray-600">
                    Tenant: {selectedItem.tenant_id} | Category: {selectedItem.category}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {selectedItem.content}
                  </pre>
                </div>
                <div className="text-xs text-gray-500">
                  Created: {new Date(selectedItem.created_at).toLocaleString()}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a knowledge item to view its content
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}