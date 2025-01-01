const { Client, GatewayIntentBits, ActivityType, SlashCommandBuilder } = require('discord.js');
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
    if (message.author.bot) return; // Ignore bot messages

    const userId = message.author.id;
    const userMessageData = messageCounts.get(userId) || { count: 0, timer: null };

    userMessageData.count += 1;

    if (userMessageData.count >= 5) {
        message.channel.send(`WAG SPAM KUPAL KABA BOSS ${message.author}?!`);
        userMessageData.count = 0; // Reset the counter after sending the warning
    }

    if (!userMessageData.timer) {
        userMessageData.timer = setTimeout(() => {
            messageCounts.delete(userId); // Remove the user from tracking after inactivity
        }, 10000); // Adjust this timeout (e.g., 10 seconds) as needed
    }

    messageCounts.set(userId, userMessageData);
});

// Serve the index.html file
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

// Status messages and heartbeat
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
    const currentStatus = statusMessages[currentStatusIndex];
    const currentType = statusTypes[currentTypeIndex];
    client.user.setPresence({
        activities: [{ name: currentStatus, type: ActivityType.Custom }],
        status: currentType,
    });
    console.log(
        '\x1b[33m[ STATUS ]\x1b[0m',
        `Updated status to: ${currentStatus} (${currentType})`
    );
    currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
    currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
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

// User info command module

const guildId = '910119627793780747';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('ready', async () => {
    const commands = [
        new SlashCommandBuilder()
            .setName('userinfo')
            .setDescription('Get information about a user')
            .addUserOption(option => 
                option.setName('user')
                    .setDescription('The user to get info about')
                    .setRequired(false)),
    ];

    try {
        await client.guilds.cache.get(guildId).commands.set(commands);
        console.log('Slash commands registered');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
});


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    
    if (commandName === 'userinfo') {
        let user = interaction.options.getUser('user') || interaction.user;

        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const userInfo = `
👤 **User Info:**
=========================
**Username**      : ${user.username}
**User ID**       : ${user.id}
**Account Created**: ${new Date(user.createdTimestamp).toLocaleDateString()} (${new Date(
            user.createdTimestamp
        ).toLocaleTimeString()})
=========================
**Profile Picture**: [Click Here](${avatarURL})
        `;

        await interaction.reply(userInfo);
    }
});


login();
