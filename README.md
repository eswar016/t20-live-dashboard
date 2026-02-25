# T20 Tournament Live Scoring & Standings Management System

Professional Description
------------------------
This web-based dashboard provides live scoring and standings management for a T20 cricket tournament. Scores are updated via a simple frontend interface and propagated to a spreadsheet-driven backend which recalculates results, Net Run Rate (NRR), and team rankings. The platform supports near real-time synchronization between the spreadsheet backend and the web UI.

Key Features
------------
- Live match score updating interface
- Automatic Net Run Rate (NRR) calculation (backend spreadsheet)
- Cricket overs ↔ decimal conversion utilities
- Dynamic points table rendering and ranking
- Real-time synchronization via public API endpoints
- Simple deployment (e.g., GitHub Pages)

Tech Stack
----------
- Plain HTML / CSS / JavaScript (vanilla)
- Google Sheets as calculation engine (published endpoints)
- Google Apps Script for updates (update webhook)

Quick Start
-----------
1. Clone the repository into your workspace:
   - Place files in a web server folder or open index.html in a browser.
2. Ensure the spreadsheet endpoints in `script.js` are reachable from your environment.
3. Open `index.html` to view the dashboard.
4. Edit match runs/overs and click "Update Match" to push changes to the backend.

Files
-----
- index.html — Dashboard UI
- style.css — Minimal styling and team color classes
- script.js — Frontend logic (fetch fixtures/points, update API calls)
- README.md — This file

APIs / Endpoints
----------------
- Fixtures API: returns match fixtures and current scores
- Points API: returns current points table and NRR
- Update API (Google Apps Script): receives POST body with `{ cell, value }` to update spreadsheet cells

Notes / Tips
------------
- Overs are displayed in cricket format (overs.balls). The frontend converts between cricket format and decimal representation required by the spreadsheet.
- The backend spreadsheet performs all tournament rule calculations (points, NRR, rankings). The frontend is intentionally lightweight.
- For reliable updates, ensure Google Apps Script webhook is authorized and the sheet is writable.

Contributing
------------
- Open an issue for bugs or feature requests.
- Fork, make changes, and open a pull request.

License
-------
MIT (or choose your preferred license)