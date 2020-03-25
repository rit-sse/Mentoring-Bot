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
let voice_channel_count = 0

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
	mentor_role = msg.guild.roles.find(role => role.name === "Mentor");
	let now = new Date();
	if (now.getHours() < 9 || now.getHours() > 17) {
		found = false
		msg.member.roles.forEach((key, value) => {
			if (value === mentor_role.id) {
				found = true;
			}
		});
		if (msg.content.toLowerCase().startsWith("!") && !found) {
			msg.reply("Mentoring is closed for the day. Please check back between 10 am and 6 pm M-F")
			return
		}
	}
	// Now handle commands
	if (msg.content.toLowerCase().startsWith("!help")) {
		found = false
		msg.member.roles.forEach((key, value) => {
			if (value === mentor_role.id) {
				found = true;
			}
		});
		mentor_cmds = ""
		if (found) {
			mentor_cmds = "\n```" +
				"\nMentor-Only commands:" +
				"```" +
				"\n!online -> Sets your status so you appear as the current mentor on duty" +
				"\n!offline -> Removes your status as the current mentor on duty" +
				"\n!delete [channel #] -> Removes a specified voice/text channel pair. EX: !delete 0" +
				"\n!close -> Removes all existing voice and text channels" +
				"\nNote: All commands work for you 24/7. Before 10 and after 6 mentees can't run commands"
		}
		msg.reply("Welcome to the eSSE's mentoring system! We're here to help." +
			"\nHere's a few helpful commands:" +
			"\n```" +
			"\n!help -> See this command (but you knew that already)" +
			"\n!ping -> Make mentors aware you need help (Please use discretion, there may only be one mentor online at a time)" +
			"\n!join -> Enters you in private voice and chat channels to speak one-on-one with a mentor" +
			mentor_cmds +
			"\n```" +
			"\nPlease remember the following items:" +
			"\n```" +
			"\nWe are volunteers (we don't get paid)" +
			"\nOur hours are 10 am - 6 pm" +
			"\nWe are an official RIT organization. PLEASE no profanity, harrassment, sexual comments, or anything else made to mentors or other mentees" +
			"\nIf you are overly aggressive to our mentors or break any of the rules above, you will be banned permanently and you will be reported to RIT" +
			"\n```" +
			"\n*If you would like to mute this channel to prevent being spammed with notifications, right click on the channel in the navigation bar to the left, navigate to \"Notifications\" and select \"Only @mentions\"*"
		)
	} else if (msg.content.toLowerCase().startsWith("!ping")) {
		var online = msg.guild.roles.find(role => role.name === "Online Mentor");
		msg.reply(`is requesting mentoring assistance ${online}`)
	} else if (msg.content.toLowerCase().startsWith("!join")) {
		msg.guild.createChannel(`${voice_channel_count}-voice`, {
				type: `voice`,
				permissionOverwrites: [
					{
						id: msg.guild.id,
						deny: [`CONNECT`, `SPEAK`, `VIEW_CHANNEL`]
					},
					{
						id: msg.member.user,
						allow: [`CONNECT`, `SPEAK`, `VIEW_CHANNEL`]
					},
					{
						id: mentor_role,
						allow: [`CONNECT`, `SPEAK`, `VIEW_CHANNEL`]
					},
				]
		}).then(channel => {
      channel.setParent(process.env.VOICE_PARENT_ID);
      channel.setTopic(`Voice channel #${voice_channel_count} for mentoring.`)
		}).catch(error => {
      msg.reply(`Unable to create voice channel: ${error}`)
      console.error()
    });
		msg.guild.createChannel(`${voice_channel_count}-text`, {
			type: `text`,
			permissionOverwrites: [
				{
					id: msg.guild.id,
					deny: [`VIEW_CHANNEL`, `SEND_MESSAGES`, `READ_MESSAGE_HISTORY`, `ATTACH_FILES`]
				},
				{
					id: msg.member.user,
					allow: [`VIEW_CHANNEL`, `SEND_MESSAGES`, `READ_MESSAGE_HISTORY`, `ATTACH_FILES`]
				},
				{
					id: mentor_role,
					allow: [`VIEW_CHANNEL`, `SEND_MESSAGES`, `READ_MESSAGE_HISTORY`, `ATTACH_FILES`]
				},
			]
		}).then(channel => {
			channel.setParent(process.env.VOICE_PARENT_ID);
			channel.setTopic(`Text channel #${voice_channel_count} for mentoring.`)
		}).then(() => {
			msg.reply(`Voice and text channels created. Please join ${voice_channel_count}-voice and use ${voice_channel_count}-text for messaging`)
			voice_channel_count += 1
		}).catch(error => {
      msg.reply(`Unable to create text channel: ${error}`)
      console.error()
    })
	} else if (msg.content.toLowerCase().startsWith("!close")) {
		found = false
		msg.member.roles.forEach((key, value) => {
			if (value === mentor_role.id) {
				found = true;
			}
		});
		if (found) {
			msg.reply("Shutting down all voice channels")
			parent_channel = msg.guild.channels.find(channel => channel.id === process.env.VOICE_PARENT_ID)
			parent_channel.children.forEach((channel) => {
				channel.delete("closing time *Insert song here*")
				voice_channel_count = 0
			})
		} else {
			msg.reply("Insufficient Permissions")
		}
	} else if (msg.content.toLowerCase().startsWith("!delete")) {
		found = false
		msg.member.roles.forEach((key, value) => {
			if (value === mentor_role.id) {
				found = true;
			}
		});
		if (found) {
			cmds = msg.content.split(" ")
			if (cmds.length != 2) {
				msg.reply("Incorrect usage. Usage: !delete **Channel#** Ex: !delete 0")
				return
			}
			voice_channel_to_del = msg.guild.channels.find(channel => channel.name === `${cmds[1]}-voice`)
			text_channel_to_del = msg.guild.channels.find(channel => channel.name === `${cmds[1]}-text`)
			msg.reply(`Closing ${cmds[1]}-voice and ${cmds[1]}-text`)
			voice_channel_to_del.delete("closing time *Insert song here*")
			text_channel_to_del.delete("closing time *Insert song here*")
		} else {
			msg.reply("Insufficient Permissions")
		}
	} else if (msg.content.toLowerCase().startsWith("!online")) {
		found = false
		msg.member.roles.forEach((key, value) => {
			if (value === mentor_role.id) {
				found = true;
			}
		});
		if (found) {
			var online = msg.guild.roles.find(role => role.name === "Online Mentor");
			already_online = false
			msg.member.roles.forEach((key, value) => {
				if (value === online.id) {
					already_online= true;
				}
			});
			if (!already_online) {
				msg.member.addRole(online)
				msg.reply("is now mentoring")
			} else {
				msg.reply("is already online")
			}
		}
	} else if (msg.content.toLowerCase().startsWith("!offline")) {
		found = false
		msg.member.roles.forEach((key, value) => {
			if (value === mentor_role.id) {
				found = true;
			}
		});
		if (found) {
			var online = msg.guild.roles.find(role => role.name === "Online Mentor");
			already_online = false
			msg.member.roles.forEach((key, value) => {
				if (value === online.id) {
					already_online= true;
				}
			});
			if (already_online) {
				msg.member.removeRole(online)
				msg.reply("is no longer mentoring")
			} else {
				msg.reply("isn't currently mentoring to begin with")
			}
		}
	}
})

client.login(process.env.BOT_TOKEN);
