export default class UserInterface {
 
    pseudoChoice(alertPseudo = false)  {
        if(alertPseudo === true) alert(`Choisissez un autre pseudo, celui ci est déjà utilisé !`);
        let user;
        do {
            user = window.prompt(`Quel pseudo voulez vous ?`);
        } while(user === '');
        
        if(user !== null) {
            document.dispatchEvent(new CustomEvent('local:user:pseudo', {detail : { user : user }}));
        }
    }
 
    listenInterface() {
        document.querySelectorAll(".buttonAuth").forEach((element) => {
            element.addEventListener('click', this.pseudoChoice );
        });
    }
    connectUser() {
        document.querySelector(".authenticated").classList.remove('hide');
        document.querySelector(".noAuthenticated").classList.add('hide');
    }
 
    listUsers(users) {
        document.querySelector("#listingUsers").innerHTML = "";
        if ("content" in document.createElement("template")) {
            let template = document.querySelector("#usersTpl"); 
            users.forEach(pseudo => {
                let clone = document.importNode(template.content, true);
                clone.querySelector("li").innerHTML = pseudo;
                document.querySelector("#listingUsers").appendChild(clone);
            });
        }
    }
}
