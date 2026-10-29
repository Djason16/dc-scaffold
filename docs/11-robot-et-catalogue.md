# 11. Robot et catalogue

[← Sommaire](README.md)

Les frameworks sortent des versions sans arrêt. Le **robot de compatibilité** vérifie chaque semaine que tous les stacks
marchent encore, valide les nouvelles versions qui marchent, et publie un **catalogue** que les DC Scaffold installés
téléchargent tout seuls.

## Quand il tourne

Le workflow [`.github/workflows/compatibility.yml`](../.github/workflows/compatibility.yml) lance
[`tools/robot/robot.py`](../tools/robot/robot.py) :

- **chaque lundi** à 4 h (UTC) ;
- **après chaque push** sur `master` qui modifie `stacks/` ;
- **à la main** : GitHub → Actions → Compatibility → *Run workflow*.

## Ce qu'il fait

1. **`plan`** : pour chaque paquet de chaque `stack.json`, il cherche la dernière version **stable** sur npm / Packagist.
   Une nouvelle version majeure n'est testée que **30 jours** après sa première sortie (le temps des premières corrections).
2. **`infra-plan`** : pour les images Docker (`stacks/infra/versions.json`), la dernière **MySQL LTS** et le dernier
   **PHP** sorti depuis **6 mois** et encore maintenu.
3. **`test`** (un job par stack, en parallèle) : il crée un projet avec DC Scaffold (sous Linux, avec PowerShell) et vérifie :
   - un front : le build (`generate` pour Nuxt), plus `svelte-check` (SvelteKit, Svelte) ou `tsc` (Angular) ;
   - un back end PHP : la console du framework (`artisan about`, `bin/console about`) ou une page qui répond ;
   - un back end Node.js : le build puis `npm run dev`, qui doit répondre ;
   - un **couple « API dans le site »** (`combos/nuxt-nitro`, `combos/next-site`, `combos/sveltekit-site`,
     `combos/astro-site`, `combos/qwik-site`) : le build, puis `npm start`, qui doit servir la page d'accueil et `/api`.

   Avec une nouvelle version majeure, il teste d'abord avec elle (`-UseLatest`) ; si ça casse, il reteste avec la version validée.
4. **`infra-test`** (si une nouvelle version PHP ou MySQL est candidate) : un projet Slim dans les vraies images Docker,
   une requête sur MySQL, puis chaque back end PHP avec ce PHP.
5. **`publish`** :
   - chaque nouvelle version majeure qui marche devient la version validée (`stable` dans `stack.json`) ;
   - PHP / MySQL sont mis à jour dans `versions.json` si tout marche ;
   - `stacks/version.txt` est augmenté si les stacks ont changé (format `2026.10.29.1`) ;
   - les changements sont commités par « DC Scaffold robot » (`🤖 chore: stacks ...`) ;
   - le catalogue est publié dans la release GitHub **`catalog`** : `catalog.json` et `stacks.zip`.

## Quand quelque chose casse

Le robot ouvre un ticket GitHub **« Compatibility robot: stacks to fix »** (un seul ouvert à la fois : les semaines suivantes
y ajoutent un commentaire) :

| Message | Ce que ça veut dire | Ce que reçoivent les utilisateurs |
| ------- | ------------------- | --------------------------------- |
| *the new major version does not work yet* | La nouvelle version majeure casse, la version validée marche | La version validée, qui marche |
| *does not work, even with the validated version* | Le stack est cassé : à corriger vite (voir le journal du job `fronts/<id>` ou `backs/<id>`) | Le stack tel qu'il est |
| *Docker images (PHP x): not used yet* | La nouvelle image PHP / MySQL ne marche pas | Les images actuelles |

Les journaux de chaque test sont dans les *artifacts* du run (`result-<kind>-<id>`), fichier `.log`.

## Le catalogue

`catalog.json` :

```json
{
  "version": "2026.10.29.1",
  "minApp": "1.2.0",
  "hash": "...",
  "stacks": { "url": "https://github.com/<dépôt>/releases/download/catalog/stacks.zip", "sha256": "..." }
}
```

À chaque ouverture, DC Scaffold lit `catalog.json`. Il télécharge `stacks.zip` si :

- `version` est plus récente que ses stacks ;
- **et** `minApp` (la version de l'application pour laquelle ces stacks sont écrits) est inférieure ou égale à sa version.

`stacks.zip` est vérifié (sha256) puis décompressé dans `%LOCALAPPDATA%\DC Scaffold\catalog\current`. Sans internet,
ou si `minApp` est trop récent, DC Scaffold garde les stacks qu'il a.

## Faut-il recompiler le setup ?

| Ce qui change | Recompiler le setup ? | Comment ça arrive chez les utilisateurs |
| ------------- | --------------------- | --------------------------------------- |
| `stacks/` (fronts, back ends, docs des projets, Dockerfile, `start.ps1`) | **Non** | Le catalogue, au prochain push sur `master` |
| `engine/` (le moteur) ou `launcher/` (la fenêtre) | **Oui** | Un nouveau setup : tag `v*` (voir [12. Développer DC Scaffold](12-developper-dc-scaffold.md)) |
| `VERSION` | **Oui** | Le catalogue exige alors cette version (`minApp`) : les anciennes versions gardent leurs stacks jusqu'à la mise à jour |

**Attention à l'ordre** quand une version change le moteur : le catalogue publié prend `minApp` = la nouvelle version.
Les utilisateurs de l'ancienne version ne reçoivent plus les stacks tant qu'ils n'ont pas mis à jour l'application.
Pour qu'une correction de stacks leur arrive quand même, pousse-la **avant** de changer `VERSION`.

## Lancer le robot à la main

```
python3 tools/robot/robot.py plan                       # ce qui serait testé (JSON)
python3 tools/robot/robot.py test fronts vue results/fronts-vue.json
python3 tools/robot/robot.py test combos next-site results/combos-next-site.json
python3 tools/robot/robot.py publish results dist
```

Le robot est prévu pour Linux (comme GitHub Actions) : sous Windows, utilise WSL ou Docker.
