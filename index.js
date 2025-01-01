const { Client, GatewayIntentBits, ActivityType, SlashCommandBuilder, REST, Routes } = require('discord.js');
require('dotenv').config(); // Load environment variables
const express = require('express');
const path = require('path');

// Express setup for removing BotGhost watermark
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});
app.listen(port, () => {
    console.log('\x1b[36m[ SERVER ]\x1b[0m', '\x1b[32m SH : http://localhost:' + port + ' ✅\x1b[0m');
});

// Discord bot setup
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const messageCounts = new Map();
const statusMessages = ["BOT NI SAITO", "KUPAL KABA MAN?"];
const statusTypes = ['dnd', 'idle'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

// Helper function to register slash commands
async function registerSlashCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('userinfo')
            .setDescription('Get details and profile picture (PFP) of a user.')
            .addUserOption(option =>
                option
                    .setName('target')
                    .setDescription('The user to fetch info for')
                    .setRequired(false)
            )
            .toJSON(),
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to register slash commands:', error);
    }
}

// Bot login
async function login() {
    try {
        await client.login(process.env.TOKEN);
        console.log('\x1b[36m[ LOGIN ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
        await registerSlashCommands(); // Register commands after logging in
    } catch (error) {
        console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to log in:', error);
        process.exit(1);
    }
}

// Handle bot ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);

    updateStatus();
    setInterval(updateStatus, 10000); // Update status every 10 seconds

    heartbeat();
});

// Function to update bot status
function updateStatus() {
    const currentStatus = statusMessages[currentStatusIndex];
    const currentType = statusTypes[currentTypeIndex];
    client.user.setPresence({
        activities: [{ name: currentStatus, type: ActivityType.Custom }],
        status: currentType,
    });
    console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${currentStatus} (${currentType})`);
    currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
    currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
}

// Heartbeat function to log bot uptime
function heartbeat() {
    setInterval(() => {
        console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
    }, 30000);
}

// Spam prevention logic
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

// Handle interactions for slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'userinfo') {
        try {
            const user = interaction.options.getUser('target') || interaction.user;

            const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

            const userInfo = `
👤 **User Info:**
=========================
**Username**      : ${user.username}
**User ID**       : ${user.id}
**Account Created**: ${new Date(user.createdTimestamp).toLocaleDateString()} at ${new Date(
                user.createdTimestamp
            ).toLocaleTimeString()}
=========================
**Profile Picture**: [Click Here](${avatarURL})
            `;

            await interaction.reply({ content: userInfo, ephemeral: false });
        } catch (error) {
            console.error('Error in /userinfo command:', error);
            await interaction.reply({
                content: 'Sorry, I was unable to fetch the user information.',
                ephemeral: true,
            });
        }
    }
}

login();
