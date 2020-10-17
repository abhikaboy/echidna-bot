const { DiscordAPIError } = require("discord.js");
const {  MessageEmbed } = require("discord.js");

const empty = ":white_circle:";
const red = ":red_circle:";
const yellow = ":yellow_circle:";
const colors = [red,yellow];
const sideBarColors = ["#FF0000","#FFFF00"];
const numList = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];

class Server {
	constructor(id) {
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
	}
	addCount() {
		this.count++;
	}
	resetCount() {
		this.count = 0;
	}
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
		console.log("test");
		console.log(this.gamePlayers);
		this.placeCircle(2);
		this.sendGameState(channel);
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
					let streak = 2;
					for(let k = 0; k < 2; k++){
						if(this.currentGameMessage[row+i + ((k+1) * i)][col+j + ((k+1) * j)] &&  i == j == 0){
							streak++;
						}
					} // trace until streak breaks then go back and re go from opposite slope till done. 
				} 
			}
		}

	}
}
// export const Server;
module.exports = Server;
