# 🧾 OC-Billed

<p align="center">
  <a href="README.md">🇫🇷 Français</a> · 🇬🇧 English
</p>

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5173-646CFF?style=flat&logo=vite&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?style=flat&logo=jest&logoColor=white)
![Accessibility](https://img.shields.io/badge/Accessibility-WCAG-AA-green)
![OpenClassrooms](https://img.shields.io/badge/OpenClassrooms-Project-blue)

<div align="center" style="margin: 24px 0;">
  <p>
    🚀 <a href="https://steinshy.github.io/Oc-Billed/" target="_blank">
      <strong>Access the live application (Live Demo)</strong>
    </a>
  </p>
</div>

> 💡 **Live demo**  
> This deployed version allows you to test the user interface, navigation, and front-end behavior.  
> API calls require the backend to be running locally for full functionality.

**OC-Billed** is a web application for managing employee expense reports,
developed as part of the **OpenClassrooms Frontend Developer program**.

It allows employees to submit their expense reports and administrators
to review and manage them through a dedicated interface.

---

## Quick overview

- Employee / administrator authentication
- Expense report creation and tracking
- Receipt upload (images)
- Administrator dashboard
- API error handling (404 / 500)
- Framework-free SPA architecture

---

## GitHub repository

- [Development branch](https://github.com/Steinshy/Oc-Billed/tree/dev)

---

## Project structure

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

- **JavaScript ES6+** (framework-free SPA)
- **Vite** (development server and build tool)
- **Semantic HTML5**
- **Modular CSS**
- **Jest + Testing Library**
- **Node.js / Express (provided backend)**

---

## Main features

### Employee
- Secure authentication
- View expense reports
- Create a new expense report
- Upload receipts (jpg, jpeg, png)
- Receipt preview (modal)

### Administrator
- Access to the global dashboard
- View all expense reports

---

## Accessibility

- Full keyboard navigation
- Semantic HTML structure
- Clear error messages
- Accessible modals
- WCAG best practices respected

---

## Tests

- Unit and integration tests with **Jest**
- Mocked API store and `localStorage`
- Router and component tests

```bash
npm test
```

---

## Getting started

### Installation

```bash
git clone https://github.com/Steinshy/Oc-Billed.git
cd Oc-Billed
npm install
```

### Development

```bash
npm run dev
```

---

## Available scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start the frontend       |
| `npm run dev:all` | Start frontend + backend |
| `npm run build`   | Production build         |
| `npm run preview` | Preview build            |
| `npm test`        | Run tests                |
| `npm run lint`    | Run linter               |

---

## Configuration

- JWT stored in `localStorage`
- Role-based protected routes
- Centralized API calls via `store.js`

---

## Compatibility

- Modern browsers (Chrome, Firefox, Edge)
- Node.js >= 18

---

## License

Project completed as part of the
**OpenClassrooms Frontend Developer program**.

© 2025 — OC-Billed
