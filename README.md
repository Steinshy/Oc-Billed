# 🧾 OC-Billed

<p align="center">
  🇫🇷 Français · <a href="README.en.md">🇬🇧 English</a>
</p>

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5173-646CFF?style=flat&logo=vite&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?style=flat&logo=jest&logoColor=white)
![Accessibility](https://img.shields.io/badge/Accessibility-WCAG-AA-green)
![OpenClassrooms](https://img.shields.io/badge/OpenClassrooms-Project-blue)

<div align="center" style="margin: 24px 0;">
  <p>
    🚀 <a href="https://steinshy.github.io/Oc-Billed/" target="_blank">
      <strong>Accéder à l'application en ligne (Live Demo)</strong>
    </a>
  </p>
</div>

> 💡 **Test en ligne**  
> Cette version déployée permet de tester l’interface utilisateur, la navigation et les comportements front-end.  
> Les appels API nécessitent le backend local pour un fonctionnement complet.

**OC-Billed** est une application web de gestion de notes de frais,
développée dans le cadre du parcours **Développeur Frontend OpenClassrooms**.

Elle permet aux employés de soumettre leurs notes de frais
et aux administrateurs de les consulter et gérer via une interface dédiée.

---

## Aperçu rapide

- Authentification employé / administrateur
- Création et suivi des notes de frais
- Upload de justificatifs (images)
- Tableau de bord administrateur
- Gestion des erreurs API (404 / 500)
- Application SPA sans framework

---

## Dépôt GitHub

- [Branche de développement](https://github.com/Steinshy/Oc-Billed/tree/dev)

---

## Structure du projet

```text
Oc-Billed/
├── index.html
├── src/
│   ├── App.js
│   ├── api/
│   │   ├── api.js
│   │   ├── entity.js
│   │   └── store.js
│   ├── components/
│   │   ├── bills/
│   │   ├── dashboard/
│   │   ├── login/
│   │   └── error/
│   ├── middleware/
│   │   ├── router.js
│   │   ├── routes.js
│   │   └── path.js
│   ├── utils/
│   └── data/
├── styles/
├── public/
├── test/
└── dist/
```

---

## Technologies

- **JavaScript ES6+** (SPA sans framework)
- **Vite** (dev server et build)
- **HTML5 sémantique**
- **CSS modulaire**
- **Jest + Testing Library**
- **Node.js / Express (backend fourni)**

---

## Fonctionnalités principales

### Employé
- Connexion sécurisée
- Consultation des notes de frais
- Création d’une note de frais
- Upload de justificatif (jpg, jpeg, png)
- Visualisation du justificatif (modale)

### Administrateur
- Accès au tableau de bord global
- Visualisation de toutes les notes de frais

---

## Accessibilité

- Navigation clavier complète
- Structure HTML sémantique
- Messages d’erreur explicites
- Modales accessibles
- Respect des bonnes pratiques WCAG

---

## Tests

- Tests unitaires et d’intégration avec **Jest**
- Mock du store et du localStorage
- Tests du router et des composants

```bash
npm test
```

---

## Démarrage

### Installation

```bash
git clone https://github.com/Steinshy/Oc-Billed.git
cd Oc-Billed
npm install
```

### Développement

```bash
npm run dev
```

---

## Scripts disponibles

| Commande          | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Lance le frontend        |
| `npm run dev:all` | Lance frontend + backend |
| `npm run build`   | Build production         |
| `npm run preview` | Prévisualisation         |
| `npm test`        | Lance les tests          |
| `npm run lint`    | Lint du projet           |

---

## Configuration

- Stockage JWT via `localStorage`
- Routes protégées selon le rôle utilisateur
- Appels API centralisés via `store.js`

---

## Compatibilité

- Navigateurs modernes (Chrome, Firefox, Edge)
- Node.js >= 18

---

## Licence

Projet réalisé dans le cadre du parcours
**Développeur Frontend OpenClassrooms**.

© 2025 — OC-Billed
