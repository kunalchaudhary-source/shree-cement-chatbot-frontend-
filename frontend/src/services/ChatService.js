import { API_BASE_URL, TYPEBOT_ID, BEARER_TOKEN } from '../utils/constants';

class ChatService {
  constructor() {
    this.sessionId = null;
    this.isInitialized = false;
    // Runtime-configurable — overridden by configure()
    this._startChatUrl    = '';
    this._continueChatUrl = '';
    this._apiBaseUrl      = API_BASE_URL;
    this._typebotId       = TYPEBOT_ID;
    this._bearerToken     = BEARER_TOKEN;
  }

  // Call this whenever widget settings load / change
  configure({ startChatUrl, continueChatUrl, bearerToken, apiBaseUrl, typebotId } = {}) {
    // If the start URL changes, reset any active session so next open starts fresh
    if (startChatUrl && startChatUrl !== this._startChatUrl) {
      this.sessionId = null;
      this.isInitialized = false;
    }
    // Direct URL mode (new)
    if (startChatUrl)    this._startChatUrl    = startChatUrl;
    if (continueChatUrl) this._continueChatUrl = continueChatUrl;
    // Legacy fallback: construct URLs from base + id if direct URLs not set
    if (apiBaseUrl)  this._apiBaseUrl  = apiBaseUrl;
    if (typebotId)   this._typebotId   = typebotId;
    if (bearerToken) this._bearerToken = bearerToken;
  }

  _getStartUrl() {
    if (this._startChatUrl) return this._startChatUrl;
    return `${this._apiBaseUrl}/typebots/${this._typebotId}/startChat`;
  }

  _getContinueUrl(sessionId) {
    if (this._continueChatUrl) {
      return this._continueChatUrl.replace('<SESSION_ID>', sessionId);
    }
    return `${this._apiBaseUrl}/sessions/${sessionId}/continueChat`;
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
      const url = this._getStartUrl();
      console.log('🚀 Starting chat:', url);
      const response = await fetch(url, {
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
      
      const response = await fetch(this._getContinueUrl(this.sessionId), {
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