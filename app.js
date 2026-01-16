// On définit l'URL de l'API pour chercher des cartes avec le mot "Lotus"
const API_URL = "https://api.scryfall.com/cards/search?q=lotus";

async function testFetchMagic() {
    try {
        console.log("Tentative de récupération des données...");
        
        // 1. On lance la requête
        const response = await fetch(API_URL);
        
        // 2. On transforme la réponse en format JSON (lisible par JS)
        const data = await response.json();
        
        // 3. On affiche le résultat dans la console
        console.log("Données reçues :", data);
        
        // Bonus : On affiche le nom de la première carte trouvée
        if (data.data && data.data.length > 0) {
            console.log("Nom de la première carte :", data.data[0].name);
        }

    } catch (error) {
        // Si internet coupe ou que l'API est en panne
        console.error("Erreur lors de l'appel API :", error);
    }
}

// On lance la fonction
testFetchMagic();