# Simple Clash of Clans Player Lookup (Node.js + Express)

Beginner-friendly fullstack app:
- Backend: Express API endpoints `GET /player/:tag` and `GET /players/:tag`
- Frontend: plain HTML + JavaScript
- Data source: Clash of Clans API (via `axios`)
- Frontend automatically fetches clan profile when player has a clan
- Frontend also displays clan member list in a table

## Project Structure

```text
Tes/
  public/
    assets/
      clan-temp.svg
      star-temp.svg
      townhall-temp.svg
      trophy-temp.svg
    app.js            # Frontend logic
    index.html        # Frontend structure
    style.css         # Frontend styling
  src/
    server.js         # Express backend
  .env.example        # Environment variable template
  package.json
  README.md
```

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment variable

Create a `.env` file in the project root, then copy values from `.env.example`:

```env
COC_API_KEY=your_clash_of_clans_api_key_here
PORT=3000
```

Important:
- Do not hardcode API key in source code.
- Clash of Clans API key often requires allowed IP configuration from the Clash developer portal.

## 3) Run the app

```bash
npm start
```

For development mode with auto-reload:

```bash
npm run dev
```

Open:
- `http://localhost:3000`

## API Endpoint

### Local endpoints (your Express app)

- `GET /player/:tag`
- `GET /players/:tag` (alias)
- `GET /clan/:tag`
- `GET /clans/:tag` (alias)
- `GET /clan/:tag/members`
- `GET /clans/:tag/members` (alias)

Examples:
- `/player/%2390ABC123` (tag with `#`)
- `/player/90ABC123` (tag without `#`)
- `/players/90ABC123` (alias)

### External Clash API endpoint used by backend

- `GET https://api.clashofclans.com/v1/players/{playerTag}`

Success response:

```json
{
  "name": "PlayerName",
  "expLevel": 200,
  "townHallLevel": 13,
  "trophies": 4200,
  "bestTrophies": 4700,
  "warStars": 1400,
  "clanName": "ClanName",
  "clanTag": "#ABCD1234"
}
```

Clan response example:

```json
{
  "name": "ClanName",
  "tag": "#ABCD1234",
  "clanLevel": 20,
  "members": 47,
  "warLeague": "Crystal League I",
  "location": "Indonesia",
  "badgeUrl": "https://..."
}
```

Clan members response example:

```json
{
  "clanTag": "#ABCD1234",
  "total": 50,
  "members": [
    {
      "name": "PlayerOne",
      "tag": "#P123456",
      "role": "leader",
      "expLevel": 240,
      "trophies": 5800,
      "builderBaseTrophies": 4200
    }
  ]
}
```

## Error Handling Included

- Invalid tag format -> `400`
- Player not found -> `404`
- Missing API key -> `500`
- Clash API auth issue -> `403`
- Network/unexpected error -> `500`

## Deploy to Render (Free)

1. Push this project to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Blueprint**.
3. Connect your GitHub repo and select this project.
4. Render will read [render.yaml](C:\Users\Rizky Ariyan\Desktop\Tes\render.yaml) automatically.
5. In Render Environment Variables, set:
   - `COC_API_KEY=your_real_key`
6. Deploy, then open your Render URL.

Notes:
- Keep `COC_API_KEY` secret (never commit it).
- If Clash API rejects requests in production (`403`), re-check API key restrictions and allowed IP settings in Clash developer portal.
