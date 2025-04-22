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

        const generatedMessage = this.generateMessage(markovChain, 3, randomIntInRange(25, 100));

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

    private generateMessage(markovChain: any, order: number, maxWords: number): string {
        const states = Object.keys(markovChain);

        if (states.length === 0) {
            return 'No data to generate message.';
        }

        let currentState = states[Math.floor(Math.random() * states.length)];
        const generatedWords = currentState.split(' ');

        for (let i = 0; i < maxWords; i++) {
            const nextWords = markovChain[currentState];

            if (!nextWords || nextWords.length === 0) {
                break;
            }

            const nextWord = nextWords[Math.floor(Math.random() * nextWords.length)];
            generatedWords.push(nextWord);

            currentState = generatedWords.slice(-order).join(' ');
        }

        return generatedWords.join(' ');
    }
}

export default new KillChatCommand();