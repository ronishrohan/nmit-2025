# Outworks – Frontend

Outworks is a modular manufacturing management frontend application built with **Next.js** and **Tailwind CSS**.  
It aims to digitize and streamline the entire manufacturing process — from order creation to final output — replacing fragmented spreadsheets and manual tracking with a centralized, user-friendly platform.
Video Link: https://drive.google.com/file/d/15cv9WblQ6jOma_J12xhGa_EY9E2yCqCh/view?usp=sharing
---

## Problem Statement (Overview)

Manufacturing businesses often face challenges with scattered systems, lack of real-time visibility, and manual paperwork.  
**Outworks** solves these issues by providing:

- A unified dashboard for managing **Manufacturing Orders (MO)**, **Work Orders (WO)**, **Work Centers**, **Stock Ledger**, and **Bills of Material (BOM)**.
- Real-time tracking of production progress.
- Dynamic filtering and quick insights into order states (Planned, In Progress, Done, Canceled).
- Seamless integration between stock, production, and reporting.
- Scalable architecture to add new modules (Quality Check, Maintenance) in the future.

---

## Features

- **Authentication & Access Control**  
  - Login, signup, and password recovery with OTP verification.
Global Tailwind & custom styles
- **Dashboard & Filters**  
  - View all manufacturing orders in real-time.  
  - Filter by order status and view KPIs like completed, delayed, and in-progress orders.

- **Manufacturing Orders**  
  - Create, edit, and track production orders.  
  - Attach BOMs, work centers, and deadlines.

- **Work Orders**  
  - Assign tasks to operators and track progress with start/pause/completion updates.

- **Work Centers**  
  - Manage capacity, downtime, and utilization.  
  - Calculate costing per hour.

- **Stock Ledger & Product Master**  
  - Track material movements (stock in/out) automatically after work orders are completed.

- **Bill of Materials (BOM)**  
  - Define raw materials and operations per finished product.  
  - Auto-fetch and adjust based on order quantity.

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management & API Calls:** React Hooks, Zustand for Global State Management

---

## Getting Started

Follow these steps to run the project locally:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**.

---

## Project Structure

```
outworks-frontend/
├── app/                 # Next.js App Router pages & layouts
├── components/          # Reusable UI components
├── lib/                 # Global libraries
├── public/              # Static assets
└── package.json         # Project dependencies & scripts
```

---
