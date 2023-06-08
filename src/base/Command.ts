import { ApplicationCommandData, CommandInteraction } from "discord.js";
import UppercaseClient from "./UppercaseClient";

export type CommandInfo = ApplicationCommandData;

export default abstract class Command {

    readonly client: UppercaseClient;
    readonly info: CommandInfo;

    protected constructor(client: UppercaseClient, info: CommandInfo) {
        this.client = client;
        this.info = info;

        client.commands.set(this.info.name, this);
    }

    abstract onExecute(interaction: CommandInteraction): Promise<void>;
}