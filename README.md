# Magic Collection Manager

Application web de gestion de collection de cartes **Magic: The Gathering** et de création de decks. Les cartes sont recherchées via l'API publique [Scryfall](https://scryfall.com/docs/api), puis ajoutées à une collection personnelle sauvegardée dans le navigateur.

> Projet personnel d'apprentissage en HTML, CSS et JavaScript (sans framework).

**Démo** : https://alexandreloth.github.io/magic-collection-app/ *(à activer dans Settings > Pages)*

![Recherche de cartes](docs/recherche.png)
![Ma collection](docs/collection.png)

## Fonctionnalités

### Recherche de cartes
- Recherche par nom, texte ou capacité
- Filtres : couleurs (blanc, bleu, noir, rouge, vert, incolore), nombre exact de couleurs, type, rareté, extension, artiste, langue
- Tri par nom, prix ou date de sortie
- Pagination numérotée
- Zoom sur l'image d'une carte
- Cartes double face : bouton pour afficher le recto ou le verso

### Ma collection
- Ajout d'une carte en un clic depuis les résultats de recherche
- Affichage de la **valeur totale** de la collection (prix en euros, en dollars si le prix en euros n'existe pas)
- Filtres par nom, couleur, extension et artiste
- Tri par prix, nom ou rareté
- Suppression de cartes

### Mes decks
- Création d'un deck avec un nom et un format (Standard, Modern, Pioneer, Legacy, Pauper, Historique, Intemporel, Brawl, Commander, Libre)
- Ajout de cartes à un deck depuis la collection (mode "ajout vers un deck")
- Consultation et suppression d'un deck, retrait de cartes

## Technologies

- HTML5, CSS3 (grilles CSS, responsive)
- JavaScript (DOM, `fetch`, `async/await`)
- API REST [Scryfall](https://scryfall.com/docs/api)
- `localStorage` pour la persistance des données

## Lancer le projet

Aucune installation nécessaire.

```bash
git clone https://github.com/AlexandreLoth/magic-collection-app.git
cd magic-collection-app
```

Ouvrir ensuite `index.html` dans un navigateur (ou utiliser l'extension Live Server de VS Code).

## Structure

```
index.html   Structure des pages (recherche, collection, decks)
style.css    Mise en forme
app.js       Logique : appels API, collection, decks
```

## Limites connues et pistes d'amélioration

- Les données sont stockées dans le navigateur (`localStorage`) : elles ne sont ni synchronisées entre appareils ni sauvegardées côté serveur
- La valeur d'un deck n'est pas encore calculée (seule celle de la collection l'est)
- Une carte possédée en plusieurs exemplaires est ajoutée comme plusieurs entrées distinctes, sans compteur de quantité
- Pas de tests automatisés
- Évolutions envisagées : valeur des decks, gestion des quantités, export/import de la collection, base de données et authentification

## Crédits et mentions

- Données et images des cartes : [Scryfall](https://scryfall.com)
- *Magic: The Gathering* est une marque de Wizards of the Coast. Ce projet est non officiel, à but d'apprentissage, et n'est ni approuvé ni sponsorisé par Wizards of the Coast.

## Licence

MIT
