const langSelect = document.getElementById("language-select");
const colorSelect = document.getElementById("color-select");
const resultsGrid = document.getElementById("results-grid");
const inputSource = document.getElementById("search-input");
const btnRecherche = document.getElementById("search-btn");
const setSelect = document.getElementById("set-select");
const typeSelect = document.getElementById('type-select');

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

        cardElement.innerHTML = `
                    <img src="${card.image_uris.normal}" alt="${card.name}" style="width: 100%;">
                    <p>${card.name}</p>
                    <button>Ajouter</button>
                `;

        resultsGrid.appendChild(cardElement);
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

 if (!maRecherche && !maCouleur && !monSet) {
    alert("Veuillez saisir un nom ou choisir un filtre !");
    return;
}

  let queryParts = [];

  // Texte recherché
  queryParts.push(maRecherche);

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

  const fullQuery = queryParts.join(" ");
  fetchAndDisplayCards(fullQuery);
});

// --- 3. Premier affichage au chargement (Optionnel) ---
// On affiche quelques cartes de base pour que le site ne soit pas vide au début
fetchAndDisplayCards("lotus");
