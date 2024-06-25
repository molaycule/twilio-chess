## Project Overview
This project is structured into two main parts: the backend and the frontend. The backend handles the server-side logic, including game state management, and image generation for chess moves.
The frontend is built with React, providing a dynamic and responsive interface for users to setup their chess game play experience.

## Directory Structure
### Backend
- package.json: Contains the project metadata and dependencies.
- src/:
  - app.js: Main application file.
  - constants/index.js: Constants used in the backend.
  - db/:
  - migrate.js: Script for handling database migrations.
  - schema.js: Database schema definitions.
  - migrations/: SQL migration files and metadata snapshots.
- pkg/chess-image-generator/:
  - config.js: Configuration for the chess image generator.
  - index.js: Main file for generating chess images.
  - images/: Chess piece images.
### Frontend
- package.json: Contains the project metadata and dependencies.
- public/: Public assets (e.g., images, sounds).
- src/:
  - components/: React components for various parts of the application (e.g., Chessboard, Contact, GameChat).
  - constants/index.js: Constants used in the frontend.
  - icons/: Icon components.
  - layouts/Layout.astro: Layout file for Astro (static site generator).
- pages/:
  - chess.astro: Chess page.
  - index.astro: Home page.
- store/index.js: State management.
- styles/globals.css: Global CSS styles.
- utils/: Utility functions.

## Setting Up the Project
To get started with the project, follow these steps:

### Clone the Repository:
```bash
git clone <repository-url>
cd twilio-chess
```

### Install Dependencies:
- Backend:
```bash
cd backend
npm install
```

- Frontend:
```bash
cd ../client
npm install
```

### Run Migrations:
```bash
cd backend
npm run db:migrate
```

### Start the Application:
- Backend:
```bash
npm run dev
```

- Frontend:
```bash
cd ../client
npm run dev
```
