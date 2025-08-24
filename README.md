# Cat of Wisdom

A Discord bot that chats with users in DMs or servers, powered by Cohere, OpenAI, and Google Gemini. This bot is The Cat of Wisdom: an ancient feline with quirky, brief, and wise responses.

## Features
- Chatbot persona: Cat of Wisdom (quirky, brief, and wise answers)
- Supports multiple AI providers: Cohere, OpenAI, Google Gemini
- DM conversations with users
- Guild whitelisting (optional)
- Logging to a specified channel

## Environment Setup
Create a `.env` file in the project root with the following variables:

```
DISCORD_TOKEN=your_discord_bot_token
COHERE_API_KEY=your_cohere_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_google_gemini_api_key
LOG_CHANNEL_ID=your_log_channel_id
ALLOWED_GUILD_IDS=guild_id1,guild_id2
GUILD_WHITELIST_ENABLED=true
AI_PROVIDER=cohere|openai|gemini
```

- Only the relevant API key for your chosen provider is required.
- `ALLOWED_GUILD_IDS` is a comma-separated list of guild IDs.
- Set `GUILD_WHITELIST_ENABLED` to `true` to restrict bot usage to specified guilds.

## Getting Started
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in your credentials.
3. **Run the bot:**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## License
MIT

---

Feel free to customize the bot’s persona or extend its features!

