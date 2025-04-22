import { CacheType, ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { InteractionCommand } from '../../../classes/command';
import path from 'path';
import fs from 'fs';
import { randomIntInRange } from '../../../modules/random';

export class KillChatCommand extends InteractionCommand {
    constructor() {
        super();
        this.name = 'killchat';
        this.description = 'Get the bot to send a message that will likely kill chat.';
        this.data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setNSFW(this.nsfw);
    }

    async execute(interaction: ChatInputCommandInteraction<CacheType>) {

        const markovChain = this.loadMarkovChain();

        if (Object.keys(markovChain).length === 0) {
            interaction.reply({ content: 'I haven\'t learnt anything yet, just wait for more messages that cause dead chat', flags: MessageFlags.Ephemeral });
            return;
        }

        const generatedMessage = this.generateMessage(markovChain, 'the', randomIntInRange(25, 100));

        interaction.reply({ content: generatedMessage });

    }

    private loadMarkovChain() {
        const filePath = path.join(process.cwd(), 'markov_chain.json');

        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }

        return {};
    }

    private generateMessage(markovChain: any, startWord: string, maxWords: number): string {
        let currentWord = startWord;
        const generatedMessage = [currentWord];

        for (let i = 0; i < maxWords; i++) {
            const nextWords = markovChain[currentWord];

            if (!nextWords || nextWords.length === 0) {
                break;
            }

            const randomIndex = Math.floor(Math.random() * nextWords.length);
            const nextWord = nextWords[randomIndex];

            generatedMessage.push(nextWord);

            currentWord = nextWord;
        }

        return generatedMessage.join(' ');
    }
}

export default new KillChatCommand();