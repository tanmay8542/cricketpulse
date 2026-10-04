# CricketPulse 🏏

**Women's cricket, made for fans.** Built for the **ICC × Ignyte Hackathon** (Theme 2: Next-Gen Fan Experiences).

Fans can follow matches, explore stats, predict the next ball, chat live with other fans and climb a leaderboard.

## Features

- Live match centre, scorecard and commentary; Matches, Series, News, Rankings, Teams, Players
- **Match Lab:** interactive wagon wheel and win probability
- **Fan Zone:** shared live chat, leaderboard, squads and watch parties
- **Predict:** next-ball predictions with XP, levels and badges
- **Discover:** fan-type quiz; **real accounts** with profile and progress
- Dark / light theme, responsive layout, reduced-motion support

## Tech stack

| Layer | Technology |
|---|---|
| Front end | Vanilla HTML, CSS and JavaScript (single file, inline SVG graphics, hash-based routing) |
| Back end | Node.js 22, built-in `http` module (zero dependencies) |
| Database | SQLite (Node's built-in `node:sqlite`) |
| Security | Passwords hashed with scrypt + random salt, session tokens, input sanitising, rate limiting |

## API

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/signup`, `/api/login` | Create account / log in |
| GET / PUT | `/api/me` | Profile; save team and fan type |
| POST | `/api/predict` | Lock a next-ball prediction (outcome decided server-side) |
| GET / POST | `/api/chat` | Read / send live chat messages |
| GET | `/api/leaderboard` | Top fans by points |

## Run locally

Requires [Node.js 22+](https://nodejs.org).

```bash
node server.js
# open http://localhost:3000
```

The server also serves `index.html`, so this is the whole app.

## Deploy (free, e.g. Render)

1. Push this repo to GitHub.
2. On [render.com](https://render.com): **New → Web Service**, connect the repo.
3. Set **Start command** to `node server.js` and add the environment variable `NODE_VERSION` = `22`.
4. Open the URL Render gives you. That is the live app.

Note: free hosts may reset the SQLite file on restart. Fine for a demo; for permanent data use a persistent disk or a hosted database.

**GitHub Pages only?** The site still works in **demo mode** (accounts, chat and predictions stored in your browser) when no backend is reachable. To connect a Pages-hosted site to a hosted backend, set `API_BASE` near the bottom of `index.html` to your backend URL.

## Notes

Match, player and news data are sample data for demo purposes. A live cricket data API is the next step.

## Roadmap

- Live cricket data API
- Real-time chat with WebSockets, push notifications for wickets
- Move to a hosted database; split the front end into components
