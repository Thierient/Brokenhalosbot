import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, warningEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const SUCCESS_LOOT = [
    "a shiny golden coin",
    "a dusty old map to nowhere in particular",
    "a suspiciously good sandwich",
    "a rubber duck wearing a tiny crown",
    "a chest full of glitter (it's everywhere now)",
    "a single, perfect sock",
    "an ancient scroll that just says 'lol'",
    "a tiny dragon plushie",
];

const FAIL_FLAVOR = [
    "The lock jams and the key snaps clean in half.",
    "An alarm made entirely of kazoos goes off.",
    "The 'lock' turns out to be a very convincing sticker.",
    "You pick the lock... on the wrong door.",
    "The key bends like it's made of rubber.",
];

const SUCCESS_CHANCE = 0.65;

export default {
    data: new SlashCommandBuilder()
        .setName("keys")
        .setDescription("Try your luck picking a mysterious lock for a bit of loot.")
        .addIntegerOption((option) =>
            option
                .setName("attempts")
                .setDescription("How many keys to try (1-5)")
                .setMinValue(1)
                .setMaxValue(5),
        ),
    category: 'Fun',

    async execute(interaction, config, client) {
        await InteractionHelper.safeDefer(interaction);

        const user = interaction.user;
        const attempts = interaction.options.getInteger("attempts") || 1;

        const lines = [];
        let successes = 0;

        for (let i = 1; i <= attempts; i++) {
            const didSucceed = Math.random() < SUCCESS_CHANCE;

            if (didSucceed) {
                successes++;
                const loot = SUCCESS_LOOT[rand(0, SUCCESS_LOOT.length - 1)];
                lines.push(`🔑 **Key ${i}:** Click! The lock gives way — you find ${loot}!`);
            } else {
                const flavor = FAIL_FLAVOR[rand(0, FAIL_FLAVOR.length - 1)];
                lines.push(`🗝️ **Key ${i}:** ${flavor}`);
            }
        }

        const title = successes === attempts
            ? "🏆 Master Locksmith!"
            : successes === 0
                ? "💥 Total Lockout"
                : "🔓 Lockpicking Results";

        const summary = `**${successes}/${attempts}** key${attempts > 1 ? "s" : ""} successfully picked.`;

        const embed = successEmbed(title, `${lines.join("\n")}\n\n${summary}`);

        await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
        logger.debug(`Keys command executed by ${user.id} in guild ${interaction.guildId} — ${successes}/${attempts} successes`);
    },
};
