// Using dotenv to read a .env file for the secret infos
require('dotenv').config()

// Regular imports 
const { PerformanceObserver, performance } = require('perf_hooks');
const Discord = require('discord.js');
const client = new Discord.Client();
const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
}

// Set the bot's presence (activity and status)
client.on("ready", () => {
  client.user.setPresence({
  	game: {
      name: 'Mentoring Assistance',
      type: 'PLAYING'
    },
    status: 'Online'
  })
})

client.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return;
	const { d: data } = event;
	const user = client.users.get(data.user_id);
	const channel = client.channels.get(data.channel_id) || await user.createDM();
	if (channel.messages.has(data.message_id)) return;
	const message = await channel.fetchMessage(data.message_id);
	const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
	const reaction = message.reactions.get(emojiKey);
	client.emit(events[event.t], reaction, user);
});

client.on('message', async msg => {
	// Ensuring we aren't responding to a bot
	if (msg.member.user.bot) {
		return
	}
	// Now handle commands
	if (msg.content.includes("!help")) {
		msg.reply("\
			\n\bWelcome to the eSSE's mentoring system! We're here for help.\
			\n\bHere's a few helpful commands:\
			```\
			\n\b!help -> See this command (but you knew that already)\
			\n\b!mentee -> Register yourself to receive mentoring assistance\
			\n\b!ping -> Make mentors aware you need help (Please use discretion, there may only be one mentor online at a time)\
			```\
			\n\bPlease remember the folling items:\
			```\
			\n\bWe are volunteers (we don't get paid)\
			\n\bOur hours are 10 am - 6 pm\
			\n\bWe are an official RIT organization. PLEASE no profanity, harrassment, sexual comments, or anything else made to mentors or other mentees.\
			\n\bIf you are overly aggressive to our mentors or break any of the rules above, you will be banned permanently and you will be reported to RIT\
			```\
		")
	}
})

client.login(process.env.BOT_TOKEN);
