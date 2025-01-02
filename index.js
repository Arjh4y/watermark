const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const messageCounts = new Map();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(
        '\x1b[36m[ INFO ]\x1b[0m',
        `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`
    );
    updateStatus(); // Calling updateStatus here
    setInterval(updateStatus, 10000); // Update status every 10 seconds
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;
    const userMessageData = messageCounts.get(userId) || { count: 0, timer: null };

    userMessageData.count += 1;

    if (userMessageData.count >= 5) {
        message.channel.send(`WAG SPAM KUPAL KABA BOSS ${message.author}?!`);
        userMessageData.count = 0;
        clearTimeout(userMessageData.timer); // Clear previous timeout
    }

    if (!userMessageData.timer) {
        userMessageData.timer = setTimeout(() => {
            messageCounts.delete(userId);
        }, 10000);
    }

    messageCounts.set(userId, userMessageData);
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath, { headers: { 'Content-Type': 'text/html' } });
});

app.listen(port, () => {
    console.log(
        '\x1b[36m[ SERVER ]\x1b[0m',
        `\x1b[32m SH : http://localhost:${port} ✅\x1b[0m`
    );
});

// Status messages kupal
async function login() {
    try {
        await client.login(process.env.TOKEN);
        console.log(
            '\x1b[36m[ LOGIN ]\x1b[0m',
            `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`
        );
        console.log(
            '\x1b[36m[ INFO ]\x1b[0m',
            `\x1b[35mBot ID: ${client.user.id} \x1b[0m`
        );
        console.log(
            '\x1b[36m[ INFO ]\x1b[0m',
            `\x1b[34mConnected to ${client.guilds.cache.size} server(s) \x1b[0m`
        );
    } catch (error) {
        console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to log in:', error);
        process.exit(1);
    }
}

function formatTime() {
  const date = new Date();
  const options = {
    timeZone: 'Asia/Manila', 
    hour12: true,
    hour: 'numeric',
    minute: 'numeric'
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

client.on('ready', async () => {
  console.clear();
  console.log(`${client.user.tag} - rich presence started!`);

  setActivity();
  setInterval(() => {
    setActivity(); 
  }, 1000); // Update every second
});

async function setActivity() {
  const time = formatTime();
  client.user.setActivity({
    name: `STREAMING [${time}]`,
    type: ActivityType.Watching,
    url: 'https://www.tiktok.com/@javinarjj',
  });

  client.user.setPresence({ status: 'dnd' }); // 'dnd', 'online', 'idle', 'offline'
}

function updateStatus() {
    // Define the updateStatus function to change the bot's activity/status
    const statusMessages = ['Saito'];
    const statusTypes = ['dnd'];
    let currentStatusIndex = 0;
    let currentTypeIndex = 0;

    // Set the bot's activity and presence
    client.user.setActivity(statusMessages[currentStatusIndex], {
        type: ActivityType.Watching,
    });
    client.user.setPresence({ status: statusTypes[currentTypeIndex] });

    // Toggle between status messages and types
    currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
    currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
}

const mySecret = process.env['TOKEN'];
client.login(mySecret);
