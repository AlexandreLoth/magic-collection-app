const langSelect = document.getElementById("language-select");
const colorSelect = document.getElementById("color-select");
const resultsGrid = document.getElementById("results-grid");
const inputSource = document.getElementById("search-input");
const btnRecherche = document.getElementById("search-btn");
const setSelect = document.getElementById("set-select");
const typeSelect = document.getElementById("type-select");
const raritySelect = document.getElementById("rarity-select");
const searchCollectionInput = document.getElementById("searchCollection");
const navDecksBtn = document.getElementById("nav-decks");

// --- 1. La fonction devient "flexible" ---
// On lui ajoute un paramètre 'query'. Elle peut maintenant chercher n'importe quoi.
async function fetchAndDisplayCards(query) {
  try {
    // On construit l'URL à l'intérieur de la fonction
    // Comme ça, elle utilise le mot exact reçu au moment de l'appel
    const url = `https://api.scryfall.com/cards/search?q=${query}`;

    const response = await fetch(url);
    const data = await response.json();

    resultsGrid.innerHTML = "";

    // Petite sécurité : si l'API ne trouve rien, data.data sera vide
    if (!data.data) {
      resultsGrid.innerHTML = "<p>Aucune carte trouvée.</p>";
      return;
    }

    data.data.forEach((card) => {
      if (card.image_uris && card.image_uris.normal) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card-item");

        const rarityMap = {
          common: "Commune",
          uncommon: "Inhabituelle",
          rare: "Rare",
          mythic: "Mythique",
          special: "Spéciale",
        };

        const rarityName = rarityMap[card.rarity] || card.rarity;

        cardElement.innerHTML = `
          <img src="${card.image_uris.normal}" alt="${card.name}" style="width: 100%;">
          <div class="card-info">
          <p class="card-name">${card.name}</p>
          <span class="rarity-badge ${card.rarity}">${rarityName}</span>
          <p class="card-price">${card.prices.eur || card.prices.usd || "?"}€</p>
          </div>
          <button class="add-btn">Ajouter</button>
          `;

        resultsGrid.appendChild(cardElement);
        const addButton = cardElement.querySelector("button");
        addButton.addEventListener("click", () => addToCollection(card));
      }
    });
  } catch (error) {
    console.error("Erreur :", error);
  }
}
async function loadMagicSets() {
  try {
    const response = await fetch("https://api.scryfall.com/sets");
    const data = await response.json();

    const select = document.getElementById("set-select");

    // Tri alphabétique (plus lisible)
    const sortedSets = data.data.sort((a, b) => a.name.localeCompare(b.name));

    sortedSets.forEach((set) => {
      const option = document.createElement("option");
      option.value = set.code; // ex: "khm", "m21", "bro"
      option.textContent = set.name; // ex: "Kaldheim"
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur de chargement des extensions :", error);
  }
}

loadMagicSets();

// --- 2. L'écouteur de clic ---
btnRecherche.addEventListener("click", () => {
  const maRecherche = inputSource.value.trim();
  const maLangue = langSelect.value; // ex: "lang:fr"
  const maCouleur = colorSelect.value; // ex: "W"
  const monSet = setSelect.value; // ex: "khm"
  const monType = typeSelect.value; // ex: land
  const maRarete = raritySelect.value;

  if (!maRecherche && !maCouleur && !monSet && !maRarete) {
    alert("Veuillez saisir un nom ou choisir un filtre !");
    return;
  }

  let queryParts = [];

  // Texte recherché
  if (maRecherche) {
    queryParts.push(maRecherche);
  }

  // Langue
  if (maLangue) {
    queryParts.push(maLangue);
  }

  // Couleur
  if (maCouleur === "multi") {
    queryParts.push("c>=2");
  } else if (maCouleur) {
    queryParts.push(`c=${maCouleur}`);
  }

  // Extension
  if (monSet) {
    queryParts.push(`set:${monSet}`);
  }

  // Type
  if (monType) {
    queryParts.push(`type:${monType}`);
  }

  //Rareté
  if (maRarete) {
    queryParts.push(maRarete);
  }

  const fullQuery = queryParts.join(" ");
  fetchAndDisplayCards(fullQuery);
});

// --- 3. Premier affichage au chargement (Optionnel) ---
// On affiche quelques cartes de base pour que le site ne soit pas vide au début
fetchAndDisplayCards("lotus");

function addToCollection(card) {
  let myCollection = JSON.parse(localStorage.getItem("mtg-collection")) || [];
  const cardIndex = myCollection.findIndex((c) => c.id === card.id);

  if (cardIndex !== -1) {
    myCollection[cardIndex].quantity += 1;
    showNotification(
      `Quantité : ${card.name} x${myCollection[cardIndex].quantity}`,
      "update",
    );
  } else {
    // IMPORTANT : On récupère le prix ici
    // On utilise || 0 pour éviter d'avoir "null" si le prix n'est pas listé
    const cardPrice = card.prices?.eur || card.prices?.usd || "0.00";

    const newCard = {
      id: card.id,
      name: card.name,
      image: card.image_uris.normal,
      price: cardPrice,
      rarity: card.rarity,
      quantity: 1,
      colors: card.colors || [],
      set_name: card.set_name, // Le nom complet de l'extension (ex: "Kaldheim")
      artist: card.artist,
    };
    myCollection.push(newCard);
    showNotification(`${card.name} ajoutée ! (${cardPrice}€)`, "success");
  }
  localStorage.setItem("mtg-collection", JSON.stringify(myCollection));
  showNotification(`${card.name} ajoutée !`);
}
const navCollectionBtn = document.getElementById("nav-collection");
const navSearchBtn = document.getElementById("nav-search");
const searchView = document.getElementById("search-view");
const collectionView = document.getElementById("collection-view");

navCollectionBtn.addEventListener("click", () => {
  searchView.classList.add("hidden");
  decksView.classList.add("hidden");
  collectionView.classList.remove("hidden");
    displayCollection(); // On appelle la fonction qui dessine la collection
});
navSearchBtn.addEventListener("click", () => {
  collectionView.classList.add("hidden");
  decksView.classList.add("hidden");
  searchView.classList.remove("hidden");
});

function displayCollection() {
    const collectionGrid = document.getElementById("collection-grid");
    const myCollection = JSON.parse(localStorage.getItem("mtg-collection")) || [];
    
    // 1. Récupération des valeurs de tous les filtres
    const nameFilter = document.getElementById("searchCollection").value.toLowerCase();
    const colorFilter = document.getElementById("col-filter-color").value;
    const rarityFilter = document.getElementById("col-filter-rarity").value;
    const setFilter = document.getElementById("col-filter-set").value.toLowerCase();
    const artistFilter = document.getElementById("col-filter-artist").value.toLowerCase();
    const sortPrice = document.getElementById("col-sort-price").value;

    // 2. Filtrage des données (Le Prédicat)
    let filteredData = myCollection.filter(card => {
        const matchesName = card.name.toLowerCase().includes(nameFilter);
        const matchesRarity = rarityFilter === "" || card.rarity === rarityFilter;
        const matchesSet = (card.set_name || "").toLowerCase().includes(setFilter);
        const matchesArtist = (card.artist || "").toLowerCase().includes(artistFilter);
        
        // Gestion de la couleur (on vérifie si le code couleur est présent dans le tableau colors)
        const matchesColor = colorFilter === "" || (card.colors && card.colors.includes(colorFilter));

        return matchesName && matchesRarity && matchesSet && matchesArtist && matchesColor;
    });

    // 3. Tri des données par prix
    if (sortPrice === "asc") {
        filteredData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortPrice === "desc") {
        filteredData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    // 4. Affichage des résultats
    collectionGrid.innerHTML = "";
    let totalValue = 0;

    // Traduction pour l'affichage des raretés
    const rarityMap = {
        common: "Commune",
        uncommon: "Inhabituelle",
        rare: "Rare",
        mythic: "Mythique",
        special: "Spéciale",
    };

    filteredData.forEach((card) => {
        const price = parseFloat(card.price) || 0;
        totalValue += price * card.quantity;
        const rarityName = rarityMap[card.rarity] || card.rarity;

        const cardElement = document.createElement("div");
        cardElement.classList.add("card-item");
        
        // On utilise ton design avec des <p> pour le retour à la ligne
        cardElement.innerHTML = `
            <img src="${card.image}" alt="${card.name}" style="width: 100%; border-radius: 8px;">
            <div class="card-info">
                <p class="card-name"><strong>${card.name}</strong></p>
                <p><span class="rarity-badge ${card.rarity}">${rarityName}</span></p>
                <p><em>${card.set_name || "Extension inconnue"}</em></p>
                <p><small>Artiste: ${card.artist || "Inconnu"}</small></p>
                <p class="card-price">${price.toFixed(2)}€</p>
                
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${card.id}', -1)">-</button>
                    <span><strong>x${card.quantity}</strong></span>
                    <button onclick="updateQuantity('${card.id}', 1)">+</button>
                </div>
                
                <button class="delete-btn" onclick="removeFromCollection('${card.id}')">Supprimer</button>
            </div>
        `;
        collectionGrid.appendChild(cardElement);
    });

    // 5. Mise à jour de la valeur totale affichée
    const displayTotal = document.getElementById("total-price-display");
    if (displayTotal) {
        displayTotal.textContent = `Valeur : ${totalValue.toFixed(2)}€`;
    }
}
const filters = ["searchCollection", "col-filter-color", "col-filter-rarity", "col-filter-set", "col-filter-artist", "col-sort-price"];

const collectionFiltersIds = [
    "searchCollection", 
    "col-filter-color", 
    "col-filter-rarity", 
    "col-filter-set", 
    "col-filter-artist", 
    "col-sort-price"
];

collectionFiltersIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        // On écoute 'input' pour le texte et 'change' pour les menus
        const eventType = (el.tagName === "INPUT") ? "input" : "change";
        el.addEventListener(eventType, () => {
            displayCollection();
        });
    }
});

// Changer la quantité (+1 ou -1)
function updateQuantity(cardId, change) {
  let myCollection = JSON.parse(localStorage.getItem("mtg-collection"));
  const cardIndex = myCollection.findIndex((c) => c.id === cardId);

  if (cardIndex !== -1) {
    myCollection[cardIndex].quantity += change;

    // Si la quantité tombe à 0, on peut décider de supprimer ou de laisser à 0
    if (myCollection[cardIndex].quantity < 1)
      myCollection[cardIndex].quantity = 1;

    localStorage.setItem("mtg-collection", JSON.stringify(myCollection));
    displayCollection(); // On rafraîchit l'affichage
  }
}

// Supprimer complètement
function removeFromCollection(cardId) {
  if (confirm("Supprimer cette carte de votre collection ?")) {
    let myCollection = JSON.parse(localStorage.getItem("mtg-collection"));
    myCollection = myCollection.filter((c) => c.id !== cardId);
    localStorage.setItem("mtg-collection", JSON.stringify(myCollection));
    displayCollection();
  }
  // remplacement de l'alerte
}
function showNotification(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // On supprime la notification après 2.5 secondes
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.5s ease";
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}

// Navigation pour les Decks
const decksView = document.getElementById("decks-view");
document.getElementById("nav-decks").addEventListener("click", () => {
    searchView.classList.add("hidden");
    collectionView.classList.add("hidden");
    decksView.classList.remove("hidden");
    displayDecks();
});

function createNewDeck() {
    const name = document.getElementById("new-deck-name").value.trim();
    const format = document.getElementById("new-deck-format").value;

    if (!name) {
        showNotification("Donnez un nom à votre deck !", "error");
        return;
    }

    let allDecks = JSON.parse(localStorage.getItem("mtg-decks")) || [];
    
    const newDeck = {
        id: Date.now(), // ID unique basé sur le temps
        name: name,
        format: format,
        cards: []
    };

    allDecks.push(newDeck);
    localStorage.setItem("mtg-decks", JSON.stringify(allDecks));
    
    document.getElementById("new-deck-name").value = "";
    displayDecks();
    showNotification(`Deck "${name}" créé en format ${format} !`, "success");
}

function displayDecks() {
    const decksList = document.getElementById("decks-list");
    const allDecks = JSON.parse(localStorage.getItem("mtg-decks")) || [];
    
    decksList.innerHTML = allDecks.length === 0 ? "<p>Aucun deck créé.</p>" : "";

    allDecks.forEach(deck => {
        const deckEl = document.createElement("div");
        deckEl.className = "deck-card"; // Ajoute du style CSS pour ça
        deckEl.innerHTML = `
            <h3>${deck.name}</h3>
            <p>Format: <strong>${deck.format}</strong></p>
            <p>Cartes: ${deck.cards.length}</p>
            <button onclick="openDeckBuilder(${deck.id})">Modifier / Ajouter des cartes</button>
            <button class="delete-btn" onclick="deleteDeck(${deck.id})">Supprimer</button>
        `;
        decksList.appendChild(deckEl);
    });
}
function canAddCardToDeck(card, deck) {
    const count = deck.cards.filter(c => c.name === card.name).length;

    // Règle 1 : Limitation par nombre
    if (deck.format === "commander" && count >= 1) return "Format Commander : 1 seul exemplaire autorisé !";
    if (count >= 4) return "4 exemplaires maximum autorisés !";

    // Règle 2 : Format Pauper (uniquement communes)
    if (deck.format === "pauper" && card.rarity !== "common") return "Format Pauper : Uniquement des cartes communes !";

    return true; // Tout est bon
}
const navButtons = document.querySelectorAll('.nav-btn');

function setActiveButton(buttonId) {
    navButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(buttonId).classList.add('active');
}

// Ajoute setActiveButton('id-du-bouton') dans tes écouteurs de clic existants
navCollectionBtn.addEventListener("click", () => {
    // ... ton code actuel ...
    setActiveButton('nav-collection');
});

navSearchBtn.addEventListener("click", () => {
    // ... ton code actuel ...
    setActiveButton('nav-search');
});

// N'oublie pas pour le bouton Mes Decks
navDecksBtn.addEventListener("click", () => {
    setActiveButton('nav-decks');
});

setActiveButton('nav-search');