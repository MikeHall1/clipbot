const BOT_TOKEN = process.env.API_KEY;
// Replace "CHANNEL_ID" with the ID of the channel you want to create the daily link list for
const targetChannelId = process.env.TARGET_CHANNEL
// This is the channel where the daily link list will be posted
const listChannelId = process.env.LIST_CHANNEL
const botId = process.env.BOT_ID
import {Client as Client, GatewayIntentBits as GatewayIntentBits }from 'discord.js';


doMikesStuff();

export const handler = async(event) => {
    // TODO implement
    doMikesStuff();
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
function doMikesStuff(){

    const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers]});

    client.login(BOT_TOKEN);

    let dailyMessage = null; // This will hold the daily message
    let today = new Date();
    let messagesByAuthor = {};
    client.on("ready", async () => {
        console.log(`Logged in as ${client.user.tag}`);

        // Get the target channel and the list channel
    const targetChannel = client.channels.cache.get(targetChannelId);
    const listChannel = client.channels.cache.get(listChannelId);

    targetChannel.messages.fetch({limit:100})
        .then( messages => {
            //get only the messages created since last read
            messages.filter(message => message.createdTimestamp > lastRead)
            //filter for only messages wiht an author
            //filter messages that aren't from the bot
            //filter for messages that have a link
            //add each of those to the list of messages
            //
            .filter(message => message.)

        })

    setInterval(() => {
        const now = new Date();
        if (
                // Check if the date has changed
        now.getDate() !== today.getDate() ||
        now.getMonth() !== today.getMonth() ||
        now.getFullYear() !== today.getFullYear()
        //now.getSeconds() !== today.getSeconds()

        ) {
            // Send the message
            try {
                listChannel.send("Clips Consolidated for " + now.toLocaleDateString() + " Auto").then(msg => {
                    dailyMessage = msg;
                });
                if(messagesByAuthor) {
                    clearObj(messagesByAuthor);
                }
            } catch (error) {
                // Handle the error here
            }
            // Update the today variable with the current date
            today = now;
        }
    }, 60000); // Set the interval to 1 minute (60 seconds)

    if (!dailyMessage) {
        dailyMessage = await listChannel.send(
                "Clips Consolidated for " + today.toLocaleDateString() + "initial bot load"
                );
    }
        // Listen for new messages in the target channel
    client.on("messageCreate", async (message) => {
        if (message.author.id === botId) {
            // on creation of bot message don't delete.
            return;
        }

        console.log("New Message");
        if (message.channel.id === targetChannelId) {
            // check if the message has a url
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            if (!urlRegex.test(message.content)) {
                console.log("Message does not contain URL");
                return;
            }

            // Check if the object already has a property for the author's name
            if (messagesByAuthor.hasOwnProperty(message.author.tag)) {
                // If it does, retrieve the existing array of messages
                let messages = messagesByAuthor[message.author.tag];
                // Add the new message to the array
                messages.push({
                    url: message.content.match(urlRegex)[0],
                    created_at: new Date(message.createdAt).toLocaleTimeString(),
                });
            } else {
                // If it doesn't, create a new property for the author's name and add the first message to the array
                messagesByAuthor[message.author.tag] = [
                    {
                        url: message.content.match(urlRegex)[0],
                        created_at: new Date(message.createdAt).toLocaleTimeString(),
                    },
                    ];
            }
        }

        let outputString = "";
        // Loop through each property in the object
        const now = new Date();
        for (let key in messagesByAuthor) {
            // Add the user's name to the output string
            outputString += `${key}:\n`;

            // Loop through each item in the user's array of messages
            for (let i = 0; i < messagesByAuthor[key].length; i++) {
                // Get the current message
                const message = messagesByAuthor[key][i];

                // Add the message details to the output string
                outputString += `   - ${message.created_at}: <${message.url}>\n`;
            }
            // Add a newline after each user's messages

            outputString += "\n";
        }
        dailyMessage.edit("Clips Consolidated for " + now.toLocaleDateString() + " Auto\n"  + outputString);
        await message.delete(); // deletes original message
    }
    );
    });
}

function clearObj (obj) {
    for (const key in obj) {
        delete obj[key];
    }

    console.log(obj); // 👉️ {}
}
