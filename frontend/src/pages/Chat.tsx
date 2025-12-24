import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Send, User, Bot, Loader2, Trash2, ArrowLeft } from 'lucide-react'
import { MessageContent } from '../components/MessageContent'
import { type ChatMessage, getAllMessages, addMessage, clearAllMessages } from '../lib/db'
import './Chat.css'

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load messages from IndexedDB on mount
  useEffect(() => {
    const loadFromDB = async () => {
      const storedMessages = await getAllMessages()
      setMessages(storedMessages)
      setIsInitialized(true)
    }
    loadFromDB()
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isInitialized) {
      scrollToBottom()
    }
  }, [messages, isInitialized, scrollToBottom])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const clearChat = async () => {
    await clearAllMessages()
    setMessages([])
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    // Save to IndexedDB and update state
    await addMessage(userMessage)
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL
      
      // Build conversation history for backend
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }))

      // Call Go Cloud Function (API key is stored securely in function secrets)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: conversationHistory
        })
      })

      const data = await response.json()
      console.log('API Response:', response.status, data)

      if (!response.ok) {
        throw new Error(data.error || `API error (${response.status})`)
      }
      
      // Extract response from Cloud Function format
      const aiResponse = data.response || data.message || JSON.stringify(data)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      // Save to IndexedDB and update state
      await addMessage(assistantMessage)
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Connection Error**\n\n${errorMsg}\n\nPlease check:\n- Your API URL is correct\n- Your API key is configured in \`.env\`\n- The API endpoint is accessible`,
        timestamp: new Date()
      }
      await addMessage(errorMessage)
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="chat-container">
        <div className="ambient-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="loading-state">
          <Loader2 size={32} className="spin" />
          <p>Loading chat history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container">
      {/* Ambient background effects */}
      <div className="ambient-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Floating home button */}
      <Link to="/" className="floating-home-btn">
        <ArrowLeft size={18} />
      </Link>

      {/* Messages area */}
      <main className="messages-container">
        <div className="messages-wrapper">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon animate-float">
                <Bot size={48} />
              </div>
              <h2>Hi, I'm Anie! 👋</h2>
              <p>Your BITS CS academic advisor. Ask me about grades, SGPA/CGPA, syllabus, or curriculum!</p>
              <div className="suggestions">
                <button onClick={() => setInput('Calculate my grade for Web Programming')}>
                  Calculate my grade
                </button>
                <button onClick={() => setInput('Tell me about the CS syllabus')}>
                  CS Syllabus
                </button>
                <button onClick={() => setInput('Explain the BITS curriculum structure')}>
                  BITS Curriculum
                </button>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message, index) => (
                <div 
                  key={message.id} 
                  className={`message ${message.role}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="message-avatar">
                    {message.role === 'user' ? (
                      <User size={20} />
                    ) : (
                      <Bot size={20} />
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-role">
                        {message.role === 'user' ? 'You' : 'Anie'}
                      </span>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="message-body">
                      <MessageContent content={message.content} />
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant loading">
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span className="animate-pulse-dot" style={{ animationDelay: '0s' }} />
                      <span className="animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                      <span className="animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input area */}
      <footer className="input-container">
        <div className="input-wrapper">
          {messages.length > 0 && (
            <button 
              className="clear-btn"
              onClick={clearChat}
              title="Clear chat history"
            >
              <Trash2 size={18} />
            </button>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            rows={1}
            disabled={isLoading}
          />
          <button 
            className="send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 size={20} className="spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </footer>
    </div>
  )
}
