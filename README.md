# 🪴 JugGarden

Container & milk jug gardening app — personalized to your USDA growing zone.

---

## 📁 Folder structure

```
juggarden/
├── index.html          ← HTML entry point (root level — this is key for Vite!)
├── vite.config.js      ← Build config
├── package.json        ← Dependencies
├── public/
│   ├── manifest.json   ← Makes it installable as a PWA
│   ├── icon-192.png    ← App icon — ADD THIS (192×192px)
│   └── icon-512.png    ← App icon — ADD THIS (512×512px)
└── src/
    ├── main.jsx        ← React entry point
    └── App.jsx         ← Your full app
```

---

## 🖼️ Icons (add before deploying)

Add two images to the `public/` folder:
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

Use Canva or squoosh.app to resize your JugGarden logo.

---

## 🚀 Deploy to Vercel (free, ~5 min)

### 1. Upload to GitHub
- Go to github.com → New repository → name it `juggarden`
- Upload this entire folder (drag & drop, or use GitHub Desktop)

### 2. Deploy on Vercel
- Go to vercel.com → Sign up with GitHub (free)
- Click "Add New Project" → select your `juggarden` repo
- Vercel will auto-detect Vite — just click **Deploy**
- You'll get a live URL like `juggarden.vercel.app` ✅

### 3. Share!
Send the URL to anyone — opens in any browser, no install needed.

To install on phone as an app:
- **iPhone:** Safari → Share → "Add to Home Screen"
- **Android:** Chrome → ⋮ menu → "Add to Home Screen"

---

## 💻 Run locally (optional)

Requires Node.js installed:
```bash
cd juggarden
npm install
npm run dev
```
Opens at http://localhost:5173
