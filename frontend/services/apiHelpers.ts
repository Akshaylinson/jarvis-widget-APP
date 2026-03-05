export const adminLogin = async (credentials: { username: string; password: string }) => {
  return apiService.login(credentials.username, credentials.password)
}

export const getDashboardMetrics = async () => {
  return apiService.getDashboardMetrics()
}

export const getAnalytics = async () => {
  return apiService.getAnalytics()
}

export const getTenants = async () => {
  return apiService.getTenants()
}

export const getTenant = async (id: string) => {
  return apiService.getTenant(id)
}

export const deleteTenant = async (id: string) => {
  return apiService.deleteTenant(id)
}

export const getAssistants = async () => {
  return apiService.getAssistants()
}

export const updateAssistant = async (id: string, data: any) => {
  return apiService.updateAssistant(id, data)
}

export const getKnowledge = async () => {
  return apiService.getKnowledge()
}

export const deleteKnowledge = async (id: string) => {
  return apiService.deleteKnowledge(id)
}

export const getConversations = async (filters?: any) => {
  return apiService.getConversations(filters)
}

export const getSystemHealth = async () => {
  return apiService.getHealth()
}

export const getLogs = async () => {
  return apiService.getLogs()
}

export const getSystemConfig = async () => {
  return apiService.getSystemConfig()
}

export const updateSystemConfig = async (config: any) => {
  return apiService.updateSystemConfig(config)
}