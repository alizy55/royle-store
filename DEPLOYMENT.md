# SMV E-Commerce Deployment Guide

This guide outlines how to deploy the SMV E-Commerce application.

## Prerequisites

- GitHub account with the project repository: `alizy55/royle-store`
- Vercel account (for Frontend)
- Render account (for Backend)
- MongoDB Atlas account (Database)

## 1. Database Setup (MongoDB Atlas)

1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a Cluster (Shared Free tier is fine).
3.  Create a Database User (keep credentials safe).
4.  Network Access: Allow access from anywhere (`0.0.0.0/0`).
5.  Get the Connection String: `mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/royle_store?retryWrites=true&w=majority`

## 2. Backend Deployment (Render)

1.  Log in to [Render](https://render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository `alizy55/royle-store`.
4.  **Root Directory**: `backend`
5.  **Build Command**: `npm install`
6.  **Start Command**: `npm start`
7.  **Environment Variables**:
    -   `NODE_ENV`: `production`
    -   `DB_MODE`: `online`
    -   `MONGO_URI_ATLAS`: *(Your MongoDB Atlas Connection String)*
    -   `JWT_SECRET`: *(A long random string)*
    -   `CLIENT_URL`: *(Your Vercel Frontend URL - you will get this after Step 3, for now use `http://localhost:5173` or update later)*
8.  Click **Create Web Service**.
9.  Wait for the deployment to finish. Copy the **Service URL** (e.g., `https://smv-ecom-backend.onrender.com`).

## 3. Frontend Deployment (Vercel)

1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import `alizy55/royle-store`.
4.  **Framework Preset**: Vite
5.  **Root Directory**: `frontend`
6.  **Environment Variables**:
    -   `VITE_API_BASE_URL`: *(Your Render Backend URL + `/api`)*
        -   Example: `https://smv-ecom-backend.onrender.com/api`
7.  Click **Deploy**.
8.  Once deployed, copy your **Vercel Deployment URL** (e.g., `https://royle-store.vercel.app`).

## 4. Final Configuration

1.  Go back to **Render** -> Dashboard -> your backend service -> **Environment**.
2.  Update `CLIENT_URL` with your new Vercel Deployment URL to allow CORS.
3.  **Save Changes**. Render will redeploy automatically.

**Done!** Your application should now be live.
