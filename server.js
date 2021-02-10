const express = require('express');
const app = express();
const server = require('http').createServer(app);
//const io = require('socket.io')(server);
const path = require('path');
const routes = require('./app/routes.js');
const bodyParser = require("body-parser");
const ServerChat = require('./app/ServerChat.js');
new ServerChat(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
/*
app.use((req,res,next) => {
    next();
});
*/
app.use('/',routes);
/*
let usernames = [];
io.on('connection', (socket) => {
    socket.on('message', (message) => {
        console.log(message)
    });

    socket.on('server:user:pseudo_exists', (username) => {
        console.log(username)
        if(usernames.includes(username)){
            socket.emit('server:user:pseudo_exists',true);
        }else{
            usernames.push(username);
            socket.pseudo = username;
            socket.emit('server:user:connected',usernames);
            socket.broadcast.emit('server:user:list', usernames);
        }
    });

    socket.on('server:user:deconnected', (username) => {
        console.log("deconnected : "+username);
        if(usernames.includes(username)){
            for(let key in usernames){
                if(usernames[key] == username){
                    usernames.splice(key,1);
                    socket.broadcast.emit('server:user:list', usernames);
                    break;
                }
            }
        }

    });
});*/
const port = process.env.PORT || 9000;
server.listen(port);