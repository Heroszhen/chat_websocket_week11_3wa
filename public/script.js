const socket = io("http://localhost:9000/");

let me;
let usernames = [];
let btnconnexion = document.getElementById("btnconnexion");
let btndeconnexion = document.getElementById("btndeconnexion");
let chat = document.getElementById("chat");

document.getElementById("coucou").addEventListener("click", ()=>{
    socket.emit("message","Message test pour le serveur");
});

btnconnexion.addEventListener("click", ()=>{
    sendUsername();
});

btndeconnexion.addEventListener("click", ()=>{
    logout();
});

window.addEventListener("DOMContentLoaded",()=>{
    logout();
});

socket.on("server:user:pseudo_exists",(msg)=>{
    if(msg == true)sendUsername();
});

socket.on("server:user:connected",(usernames2)=>{
    btnconnexion.classList.add('d-none');
    btndeconnexion.classList.remove('d-none');
    chat.classList.remove('d-none');
    usernames = usernames2;
    listUsernames(usernames);
    
});
socket.on("server:user:list",(usernames2)=>{
    usernames = usernames2;
    listUsernames(usernames);
});

function sendUsername(){
    let username;
    do {
        username = window.prompt("Please enter your name");
        me = username;
    } while(username === '');
    if (username != null) {
        socket.emit('server:user:pseudo_exists',username);
    }
}

function listUsernames(list){
    document.querySelector("#listingUsers").innerHTML = "";
    if ("content" in document.createElement("template")) {
        let template = document.querySelector("#usersTpl"); 
        usernames.forEach(pseudo => {
            let clone = document.importNode(template.content, true);
            clone.querySelector("li").innerHTML = pseudo;
            document.querySelector("#listingUsers").appendChild(clone);
        });
    }
}

function logout(){
    socket.emit("server:user:deconnected",me);
    btnconnexion.classList.remove('d-none');
    btndeconnexion.classList.add('d-none');
    chat.classList.add('d-none');
    usernames = [];
    listUsernames(usernames);
}