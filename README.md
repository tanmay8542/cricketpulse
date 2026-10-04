# CricketPulse 🏏

**Women's cricket, made for fans.**
A front-end prototype built for the **ICC × Ignyte Hackathon** (Theme 2: Next-Gen Fan Experiences).

CricketPulse goes beyond live scores. Fans can follow matches, explore stats, predict the next ball, chat with other fans and earn rewards.

## Features

- **Live match centre:** score, commentary, scorecard and match info
- **Matches, Series, News, Rankings, Teams, Players:** filterable pages
- **Match Lab:** interactive wagon wheel and win probability
- **Fan Zone:** live chat, leaderboard, watch parties and squads
- **Predict:** next-ball predictions with XP, levels and badges
- **Discover:** a short quiz that assigns your fan type
- **Accounts:** log in or sign up, with a profile and progress
- **Dark / light theme**, responsive layout and `prefers-reduced-motion` support

## Tech stack

Vanilla HTML, CSS and JavaScript in a single file, with no frameworks, no build step and no dependencies.

- Hash-based client-side routing (`#/matches`, `#/predict`, ...)
- Inline SVG for all graphics
- `localStorage` for theme and demo account data

## Run locally

Open `index.html` in any modern browser. No install is needed.

Or serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy (GitHub Pages)

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

## Note on data

All match, player and news data is **sample data** hard-coded in `index.html` for demo purposes. Login is simulated in the browser (nothing is sent to a server). The data section is marked in the code and can be replaced with a real API.

## Roadmap

- Connect to a live cricket data API
- Real authentication and a backend for predictions and chat
- Push notifications for wickets and milestones
- Split into components (e.g. React / Next.js) for scale

## Team

Built for the ICC × Ignyte Hackathon 2026.
