import { API_BASE_URL, TYPEBOT_ID, BEARER_TOKEN } from '../utils/constants';

class ChatService {
  constructor() {
    this.sessionId = null;
    this.isInitialized = false;
    // Runtime-configurable — overridden by configure()
    this._apiBaseUrl   = API_BASE_URL;
    this._typebotId    = TYPEBOT_ID;
    this._bearerToken  = BEARER_TOKEN;
  }

  // Call this whenever widget settings load / change
  configure({ apiBaseUrl, typebotId, bearerToken } = {}) {
    if (apiBaseUrl)  this._apiBaseUrl  = apiBaseUrl;
    if (typebotId)   this._typebotId   = typebotId;
    if (bearerToken) this._bearerToken = bearerToken;
  }

  // Extract text content from rich text format
  extractTextFromRichText(content) {
    if (content && content.richText && content.richText.length > 0) {
      let fullText = '';
      
      // Iterate through all richText elements
      content.richText.forEach(element => {
        if (element.children && element.children.length > 0) {
          // Concatenate all children's text values
          element.children.forEach(child => {
            if (child.text) {
              fullText += child.text;
            }
          });
        }
      });
      
      return fullText;
    }
    return content && content.text ? content.text : '';
  }

  // Process messages from API response
  processMessages(messages) {
    if (!messages || !Array.isArray(messages)) return [];
    
    return messages.map((msg, index) => {
      let messageText = '';
      
      if (msg.content) {
        if (msg.content.type === 'richText') {
          messageText = this.extractTextFromRichText(msg.content);
        } else {
          messageText = msg.content.text || msg.content || msg.text || '';
        }
      } else {
        messageText = msg.text || msg.message || 'Message received';
      }
      
      return {
        id: msg.id || `msg-${Date.now()}-${index}`,
        message: messageText,
        type: 'bot',
        timestamp: Date.now()
      };
    });
  }

  // Process choice input options
  processChoiceOptions(input) {
    if (!input || input.type !== 'choice input' || !input.items) {
      return null;
    }
    
    return input.items.map(item => ({
      id: item.id,
      content: item.content,
      outgoingEdgeId: item.outgoingEdgeId
    }));
  }

  async startChat() {
    try {
      console.log('🚀 Starting chat with API:', `${API_BASE_URL}/typebots/${TYPEBOT_ID}/preview/startChat`);
      
      const response = await fetch(`${this._apiBaseUrl}/typebots/${this._typebotId}/preview/startChat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: ''
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Start chat response:', data);
      
      this.sessionId = data.sessionId;
      this.isInitialized = true;
      
      // Process messages and choices
      const processedMessages = this.processMessages(data.messages);
      const choiceOptions = this.processChoiceOptions(data.input);
      
      return {
        success: true,
        data: {
          ...data,
          processedMessages,
          choiceOptions
        },
        sessionId: this.sessionId
      };
    } catch (error) {
      console.error('❌ Error starting chat:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendMessage(message) {
    if (!this.sessionId) {
      throw new Error('Chat session not initialized. Call startChat() first.');
    }

    try {
      console.log('📤 Sending message:', message, 'to session:', this.sessionId);
      
      const response = await fetch(`${this._apiBaseUrl}/sessions/${this.sessionId}/continueChat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Continue chat response:', data);
      
      // Process messages and choices
      const processedMessages = this.processMessages(data.messages);
      const choiceOptions = this.processChoiceOptions(data.input);
      
      return {
        success: true,
        data: {
          ...data,
          processedMessages,
          choiceOptions
        }
      };
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getSessionId() {
    return this.sessionId;
  }

  isReady() {
    return this.isInitialized && this.sessionId;
  }

  reset() {
    this.sessionId = null;
    this.isInitialized = false;
  }
}

export default new ChatService();