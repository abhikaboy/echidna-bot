require("dotenv").config();
//import { Client } from "discord.js";
const { Client, MessageAttachment, Message } = require("discord.js");
const client = new Client();
const PREFIX = "~";
const numList = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];
// so sad i cant use cool syntax
// import { servers } from "./serverCollection";
// import { Server } from "./server";

let servers = require("./serverCollection");
let Server = require("./server");



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
	servers.get(message.guild.id,message.guild);

	// User wants to issue a command
	servers.get(message.guild.id).serverObject = message.guild; // need to do this a better way in the future. 
	if (message.content.startsWith(PREFIX)) {
		const [cmdName, ...args] = message.content
			.trim()
			.substring(PREFIX.length)
			.split(/\s+/);
		let serverId = message.guild.id;
		console.log(args);
		switch (cmdName.toLowerCase()) {
			case "test":
				servers.get(serverId).test(message.channel);
				break;
			case "challenge" || "challenge":
				if (args[0] == "Accept" || args[0] == "accept") {
					servers
						.get(serverId)
						.acceptRequest(message.author, message.channel);
				} else if (args[0] == "public") {
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
			case "nextclass":
				message.reply(servers.get(serverId).nextClass(new Date()));
				break;
			case "classend":
				message.reply(servers.get(serverId).classEnd(new Date()));
				break;
			case "schedule":
				message.reply();
				break;
			case "event":
				
				/*
					Create 
					public, @ role
					Event Name 
					time in EST
				*/
				message.reply("I dont do this yet");
				break;
			case "help":
				message.reply(
					"\n i dont actually do anything and im a scam edit: i promise this will actually do something just wait like 4 more years"
				);
				break;
			case "add":
				servers.get(serverId).addCount();
				message.reply(servers.get(serverId).count);
				break;
			case "collectionstats":
				message.channel.send("check console");
				console.log(servers);
				break;
			case "reset":
				servers.get(serverId).resetCount();
				message.reply(servers.get(serverId).count);
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
			case "genocide":
				message.channel.send(
					"You really thought something would happen"
				);
				break;
			case "minecraftkirby":
				const mcKirby = new MessageAttachment(
					"https://cdn.vox-cdn.com/thumbor/kAG-y5f-SC0w5h05BkQnV64kqO4=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/21927213/minecraft.jpg"
				);
				message.channel.send(mcKirby);
				// https://cdn.vox-cdn.com/thumbor/kAG-y5f-SC0w5h05BkQnV64kqO4=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/21927213/minecraft.jpg
				break;
		}
	} else if (
		message.content.toLowerCase().trim().split(/\s+/).includes("obby") ||
		message.content.toLowerCase().trim().split(/\s+/).includes("obsidian")
	) {
		message.channel.send(
			"Oh? you dare mention such a crappy macro game option? you are truly the lowest of low."
		);
	} else if (
		message.content.trim().split(/\s+/).includes("mc") ||
		message.content.trim().split(/\s+/).includes("minecraft") ||
		message.content.trim().split(/\s+/).includes("bedwars")
	) {
		message.channel.send("playing games during class i see");
	}
});
client.login(process.env.DISCORDJS_BOT_TOKEN);
