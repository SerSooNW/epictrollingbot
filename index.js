const { Client, GatewayIntentBits, Message, GuildMember, User} = require('discord.js');
const { Routes } = require('discord-api-types/v10');
const { REST } = require('@discordjs/rest');
const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const clientId = 'IwI';
//const guildId = 'OwO';
const token = 'UwU';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });
const imageRanges = [
    { min: 1, max: 2, imageUrl: 'https://cdn.discordapp.com/attachments/702895648663404645/1146187475891519518/1.png', message: '<OH, YEEEEEEEEAAH>!! <VERY GOOOOOOOOOOOOOD>!!' },
    { min: 3, max: 7, imageUrl: 'https://cdn.discordapp.com/attachments/702895648663404645/1146187476159975484/3.png', message: 'PWEEASE, LOOK AT THIIIIIIIIIISS!!' },
    { min: 8, max: 10, imageUrl: 'https://cdn.discordapp.com/attachments/702895648663404645/1146187476487118948/8.png', message: "BUT IT'S NO UUUUUUUUUUUUUUUUSE!!" },
    { min: 11, max: 15, imageUrl: 'https://cdn.discordapp.com/attachments/702895648663404645/1146187476784926870/11.png', message: "WHHHAAAAAT ARRRRE THEEEESSE?!" },
    { min: 16, max: 17, imageUrl: 'https://cdn.discordapp.com/attachments/702895648663404645/1146187477036572753/16.png', message: "WHAT ABOUT THIS ROOOOOOOOOOOOOOOLL?!?!" },
    { min: 18, max: 20, imageUrl: 'https://cdn.discordapp.com/attachments/702895648663404645/1146187475614703636/jebnecikurwa.png', message: "Look, here, here! There's something attached to the dice?! What is it?! Hey, what is it, Maaariiiiiiiiiiii?!." },
];

function getImageForNumber(number, maxLimit) {
    const scaledRanges = imageRanges.map(range => ({
        min: Math.ceil(range.min * maxLimit / 20),
        max: Math.floor(range.max * maxLimit / 20),
        imageUrl: range.imageUrl,
        message: range.message
    }));

    for (const range of scaledRanges) {
        if (number >= range.min && number <= range.max) {
            return {imageUrl: range.imageUrl, message: range.message};
        }
    }
    return {};

let lastNumber;

client.once('ready', () => {
    console.log('Bot is ready!');
});

const commands = [
    new SlashCommandBuilder()
        .setName('rzut')
        .setDescription('Co dzisiaj wypadnie, może 1? (￣y▽￣)╭ Ohohoho.....')
        .addIntegerOption(option => option.setName('k').setDescription('Jaka kostka wariacie?').setRequired(true))
        .addIntegerOption(option => option.setName('d').setDescription('Ile dodajemy do rzutu?').setRequired(false))
        .addIntegerOption(option => option.setName('o').setDescription('Ile odejmujemy od rzutu?').setRequired(false))
        .addStringOption(option => option.setName('w').setDescription('Jakie numery wykluczyć?').setRequired(false)),
    new SlashCommandBuilder()
        .setName('pomoc')
        .setDescription('Wyjaśnij co robi komenda rzut')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);
(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    const userMention = `<@${interaction.user.id}>`; 
    const username = interaction.user.username;
    const memberColor = interaction.member.displayColor;
    const guild = interaction.guild;

    if (commandName === 'pomoc') {
        const embed = new EmbedBuilder()
            .setTitle('Sieam wyjaśnień czas')
            .addFields(
                {name: 'rzut', value: 'Losuje numer, można dodawać x do rzutu, można odejmować, można wyłączać w sposób: x, y, z.'},
                {name: 'pomoc', value: 'Właśnie to czytasz!'},
                {name: 'zostałam wywołana przez:', value: `${userMention}`},
                )
            .setColor(memberColor)
            .setImage('https://cdn.discordapp.com/attachments/921835323376422955/1146158598976704542/839e6c77ba4a54dae2f7139aa35d74dc.png');

        await interaction.reply({ embeds: [embed] });
        return;
    }

    if (commandName === 'rzut') {
        
        const limit = interaction.options.getInteger('k');
        let number = Math.floor(Math.random() * limit) + 1;

        if (lastNumber && Math.random() < 0.02) {
            number = lastNumber;
        }

        const add = interaction.options.getInteger('d') || 0;
        const subtract = interaction.options.getInteger('o') || 0;
        const excludeStr = interaction.options.getString('w');
        const excludes = excludeStr ? excludeStr.split(',').map(num => parseInt(num.trim())) : [];

        number = number + add - subtract;

        while (excludes.includes(number)) {
            number = (number + 1) % (limit + 1);
            if (number === 0) number = 1; 
        }

        lastNumber = number;

        const details = getImageForNumber(number, limit);

        const embed = new EmbedBuilder()
            .setTitle('Rzucig')
            .setDescription(`Wynik rzutu ${userMention} to: **${number}**\n${details.message || ''}`)
            .setColor(memberColor);

        if (details.imageUrl) {
            embed.setImage(details.imageUrl);
        }

        await interaction.reply({ embeds: [embed] });
    }
});

client.login(token);
