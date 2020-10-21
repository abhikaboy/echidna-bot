const { DiscordAPIError } = require("discord.js");
const {  MessageEmbed } = require("discord.js");

const empty = ":white_circle:";
const red = ":red_circle:";
const yellow = ":yellow_circle:";
const colors = [red,yellow];
const sideBarColors = ["#FF0000","#FFFF00"];
const numList = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];


let convertToMinTime = function(hour,minute){
	return (hour*60)+minute;
}

class Block{
	constructor(hour,minute,length, name){
		this.hour = hour;
		this.minute = minute;

		// time of class written in minutes 
		this.minTime = convertToMinTime(this.hour,this.minute); 

		this.length = length;
		this.name = name;
	}
	/**
	 * 
	 * @param {How long before class bot sends a starting warning} warnTime 
	 * @param {Current time in Minute Time} currentTime 
	 */
	checkStartWarning(warnTime,currentTime,channel){
		// warn people 1 minutes before class starts 
		// if this class is [warn time] before current time
		let shouldWarn = (this.minTime - currentTime == warnTime);
		if(shouldWarn){
			const embed = new MessageEmbed()
				.setColor('#FF0000')
				.setTitle(`${this.name} Will Start in ${warnTime} Minute(s)!`)
				.setDescription(`get off your games you absolute scrub \n if you see this then someone's code worked on the first try without testing it lol`)
			channel.send(embed);
		}
	}
}



const schedule = [	
	new Block(7,30,60,"Block 1 AM Session"), 
	new Block(8,35,60,"Block 2 AM Session"), 
	new Block(9,40,60,"Block 3 AM Session"), 
	new Block(10,45,60,"Block 4 AM Session"), 
	new Block(11,45,45,"Lunch Break"), 
	new Block(12,30,20,"Block 1 PM Session"), 
	new Block(12,55,20,"Block 2 PM Session"), 
	new Block(13,20,20,"Block 3 PM Session"), 
	new Block(13,45,20,"Block 4 PM Session"),
]

class Server {
	constructor(id,serverObject) {
		this.id = id;
		// this.name = name;
		this.currentGame = "";
		this.currentlyPlaying = false;
		this.gameState = {};
		this.outgoingRequests = { active: false, user: {}, game: "None" };
		this.gamePlayers = [];
		this.turn = 0;
		this.gameCurrentPlayer = 0;
		this.count = 0;
		this.currentGameMessage;
		this.currentGameMessageID;
		this.connect4Base = [
			[empty, empty, empty, empty, empty, empty, empty],
			[empty, empty, empty, empty, empty, empty, empty],
			[empty, empty, empty, empty, empty, empty, empty],
			[empty, empty, empty, empty, empty, empty, empty],
			[empty, empty, empty, empty, empty, empty, empty],
			[empty, empty, empty, empty, empty, empty, empty],
		];
		this.previousGameMessage;
		this.scheduleChannelID = "768352806734135307"; 
		this.serverObject = serverObject;
		// console.log(this.serverObject.channels.cache.filter(channel => channel.id == this.scheduleChannelID).array()[0]);

		// LMAO WHAT IS THIS LINE 
		this.donaAlerts = this.serverObject.channels.cache.filter(channel => channel.id == this.scheduleChannelID).array()[0];
	}
	// Gaming 
	createPublicRequest(game, player1, channel) {
		if (game == "Connect4") {
			const embed = new MessageEmbed()
				.setColor('#FF0000')
				.setTitle('Creating a Public Connect 4 Game...')
				.setDescription(`Send the command ~Challenge Accept to accept ${player1.username}'s game request`)

			channel.send(embed);
			this.outgoingRequests = { active: true, user: player1, game: game };
		}
	}
	acceptRequest(user, channel) {
		if (!this.outgoingRequests.active) {
			channel.send("There is no public challenge request!");
		} else {
			
			const embed = new MessageEmbed()
				.setColor('#FF0000')
				.setTitle(`**${this.outgoingRequests.user.username}'s** Challenge Has Been Accepted by **${user.username}**`)
				.setDescription(`show player stats/elo show here or something maybe idk`)
			channel.send(
				embed
			);
			this.createMatch(
				this.outgoingRequests.game,
				user,
				this.outgoingRequests.user,
				channel
			);
			this.outgoingRequests = { active: false, user: {}, game: "None" };
		}
	}
	test(channel) {
		// console.log("test");
		// console.log(this.gamePlayers);
		// this.placeCircle(2);
		// this.sendGameState(channel);
		this.donaAlerts.send("This is a test alert!");
		console.log("alert sent");
	}
	sendGameState(channel) {
		console.log(this.gameCurrentPlayer + " THE CURRENT GAME PLAYER ");
		console.log(this.turn + " THE CURRENT TURN ");
		const embed = new MessageEmbed()
		.setColor(sideBarColors[this.turn % 2])
		//.setTitle(`It is <@${this.gamePlayers[this.gameCurrentPlayer].id}> 's turn`)
		.setTitle(`It is ${this.gamePlayers[this.gameCurrentPlayer].username} 's turn`)
		.setFooter(`Turn: ${this.turn}`);
		let message = ``;
		// make this better later
		for (let i = 0; i < this.currentGameMessage.length; i++) {
			for (let j = 0; j < this.currentGameMessage[i].length; j++) {
				message += this.currentGameMessage[i][j];
				message += " ";
			}
			message += "\n";
		}
		embed.setDescription(message);
		try{
			this.previousGameMessage.delete({timeout:6000});
		} catch(err){
			console.log(err);
		}
		channel.send(embed).then((message) => {
			this.previousGameMessage = message;
			this.currentGameMessageID = message.id;
			numList.forEach((element) => {
				message.react(element);
			});
		});
	}
	createMatch(game, player1, player2, channel) {
		this.gamePlayers = [player1, player2];
		this.gameCurrentPlayer = 0;
		this.currentlyPlaying = true;
		this.currentGame = game;
		this.currentGameMessage = this.connect4Base;
		this.sendGameState(channel);
		console.log(this.gamePlayers);
		console.log(this.gameCurrentPlayer);
	}
	placeCircle(col) {
		console.log("PLACING CIRCLE");
		let rowToPlace = 6; // row 6 is default
		let current = 1;
		this.currentGameMessage.forEach((row) => {
			if (row[col - 1] != empty) {
				// If a game piece is found
				console.log("Game Piece Found");
				rowToPlace = current - 1; // Places at row ABOVE current row
				return false;
			} else {
				current++;
			}
		});
		let color = colors[this.turn % 2];
		console.log(rowToPlace);
		this.currentGameMessage[rowToPlace - 1][col-1] = color;
		console.log(this.gameCurrentPlayer + " Current Player");
		this.turn++;
		this.gameCurrentPlayer = this.turn % 2;
	}
	checkPlacement(row,col,color){
		// check around itself in a circle
		// col 1 2 3
		for(let i = -1; i < 2; i++){
			for(let j = -1; j < 2; j++){
				if(this.currentGameMessage[row+i][col+j] == color){
					let streak = 2; // piece and then current piece we're looking at.
					for(let k = 0; k < 2; k++){
						if(this.currentGameMessage[row+i + ((k+1) * i)][col+j + ((k+1) * j)] &&  i == j == 0){
							streak++;
						}
					} // trace until streak breaks then go back and re go from opposite slope till done. 
				} 
			}
		}

	}
	// Events 
	eventUpdate(time){

	}
	// School 
	scheduleUpdate(time){
		let hour = time.getHours();
		let minute = time.getMinutes();

		schedule.forEach((block) => {block.checkStartWarning(1,convertToMinTime(hour,minute),this.donaAlerts)});
	}
	nextClass(time){

	}
	classEnd(time){

	}
}




// export const Server;
module.exports = Server;
