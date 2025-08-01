# Discord Cohere Bot

A Discord bot that uses Cohere's Command models to chat with users in direct messages. The bot maintains conversation context and provides intelligent responses to user queries.

## Features

- 🤖 **Cohere Integration**: Uses Cohere's Command models for intelligent conversations
- 💬 **DM Support**: Responds to users in direct messages
- 🧠 **Context Awareness**: Maintains conversation history for each user
- ⚡ **Real-time Responses**: Shows typing indicators while processing
- 🔒 **Error Handling**: Graceful error handling with user-friendly messages
- 📝 **Message Splitting**: Automatically splits long responses to fit Discord's character limit

## Prerequisites

Before running this bot, you need:

1. **Node.js** (version 16 or higher)
2. **Discord Bot Token** from Discord Developer Portal
3. **Cohere API Key** from Cohere Platform

## Installation

1. **Clone or download this project**

   ```bash
   cd ai-chatbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy the `.env` file and fill in your tokens:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   COHERE_API_KEY=your_cohere_api_key_here
   COHERE_MODEL=command-r-plus
   MAX_TOKENS=150
   ```

## Setup Instructions

### 1. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section in the sidebar
4. Click "Add Bot"
5. Copy the bot token and add it to your `.env` file
6. Under "Privileged Gateway Intents", enable:
   - Message Content Intent

### 2. Get Cohere API Key

1. Go to [Cohere Platform](https://cohere.com)
2. Sign up or log in to your account
3. Navigate to API Keys section in your dashboard
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 3. Invite Bot to Your Server (Optional)

1. In Discord Developer Portal, go to "OAuth2" > "URL Generator"
2. Select scopes: `bot`
3. Select bot permissions: `Send Messages`, `Read Messages`, `Read Message History`
4. Copy the generated URL and open it in your browser
5. Select the server you want to add the bot to

**Note**: The bot will work in DMs without being in a server, but you need to share a server with the bot or have mutual friends to start a DM.

## Usage

### Starting the Bot

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

### Chatting with the Bot

1. Send a direct message to the bot
2. The bot will respond using ChatGPT
3. Continue the conversation - the bot remembers context
4. Each user has their own conversation history

### Example Conversation

```
You: Hello! What can you help me with?
Bot: Hi there! I'm a Discord bot powered by Cohere's Command model. I can help you with a wide variety of things like answering questions, brainstorming ideas, explaining concepts, creative writing, coding help, and much more. What would you like to chat about today?

You: Can you explain what APIs are?
Bot: Sure! An API (Application Programming Interface) is like a bridge that allows different software applications to communicate with each other...
```

## Configuration Options

You can customize the bot's behavior by modifying these environment variables in `.env`:

- `COHERE_MODEL`: The Cohere model to use (default: `command-r-plus`)
  - Options: `command-r-plus`, `command-r`, `command`, `command-light`
- `MAX_TOKENS`: Maximum tokens per response (default: `150`)
  - Higher values = longer responses but higher cost
- `DISCORD_TOKEN`: Your Discord bot token
- `COHERE_API_KEY`: Your Cohere API key

## Project Structure

```
ai-chatbot/
├── index.js          # Main bot file
├── package.json      # Dependencies and scripts
├── .env             # Environment variables (tokens)
├── .gitignore       # Git ignore file
└── README.md        # This file
```

## Error Handling

The bot includes comprehensive error handling for common issues:

- **Cohere Rate Limits**: Notifies users when rate limited
- **Insufficient Quota**: Warns when Cohere credits are exhausted
- **Network Errors**: Graceful handling of connection issues
- **Invalid Tokens**: Clear error messages for authentication issues

## Security Notes

- ⚠️ **Never commit your `.env` file** to version control
- 🔒 **Keep your tokens secure** and never share them
- 💰 **Monitor your Cohere usage** to avoid unexpected charges
- 🔄 **Regenerate tokens** if you suspect they've been compromised

## Troubleshooting

### Common Issues

1. **Bot doesn't respond to DMs**

   - Check if Message Content Intent is enabled
   - Verify the bot token is correct
   - Ensure you share a server with the bot

2. **Cohere errors**

   - Verify your API key is correct
   - Check your Cohere account has credits
   - Ensure you're not hitting rate limits

3. **Bot goes offline**
   - Check your internet connection
   - Verify tokens haven't expired
   - Look at console logs for error messages

### Getting Help

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test your tokens separately to ensure they're valid

## License

This project is licensed under the MIT License - see the package.json file for details.

## Contributing

Feel free to submit issues and enhancement requests!

---

**Happy chatting! 🤖💬**
