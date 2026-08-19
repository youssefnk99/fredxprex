# FREDXPREX LTD. — site vitrine

> *When Speed And Trust Travel Together*

Site **descriptif** bilingue (FR/EN) pour Fredxprex Ltd., entreprise canadienne de
transport et de logistique spécialisée dans la livraison du dernier kilomètre au
Nouveau-Brunswick.

Aucune dépendance, aucune étape de compilation. Ouvrir `index.html` dans un navigateur,
ou servir le dossier :

```
python -m http.server 5173
```

---

## Fichiers

| Chemin | Rôle |
| --- | --- |
| `index.html` | Structure HTML5 sémantique, sprite d'icônes SVG en ligne |
| `assets/css/styles.css` | Palette de la marque, composants, responsive, impression |
| `assets/js/app.js` | Dictionnaire FR/EN, bascule de langue, menu, animations |
| `assets/img/logo.png` | Logo officiel, fond transparent |
| `assets/img/logo-light.png` | Variante claire pour le pied de page aubergine |
| `assets/img/mark.png` | Le « F » seul, carré — favicon |

---

## Identité visuelle

Les couleurs sont **échantillonnées directement dans le logo fourni** :

| Rôle | Valeur |
| --- | --- |
| Aubergine (le « F », la route) | `#3E1742` |
| Orange (le mot REDXPREX) | `#EA562E` |

Deux variantes existent **uniquement pour l'accessibilité** — l'orange de la marque
ne donne que 3,58:1 sur blanc, sous le seuil WCAG AA de 4,5:1 :

- `--orange-txt: #C43D18` — texte orange sur fond clair (5,21:1)
- `--orange-btn: #C93F1A` — fond de bouton, texte blanc (4,99:1)

Le logo lui-même conserve toujours les couleurs exactes de la marque.

**Motif signature :** la route à lignes discontinues du logo est réutilisée comme
séparateur entre les sections, avec une animation de défilement (désactivée si le
système demande un mouvement réduit).

Polices : **Archivo** (titres, rappelle le lettrage du logo) et **Inter** (texte).

---

## Contenu

Le texte français est celui fourni par la direction, repris mot pour mot. La version
anglaise en est la traduction. Sections :

1. En-tête + bascule FR/EN
2. Héros — nom, slogan, valeurs
3. À propos — présentation, fondée en 2023
4. Notre réseau — les 7 marchés
5. Nos services — 6 offres
6. Pourquoi Fredxprex — 4 engagements
7. Développement + mission
8. Grandissons ensemble
9. Contact — direction et coordonnées
10. Pied de page

Les 7 marchés : Fredericton, Edmundston, Bathurst, Campbellton, Miramichi,
Tracadie, Woodstock.

---

## Modifier les contacts

Les personnes sont écrites directement dans `index.html`, section `#contact`
(bloc `.person`). Le titre « Directeur Associé » passe par la clé `role.assoc`
dans `assets/js/app.js` pour rester traduit.

Pour changer un texte, cherchez son attribut `data-i18n` dans `index.html`, puis
modifiez la clé correspondante **dans les deux langues** dans `app.js`.

---

## Accessibilité

- Lien d'évitement, repères sémantiques, un seul `h1`, plan de titres ordonné
- Navigation complète au clavier, anneaux de focus visibles
- Contraste WCAG 2.1 AA vérifié sur l'ensemble du texte visible
- `prefers-reduced-motion` respecté (animations et route figées)
- Aucun défilement horizontal jusqu'à 320 px
