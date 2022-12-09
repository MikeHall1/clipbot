const credentials = require('./credential-file.js');
const { Client, GatewayIntentBits, Discord } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
const BOT_TOKEN = credentials.token;
client.login(BOT_TOKEN);


// Replace "CHANNEL_ID" with the ID of the channel you want to create the daily link list for
const targetChannelId = "1050361047590117408";
// This is the channel where the daily link list will be posted
const listChannelId = "1050361047590117408";
const botId = "1050370604865429624";

let dailyMessage = null; // This will hold the daily message
let today = new Date();
let messagesByAuthor = {};
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Get the target channel and the list channel
  const targetChannel = await client.channels.fetch(targetChannelId);
  const listChannel = client.channels.cache.get(listChannelId);

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
      message.delete(); // deletes original message
    }
);
});


function clearObj (obj) {
    for (const key in obj) {
        delete obj[key];
      }
      
      console.log(obj); // 👉️ {}
}
