import Dexie, { type EntityTable } from 'dexie'

// Message interface
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Database class
class ChatDatabase extends Dexie {
  messages!: EntityTable<ChatMessage, 'id'>

  constructor() {
    super('AnieChatDB')
    
    this.version(1).stores({
      messages: 'id, role, timestamp' // Primary key and indexed fields
    })
  }
}

// Create database instance
export const db = new ChatDatabase()

// Helper functions
export async function getAllMessages(): Promise<ChatMessage[]> {
  try {
    const messages = await db.messages.orderBy('timestamp').toArray()
    return messages
  } catch (error) {
    console.error('Error loading messages from IndexedDB:', error)
    return []
  }
}

export async function addMessage(message: ChatMessage): Promise<void> {
  try {
    await db.messages.add(message)
  } catch (error) {
    console.error('Error saving message to IndexedDB:', error)
  }
}

export async function clearAllMessages(): Promise<void> {
  try {
    await db.messages.clear()
  } catch (error) {
    console.error('Error clearing messages from IndexedDB:', error)
  }
}

export async function getMessageCount(): Promise<number> {
  try {
    return await db.messages.count()
  } catch (error) {
    console.error('Error counting messages:', error)
    return 0
  }
}

// Search messages (bonus feature!)
export async function searchMessages(query: string): Promise<ChatMessage[]> {
  try {
    const allMessages = await db.messages.toArray()
    return allMessages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    )
  } catch (error) {
    console.error('Error searching messages:', error)
    return []
  }
}

