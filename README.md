
# Shula Equipment Library

Welcome to the Shula Equipment Library, a full-stack web application for managing and renting equipment. This project provides a comprehensive solution for tool rentals, featuring user authentication, product management, a shopping cart, and an admin dashboard. The application is built with a React frontend, a Node.js/Express backend, and a MongoDB database, and it includes real-time features powered by WebSockets.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

## Features

- **User Authentication:** Secure user registration and login with JWT-based authentication.
- **Product Catalog:** Browse, search, and view detailed information about available equipment.
- **Shopping Cart:** Add items to a cart and manage them before checkout.
- **Checkout Process:** A multi-step checkout process with order summary and payment.
- **Admin Dashboard:** A dedicated interface for administrators to manage products, orders, and users.
- **Real-Time Updates:** Real-time product availability updates using Socket.io.

## Technologies

This project is built with a modern technology stack, including:

- **Frontend:**
  - React
  - React Router for navigation
  - Axios for API requests
  - Socket.io Client for real-time communication
- **Backend:**
  - Node.js and Express for the server
  - MongoDB and Mongoose for the database
  - JSON Web Tokens (JWT) for authentication
  - Socket.io for real-time communication
- **Development:**
  - Concurrently for running multiple scripts
  - Nodemon for automatic server restarts

## System Architecture

The application is designed with a client-server architecture:

- **Frontend:** A React-based single-page application (SPA) that communicates with the backend via a RESTful API and WebSockets.
- **Backend:** A Node.js/Express server that handles business logic, interacts with the MongoDB database, and provides API endpoints for the frontend.
- **Database:** A MongoDB database to store user, product, and order data.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v20 or later recommended)
- npm (Node Package Manager)
- MongoDB (A local or cloud-based instance)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/TymorIbrahim/ShulaWebApp2.git
    cd ShulaWebApp2
    ```

2.  **Install backend dependencies:**

    ```bash
    cd backend
    npm install
    ```

3.  **Install frontend dependencies:**

    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

The `start-dev-local.sh` script automates the process of setting up and running the local development environment. It configures the necessary environment variables and starts both the frontend and backend servers.

To run the application, execute the following command from the project's root directory:

```bash
./start-dev-local.sh
```

The script will:
- Start the backend server on `http://localhost:5002`
- Start the frontend development server on `http://localhost:3000`

## Available Scripts

The project includes several scripts to streamline development and deployment, which can be found in the `package.json` files in the root, `frontend`, and `backend` directories.

### Root `package.json`

- `npm start`: Starts both the backend and frontend servers concurrently.
- `npm run start:backend`: Starts only the backend server.
- `npm run start:frontend`: Starts only the frontend server.
- `npm run build`: Builds the frontend application for production.
- `npm run deploy`: Builds the frontend and starts the backend server.

## Project Structure

The project is organized into two main directories: `frontend` and `backend`.

```
ShulaWebApp2/
├── backend/      # Node.js/Express backend
├── frontend/     # React frontend
├── scripts/      # Deployment and utility scripts
└── ...
```

## Deployment

The application is configured for deployment to various platforms, including AWS, Railway, and Vercel. The `scripts` directory contains the necessary shell scripts for these deployments. Refer to the scripts and the root `package.json` for more details.
