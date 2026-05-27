# Exercice 3 - Captures a prendre

## 1. Images produites sur GitHub

Capture GitHub :

- repo `mfp-docker-ci` ;
- onglet Packages ou page du package GHCR ;
- images `mfp-docker-ci-server` et `mfp-docker-ci-client` ;
- tag `latest`.

## 2. CI qui publie les images

Capture le fichier :

```text
.github/workflows/ci.yml
```

Il faut voir :

```yaml
docker/build-push-action
push: ${{ github.event_name == 'push' }}
ghcr.io/hrivaux/mfp-docker-ci-server:latest
ghcr.io/hrivaux/mfp-docker-ci-client:latest
```

## 3. Compose production

Capture le fichier :

```text
compose.prod.yml
```

Il faut voir :

```yaml
server:
  image: ghcr.io/hrivaux/mfp-docker-ci-server:latest

client:
  image: ghcr.io/hrivaux/mfp-docker-ci-client:latest
```

Et il ne doit plus y avoir de `build:`.

## 4. Execution

Terminal :

```bash
docker compose -f compose.prod.yml up
```

Capture quand les services demarrent.

Navigateur :

```text
http://localhost:8080
```

Capture la page React.
