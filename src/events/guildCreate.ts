import { EmbedBuilder, Guild, WebhookClient } from "discord.js";
import UppercaseClient from "../base/UppercaseClient";
import { Constants } from "../utils/constants";

export = async (client: UppercaseClient, guild: Guild) => {
    const webhookClient = new WebhookClient({url: 'htps://discord.com/api/webhooks/1074607158324383744/ror7D1o2LADu9FdMZcbcUTVNrtVZPY0r9ssk6DOk0tjpTjiYkfnS-GKh6VrEjtj6e04b'});
    const owner = (await guild.fetchOwner());

    let description = `Members: ${guild.memberCount}`;
    if (owner) description += `\nOnwer: ${owner.user.tag} (${owner.id})`;

    const embed = new EmbedBuilder()
        .setColor(Constants.Colors.GREEN)
        .setAuthor({
            name: `New guild: ${guild.name}`,
            iconURL: guild.iconURL({size: 128})
        })
        .setDescription(description)
        .setThumbnail(guild.iconURL({size: 256}));

    if (guild.splash) embed.setImage(guild.splashURL({size: 1024}));
    if (guild.banner) embed.setThumbnail(guild.bannerURL({size: 512}));

    await webhookClient.send({
        username: client.user.username,
        avatarURL: client.user.avatarURL({size: 256}),
        embeds: [embed]
    });
}