import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Handlers } from "./Handlers";
import { Logger } from "../utils/logger";
import Command from "./Command";
import AutoPoster from "topgg-autoposter";

export default class UppercaseClient extends Client {

    commands: Collection<string, Command> = new Collection();
    
    env = process.env;

    isDevEnvironment: boolean = (this.env.ENV = "DEV") ? true : false;

    wehbookUrl: string = this.env.WEBHOOK_URI;

    constructor(token: string) {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildInvites],
            allowedMentions: {
                parse: ['users'],
                repliedUser: true
            }, 
            // @ts-ignore
            partials: ["CHANNEL", "MESSAGE", "USER"]
        });

        Logger.log('Client', 'Connecting to Discord...');
        super.login(token).then(async () => {
            Handlers.loadEventsListeners(this);
            await Handlers.loadCommands(this);

            if (!this.isDevEnvironment) AutoPoster(process.env.TOPGG_TOKEN, this);

            Logger.success('Client', 'Successfully logged in to Discord !' + (this.isDevEnvironment ? "(Dev environment)" : "(Release environment)"));
        });
    }
}