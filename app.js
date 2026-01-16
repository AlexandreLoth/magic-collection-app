const langSelect = document.getElementById('language-select');
const resultsGrid = document.getElementById('results-grid');
const inputSource = document.getElementById('search-input');
const btnRecherche = document.getElementById('search-btn');

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

        data.data.forEach(card => {
            if (card.image_uris && card.image_uris.normal) {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card-item');
                
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

// --- 2. L'écouteur de clic ---
btnRecherche.addEventListener('click', () => {
    const maRecherche = inputSource.value;
    const maLangue = langSelect.value; // Récupère "lang:fr" ou ""

    if (maRecherche !== "") {
        // On combine les deux pour la recherche
        // Exemple : "Dragon" + " lang:fr"
        const fullQuery = maRecherche + (maLangue ? " " + maLangue : "");
        fetchAndDisplayCards(fullQuery);
    }
});

// --- 3. Premier affichage au chargement (Optionnel) ---
// On affiche quelques cartes de base pour que le site ne soit pas vide au début
fetchAndDisplayCards("lotus");