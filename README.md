# LJDP : Le Jeu Des Photos

Jeu de devinettes à base de photos.

## Le concept de LJDP

En famille ou entre amis, décidez de plusieurs catégories : votre repas préféré, l'objet le plus utilisé le matin, votre paire de chaussettes favorite... Chaque joueur prend une photo et l'envoie sur LJDP. À vous de deviner qui a pris la photo !

## Le projet

### Fonctionnalités
Le projet en est à ses balbutiements. Voici les fonctionnalités actuellement disponibles :
- Inscription sur l'application
- Connexion/Déconnexion à l'application
- Session utilisateur
- Création d'une partie et de ses catégories
- Formulaire d'accès à une partie (modification et participation)
- Upload des photos
- Système de jeu : affichage des questions et soummission des réponses
- Système de jeu avancé : scores et gestion de fin de partie

### Stack technologique
- Next.js / React (JavaScript)
- Prisma en tant qu'ORM
- PrimeReact, PrimeIcons et PrimeFlex pour les librairies front-end

## Mise en place du projet
1. Cloner le repo
2. Lancer la commande ``npm install`` pour installer les dépendances
3. Mettre en place une base de données à l'aide du script de création : ``/database/creationScript.sql``
4. Créer à la racine de l'arborescence un fichier ``.env`` :
   ```
   DATABASE_URL="[sgbd]://[utilisateur_base_de_données]:[mot_de_passe_utilisateur]@[adresse_base_de_données]:[port_base_de_données]/[nom_base_de_données]"
   COOKIE_PASSWORD="[mot_de_passe_32_caractères_minimum]"
   ```
5. Lancer les commandes ``npx prisma db pull`` et ``npx prisma db generate`` pour synchroniser la base de données avec Prisma
6. Lancer la commande ``npm run dev`` pour lancer le projet

## Auteurs
- Augustin Pasquier [@augustin-pasq](https://github.com/augustin-pasq)