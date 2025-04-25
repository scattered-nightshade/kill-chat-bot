import { CacheType, ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { InteractionCommand } from '../../../classes/command';
import path from 'path';
import fs from 'fs';
import { graphviz } from 'node-graphviz';
import sharp from 'sharp';

export class GraphCommand extends InteractionCommand {
    constructor() {
        super();
        this.name = 'graph';
        this.description = 'Get the graph of the bot\'s learnt messages.';
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

        const graph = this.parseJsonToGraph(markovChain);

        const svg = await graphviz.dot(graph, 'svg');

        const png = await sharp(Buffer.from(svg)).png().toBuffer();

        interaction.reply({ files: [{ name: 'graph.png', attachment: png }] });

    }

    private loadMarkovChain() {
        const filePath = path.join(process.cwd(), 'markov_chain.json');

        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }

        return {};
    }

    private parseJsonToGraph(graphData: Record<string, string[]>) {
        let graph = 'digraph G {\n  rankdir=LR;\n  node [shape=ellipse];\n\n';

        for (const [from, toList ] of Object.entries(graphData)) {
            for (const to of toList) {
            graph += `  "${from}" -> "${to}";\n`;
            }
        }

        graph += '}';

        return graph;
    }
}

export default new GraphCommand();