export default class Tintin {
    commands;
    commands_index;
    sentences;
    constructor() {
        this.setCommands();
        this.commands_index = null;
        this.setSentences();
    }

    checkText(text){
        if(this.commands.includes(text)){
            let index = this.commands.findIndex(com => com == text);
            this.commands_index = index;
            //this.reply();
            return true;
        }
        else return false;
    }

    getCommand_index(){
        return this.commands_index;
    }

    setCommands(){
        this.commands = [
            "@tintin /help",
            "@tntin /reset",
            "@tintin /changer la couleur",
            "@tntin /parler" 
        ];
    }

    reply(){
        if(this.commands_index != null){
            if(this.commands_index == 0){
                let div = document.createElement("div");
                div.classList.add('onemessage');
                div.classList.add('right');
                let author = document.createElement("div");
                author.classList.add('author');
                author.textContent = "Tintin";
                let time = document.createElement("div");
                time.classList.add('time');
                let date = new Date();
                let min = date.getMinutes();
                let time2 = date.getHours() +':'+(min < 10 ? "0"+min : min);
                time.textContent = time2;
                let message = document.createElement("div");
                message.classList.add("message");
                this.commands.forEach(elm=>{
                    let divtmp = document.createElement("div");
                    divtmp.textContent = elm;
                    message.appendChild(divtmp);
                });
                div.appendChild(author);
                div.appendChild(time);
                div.appendChild(message);
                document.querySelector("#listingMessages").appendChild(div);
                this.commands_index = null;
            }
            if(this.commands_index == 1){
                this.commands_index = null;
            }
            if(this.commands_index == 2){
                
            }
            if(this.commands_index == 3){
                let index = Math.floor(Math.random() * Math.floor(this.sentences.length - 1));console.log(index)
                if ("content" in document.createElement("template")) {
                    let template = document.querySelector("#messagesTpl");
                    let clone = document.importNode(template.content, true);
                    clone.querySelector("div.onemessage").classList.add('right');
                    let date = new Date();
                    let min = date.getMinutes();
                    let time2 = date.getHours() +':'+(min < 10 ? "0"+min : min);
                    clone.querySelector("div.time").innerHTML = time2;
                    clone.querySelector("div.author").innerHTML = "Tintin";
                    clone.querySelector("div.message").innerHTML = this.sentences[index];
                    document.querySelector("#listingMessages").appendChild(clone);
                }
            }
        }
    }

    setSentences(){
        this.sentences = [
            "zhen est le plus grand héros du monde",
            "Alexandra Daddario est une déesse magnifique",
            "Apprendre sans réfléchir est vain. Réfléchir sans apprendre est dangereux",
            "zhen est le plus grand héros du monde",
            "Avec du temps et de la patience, on vient à bout de tout"
        ]
    }
}