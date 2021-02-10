module.exports = class User {
    constructor(socketId, pseudo) {  
        this.id = socketId;
        this.pseudo = pseudo;   
        this.channel;
        this.typing = false;
    }
}
