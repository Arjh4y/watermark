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
});

// Anti-spam response
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;
    const userMessageData = messageCounts.get(userId) || { count: 0, timer: null };

    userMessageData.count += 1;

    if (userMessageData.count >= 5) {
        message.channel.send(`WAG SPAM KUPAL KABA BOSS ${message.author}?!`);
        userMessageData.count = 0;
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
    res.sendFile(imagePath);
});
app.listen(port, () => {
    console.log(
        '\x1b[36m[ SERVER ]\x1b[0m',
        `\x1b[32m SH : http://localhost:${port} ✅\x1b[0m`
    );
});

// Status messages kupal
const statusMessages = ['BOT NI SAITO', 'KUPAL KABA MAN?'];
const statusTypes = ['dnd', 'idle'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

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

function updateStatus() {
    client.user.setPresence({
        activities: [
            {
                name: 'Saito',
                type: ActivityType.Streaming,
                url: 'https://www.tiktok.com/@javinarjj', // Replace with your streaming URL
                state: 'Live',
                details: `Saito [${new Date().toLocaleTimeString()}]`,
                assets: {
                    largeImage: 'https://media1.tenor.com/m/EuRL4e1BvGUAAAAC/malupiton-bossing-boss-dila.gif', // Replace with a large image URL
                    largeText: 'Kupal ka BOSS', // Hover text for the large image
                    smallImage: 'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/e3eea550621f1ff34d3ae1f71c9f4e8b~c5_1080x1080.jpeg?lk3s=a5d48078&nonce=98051&refresh_token=f726489b0832fdd6668b68f084aa98b2&x-expires=1736020800&x-signature=pJW8hjQljfhDnHkoBPrl2VZxLR8%3D&shp=a5d48078&shcp=81f88b70', // Replace with a small image URL
                    smallText: '_sythoo', // Hover text for the small image
                },
                buttons: [
                    { label: 'Server', url: 'https://discord.gg/zyjnMDyy' }, // Replace with a URL
                ],
            },
        ],
    });
}

function heartbeat() {
    setInterval(() => {
        console.log(
            '\x1b[35m[ HEARTBEAT ]\x1b[0m',
            `Bot is alive at ${new Date().toLocaleTimeString()}`
        );
    }, 30000);
}

client.once('ready', () => {
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
    updateStatus();
    setInterval(updateStatus, 10000);
    heartbeat();
});

login();
