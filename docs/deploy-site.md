# Mettre la page de présentation sur ton domaine .tech

La page est dans `site/`. C'est un site statique : pas de serveur ni de modèle, donc l'hébergement est gratuit. Elle est publiée par **GitHub Pages** grâce au workflow `.github/workflows/pages.yml`, qui lance les tests puis publie `site/`.

## 1. Récupérer le domaine

1. Va sur hacktoberfest.com/my/promos et récupère ton domaine **.tech** gratuit (par exemple `seance-exe.tech`). Attention, il coûte 29,99 $ par an à partir de la deuxième année.
2. Garde l'onglet du gestionnaire DNS de get.tech ouvert.

## 2. Publier le dépôt sur GitHub

1. Crée un dépôt public `seance` sur GitHub, puis pousse le projet :
   ```bash
   git remote add origin https://github.com/<ton-pseudo>/seance.git
   git push -u origin main
   ```
2. Sur GitHub, va dans **Settings → Pages → Build and deployment → Source** et choisis **GitHub Actions**.
3. Va dans l'onglet **Actions** et attends que « Deploy site to GitHub Pages » soit vert. La page est alors en ligne sur `https://<ton-pseudo>.github.io/seance/`.

## 3. Brancher le domaine .tech

1. Chez get.tech, dans le DNS de ton domaine, ajoute :
   - 4 enregistrements **A** pour `@`, qui pointent vers `185.199.108.153`, `185.199.109.153`, `185.199.110.153` et `185.199.111.153` ;
   - 1 enregistrement **CNAME** pour `www`, qui pointe vers `<ton-pseudo>.github.io`.
2. Crée le fichier `site/CNAME`, qui contient une seule ligne avec ton domaine (par exemple `seance-exe.tech`). Ensuite, fais un commit et un push.
3. Sur GitHub, dans **Settings → Pages → Custom domain**, entre ton domaine, puis coche **Enforce HTTPS** dès que c'est disponible. La propagation DNS prend de quelques minutes à quelques heures.

## 4. Remplacer les TODO

- `site/index.html` : les liens `TODO-your-username` (GitHub, ×2) et `https://dev.to/TODO` (l'article), ainsi que l'emplacement de la vidéo.
- Dans l'article, ajoute le lien du site et la catégorie **Best Use of a .tech Domain**.

## Prévisualiser en local

```bash
node scripts/build-site.js
python -m http.server 4000 --directory site
```

Ensuite, ouvre http://localhost:4000.
