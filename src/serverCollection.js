// import {Server} from "./server";
let Server = require("./server");
class ServerCollection {
	constructor() {
		this.collection = [];
		console.log("Creating a new collection");
	}
	add(server) {
		console.log("Adding A new Server to the list");
		this.collection.push(server);
		console.log(this.collection.length);
	}
	get(id) {
		let ret = this.collection.filter((item) => {
			return item.id == id;
		});
		if (ret.length == 0) {
			this.add(new Server(id)); // add to collection if not found
			return this.collection[this.collection.length - 1]; // returns server that was just created
		} else {
			return ret[0];
		}
	}
}

let servers = new ServerCollection();

// export default servers;
module.exports = servers;
