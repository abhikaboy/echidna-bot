require("dotenv").config();
//import { Client } from "discord.js";
const { Client, MessageAttachment, Message, MessageEmbed } = require("discord.js");
const client = new Client();
const PREFIX = "!";
const numList = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];
// so sad i cant use cool syntax
// import { servers } from "./serverCollection";
// import { Server } from "./server";

let servers = require("./serverCollection");
let Server = require("./server");
let event = require("./events.js");



client.on("ready", () => {
	console.log(`${client.user.username} online!`);
	client.user.setPresence({
		status: 'online',
		activity: {
			name: 'do @suntex if u see this',
			type: 'STREAMING',
			url: 'https://www.twitch.tv/chippy'
		}
	})
	let time;
	setInterval(() => {
		// loop through servers and call event update.
		time = new Date();
		servers.collection.forEach(server => {server.eventUpdate(time); server.scheduleUpdate(time)});
	},60 * 1000) // 1 minute 
});
client.on("messageReactionAdd", (messageReaction, user) => {
	if (user.bot) return;
	let serverId = messageReaction.message.guild.id;
	let server = servers.get(serverId);
	try{
		console.log(server.gamePlayers[server.gameCurrentPlayer].id);
		if(user.id == server.gamePlayers[server.gameCurrentPlayer].id){ // game players array at index current game player
			let userReact = messageReaction.emoji.name;
			let col = numList.findIndex((el) => el == userReact)+1;
			console.log("before place");
			server.placeCircle(col);
			console.log("placing circ");
			server.sendGameState(messageReaction.message.channel);
			console.log("sent game state");
		}
	} catch(err){
		
	}
});
client.on("message", (message) => {
	// if(message.author.bot) return;
	
	// temp
	try{
		servers.get(message.guild.id,message.guild);
	} catch(err){
		console.log(err);
		console.log(message);
	}

	// User wants to issue a command
	servers.get(message.guild.id).serverObject = message.guild; // need to do this a better way in the future. 
	if (message.content.startsWith(PREFIX)) {
		const [cmdName, ...args] = message.content
			.trim()
			.substring(PREFIX.length)
			.split(/\s+/);
		let serverId = message.guild.id;
		let server = servers.get(serverId);
		console.log(args);
		switch (cmdName.toLowerCase()) {
			case "test":
				server.test(message.channel);
				break;
			case "challenge" || "Challenge":
				console.log("Someone send a challegne command");
				if (args[0] == "Accept" || args[0] == "accept") {
					servers
						.get(serverId)
						.acceptRequest(message.author, message.channel);
				} else if (args[0] == "public") {
					console.log("public");
					servers
						.get(serverId)
						.createPublicRequest(
							args[1],
							message.author,
							message.channel
						);
				} else {
					// servers
					// 	.get(serverId)
					// 	.createMatch(
					// 		args[1],
					// 		message.author,
					// 		message.mentions.users,
					// 		message.channel
					// 	);
				}
				break;
			case "cancel":
				if(args[0] == '<@!185595163920302080>'){
					message.channel.send("You cannot cancel god.");
				} else {
				servers
				.get(serverId).cancel(args[0],message.channel);
				}
				break;
			case "nextclass":
				message.reply(server.nextClass(new Date()));
				break;
			case "classend":
				message.reply(server.classEnd(new Date()));
				break;
			case "event":
				
				/*
					Create 
					public, @ role
					Event Name 
					time in EST
				*/
				try{
					switch(args[0].toLowerCase()){
						case "create":
							message.reply("event create process");
							break;
						case "list":
							message.reply("event list");
							break;
						case "help":
							const eventHelpEmbed = new MessageEmbed()
							.setColor('#90ee90')
							.setTitle('Event Help Menu')
							.setDescription(`
							**!event create**
							  > create a new event, starts event creation process

							**!event cancel**
							  > cancels an event, only the creator of the event can do this

							**!event <eventName> list**
							  > lists all participants

							**!event <eventName> warn**
							  > mentions all users who are not in the event voice chat 

							**!event <eventName> details**
							  > sends the details of a specific event

							**!event <eventName> addguest <@user>**
							  > allows a user to join the voice channel of an event lobby

							**!event <eventName> widthdraw <reason>** 
							  > remove yourself from an event, reason is optional

							`);
							message.reply(eventHelpEmbed);
							break;
						default:
							message.reply("default: event help");
							break;
					}
				} catch(err){
					message.reply("default: event help");
				}
				break;
			case "help":
				const helpEmbed = new MessageEmbed()
				.setColor('#90ee90')
				.setTitle('Help Menu')
				.setDescription(`
				**ADDED**
				**!help **
				  > Sends a list of all commands 
				**!nextclass **
				  > Sends when the next class will start 
				**!classend **
				  > Sends when the current class will start
				**!challenge**
				  > Challenge your friends or anyone in a game
				**!challenge help**
				  > Explains Challenge a bit more
				**!cancel <user>**
				  > Twitter cancel a user of your choice. \n

				**NOT YET ADDED**
				**!event create**
				  > Schedule events with your server
				**!event help**
				  > Explains events and how to set up an event
				**!event list**
				   > list out ongoing/future events
				**!chem, !math, !english, etc...**
					> sends a zoom link for the class depending on the time
				**!sarthak**
					> deletes the server
				`)
				.setThumbnail("https://cdn.discordapp.com/attachments/760776202121117706/772683453237559317/IMG_0529.PNG")
				.setFooter(`** this is still a work in progress **`)
				message.reply(helpEmbed);
				break;
			case "collectionstats":
				message.channel.send("check console");
				console.log(servers);
				break;
			case "punch":
				const attachment = new MessageAttachment(
					"https://media1.tenor.com/images/cf5e2af366c79b1dbbbbb7d912484c58/tenor.gif?itemid=18215078"
				);
				message.reply("FALCON PUNCHHHHHHHH");
				console.log(args);
				if (message.mentions.users.array().length > 0) {
					const icon = new MessageAttachment(
						message.mentions.users.array()[0].avatarURL()
					);
					message.channel.send(icon);
				}
				message.channel.send(attachment);
				break;
		}
	} 
	//  if message contains wordd 'obby"
	//	message.content.toLowerCase().trim().split(/\s+/).includes("obby")

});
client.login(process.env.DISCORDJS_BOT_TOKEN);
