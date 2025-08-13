
#  Shula Equipment Rental - Complete Project Guide

Welcome to the complete project guide for the Shula Equipment Rental application. This document provides a comprehensive overview of the project, from local development to deployment and server management. It is designed to be a single source of truth for understanding, running, and maintaining the application.

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Local Development](#local-development)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Deployment](#deployment)
  - [Overview](#deployment-overview)
  - [Quick Start](#deployment-quick-start)
  - [Detailed Steps](#detailed-deployment-steps)
- [Server Management](#server-management)
  - [Live URLs](#live-urls)
  - [Starting and Stopping Servers](#starting-and-stopping-servers)
  - [Monitoring and Logs](#monitoring-and-logs)
- [Security](#security)
  - [Security Audit Summary](#security-audit-summary)
  - [Implemented Security Features](#implemented-security-features)

## Project Overview

The Shula Equipment Library is a full-stack web application for managing and renting equipment. It provides a complete solution for tool rentals, featuring user authentication, product management, a shopping cart, and an admin dashboard. The application is built with a React frontend, a Node.js/Express backend, and a MongoDB database, and it includes real-time features powered by WebSockets.

## System Architecture

The application follows a standard client-server architecture:

-   **Frontend:** A React-based single-page application (SPA) that communicates with the backend via a RESTful API and WebSockets. It is hosted on **Vercel** for fast, global delivery.
-   **Backend:** A Node.js/Express server that handles business logic, interacts with the MongoDB database, and provides API endpoints for the frontend. It is hosted on **Railway** for easy deployment and management.
-   **Database:** A MongoDB database hosted on **MongoDB Atlas** to store user, product, and order data.

## Local Development

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   Node.js (v20 or later recommended)
-   npm (Node Package Manager)
-   MongoDB (a local or cloud-based instance)

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

The `start-dev-local.sh` script automates the setup and execution of the local development environment. It configures the necessary environment variables and starts both the frontend and backend servers.

To run the application, execute the following command from the project's root directory:
```bash
./start-dev-local.sh
```

- The backend server will be available at `http://localhost:5002`
- The frontend development server will be available at `http://localhost:3000`

## Deployment

### Deployment Overview

The application is designed for easy deployment to **Vercel** (frontend) and **Railway** (backend), which provides a cost-effective and scalable hosting solution.

### Deployment Quick Start

The project includes automated scripts to streamline the deployment process. From the root directory, you can run:

-   **Deploy everything:**
    ```bash
    npm run railway:deploy
    ```
-   **Deploy backend to Railway:**
    ```bash
    npm run railway:backend
    ```
-   **Deploy frontend to Vercel:**
    ```bash
    npm run vercel:deploy
    ```

### Detailed Deployment Steps

For a step-by-step guide, including account setup and manual deployment, refer to the `README-RAILWAY.md` file, which provides a detailed walkthrough.

## Server Management

### Live URLs

-   **Frontend (Vercel):** [https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app](https://shula-webapp-dppi61gn7-tymoribrahims-projects.vercel.app)
-   **Backend (Railway):** [https://shula-rent-project-production.up.railway.app](https://shula-rent-project-production.up.railway.app)

### Starting and Stopping Servers

The project includes helper scripts to manage the live servers:

-   **Check status:**
    ```bash
    ./scripts/check-status.sh
    ```
-   **Wake up servers:**
    ```bash
    ./scripts/resume-servers.sh
    ```
-   **Get pause instructions:**
    ```bash
    ./scripts/pause-servers.sh
    ```
**Note:** Railway automatically puts the backend to sleep after 30 minutes of inactivity, saving costs without manual intervention.

### Monitoring and Logs

-   **Railway Dashboard:** View logs, manage environment variables, and monitor usage at [railway.app/dashboard](https://railway.app/dashboard).
-   **Vercel Dashboard:** View deployments, manage domains, and see analytics at [vercel.com/dashboard](https://vercel.com/dashboard).

## Security

### Security Audit Summary

A comprehensive security audit of the checkout process was conducted, with a **95.2%** pass rate (20/21 tests passed). The system is considered secure and ready for production use.

### Implemented Security Features

-   **Authentication & Authorization:** JWT-based authentication, role-based access control, and proper handling of invalid tokens.
-   **Input Validation:** Protection against SQL injection and XSS attacks, with validation for required fields, email formats, and date ranges.
-   **Digital Contract Security:** Enforced signature requirements and validation.
-   **File Upload Security:** Frontend file type validation and size limitations.
-   **Rate Limiting:** Implemented to prevent abuse and DoS attacks on checkout and authentication endpoints.
-   **Request Size Limiting:** Express middleware limits JSON payload sizes to 10mb.
