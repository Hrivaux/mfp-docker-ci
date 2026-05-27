# Exercice 1 - Dockerization du projet

## Captures a prendre

Prends les captures dans cet ordre, apres avoir lance les commandes indiquees depuis la racine du projet :

```bash
cd /Users/hugorivaux/Projet_Cours_Dev/esgi-2603-my-favorite-places
```

1. **Serveur local avec yarn dev**
   - Capture le terminal apres `cd server && yarn dev`.
   - Preuve attendue : `connected to PgSQL db` et `server started on port ...`.

2. **Requete API locale**
   - Dans Bruno, cree une requete `POST http://localhost:3001/api/users` avec le body JSON :
     ```json
     {
       "email": "docker-test@example.com",
       "password": "secret123"
     }
     ```
   - Capture Bruno avec le statut `200 OK` et la reponse contenant `item.id`.
   - Si tu utilises le port 3000 et qu'il est libre chez toi, remplace `3001` par `3000`.

3. **Code Dockerfile serveur**
   - Capture `server/Dockerfile`.
   - Preuve attendue : les stages `deps`, `build`, `production-deps`, `production`.

4. **Serveur Dockerise**
   - Lance `docker compose up --build server db`.
   - Capture le terminal avec `server started on port 3000`.
   - Dans Bruno, capture `POST http://localhost:3001/api/users` avec un statut `200 OK`.

5. **compose.yml avec PgSQL**
   - Capture `compose.yml`.
   - Preuves attendues : services `db`, `server`, `client`, volume `postgres-data`, variables `DB_HOST=db`.

6. **Client React local**
   - Lance `cd client && yarn dev`.
   - Capture le terminal Vite et la page ouverte dans le navigateur.

7. **Client Dockerise**
   - Lance `docker compose up --build`.
   - Capture `docker compose ps`.
   - Capture le navigateur sur `http://localhost:8080`.

8. **Dependances et redemarrage**
   - Capture dans `compose.yml` :
     - `depends_on` avec `condition: service_healthy`.
     - `healthcheck` de PostgreSQL.
     - `restart: unless-stopped` sur les services.

9. **Optimisation build stages**
   - Capture `server/Dockerfile`.
   - Optionnel : capture `docker images` pour montrer la taille de l'image serveur.

## Reponses aux questions

## Preuves deja verifiees

- `yarn build` dans `server` : OK.
- `yarn build` dans `client` : OK.
- `docker compose build` : images `server` et `client` construites.
- `docker compose up -d` : `db` healthy, `server` started, `client` started.
- `POST http://localhost:3001/api/users` : HTTP `200 OK`.
- `POST http://localhost:8080/api/users` : HTTP `200 OK` via le proxy Nginx du front.
- `GET http://localhost:8080` : HTTP `200 OK`, page React affichee.

Sortie utile pour capture :

```text
esgi-2603-my-favorite-places-client-1   Up   0.0.0.0:8080->80/tcp
esgi-2603-my-favorite-places-db-1       Up   healthy
esgi-2603-my-favorite-places-server-1   Up   0.0.0.0:3001->3000/tcp
```

Taille des images observee apres build :

```text
esgi-2603-my-favorite-places-client latest 76.4MB
esgi-2603-my-favorite-places-server latest 320MB
postgres 16-alpine 389MB
```

### 1. Prenez connaissance du projet, testez le serveur avec yarn dev, faites une requete API avec Bruno

Le projet contient deux parties :

- `server` : API Express en TypeScript, avec TypeORM et PostgreSQL.
- `client` : application React construite avec Vite.

Le serveur expose ses routes sous `/api`, notamment :

- `POST /api/users` pour creer un utilisateur.
- `POST /api/users/tokens` pour se connecter.
- `GET /api/users/me` pour recuperer l'utilisateur courant avec un token.
- `POST /api/addresses` et `GET /api/addresses` pour les lieux favoris.

Le test local du serveur a ete fait avec `yarn dev`. La BDD PostgreSQL locale a ete lancee dans Docker avec le mot de passe `supersecret`. Une requete de test sur `POST /api/users` retourne `200 OK` avec un utilisateur cree.

### 2. Creez un Dockerfile pour dockerizer le serveur, testez de nouveau avec Bruno

Le serveur est dockerise dans `server/Dockerfile`.

L'image utilise plusieurs stages :

- `deps` installe toutes les dependances necessaires au build.
- `build` compile le TypeScript vers `dist`.
- `production-deps` installe uniquement les dependances de production.
- `production` copie uniquement `dist`, `node_modules` de production et `package.json`.

Cette approche evite d'embarquer TypeScript, nodemon, ts-node et les outils de compilation dans l'image finale.

### 3. Creez un compose.yml a la racine pour lancer le serveur et une BDD PgSQL

Le fichier `compose.yml` lance :

- `db` : PostgreSQL 16 Alpine.
- `server` : API Express dockerisee.
- `client` : front React servi par Nginx.

La BDD garde ses donnees dans le volume Docker `postgres-data`.

Le serveur recoit sa configuration via variables d'environnement :

- `DB_HOST=db`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=supersecret`
- `DB_NAME=postgres`

### 4. Testez le client React puis dockerizez-le, ajoutez-le au compose.yml et verifiez le tout

Le client React se teste localement avec `yarn dev`. En local, Vite proxyfie `/api` vers `http://localhost:3000`.

En Docker, le client est build avec Vite puis servi par Nginx. Le fichier `client/nginx.conf` proxyfie `/api` vers le service Compose `server:3000`.

Le client est accessible sur :

```text
http://localhost:8080
```

### 5. Reflechissez : comment communiquent la BDD et le serveur ? Et le serveur et le front ?

Dans Docker Compose, les services sont sur le meme reseau Docker par defaut.

La BDD et le serveur communiquent via le nom de service Docker :

```text
server -> db:5432
```

C'est pour cela que le serveur utilise `DB_HOST=db`. Dans un conteneur, `localhost` designerait le conteneur lui-meme, pas PostgreSQL.

Le front et le serveur communiquent via Nginx :

```text
navigateur -> http://localhost:8080/api -> client Nginx -> server:3000/api
```

Le navigateur appelle `/api` sur la meme origine que le front, puis Nginx transmet la requete au conteneur `server`.

## Pour aller plus loin

### 1. Faire en sorte que le serveur ne demarre qu'une fois la BDD prete

Le service `db` possede un `healthcheck` :

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d postgres"]
```

Le service `server` attend que ce healthcheck soit valide :

```yaml
depends_on:
  db:
    condition: service_healthy
```

Ainsi, le serveur ne demarre qu'une fois PostgreSQL pret a accepter les connexions.

### 2. Faire en sorte que tous les services redemarrent automatiquement sauf arret manuel

Chaque service utilise :

```yaml
restart: unless-stopped
```

Cela signifie que Docker redemarre automatiquement le service en cas d'erreur ou apres un redemarrage Docker, sauf si le service a ete stoppe manuellement.

### 3. Documenter les Docker build stages et optimiser les images Docker

Les build stages permettent de separer :

- l'environnement de build, qui contient les outils lourds ;
- l'image finale de production, qui ne contient que ce qui est necessaire pour executer l'application.

Pour le serveur, l'image finale ne contient pas les devDependencies comme `typescript`, `ts-node` ou `nodemon`. Cela reduit la taille de l'image et diminue la surface d'attaque.

## Commandes utiles

```bash
# Depuis la racine du projet
docker compose up --build

# Voir les services
docker compose ps

# Tester l'API dockerisee
curl -i -X POST http://localhost:3001/api/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"docker-compose-test@example.com","password":"secret123"}'

# Arreter les services
docker compose down
```
