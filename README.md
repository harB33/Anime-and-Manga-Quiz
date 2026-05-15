# ⛩️ SHITSUMON (シつモン) - Anime & Manga Quiz App

![Status](https://img.shields.io/badge/Status-Development-orange?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-Express_%7C_PHP_%7C_Tailwind-blueviolet?style=for-the-badge)
![Theme](https://img.shields.io/badge/Theme-Anime_%26_Manga-pink?style=for-the-badge)

**Shitsumon** is a premium, high-fidelity quiz application designed for anime and manga enthusiasts. Built with a unique hybrid architecture of Express.js and PHP, it offers a gamified experience featuring quests, shops, and a full inventory system, all wrapped in a stunning modern UI.

---

## ✨ Features

- **🎮 Dynamic Quiz Engine**: Fetches real-time anime and manga trivia from the Open Trivia Database (OpenTDB).
- **⚔️ Quest System**: Embark on specific missions to earn rewards and test your specialized knowledge.
- **💰 Yen Economy**: Earn virtual currency (¥) by answering questions correctly.
- **🛒 The Shop & Inventory**: Spend your hard-earned Yen on items and manage your collection in a dedicated inventory.
- **🔐 Hybrid Auth**: A seamless authentication bridge between Node.js and PHP for robust user management.
- **🎨 Premium Aesthetics**:
  - **Glassmorphism**: Sleek, translucent UI elements with `backdrop-blur`.
  - **Dark Mode First**: A beautiful deep purple and pink palette.
  - **Micro-animations**: Smooth transitions and interactive effects.
  - **Responsive Design**: Fully optimized for all screen sizes using Tailwind CSS 4.0.

---

## 🛠️ Tech Stack

### Backend
- **Node.js & Express**: Core application logic and routing.
- **PHP**: Specialized backend modules for authentication and database interactions.
- **php-express**: Hybrid engine allowing Express to execute PHP scripts.

### Frontend
- **EJS (Embedded JavaScript)**: Dynamic templating engine.
- **Tailwind CSS 4.0**: Utility-first CSS framework for modern styling.
- **DaisyUI 5.0**: Premium UI component library.
- **Lucide Icons**: Clean and consistent iconography.

### Data & APIs
- **OpenTDB**: The source for all trivia questions.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **XAMPP** (Installed at `C:\xampp` for PHP support)
- **PHP** (v8.0 or higher, included in XAMPP)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/veztre/express-quiz-app.git
   cd Anime-and-Manga-Quiz
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory (refer to `.env.example` if available).

4. **Build CSS:**
   ```bash
   npm run build:css
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 📂 Project Structure

```text
Anime-and-Manga-Quiz/
├── controllers/       # Backend business logic
├── public/            # Static assets (CSS, JS, Images, PHP scripts)
│   ├── php/           # PHP backend logic (Auth, Login, Register)
│   ├── styles/        # Tailwind CSS inputs/outputs
│   └── js/            # Frontend interactivity
├── routes/            # Express route definitions
├── views/             # EJS templates (Home, Quiz, Quests, Shop)
├── app.js             # Main application entry point (Express/PHP Bridge)
└── package.json       # Project configuration and dependencies
```

---

## 👨‍💻 Development Team

- **[harB33](https://github.com/harB33)** - *Lead Developer*
- **[henrykashlie-sketch](https://github.com/henrykashlie-sketch)** - *Developer*
- **[jomariwamil1012-ai](https://github.com/jomariwamil1012-ai)** - *Developer*
- **[veztre](https://github.com/veztre)** - *Developer / Project Owner*

## 📜 License

This project is licensed under the **ISC License**.

---

<p align="center">
  <i>"Patawad Amanai" - Gojo Satoru</i>
</p>
