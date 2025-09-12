import { useEffect, useMemo, useRef, useState } from 'react'
import { sendChatMessageWithResults, type ChatHistoryItem } from '../../services/chatAPI'
import { useNavigate } from 'react-router-dom'

type Message = ChatHistoryItem

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Hi! I\'m your shopping assistant. How can I help you today?' },
  ])
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  function formatAssistantText(text: string): string {
    if (!text) return ''
    let t = String(text).replace(/\r/g, '')
    // Remove code blocks
    t = t.replace(/```[\s\S]*?```/g, '')
    // Remove bold/italic markdown asterisks
    t = t.replace(/\*\*(.*?)\*\*/g, '$1')
    t = t.replace(/\*(.*?)\*/g, '$1')
    // Replace markdown bullets with friendly dot
    t = t.replace(/^\s*[\-*]\s+/gm, '• ')
    // Collapse excessive blank lines
    t = t.replace(/\n{3,}/g, '\n\n')
    return t.trim()
  }

  useEffect(() => {
    const div = listRef.current
    if (div) div.scrollTop = div.scrollHeight
  }, [messages, open])

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)
    try {
      // Ensure the first history entry is a user message per Gemini spec
      const firstUserIndex = newMessages.findIndex((m) => m.role === 'user')
      const cleanedHistory = firstUserIndex > 0 ? newMessages.slice(firstUserIndex) : newMessages
      const { reply, results } = await sendChatMessageWithResults({ message: text, history: cleanedHistory })
      const cleaned = formatAssistantText(reply)
      setMessages((prev) => [...prev, { role: 'model', content: cleaned }])
      // Auto-navigate if exactly one product/category result is returned
      const links = Array.isArray(results) ? results.filter(Boolean) as any[] : []
      if (links.length === 1 && typeof links[0]?.link === 'string') {
        const to = links[0].link
        if (to.startsWith('/product/') || to.startsWith('/category/')) {
          // Give the user a short moment to read
          setTimeout(() => navigate(to), 400)
        }
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: formatAssistantText(e?.message || 'Sorry, something went wrong.') },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-amazon-orange text-white shadow-lg hover:bg-amazon-orange focus:outline-none focus:ring-2 focus:ring-nexa-blue px-4 py-3"
        aria-label="Open chat"
      >
        {open ? 'Close Chat' : 'Chat'}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-40 w-80 max-w-[90vw] rounded-xl border border-gray-200 bg-white shadow-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b bg-nexa-blue text-white font-semibold">Shopping Assistant</div>
          <div ref={listRef} className="p-3 space-y-3 overflow-auto max-h-96">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={
                    'inline-block rounded-2xl px-3 py-2 ' +
                    (m.role === 'user' ? 'bg-amazon-orange text-white' : 'bg-gray-100 text-gray-900')
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-left">
                <div className="inline-block rounded-2xl px-3 py-2 bg-gray-100 text-gray-700 animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nexa-blue"
              placeholder="Ask about products, deals, orders..."
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-amazon-orange text-white rounded-lg disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


