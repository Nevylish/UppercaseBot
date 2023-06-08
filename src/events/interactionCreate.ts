import { CommandInteraction, Interaction } from "discord.js";
import UppercaseClient from "../base/UppercaseClient";
import { Handlers } from "../base/Handlers";

export = async (client: UppercaseClient, interaction: Interaction) => {
    if (interaction.isCommand()) await Handlers.interactionCommandHandler(client, interaction as CommandInteraction);
}