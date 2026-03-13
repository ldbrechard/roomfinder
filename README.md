# roomfinder

A lightweight, serverless web application built with **Google Apps Script**, **Leaflet.js**, and **Google Sheets**. It allows users to view an interactive floor plan, search for rooms, and calculate the shortest walking path to their destination.

Ideal for corporate offices, schools, hospitals, or any large facility looking for a free, fully customizable "indoor GPS".

## ✨ Features
* **Interactive Map:** Zoom and pan smoothly on a high-resolution custom floor plan.
* **Smart Routing (Dijkstra):** Calculates the shortest path between two points avoiding walls, with a neat animated flow line.
* **Serverless Backend:** Uses Google Sheets as a database, avoiding hosting fees and making management easy.
* **Admin Routing Mode:** Visually draw the "walkable" network paths directly on the map securely with an admin password.
* **Fuzzy Search:** Easily find a room even with typos, powered by `Fuse.js`.
* **Mobile Responsive:** Layout adapts automatically to smartphones (Google Maps-like bottom-sheet style).
* **Bilingual (i18n):** Instantly switch between English and French.
* **Feedback System:** Built-in modal to send direct emails to the administrator.

## 🛠️ Setup & Installation

### 1. Prepare the Database
1. Create a new **Google Sheet**.
2. Create 4 specific tabs (names must match exactly) :
   * `Rooms`: Columns -> `ID` | `Name` | `Info` | `Y` | `X` | `Zone`
   * `Logs`: Columns -> `Date` | `ID` | `Action`
   * `Nodes`: Columns -> `ID` | `Y` | `X`
   * `Edges`: Columns -> `NodeA` | `NodeB`
3. Get the **Sheet ID** from your Google Sheet URL (the long string of characters between `/d/` and `/edit`).

### 2. Configure Apps Script
1. In your Google Sheet, go to `Extensions` > `Apps Script`.
2. Delete any existing code.
3. Create two files:
   * `Code.gs` (Paste the backend code here)
   * `Index.html` (Paste the frontend HTML code here)
4. In `Code.gs`, replace the `SHEET_ID` variable with your actual Sheet ID. Update the `ADMIN_EMAIL_FEEDBACK` variable to receive user feedback.
5. In `Index.html`, update the `IMAGE_URL`, `IMAGE_WIDTH`, and `IMAGE_HEIGHT` variables with your custom floor plan image details. You can also modify the `ADMIN_PASSWORD` (default is `admin`).

### 3. Deploy
1. Click on **Deploy** > **New deployment** in the top right corner.
2. Select type: **Web app**.
3. *Execute as:* **Me** (This ensures users don't need to grant Google permissions to view the map or send feedbacks).
4. *Who has access:* **Anyone**.
5. Click **Deploy** and copy the generated Web App URL.

## ✏️ How to draw the Routing Network (Admin)
To allow the app to calculate paths, you need to tell it where the corridors are.
1. Open the Web App.
2. Click **🛠️ Route Mode (Admin)** in the sidebar and enter your password.
3. Click anywhere in a hallway to create a **Node**.
4. Click further down the hallway to create another Node; a line (an **Edge**) will automatically connect them.
5. Use the black bottom banner to *cut lines*, *delete points*, or insert points into existing lines.
6. Make sure all your corridors are properly connected so the routing algorithm can find a path!

## 💻 Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JS, [Leaflet.js](https://leafletjs.com/) (for custom CRS mapping), [Fuse.js](https://fusejs.io/) (for search).
* **Backend:** Google Apps Script.
* **Database:** Google Sheets.

## 📄 License
This project is open-source and available under the MIT License. Feel free to fork and adapt it to your needs!
