const API_URL = "https://api.scryfall.com/cards/search?q=lotus";
const resultsGrid = document.getElementById('results-grid');

async function fetchAndDisplayCards() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // On nettoie la grille avant d'ajouter des cartes
        resultsGrid.innerHTML = "";

        // On boucle sur chaque carte reçue
        data.data.forEach(card => {
            // On vérifie si la carte a une image (certaines n'en ont pas)
            if (card.image_uris && card.image_uris.normal) {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card-item'); // On pourra styliser cette classe en CSS
                
                cardElement.innerHTML = `
                    <img src="${card.image_uris.normal}" alt="${card.name}" style="width: 100%;">
                    <p>${card.name}</p>
                    <button onclick="addToCollection('${card.id}')">Ajouter</button>
                `;
                
                resultsGrid.appendChild(cardElement);
            }
        });
    } catch (error) {
        console.error("Erreur :", error);
    }
}

// On lance l'affichage
fetchAndDisplayCards();