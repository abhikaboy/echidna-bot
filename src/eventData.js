class EventData{
    constructor(){

        // Details
        this.creator = {};
        this.users = [];
        this.name;
        this.limit;
        this.description;

        // Bools 
        this.hardLimit = false;
        this.allowGuests = true;
        this.createTextChannel = true;
        this.createVoiceChannel = true;
        this.lockVoiceChannel = false;
        this.markOverflow = false;
        // Time 
        this.time;
        this.date;


        this.guests = [];
    }
    setDetails(name,description,limit){
        this.name = name;
        this.description = description;
        this.limit = parseInt(limit);
    }
    setBools(hL,aG,cTC,cVC,lVC,mOF){
        this.hardLimit = hL;
        this.allowGuests = aG;
        this.createTextChannel = cTC;
        this.createVoiceChannel = cVC;
        this.lockVoiceChannel = lVC;
        this.markOverflow = mOF;
    }
    setTime(time,date){

    }
}
module.exports = EventData;