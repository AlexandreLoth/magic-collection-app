const langSelect = document.getElementById("language-select");
const colorSelect = document.getElementById("color-select");
const resultsGrid = document.getElementById("results-grid");
const inputSource = document.getElementById("search-input");
const btnRecherche = document.getElementById("search-btn");
const setSelect = document.getElementById("set-select");
const typeSelect = document.getElementById("type-select");
const raritySelect = document.getElementById("rarity-select");

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
  collectionView.classList.remove("hidden");
  displayCollection(); // On appelle la fonction qui dessine la collection
});
navSearchBtn.addEventListener("click", () => {
  collectionView.classList.add("hidden");
  searchView.classList.remove("hidden");
});

function displayCollection() {
  const collectionGrid = document.getElementById("collection-grid");
  const myCollection = JSON.parse(localStorage.getItem("mtg-collection")) || [];
  let totalValue = 0;

  collectionGrid.innerHTML = "";

  myCollection.forEach((card) => {
    // parseFloat transforme le texte "12.50" en nombre 12.5
    const price = parseFloat(card.price) || 0;
    totalValue += price * card.quantity;
    const rarityClass = card.rarity;

    const cardElement = document.createElement("div");
    cardElement.classList.add("card-item");
    cardElement.innerHTML = `
    <img src="${card.image}" alt="${card.name}" style="width: 100%; border-radius: 8px;">
    
    <div class="card-info">
        <p class="card-name"><strong>${card.name}</strong></p>
        
        <p><span class="rarity-badge ${rarityClass}">${card.rarity}</span></p>
        
        <p class="card-price">${price.toFixed(2)}€ / unité</p>
        
        <div class="quantity-controls">
            <button onclick="updateQuantity('${card.id}', -1)">-</button>
            <span style="font-weight: bold;">x${card.quantity}</span>
            <button onclick="updateQuantity('${card.id}', 1)">+</button>
        </div>
        
        <button class="delete-btn" onclick="removeFromCollection('${card.id}')">Supprimer</button>
    </div>
`;
    collectionGrid.appendChild(cardElement);
  });

  // Assure-toi d'avoir un élément avec cet ID dans ton HTML (ex: dans le <h2>)
  const displayTotal = document.getElementById("total-price-display");
  if (displayTotal) {
    displayTotal.textContent = `Valeur estimée : ${totalValue.toFixed(2)}€`;
  }
}
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
