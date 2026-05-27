# Question 5 - Communication entre les services

## BDD et serveur

Le serveur communique avec PostgreSQL grace au nom du service Docker :

```text
server -> db:5432
```

Dans `compose.yml`, le serveur utilise :

```yaml
DB_HOST: db
```

On n'utilise pas `localhost`, car dans Docker `localhost` veut dire "le conteneur lui-meme".

## Front et serveur

Le navigateur appelle le front :

```text
http://localhost:8080
```

Quand le front appelle `/api`, Nginx redirige vers le serveur :

```text
localhost:8080/api -> server:3000/api
```
