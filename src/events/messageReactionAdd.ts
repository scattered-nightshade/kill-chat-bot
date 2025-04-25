import { Events, MessageReaction, MessageReactionEventDetails, User } from 'discord.js';
import BotEvent from '../classes/event';
import fs from 'fs';
import path from 'path';
import Profile from '../schemas/profileModel';

// https://discordjs.guide/popular-topics/reactions.html#listening-for-reactions-on-old-messages

class MessageReactionAdd extends BotEvent {

    constructor() {
        super();
        this.name = Events.MessageReactionAdd;
        this.once = false;
    }

    async execute(messageReaction: MessageReaction, user: User, details: MessageReactionEventDetails): Promise<any> {

        // I honestly dont really fully understand how partials work but this was gotten off the discord.js's guides

        if (messageReaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await messageReaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }

        if (messageReaction.emoji.name === '👑') {
            const message = messageReaction.message.content;
            const author = messageReaction.message.author;

            if (!message) {
                return;
            }

            const markovChain = this.buildMarkovChain(message, 3);

            this.saveMarkovChain(markovChain);

            if (!author) {
                console.warn(`Failed to find author`);
                return;
            }

            const userProfile = await Profile.getProfileById(author.id);

            userProfile.deadChats += 1;

            userProfile.save();
        }
    }

    private buildMarkovChain(text: string, order: number) {
        const words = text.toLowerCase().split(/\s+/);
        const markovChain: any = {};
    
        for (let i = 0; i <= words.length - order; i++) {
            const currentState = words.slice(i, i + order).join(' ');
            const nextWord = words[i + order];
    
            if (!nextWord) {
                continue;
            }
    
            if (!markovChain[currentState]) {
                markovChain[currentState] = [];
            }
    
            markovChain[currentState].push(nextWord);
        }
    
        return markovChain;
    }
    

    private saveMarkovChain(newMarkovChain: object) {
        const filePath = path.join(process.cwd(), 'markov_chain.json');
    
        let existingChain: any = {};
    
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            existingChain = JSON.parse(fileData);
        }
    
        for (const [word, nextWords] of Object.entries(newMarkovChain)) {
            if (!existingChain[word]) {
                existingChain[word] = [];
            }
            existingChain[word].push(...nextWords);
        }
    
        fs.writeFileSync(filePath, JSON.stringify(existingChain, null, 2), 'utf-8');
    }
    
}

export default new MessageReactionAdd();