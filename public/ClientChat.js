import UI from './UserInterface.js';
import config from './config.js';
import Tintin from './Tintin.js';

export default class ClientChat {
    me;
    usernames = [];
    btnconnexion = document.getElementById("btnconnexion");
    btndeconnexion = document.getElementById("btndeconnexion");
    chat = document.getElementById("chat");
    btn_sendmessage = document.getElementById("sendMessage");
    input_createmessage = document.getElementById("createMessage");
    logingoogle = document.getElementById("logingoogle");
    tintin = new Tintin();
    constructor() {
        this.socket = io.connect(document.location.host);
        //this.socket = io();
 
        this.UI = new UI();
 
        this.listenServer();
        this.transmitUiServer();
        this.UI.listenInterface();
        this.channel = "";
        this.timerTyping = null;
        this.typing = false;
    }
  
    listenServer() { 
        /*
        this.socket.on('server:user:pseudo_exists', this.UI.pseudoChoice.bind(this,true));
        this.socket.on('server:user:connected', this.UI.connectUser);
        this.socket.on('server:user:list', this.UI.listUsers);*/   
        
        this.socket.on("server:user:pseudo_exists",(msg)=>{
            if(msg == true)this.sendUsername();
        });

        this.socket.on("server:user:connected",(usernames2)=>{
            this.btnconnexion.classList.add('d-none');
            this.btndeconnexion.classList.remove('d-none');
            this.logingoogle.classList.add("d-none");
            this.chat.classList.remove('d-none');
            this.usernames = usernames2;
            this.listUsernames(this.usernames);
            this.channel = "Général";
        });
        this.socket.on("server:user:list",(usernames2)=>{
            this.usernames = usernames2;
            this.listUsernames(this.usernames);
        });
        this.socket.on('server:channel:list',(channels)=>{
            this.listChannels(channels)
        });

        this.socket.on('server:messages:send', (messages) => {
            this.listMessages(messages); 
        });
        this.socket.on('server:user:typing_list', (users) => {
            this.listUsersTyping(users); 
       });
       this.socket.on('server:channel:list2',(channels)=>{
        this.listChannels2(channels)
    });
       
    }
 
    transmitUiServer() {/*
        document.addEventListener('local:user:pseudo', (event) => { 
            this.socket.emit('client:user:pseudo', event.detail.user); 
        });*/

        document.getElementById("coucou").addEventListener("click", ()=>{
            this.socket.emit("message","Message test pour le serveur");
        });

        this.btnconnexion.addEventListener("click", ()=>{
            this.sendUsername(null);
        });

        this.btndeconnexion.addEventListener("click", ()=>{
            this.logout();
        });

        window.addEventListener("DOMContentLoaded",()=>{
            this.logout();
        });

        this.btn_sendmessage.addEventListener("click", ()=>{
            window.clearTimeout(this.timerTyping);
            this.timerTyping = null;
            if(this.input_createmessage.value != ""){
                this.tintin.checkText(this.input_createmessage.value);
                let message = {
                    username:this.me,
                    texte:this.input_createmessage.value
                }
                this.socket.emit('client:message:send', message);
                this.input_createmessage.value = "";
            }
        });  
        this.input_createmessage.addEventListener("keyup",(e)=>{
            this.typing = true;
            this.socket.emit('client:message:typing', this.typing); 
            this.timerTyping = window.setTimeout(() => { 
                this.typing = false;
                this.socket.emit('client:message:typing', this.typing); 
            }, 3000);

        });

        this.logingoogle.addEventListener("click", ()=>{
            this.loginWithGoogle();
        });  
    }

    sendUsername(username=null){
        if(username == null){
            let username;
            do {
                username = window.prompt("Please enter your name");
                this.me = username;
            } while(username == "");
            if (username != null) {
                this.socket.emit('server:user:pseudo_exists',username);
            }
        }else{
            this.socket.emit('server:user:pseudo_exists',username);
        }
        
    }
    
    listUsernames(list){
        document.querySelector("#listingUsers").innerHTML = "";
        if ("content" in document.createElement("template")) {
            let template = document.querySelector("#usersTpl"); 
            list.forEach(pseudo => {
                let clone = document.importNode(template.content, true);
                clone.querySelector("li").innerHTML = pseudo;
                document.querySelector("#listingUsers").appendChild(clone);
            });
        }
        document.querySelectorAll('#listingUsers li').forEach((li) => {
            li.addEventListener('click',(e)=>{
                let username = e.currentTarget.textContent;
                this.socket.emit('client:privatedroom:send', username);
            });
        });
    }
    
    logout(){
        this.socket.emit("server:user:deconnected",this.me);
        this.btnconnexion.classList.remove('d-none');
        this.btndeconnexion.classList.add('d-none');
        this.logingoogle.classList.remove("d-none");
        this.chat.classList.add('d-none');
        this.usernames = [];
        this.me = null;
        this.listUsernames(this.usernames);
        document.querySelector("#listingMessages").innerHTML = "";
        document.querySelector(".dropdown-menu").innerHTML = "";
    }

    listMessages(messages) {
        if ("content" in document.createElement("template")) {
            messages.forEach(message=>{
                let template = document.querySelector("#messagesTpl");
                let clone = document.importNode(template.content, true);
                if(message.author == this.me)clone.querySelector("div.onemessage").classList.add('left');
                else clone.querySelector("div.onemessage").classList.add('right');
                clone.querySelector("div.time").innerHTML = message.time;
                clone.querySelector("div.author").innerHTML = message.author;
                clone.querySelector("div.message").innerHTML = message.texte;
                document.querySelector("#listingMessages").appendChild(clone);
            })  
        }
        if(this.tintin.getCommand_index() != null){
            this.tintin.reply();
        }
    }

    listChannels(channels){
        document.querySelector(".dropdown-menu").innerHTML = "";
        if ("content" in document.createElement("template")) {
            channels.forEach(elm=>{
                if(!elm.isprivated){
                    let template = document.querySelector("#channelsTpl");
                    let clone = document.importNode(template.content, true);
                    clone.querySelector("div.dropdown-item").innerHTML = elm;
                    if(elm == this.channel)clone.querySelector("div.dropdown-item").classList.add("active");
                    document.querySelector(".dropdown-menu").appendChild(clone);
                } 
            });  
        }

        document.querySelectorAll('#allchannels li').forEach((element) => {
            element.addEventListener('click', (e) => {
                let channel = e.currentTarget.textContent;
                this.socket.emit('client:channel:change',channel); 
                this.channel = channel;
                document.querySelectorAll('#allchannels li div.dropdown-item').forEach(elm=>{
                    elm.classList.remove("active");
                })
                e.currentTarget.querySelector("div.dropdown-item").classList.add("active");
                document.querySelector("#listingMessages").innerHTML = "";
            })
        })        
    }

    listUsersTyping(users){
        let div = document.querySelector("#usertyping");
        if(users.length == 0)div.innerHTML = "";
        else{
            let names = "";
            for(let i in users){
                if(i == users.length - 1)names += users[i];
                else names += users[i] + ","
            }
            if(users.length == 1)names += "est en train de taper";
            if(users.length > 1)names += "sont en train de taper";
            div.innerHTML = names + "....";
        }
    }

    loginWithGoogle(){
        let cg = config.firebase;
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(cg);
        }
        let provider = new firebase.auth.GoogleAuthProvider();

        //Exemple popup
        firebase.auth().signInWithPopup(provider).then((user) => {   
            // vous pouvez récupérer le nom comme ceci :             
            //console.log(user.additionalUserInfo.profile);
            this.sendUsername(user.additionalUserInfo.profile.email);
        }).catch(function(error) {
            console.log(error)
        }) 

        /*
        Exemple redirect :
        firebase.auth().signInWithRedirect(provider).then((user) => {   
            // vous pouvez récupérer le nom comme ceci :             
            alert(user.additionalUserInfo.profile.name)
        }).catch(function(error) {
            console.log(error)
        }) */

    }    

    listChannels2(channels){
        document.querySelector(".dropdown-menu").innerHTML = "";
        if ("content" in document.createElement("template")) {
            channels.forEach(elm=>{
                
                let template = document.querySelector("#channelsTpl");
                let clone = document.importNode(template.content, true);
                clone.querySelector("div.dropdown-item").innerHTML = elm;
                if(elm == this.channel)clone.querySelector("div.dropdown-item").classList.add("active");
                document.querySelector(".dropdown-menu").appendChild(clone);
                 
            });  
        }

        document.querySelectorAll('#allchannels li').forEach((element) => {
            element.addEventListener('click', (e) => {
                let channel = e.currentTarget.textContent;
                this.socket.emit('client:channel:change',channel); 
                this.channel = channel;
                document.querySelectorAll('#allchannels li div.dropdown-item').forEach(elm=>{
                    elm.classList.remove("active");
                })
                e.currentTarget.querySelector("div.dropdown-item").classList.add("active");
                document.querySelector("#listingMessages").innerHTML = "";
            })
        })        
    }
     
}

