const EventData = require("./eventData");

class Event{
    constructor(creator){
        this.data = new EventData();
        this.data.creator = creator;
    }

}

module.exports = Event;