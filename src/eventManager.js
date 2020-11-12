const { Message } = require("discord.js");
const Event = require("./events");

class EventManager{
    constructor(){
        this.events = [];
        this.creatingEvent = false;
        this.currentEventCreator;
        this.stage = 0;
        this.creationChannel = {};
    }
    createEvent(user, channel){
        if(!this.creatingEvent){
            this.creatingEvent = true;
            this.creationChannel = channel;
            this.currentEventCreator = user;
            this.events.push(new Event(this.currentEventCreator));
            this.createEventDetails();
        } else{
            channel.send("Another User is already Creating an Event. Wait for them to finish or it to time out.");
        }
    }

    checkTimeout(){
        setTimeout( () => { 
            console.log("checking time out")

            if(this.preTimeoutStage == this.stage){   
                this.creationChannel.send("Timed Out. No Response Given");
                this.closeEventProcess();
            } else {
                console.log("did not time out")
                return
            }
        },180*1000)
    }

    createEventDetails(){
        this.creationChannel.send("Use !event parameter **[Name]&[Description]&[Atendee Limit]**. \nThis should be written in one message and each response should be seperated with &. Make the limit 0 if you do not want to set a limit");
        this.preTimeoutStage = this.stage;
        this.checkTimeout();

        console.log(this.preTimeoutStage + " stage");
    }
    createEventBools(){
        console.log("hihihi");
        this.creationChannel.send("Use !event parameter **[SetHardLimit]&[Allow Guests]&[Create Voice Channel]&[Create Text Channel]&[Lock Voice Channel]&[Mark Overflow]** " + 
        "\n Please respond with true or false to all of these (this menu will be updated to be reacts im just lazy rn lol its late) ");
        this.preTimeoutStage = this.stage;
        this.checkTimeout();
    }
    processParameter(content){
        console.log("ran process");
        console.log(content + " THJIS MESSAGE RAN PROCESS");
        let params = content.trim().substring(17).split('&');
        params = params.map((string) => string.trim());
        switch(this.stage){
            case 0:
                this.events[this.events.length-1].data.setDetails(...params);
                this.creationChannel.send("set details");
                this.createEventBools();
                break;
            case 1:
                params = params.map((string) => string == "true");
                this.events[this.events.length-1].data.setBools(...params);
                this.creationChannel.send("set bools");
                break;
            case 2:
               // this.events[this.events.length-1].data.setDetails(...params);
                this.creationChannel.send("set 2");
                break;
        }
        this.stage++;
        console.log(params);
    }

    closeEventProcess(){
        console.log("closed event");
        this.creatingEvent = false; 
    }
    createEventTime(){

    }

    cancelEvent(eventID,user){

    }

    getEvent(eventID){

    }
    getEvent(){

    }
}
module.exports = EventManager;