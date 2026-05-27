# Question 1 - Test du serveur

Commandes :

```bash
cd server
PORT=3010 yarn dev
```

Bruno :

```text
POST http://localhost:3010/api/users
```

Body JSON :

```json
{
  "email": "test@example.com",
  "password": "secret123"
}
```

Preuve attendue :

```text
server started on port 3010
```

Et dans Bruno :

```text
200 OK
```
