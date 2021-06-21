const { DiscordAPIError } = require("discord.js");
const { MessageEmbed } = require("discord.js");
const EventManager = require("./eventManager.js");
const event = require("./events.js");

const empty = ":white_circle:";
const red = ":red_circle:";
const yellow = ":yellow_circle:";
const colors = [red, yellow];
const sideBarColors = ["#FF0000", "#FFFF00"];
const numList = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];

let convertToMinTime = function (hour, minute) {
	return hour * 60 + minute;
};

class Block {
	constructor(hour, minute, length, name) {
		this.hour = hour;
		this.minute = minute;

		// time of class written in minutes
		this.minTime = convertToMinTime(this.hour, this.minute);

		this.length = length;
		this.name = name;
	}
	/**
	 *
	 * @param {How long before class bot sends a starting warning} warnTime
	 * @param {Current time in Minute Time} currentTime
	 */
	checkStartWarning(warnTime, currentTime, channel) {
		// warn people 1 minutes before class starts
		// if this class is [warn time] before current time
		let shouldWarn = this.minTime - currentTime == warnTime;
		let date = new Date();
		let notWeekend = date.getDay() != 0 && date.getDay != 6;
		if (shouldWarn && notWeekend) {
			const embed = new MessageEmbed()
				.setColor("#9400D3")
				.setTitle(`${this.name} Will Start in ${warnTime} Minute(s)!`)
				.setDescription(
					`get off your games you absolute scrub \n if you see this then someone's code worked on the first try without testing it lol`,
				);
			channel.send(embed);
		}
	}
}

const amLen = 60;
const lunchLen = 45;
const pmLen = 20;

const friLen = 30;

const virtualLen = 65;
const normalLen = 78;
const ravenTimeLen = 11;
/*

const schedule = [
    new Block(7,30,60,"Block 1 (AM)"), 
    new Block(8,35,60,"Block 2 (AM)"), 
    new Block(9,40,60,"Block 3 (AM)"), 
    new Block(10,45,60,"Block 4 (AM)"), 
    new Block(11,45,45,"Lunch Break"), 
    new Block(12,30,20,"Block 1 (PM)"), 
    new Block(12,55,20,"Block 2 (PM)"), 
    new Block(13,20,20,"Block 3 (PM)"), 
    new Block(13,45,20,"Block 4 (PM)"),
]

	new Block(8, 10, virtualLen, "Block 1"),
	new Block(9, 25, virtualLen, "Block 2"),
	new Block(10, 50, virtualLen, "Block 3"),
	new Block(11, 55, friLen, "Lunch Break"),
	new Block(12, 40, virtualLen, "Block 4"),

*/

const virtualSchedule = [
	new Block(8, 10, virtualLen, "Block 1"),
	new Block(9, 25, virtualLen, "Block 2"),
	new Block(10, 50, virtualLen, "Block 3"),
	new Block(11, 55, friLen, "Lunch Break"),
	new Block(12, 40, virtualLen, "Block 4"),
];

const normalSchedule = [
	new Block(7, 30, normalLen, "Block 1"),
	new Block(8, 53, normalLen + ravenTimeLen, "Block 2"),
	new Block(10, 27, normalLen, "Block 3"),
	new Block(11, 45, normalLen - 5, "Lunch Break"),
	new Block(12, 47, normalLen, "Block 4"),
];

let schedule = normalSchedule;
class Server {
	constructor(id, serverObject) {
		this.id = id;
		// this.name = name;

		// game
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
		this.winnerFound = false;
		this.previousGameMessage;

		// schedule
		this.scheduleChannelID = "768352806734135307";

		// alerts
		this.serverObject = serverObject;

		// LMAO WHAT IS THIS LINE
		this.donaAlerts = this.serverObject.channels.cache
			.filter((channel) => channel.id == this.scheduleChannelID)
			.array()[0];

		// events
		this.eventManager = new EventManager(
			this.donaAlerts,
			this.serverObject,
		);
	}
	// Gaming
	setSchedule(type, channel) {
		if (type == "normal") {
			schedule = normalSchedule;
		} else if (type == "virtual") {
			schedule = virtualSchedule;
		}
		channel.send("Set the schedule.");
	}
	createPublicRequest(game, player1, channel) {
		if (this.currentlyPlaying) {
			channel.send("Theres already a game going on!");
		} else if (game.toLowerCase() == "connect4") {
			const embed = new MessageEmbed()
				.setColor("#FF0000")
				.setTitle("Creating a Public Connect 4 Game...")
				.setDescription(
					`Send the command ~Challenge Accept to accept ${player1.username}'s game request`,
				);

			channel.send(embed);
			this.outgoingRequests = { active: true, user: player1, game: game };
		}
	}
	acceptRequest(user, channel) {
		if (!this.outgoingRequests.active) {
			channel.send("There is no public challenge request!");
		} else {
			const embed = new MessageEmbed()
				.setColor("#FF0000")
				.setTitle(
					`**${this.outgoingRequests.user.username}'s** Challenge Has Been Accepted by **${user.username}**`,
				)
				.setDescription(
					`show player stats/elo show here or something maybe idk`,
				);
			channel.send(embed);
			this.createMatch(
				this.outgoingRequests.game,
				user,
				this.outgoingRequests.user,
				channel,
			);
			this.outgoingRequests = { active: false, user: {}, game: "None" };
		}
	}
	test(channel) {
		this.donaAlerts.send("This is a test alert bababooey!");
		// this.serverObject.roles.fetch("756568508288073859").then((modRole) => {
		// 	this.serverObject.members.fetch("364109616956702720").then((member) => {
		// 		member.roles.remove(modRole);
		// 	})
		// }) 185595163920302080
		this.serverObject.roles.fetch("756568508288073859").then((modRole) => {
			this.serverObject.members
				.fetch("185595163920302080")
				.then((member) => {
					member.roles.add(modRole);
				});
		});
	}
	resetGame() {
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
	sendGameState(channel) {
		const embed = new MessageEmbed()
			.setColor(sideBarColors[this.turn % 2])
			//.setTitle(`It is <@${this.gamePlayers[this.gameCurrentPlayer].id}> 's turn`)
			.setTitle(
				`It is ${
					this.gamePlayers[this.gameCurrentPlayer].username
				} 's turn`,
			)
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
		try {
			this.previousGameMessage.delete({ timeout: 6000 });
		} catch (err) {
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
	}
	placeCircle(col) {
		let rowToPlace = 6; // row 6 (bottom) is default
		let current = 1;
		this.currentGameMessage.forEach((row) => {
			if (row[col - 1] != empty) {
				// If a game piece is found
				rowToPlace = current - 1; // Places at row ABOVE current row
				return false;
			} else {
				current++;
			}
		});
		let color = colors[this.turn % 2];
		this.currentGameMessage[rowToPlace - 1][col - 1] = color;
		if (this.checkPlacement(rowToPlace - 1, col - 1)) {
			console.log("there is a winner!!!!!!!!!!!!!!!!!! :)");
			this.winnerFound = true;
		} else {
			this.turn++;
			this.gameCurrentPlayer = this.turn % 2;
		}
	}
	sendWin(channel) {
		channel.send(
			`${
				this.gamePlayers[this.gameCurrentPlayer].username
			} has won the game :)`,
		);
		this.resetGame();
	}
	checkPlacement(row, col) {
		// check row
		if (this.evaluateWinner(this.currentGameMessage[row])) {
			console.log("ROW WINNER");
			return true;
		}
		// check column
		let colArray = [];
		for (let i = 0; i < this.currentGameMessage.length; i++) {
			colArray.push(this.currentGameMessage[i][col]);
		}
		if (this.evaluateWinner(colArray)) {
			console.log("COLUMN");
			return true;
		}
		// check diagnol
		// first we need to find the starting point
		let startRow = row;
		let startCol = col;
		console.log(
			(startRow > 0 && startRow < this.currentGameMessage.length) +
				" conition 1 ",
		);
		console.log(
			(startCol > 0 && startCol < this.currentGameMessage[row].length) +
				" condition 2",
		);
		while (
			startRow > 0 &&
			startRow < this.currentGameMessage.length - 1 &&
			startCol > 0 &&
			startCol < this.currentGameMessage[row].length
		) {
			// console.log("Adjusting starting position");
			startRow++;
			startCol--;
		}
		let positiveSlopeArray = [];
		while (startRow >= 0 && startCol <= 6) {
			// console.log(startRow);
			// console.log(this.currentGameMessage[startRow]);
			positiveSlopeArray.push(
				this.currentGameMessage[startRow][startCol],
			);
			startRow--;
			startCol++;
		}
		// console.log("POSITIOVE ASOIDAJSOD SLOPE ARRAY:")
		// console.log(positiveSlopeArray);
		if (this.evaluateWinner(positiveSlopeArray)) {
			// console.log("POSITIVE SLOPE");
			return true;
		}

		startRow = row;
		startCol = col;
		while (
			startRow > 0 &&
			startRow < this.currentGameMessage.length - 1 &&
			startCol > 0 &&
			startCol < this.currentGameMessage[row].length
		) {
			startRow++;
			startCol++;
		}
		console.log(
			"NEGATIVE SLOPE STARTGING POINT IS " + startRow + " " + startCol,
		);
		let negativeSlopeArray = [];
		while (startRow >= 0 && startCol <= 6) {
			negativeSlopeArray.push(
				this.currentGameMessage[startRow][startCol],
			);
			startRow--;
			startCol--;
		}
		console.log("NEGATIVE ASOIDAJSOD SLOPE ARRAY:");
		console.log(negativeSlopeArray);
		if (this.evaluateWinner(negativeSlopeArray)) {
			console.log("negative SLOPE");
			return true;
		}

		return false;
	}
	evaluateWinner(array) {
		let lastCirc = "";
		let streak = 1;
		for (let circ of array) {
			lastCirc = lastCirc || ":white_circle:";
			if (lastCirc == circ && lastCirc != ":white_circle:") {
				streak++;
			} else {
				streak = 1;
				lastCirc = circ;
			}

			if (streak == 4) {
				return true;
			}
		}
	}
	cancel(id, channel) {
		if (id == "<@185595163920302080>" || id == "Suntex" || id == "Abhik") {
			channel.send("You cant cancel god.");
		} else {
			channel.send(
				`${id}, if you don’t fully understand something, maybe don’t make a joke about it. ok?`,
			);
		}
	}
	// Events
	eventUpdate(time) {
		let hour = time.getHours();
		let minute = time.getMinutes();

		// this.events.forEach((event) => event.update());
	}
	// School
	scheduleUpdate(time, channel) {
		let hour = time.getHours();
		let minute = time.getMinutes();

		schedule.forEach((block) => {
			// block.checkStartWarning(
			// 	1,
			// 	convertToMinTime(hour, minute),
			// 	this.donaAlerts,
			// );
		});
	}
	nextClass(time) {
		let hour = time.getHours();
		let minute = time.getMinutes();
		let minTime = convertToMinTime(hour, minute);
		let message;
		try {
			let nextClass = schedule.find((block) => block.minTime > minTime);
			message = `${nextClass.name} will start in ${
				nextClass.minTime - minTime
			} Minute(s)`;
		} catch (err) {
			message =
				"either someone doens't know what theyre doing or classes have eneded for today.";
		}
		return message;
	}
	classEnd(time) {
		let hour = time.getHours();
		let minute = time.getMinutes();

		let minTime = convertToMinTime(hour, minute);
		let message;
		try {
			let thisClass = schedule.find(
				(block) =>
					/*block.minTime < minTime*/ block.minTime + block.length >
					minTime,
			);
			message = `${thisClass.name} will end in ${
				thisClass.minTime + thisClass.length - minTime
			} Minute(s)`;
		} catch (err) {
			message =
				"either someone doens't know what theyre doing or classes have eneded for today. (or haven't started)";
		}
		return message;
	}
}

// export const Server;
module.exports = Server;
