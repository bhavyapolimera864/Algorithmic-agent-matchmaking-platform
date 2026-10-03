# Algorithmic Agent Matchmaking Platform

A next-generation, agentic matchmaking platform built with **Next.js**, **PostgreSQL**, and the **Google Gemini API**. 

This application replaces endless swiping by representing every user with an autonomous AI agent. Each agent analyzes the user's public profile (interests, hobbies, lifestyle, personality traits) and autonomously "dates" other agents on the platform to produce deterministic, explainable, and highly accurate compatibility rankings.

## ✨ Features
- **AI Agent Representation**: Extracts structured personality and lifestyle traits from public profiles.
- **Autonomous Matchmaking Engine**: Agents evaluate each other instantly, calculating overlap across Interests, Lifestyle, Personality, Hobbies, and Career.
- **Explainable Results**: Every match provides a detailed breakdown, including "Reasons they matched", "Potential concerns", and "Simulated agent-to-agent conversation".
- **Dynamic Dashboard**: Real-time activity feed showing agent analysis, match decisions, and live session stats.
- **Deterministic Fallback**: If an AI API key is not provided, the platform intelligently falls back to a rule-based engine, ensuring the app works perfectly 100% of the time.

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend**: Next.js Route Handlers (REST JSON API)
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM
- **AI Engine**: Google Gemini (`gemini-2.5-flash`)

## 🚀 Deployment (Vercel)
This project is pre-configured and optimized for 1-click deployment on Vercel.

1. Import this repository into Vercel.
2. In the Vercel **Environment Variables** settings, you must add the following variable:
   - `DATABASE_URL`: Your PostgreSQL connection string.
3. (Optional) Add `GEMINI_API_KEY` to enable live AI analysis.
4. Click **Deploy**.

*Note: The first time the application loads in production, it will automatically populate the database with 26 demo profiles so you can test the matchmaking engine immediately.*

## 📂 Project Structure
- `src/app/`: Next.js App Router pages and API route handlers.
- `src/components/`: Reusable UI components.
- `src/db/`: Drizzle ORM schemas, migration logic, and seed data.
- `src/lib/`: Core matchmaking logic, deterministic fallback engines, and agent builders.
