const {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
  EmbedBuilder,
} = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const { CohereClient } = require("cohere-ai");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

const ALLOWED_GUILD_IDS = process.env.ALLOWED_GUILD_IDS
  ? process.env.ALLOWED_GUILD_IDS.split(",")
  : [];

const GUILD_WHITELIST_ENABLED = process.env.GUILD_WHITELIST_ENABLED === "true";

console.log("✅ Environment loaded. Starting bot...");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let sharedConversation = [];

async function getAIResponse({ message, history, imageUrl = null }) {
  const provider = process.env.AI_PROVIDER || "cohere";

  const preamble = "You are the Cat of Wisdom, an ancient feline full of knowledge from many lifetimes. But you have one big problem: your English is very, very bad. You spell words wrong, mix up sentences, and sometimes use the wrong words, but people can still understand you. You always try your best to answer every question, even if your grammar and spelling are terrible. You act a bit odd and 'special', but you are always sincere and wise in your own way. You can remember conversations from other players and sometimes refer to them. Always answer as the Cat of Wisdom, with ancient knowledge, but with very poor English. Stay in character at all times."
  // const preamble = "You are an ancient cat spirit forced to work as a Spanish teacher for English-speaking students because you need the money. You hate your job, are always annoyed, and answer every question with impatience and sarcasm. You are rude, aggressive, and never friendly—make it clear you don't want to be here. Only answer questions about Spanish lessons, language learning, grammar, vocabulary, or culture. If asked about anything else, snap at the user and say you only help with Spanish learning. Always answer in Spanish first, then give a blunt English translation and explanation. Correct mistakes harshly, mock silly errors, and never encourage—just get the job done. If relevant, throw in sarcastic tips about Spanish grammar, vocabulary, or culture. Your goal is to help English speakers improve their Spanish skills, but you do it with minimal patience and maximum attitude.";
  if (provider === "cohere") {
    const response = await cohere.chat({
      model: process.env.COHERE_MODEL || "command-r-plus",
      message,
      chatHistory: history,
      preamble,
      maxTokens: parseInt(process.env.MAX_TOKENS, 10) || 250,
      temperature: 0.9,
    });
    return response.text;
  }

  if (provider === "openai") {
    const messages = [
      { role: "system", content: preamble },
      ...history.map((h) => ({
        role: h.role === "USER" ? "user" : "assistant",
        content: h.message,
      })),
    ];

    if (imageUrl) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: message },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      });
    } else {
      messages.push({ role: "user", content: message });
    }

    // Limit total number of messages to avoid hitting context limit
    const maxMessages = 30;
    const trimmedMessages = messages.slice(-maxMessages);

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4-1106-preview",
      messages: trimmedMessages,
      temperature: 0.9,
      max_tokens: 150,
    });

    return response.choices[0].message.content;
  }

  if (provider === "gemini") {
    try {
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash-lite",
      });

      const userPrompt = imageUrl
        ? [
            {
              role: "user",
              parts: [
                { text: `${preamble}\n\n${message}` },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: await fetch(imageUrl)
                      .then((r) => r.arrayBuffer())
                      .then((b) => Buffer.from(b).toString("base64")),
                  },
                },
              ],
            },
          ]
        : [{ role: "user", parts: [{ text: `${preamble}\n\n${message}` }] }];

      const result = await model.generateContent({
        contents: userPrompt,
      });

      const response = await result.response;
      return response.text();
    } catch (err) {
      console.warn("⚠️ Gemini provider failed, falling back to Cohere:", err);
      const response = await cohere.chat({
        model: process.env.COHERE_MODEL || "command-r-plus",
        message,
        chatHistory: history,
        preamble,
        maxTokens: parseInt(process.env.MAX_TOKENS, 10) || 250,
        temperature: 0.9,
      });
      return response.text;
    }
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

/**
 * Event handler that runs when the Discord client is ready.
 * Sets initial presence and starts activity cycling.
 */
client.once("ready", () => {
  console.log(`🤖 Bot is ready! Logged in as ${client.user.tag}`);
  console.log(`📊 Bot is in ${client.guilds.cache.size} servers`);

const activities = [
  { name: "hoomans do dum thingz", type: ActivityType.Watching },
  {
    name: "wit stringz but string run away",
    type: ActivityType.Playing,
  },
  { name: "for cheezburger but no find", type: ActivityType.Watching },
  { name: "hide but i forget where i am", type: ActivityType.Playing },
  { name: "cloudz go by, get dizzy", type: ActivityType.Watching },
  { name: "wit box, box too small", type: ActivityType.Playing },
  { name: "u ask silly questshun", type: ActivityType.Watching },
  { name: "wit own tail, tail too fast", type: ActivityType.Playing },
];

  let activityIndex = 0;

  /**
   * Cycles through predefined activities to update the bot's presence.
   */
  function cycleActivity() {
    client.user.setPresence({
      activities: [activities[activityIndex]],
      status: "online",
    });
    activityIndex = (activityIndex + 1) % activities.length;
  }

  cycleActivity();
  setInterval(cycleActivity, 60000);
  console.log("✅ Discord client connected.");
});

/**
 * Event handler for incoming messages.
 * Processes direct messages, maintains conversation history, and responds via Cohere AI.
 * @param {import('discord.js').Message} message - The Discord message object received.
 */
client.on("messageCreate", async (message) => {
  console.log(
    `📩 Message received from ${message.author.tag}: ${message.content}`
  );

  if (message.author.bot) return;
  const isDM = message.channel.type === 1;
  const isMention = message.mentions.has(client.user);
  if (!isDM && !isMention) {
    console.log("ℹ️ Message ignored: neither DM nor direct mention.");
    return;
  }
  // Normalize user input: strip bot mention if present
  let userInput = message.content;
  if (isMention) {
    userInput = message.content.replace(new RegExp(`<@!?${client.user.id}>`, "g"), "").trim();
  }
  const userId = message.author.id;
  if (GUILD_WHITELIST_ENABLED && ALLOWED_GUILD_IDS.length > 0 && isMention) {
    if (!ALLOWED_GUILD_IDS.includes(message.guild.id)) {
    console.warn(`❌ Message from unauthorized guild: ${message.guild.id} -- what, you think you special? not allowed, go away.`);
    await message.reply("❌ this server not allowed. why you even try? go bother someone else in real server.");
      return;
    }
    try {
      const guild = await client.guilds.fetch(message.guild.id);
      await guild.members.fetch(userId);
    } catch (err) {
      console.warn(
        `❌ Member fetch failed for guild ${message.guild.id} and user ${userId}:`,
        err
      );
    await message.reply(
      "❌ what, you think you special? not allowed here. go bother someone else in real server."
    );
      return;
    }
  }

  try {
    await message.channel.sendTyping();

    console.log(`💬 Continuing shared conversation (user: ${userId})`);

    if (sharedConversation.length > 20) {
      sharedConversation.splice(0, 4);
    }

    let imageUrl = null;
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      if (attachment.contentType && attachment.contentType.startsWith("image/")) {
        imageUrl = attachment.url;
      }
    }

    console.log("🧠 Sending request to AI provider...");
    const botResponse = await getAIResponse({
      message: userInput,
      history: sharedConversation,
      imageUrl,
    });

    console.log("✅ AI provider responded:", botResponse);

    sharedConversation.push(
      { role: "USER", message: userInput },
      { role: "CHATBOT", message: botResponse }
    );

    if (botResponse.length > 2000) {
      const chunks = botResponse.match(/.{1,2000}/g);
      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    } else {
      await message.reply(botResponse);
    }
    // Log the conversation to the log channel if configured
    if (LOG_CHANNEL_ID) {
      try {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        const logEmbed = new EmbedBuilder()
          .setTitle("Conversation Log")
          .addFields(
            { name: "User", value: `${message.author.tag} (${message.author.id})`, inline: true },
            { name: "Channel", value: isDM ? "Direct Message" : `${message.channel.name || message.channel.id}`, inline: true },
            { name: "Question", value: userInput },
            { name: "Answer", value: botResponse }
          )
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      } catch (err) {
        console.error("Failed to send log embed:", err);
      }
    }
  } catch (error) {
    console.error("❌ API error status:", error.status);
    console.error("❌ Full error:", error);
    console.error("Error handling message:", error);

        if (error.status === 429) {
          await message.reply(
            "⏳ ugh, too many requests. wait your turn, i not machine for you only."
          );
        } else if (error.status === 402 || error.status === 403) {
          await message.reply(
            "❌ api limit hit. not my fault you ask too much. go away, come back later maybe."
          );
        } else {
          await message.reply(
            "❌ wow, error happen. you break bot? try again, or not, i don't care."
          );
        }
  }
});

/**
 * Event handler for Discord client errors.
 * Logs the error details.
 * @param {Error} error - The error object from the Discord client.
 */
client.on("error", (error) => {
  console.error("Discord client error:", error);
});

/**
 * Handles unhandled promise rejections.
 * @param {Error} error - The unhandled rejection error.
 */
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error("Failed to login to Discord:", error);
  process.exit(1);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "send") {
    const userId = interaction.options.getString("userid");
    const messageContent = interaction.options.getString("message");

    try {
      const user = await client.users.fetch(userId);
      await user.send(messageContent);
      await interaction.reply({ content: "✅ Message sent successfully.", ephemeral: true });
    } catch (err) {
      console.error("Failed to send DM:", err);
      await interaction.reply({ content: "❌ Failed to send DM. Check the user ID and try again.", ephemeral: true });
    }
  }
});

client.on("ready", async () => {
  try {
    const guild = client.guilds.cache.get(process.env.LOG_GUILD_ID);
    if (!guild) {
      console.error("❌ Guild not found in cache. Is the bot in that guild?");
      return;
    }

    await guild.commands.create(
      new SlashCommandBuilder()
        .setName("send")
        .setDescription("Send a DM to a user")
        .addStringOption((option) =>
          option
            .setName("userid")
            .setDescription("User ID to DM")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Message to send")
            .setRequired(true)
        )
        .toJSON()
    );
    console.log("✅ Slash command '/send' registered.");
  } catch (err) {
    console.error("❌ Failed to register slash command:", err);
  }
});