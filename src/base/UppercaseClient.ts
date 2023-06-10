import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import { Handlers } from "./Handlers";
import { Logger } from "../utils/logger";
import Command from "./Command";
import AutoPoster from "topgg-autoposter";
import { Types } from "../utils/types";

export default class UppercaseClient extends Client {

    commands: Collection<string, Command> = new Collection();
    
    env = process.env;

    isDevEnvironment: boolean = (this.env.ENV = "DEV") ? true : false;

    var: Types.Var = {
        topggToken: this.env.TOPGG_TOKEN,
        webhookUrl: this.env.WEBHOOK_URI
    }

    constructor(token: string) {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildInvites],
            allowedMentions: {
                parse: ['users'],
                repliedUser: true
            }, 
            partials: [Partials.Channel, Partials.User]
        });

        Logger.log('Client', 'Connecting to Discord...');
        super.login(token).then(async () => {
            Handlers.loadEventsListeners(this);
            await Handlers.loadCommands(this);

            if (!this.isDevEnvironment) AutoPoster(this.var.topggToken, this);

            Logger.success('Client', 'Successfully logged in to Discord !' + (this.isDevEnvironment ? "(Dev environment)" : "(Release environment)"));
        });
    }
}

