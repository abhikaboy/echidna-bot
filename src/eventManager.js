const { Message } = require("discord.js");
const Event = require("./events");
const {  MessageEmbed } = require("discord.js");

class EventManager{
    constructor(alertChannel,serverObject){
        this.events = [];
        this.creatingEvent = false;
        this.currentEventCreator;
        this.stage = 0;
        this.creationChannel = {};
        this.cancelMessageID = '';
        this.alertChannel = alertChannel;
        this.serverObject = serverObject;
    }
    
    resetEventProcess(){
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

            if(this.preTimeoutStage == this.stage &&  this.creationChannel != {}){   
                this.creationChannel.send("Timed Out. No Response Given");
                this.resetEventProcess();
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

    createEventTime(){
        this.creationChannel.send("Use !event parameter **[Hour in Military Time EST]&[Minute]&[Number of Days until event (put 0 if today)]**");
        this.preTimeoutStage = this.stage;
        this.checkTimeout();
    }
    createChannels(role){
        let event = this.events[this.events.length-1].data;
        let channelManager = this.serverObject.channels;
        // creates a text channel
        if(event.createTextChannel){
            channelManager.create(`${event.name}-text`,{topic:event.description, permissionOverwrites: [
                {
                    id: this.serverObject.id,
                    deny: ["VIEW_CHANNEL"],
                },
                {
                    id:role.id,
                    allow: ["VIEW_CHANNEL"],
                }
            ]}).then((channel) => event.textChannel = channel).catch(err => console.log(err))
        }
        // creates a voice channel
        if(event.createVoiceChannel){
            channelManager.create(`${event.name}-voice`,{topic:event.description, type: "voice", permissionOverwrites: [
                {
                    id: this.serverObject.id,
                    deny: ["VIEW_CHANNEL"],
                },
                {
                    id:role.id,
                    allow: ["VIEW_CHANNEL"],
                }
            ]}).then((channel) => event.voiceChannel = channel).catch(err => console.log(err))
        }
    }
    launchEvent(){
        let event = this.events[this.events.length-1].data;
        this.creationChannel.send("Created Event! check !event list to view your event");								
        const eventEmbed = new MessageEmbed()							
        .setColor('#90ee90')
        .setTitle(event.name)
        .setDescription(`Created by ${event.creator.user.username} \n ${event.description}
        Set for ${Math.floor(event.time/60) +":"+event.time%60 }, Limit: ${event.limit} \n React to this message if you're attending.`)
        this.alertChannel.send(eventEmbed);

        let roleManager = this.serverObject.roles;
        roleManager.create({data:{name:event.name+"Atendee",mentionable:true}}).then((role) => {
            event.role = role;
            this.createChannels(role);
        }).catch(err => console.log(err))


        this.resetEventProcess();
    }

    processParameter(content){
        console.log("ran process");
        console.log(content + " THJIS MESSAGE RAN PROCESS");
        let params = content.trim().substring(17).split('&');
        params = params.map((string) => string.trim());
        let event = this.events[this.events.length-1].data;
        switch(this.stage){
            case 0:
                event.setDetails(...params);
                this.creationChannel.send("set details");
                this.createEventBools();
                this.stage++;
                break;
            case 1:
                params = params.map((string) => string == "true");
                event.setBools(...params);
                this.createEventTime();
                this.creationChannel.send("set bools");
                this.stage++;
                break;
            case 2:
                // horus * 60 + minutes this is the same as convert to min time. 
                let hourArrayPos = 0;
                let minuteArrayPos = 1;
                let daysUntilArrayPos = 2;
                // these are hard coded array positions ;/ 
                let minTime = (parseInt(params[hourArrayPos])*60)+parseInt(params[minuteArrayPos]);
                console.log(minTime);
                event.setTime(minTime,params[daysUntilArrayPos]);
                this.launchEvent();
                break;
        }
        console.log(params);
    }

    cancelEvent(eventID,user){

    }

    getEvent(eventID){

    }
    getEvent(){

    }
}
module.exports = EventManager;