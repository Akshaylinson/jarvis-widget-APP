'use client'

import { useEffect, useState } from 'react'
import { getTenants, deleteTenant } from '../../../services/apiHelpers'

interface Tenant {
  id: string
  email: string
  assistant_name: string
  plan: string
  created_at: string
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await getTenants()
        setTenants(data)
      } catch (error) {
        console.error('Failed to fetch tenants:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTenants()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tenant?')) {
      try {
        await deleteTenant(id)
        setTenants(tenants.filter(t => t.id !== id))
      } catch (error) {
        console.error('Failed to delete tenant:', error)
      }
    }
  }

  if (loading) return <div className="text-center py-8">Loading tenants...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
        <div className="text-sm text-gray-600">Total: {tenants.length}</div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assistant Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tenant.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tenant.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tenant.assistant_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {tenant.plan}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tenant.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(tenant.id)}
                    className="text-red-600 hover:text-red-900 mr-4"
                  >
                    Delete
                  </button>
                  <button className="text-indigo-600 hover:text-indigo-900">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}