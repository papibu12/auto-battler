
document.addEventListener("DOMContentLoaded", () => {
		
	// AJOUTER CARTE
	const btn_ajouter_carte = document.getElementById("add-card");
    const boutique = document.getElementById("shop");
    const plateau = document.getElementById("board");
    const main = document.getElementById("hand");

    let compteurCarte = 0;
    let piece_actuel = 3;
    let piece_maximum = 3;

    // TOUCH SCREEN SUPPORT
    let carte_selectionnee = null;
    
    // AJOUTER ATTRIBUTS A LA BOUTIQUE, PLATEAU ET MAIN
    boutique.addEventListener("dragover", dragoverHandler);
    boutique.addEventListener("drop", dropHandler);

    plateau.addEventListener("dragover", dragoverHandler);
    plateau.addEventListener("drop", dropHandler);

    main.addEventListener("dragover", dragoverHandler);
    main.addEventListener("drop", dropHandler);

    // DONNEES RANDOM
    const types = ["Démon", "Pirate", "Bête", "Tout"];
    const textes = ["Crie de guerre : +2 à toutes vos autres serviteurs sur le plateau", "Râle d'agonie : meurt avec dignité", "Provocation"];
    const images = ["demon.png", "Pirate.png", "Bete.png"];

    function aleatoire(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }   

    function choixAleatoire(tableau){
        return tableau[aleatoire(0, tableau.length - 1)];
    }

    function creerCarte(){
        // STATS ALEATOIRES
        const attaque = aleatoire(1, 5);
        const vie = aleatoire(1, 5);
        const niveau = aleatoire(1, 3);

        // CONTENU ALEATOIRE
        const type = choixAleatoire(types);
        const texte = choixAleatoire(textes);
        const image = "./img/" + choixAleatoire(images);

        const nouvelle_carte = document.createElement("div");

        nouvelle_carte.classList.add("card-wrapper");
            
        // ATTRIBUTS DE CARTE
        nouvelle_carte.setAttribute("draggable", true);
        nouvelle_carte.addEventListener("dragstart", dragstartHandler);
        
        //DATA SET
        nouvelle_carte.dataset.active = "false";
        // PRIX CARTES
        nouvelle_carte.dataset.prix = niveau;

        //TOUCH SCREEN SUPPORT
        nouvelle_carte.addEventListener("touchstart", touchStartHandler);
        nouvelle_carte.addEventListener("touchmove", touchMoveHandler);
        nouvelle_carte.addEventListener("touchend", touchEndHandler); 

        // ID UNIQUE
        nouvelle_carte.id = "carte-" + compteurCarte++;

        nouvelle_carte.innerHTML = `
            <div class="card">
                <div class="card-level">${niveau}</div>
                <div class="card-upper-half">
                    <img src="${image}" alt="${type}" draggable="false">
                </div>
                <div class="card-lower-half">
                    <div class="text">${texte}</div>
                </div>
                <div class="card-attack">${attaque}</div>
                <div class="card-health">${vie}</div>
                <div class="card-type">${type}</div>
            </div>
        `;
        // RETOURNE UNE NOUVELLE CARTE
        return nouvelle_carte;
    }

    /*
    btn_ajouter_carte.addEventListener("click", () => {

        const carte_plateau = creerCarte();
        const carte_boutique = creerCarte();

        plateau.appendChild(carte_plateau)
        boutique.appendChild(carte_boutique);
    });*/
     
    /*
    // ENLEVER CARTE
    const btn_enlever_carte = document.getElementById("remove-card");
    

	btn_enlever_carte.addEventListener("click", () => {
        const derniere_carte = plateau.lastElementChild;
		if (derniere_carte) {
			plateau.removeChild(derniere_carte);
		}
	});
    */
    // NOUVELLE BOUTIQUE
    const btn_nouvelle_boutique = document.getElementById("new_shop");

    btn_nouvelle_boutique.addEventListener("click", () =>{
        // VIDER BOUTIQUE
        do{
            const derniere_carte = boutique.lastElementChild;

            if (derniere_carte) {
                boutique.removeChild(derniere_carte);
            }
        }while(boutique.lastElementChild != null);

        // AJOUTER 5 NOUVELLES CARTES
        for(let i = 0; i < 5; i++){
            boutique.appendChild(creerCarte());
        }
    });

    // DRAG AND DROP
    // DRAG
    function dragstartHandler(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    }
    // DRAG OVER
    function dragoverHandler(ev) {
        ev.preventDefault();
    }
    // DROP
    function dropHandler(ev) {
        ev.preventDefault();
        const id_Carte = ev.dataTransfer.getData("text");
        const carte = document.getElementById(id_Carte);

        // PARENT ACTUEL
        const parent_actuel = carte.parentElement;
        // DESTINATION DE CARTE
        const destination = ev.currentTarget;
        // carte survolée
        const carteCible = ev.target.closest(".card-wrapper");
        // PRIX CARTE
        const prix_carte = Number(carte.dataset.prix);

        // BOUTIQUE --> MAIN
        if(parent_actuel === boutique){
            //mauvaise destination
            if(destination !== main){
                return;
            }
            // main pleine
            if(main.children.length >= 5){
                return;
            }

            if(piece_actuel < prix_carte){
                return;
            }

            piece_actuel -= prix_carte;

            updatePiece();
        }

        // MAIN --> PLATEAU
        if(parent_actuel === main){
            //mauvaise destination
            if(destination !== plateau){
                return;
            }
            // main pleine
            if(plateau.children.length >= 5){
                return;
            }
        }

        // PLATEAU --> BOUTIQUE
        if(parent_actuel === plateau){
            //mauvaise destination
            if(destination == main){
                return;
            }

            if(destination == boutique){
                carte.remove();
                piece_actuel += 1;
                updatePiece();
                return;
            }
            
            if(destination == plateau){
                moveCard(
                carte,
                destination,
                carteCible,
                ev.clientX
                );
                return;
            }

            
            return;
           
        }

        // DEPLACEMENT NORMAL
        moveCard(
            carte,
            destination,
            carteCible,
            ev.clientX
        );
    }

    function moveCard(carte, destination, carteCible, positionX){

        // si on survole une carte
        if(carteCible && carteCible !== carte){
            const rect = carteCible.getBoundingClientRect();
            const avant = positionX < rect.left + rect.width / 2;

            if(avant){

            // insère avant
            destination.insertBefore(carte, carteCible);

            }else{

                // insère après
                destination.insertBefore(
                    carte,
                    carteCible.nextSibling
                );
            }
        }else{
            // ajoute à la fin
            destination.appendChild(carte);
        }
    }


    // TOUCH SCREEN DRAG AND DROP
    function touchStartHandler(ev){
        carte_selectionnee = ev.currentTarget;

        carte_selectionnee.style.position = "absolute";
        carte_selectionnee.style.zIndex = "1000";

        // IMPORTANT
        carte_selectionnee.style.pointerEvents = "none";

    }

    function touchMoveHandler(ev){
        ev.preventDefault();

        if(!carte_selectionnee){
            return;
        }

        const touch = ev.touches[0];
        
        carte_selectionnee.style.left = touch.pageX - 50 + "px";
        carte_selectionnee.style.top = touch.pageY - 70 + "px";
    }

    function touchEndHandler(ev){

        if(!carte_selectionnee){
            return;
        }

        const touch = ev.changedTouches[0];

        // élément sous le doigt
        const element = document.elementFromPoint(
        touch.clientX,
        touch.clientY
        );

        if(!element){
            resetCarte();
            return;
        }

        // zone valide
        const zone = element.closest("#shop, #hand, #board");

        if(!zone){
            resetCarte();
            return;
        }

        const parent_actuel = carte_selectionnee.parentElement;

        // =========================
        // BOUTIQUE -> MAIN uniquement
        // =========================
        if(parent_actuel === boutique){

            // mauvaise destination
            if(zone !== main){
                resetCarte();
                return;
            }

            // main pleine
            if(main.children.length >= 5){
                resetCarte();
                return;
            }
        }

        // =========================
        // MAIN -> PLATEAU uniquement
        // =========================
        if(parent_actuel === main){

            if(zone !== plateau){
                resetCarte();
                return;
            }

            // plateau plein
            if(plateau.children.length >= 5){
                resetCarte();
                return;
            }
        }

        // =========================
        // PLATEAU -> BOUTIQUE
        // =========================
        if(parent_actuel === plateau){

            if(zone !== boutique){
                resetCarte();
                return;
            }

            // suppression
            piece_actuel += 1;
            updatePiece();
            carte_selectionnee.remove();

            resetCarte();

            return;
        }

        // déplacement normal
        zone.appendChild(carte_selectionnee);

        resetCarte();
    }

    function resetCarte(){
        carte_selectionnee.style.position = "";
        carte_selectionnee.style.left = "";
        carte_selectionnee.style.top = "";
        carte_selectionnee.style.zIndex = "";

        carte_selectionnee.style.pointerEvents = "";

        carte_selectionnee = null;
    }


    // SHOP TIMER
    const boutique_chronometre = document.getElementById("shop-timer");

    let temps = 30;

    boutique_chronometre.textContent = temps + "s";

    setInterval(() =>{
        temps--;

        boutique_chronometre.textContent = temps + "s";
        //reset
        if(temps <= 0){
            temps = 30;
        }
    }, 1000);

    // SYSTEME DE PIECES
  
    const affichage_piece = document.getElementById("gold-display");

    function updatePiece(){
        affichage_piece.textContent = piece_actuel + "/" + piece_maximum;
    }

    updatePiece();
});
