import api from './api'

export type ChatHistoryItem = { role: 'user' | 'model'; content: string }

export async function sendChatMessage(params: {
  message: string
  history?: ChatHistoryItem[]
  model?: string
  apiKeyOverride?: string
}): Promise<string> {
  const { message, history = [], model, apiKeyOverride } = params
  const { data } = await api.post('/chat', {
    message,
    history,
    model,
    apiKey: apiKeyOverride,
  })
  if (!data?.success) throw new Error(data?.message || 'Chat failed')
  return data.data.reply as string
}


