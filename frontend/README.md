# Embeddable Chatbot Widget

A modular React chatbot widget that can be embedded into any website with a single script tag.

## Features

- 🚀 Easy integration with one line of code
- 💬 Real-time chat interface
- 📱 Mobile responsive design
- 🎨 Customizable appearance
- 🔧 Modular React architecture
- ⚡ Lightweight and fast

## Quick Start

### 1. Build the Widget

```bash
cd frontend
npm install
npm run build
```

This generates `chatbot-widget.min.js` in the `dist/` folder.

### 2. Embed in Any Website

#### Method 1: Auto-initialization (Recommended)

Add this single line before the closing `</body>` tag:

```html
<script src="https://your-domain.com/chatbot-widget.min.js" data-auto-init></script>
```

#### Method 2: Manual initialization

```html
<script src="https://your-domain.com/chatbot-widget.min.js"></script>
<script>
  // Initialize with default settings
  const chatbot = initChatbot();
  
  // Or with custom configuration
  const chatbot = initChatbot({
    apiUrl: 'https://your-api-url.com/api/v1',
    typebotId: 'your-typebot-id',
    bearerToken: 'your-bearer-token'
  });
</script>
```

## Configuration Options

```javascript
const chatbot = initChatbot({
  containerId: 'chatbot-root',           // Container element ID
  apiUrl: 'https://api.example.com/v1',  // Your API base URL
  typebotId: 'your-typebot-id',          // Your Typebot ID
  bearerToken: 'your-bearer-token'       // Your authentication token
});
```

## API Methods

The `initChatbot()` function returns an object with control methods:

```javascript
const chatbot = initChatbot();

// Hide the chatbot
chatbot.hide();

// Show the chatbot
chatbot.show();

// Completely remove the chatbot
chatbot.destroy();
```

## Development

### Prerequisites

- Node.js 14+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Serve development build
npm run serve
```

### Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── ChatWidget.js  # Main widget container
│   │   ├── ChatWindow.js  # Chat interface
│   │   ├── ChatIcon.js    # Floating chat icon
│   │   └── Message.js     # Individual message
│   ├── services/          # API services
│   │   └── ChatService.js # Chat API integration
│   ├── styles/            # CSS styles
│   │   └── chatbot.css    # Widget styles
│   ├── utils/             # Utilities
│   │   └── constants.js   # Configuration constants
│   └── index.js           # Entry point
├── public/                # Static files
├── dist/                  # Build output
├── package.json          # Dependencies
└── webpack.config.js     # Build configuration
```

## Customization

### Styling

Edit `src/styles/chatbot.css` to customize the appearance. The widget uses CSS variables for easy theming:

```css
.chatbot-widget {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --text-color: #333;
  --background-color: #fff;
}
```

### API Integration

Modify `src/services/ChatService.js` to integrate with different chat APIs:

```javascript
// Update API endpoints and request format
class ChatService {
  async startChat() {
    // Your custom chat initialization logic
  }
  
  async sendMessage(message) {
    // Your custom message sending logic
  }
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.