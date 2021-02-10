const User = require('./User.js');
const Channel = require('./Channel.js');
const Message = require('./Message.js');
const Smile = require('smile2emoji');
const xss = require("xss");

module.exports = class ServerChat {
 
    constructor(server) {    
        this.usernames = [];   
        this.users = [];
        this.channels = [
            new Channel("Général"),
            new Channel("Programmation"),
            new Channel("Tennis"),
            new Channel("COVID-19")
        ];
        this.io = require('socket.io')(server);
        //this.io.on('connection', function(socket) { this.onConnection.bind(this, socket)});
        this.io.on('connection', (socket) => { this.onConnection(socket); } );
    }
 
    onConnection(socket) {/*
        console.log(`client ${socket.id} is connected via WebSockets   `);
 
        // choix du pseudo
        socket.on('client:user:pseudo', this.choicePseudo.bind(this, socket));
        // deconnexion 
        socket.on('disconnect',  this.disconnected.bind(this, socket) );*/
        socket.on('message', (message) => {
            console.log(message)
        });
        
        socket.on('server:user:pseudo_exists', (username) => {
            if(this.usernames.includes(username)){
                socket.emit('server:user:pseudo_exists',true);
            }else{
                this.usernames.push(username);
                let user = new User(socket.id,username);
                this.users.push(user);
                socket.user = user;
                socket.emit('server:user:connected',this.usernames);
                socket.broadcast.emit('server:user:list', this.usernames);
                socket.emit('server:channel:list',this.channels.map(channel => channel.name));
                this.changeChannel(socket,"Général");
            }
        });
    
        socket.on('server:user:deconnected', (username) => {
            if(username != null){
                if(this.usernames.includes(username)){
                    for(let key in this.usernames){
                        if(this.usernames[key] == username){
                            this.usernames.splice(key,1);
                            socket.broadcast.emit('server:user:list', this.usernames);
                            break;
                        }
                    }
                    for(let key in this.users){
                        if(this.users[key]["pseudo"] == username){
                            this.users.splice(key,1);
                            break;
                        }
                    }
                }
            }
        });

        socket.on('client:message:send', this.receiveMessage.bind(this, socket));

        socket.on('client:channel:change', this.changeChannel.bind(this, socket));

        socket.on('client:message:typing',this.userTypingChannel.bind(this, socket)); 

        socket.on('client:privatedroom:send', this.createdPrivatedRoom.bind(this, socket));

    }
 
    receiveMessage(socket, message) {
        //const text = Smile.checkText('i like bananas :)'); console.log(message)
        message.texte = Smile.checkText(message.texte);
        message.texte = xss(message.texte);
        let msg = new Message(socket.user.pseudo, message);
        // Nous allons le stocker dans l'objet channel correspondant
        let channel = this.channels.find(
            channel => channel.name == socket.user.channel
        );
        channel.addMessage(msg);

        let author = message["username"];
        let date = new Date();
        let min = date.getMinutes();
        let time = date.getHours() +':'+(min < 10 ? "0"+min : min);
        this.io.in(socket.user.channel).emit('server:messages:send', [{ "author":author, "texte":message["texte"], "time":time }]);
    }

    changeChannel(socket,channelName){
        let index = this.channels.findIndex(channel => channel.name == channelName);console.log(index)
        if(index != -1) {
            if(socket.user)socket.leave(socket.user.channel);
            socket.user.channel = channelName;
            for(let key in this.users){
                if(this.users[key]["pseudo"] == socket.user.pseudo){
                    this.users[key]["channel"] == channelName;
                    break;
                }
            }
            socket.join(socket.user.channel);
            let channel = this.channels.find(
                channel => channel.name == socket.user.channel
            );   
            let messages = channel.messages.map((message) => { return { 
                "author" : message.author,  
                "texte" : message.message.texte, 
                "time" : message.time, 
             }});console.log(messages,socket.user.channel)
             this.io.in(socket.user.channel).emit(
                'server:messages:send', 
                 messages
            );    
            console.log(`Le client ${socket.id} (pseudo : ${socket.user.pseudo}) est maintenant dans le salon ${socket.user.channel}`);
            
        } else {
            console.log(`Le client ${socket.id} (pseudo : ${socket.user.pseudo}) a tenté une connexion sur un salon inexistant`);
        }
    }

    userTypingChannel(socket,typing){
        // on met à jours le statut de l'utilisateur
        socket.user.isTyping = typing;/*
        // on envoi l'information aux utilisateurs du même salon
       */
        let tab = this.users.filter(user => 
            (user.channel == socket.user.channel && user.isTyping)
        ).map(user => user.pseudo)
        this.io.in(socket.user.channel).emit('server:user:typing_list',tab);
    }

    /**
     * channel : username
     * @param {*} socket 
     * @param {*} channel 
     */
    createdPrivatedRoom(socket,channel){
        let existe = false;
        for(let entry of this.channels){
            if(entry["name"] == channel){
                existe = true;
                break;
            }
        }
        if(existe == false){
            let channel_tmp = new Channel(channel);
            channel_tmp.isprivated = true;
            this.channels.push(channel_tmp);
            socket.emit('server:channel:list2',this.channels.map(channel => channel.name));
            let socketid;
            for(let entry of this.users){
                if(entry.pseudo == channel){
                    socketid = entry.id;
                    break;
                }
            }console.log(this.users,socketid)
            this.io.to(socketid).emit('server:channel:list2',this.channels.map(channel => channel.name));
        }
    }
    
    /*
    choicePseudo(socket, pseudo) {
        if(this.users.find(user => user.pseudo == pseudo)) {
            socket.emit('server:user:pseudo_exists');
        }
        else {
            socket.user = new User(socket.id, pseudo);
            this.users.push(socket.user);
            socket.emit('server:user:connected');
            this.io.emit('server:user:list', this.users.map(user => user.pseudo));
        }
    }
 
 
    disconnected(socket) {
        if(socket.user != undefined && socket.user.pseudo != undefined) {
            let index = this.users.findIndex(user => user.pseudo == socket.user.pseudo);
            if(index != -1) {
                this.users.splice(index,1);
                this.io.emit('server:user:list', this.users.map(user => user.pseudo));
            }
        }
    }*/
}

 
