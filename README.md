# Scroll Effects Website 🌊✨

An interactive, high-end web experience featuring advanced scroll-driven animations and a high-performance **2D Canvas Image Sequence** walkthrough.

---

## 🚀 Key Features

- **768 Frame Sequence:** Orchestrated across 4 logical parts (192 frames each) utilizing custom scroll mapping.
- **Performance Optimized:** Canvas-drawn frames utilizing dynamic requestAnimationFrame (RAF) rendering loops with soft interpolation (easing) for custom smooth scrolling.
- **Glassmorphic UI Overlay:** Immersive hotspots and collapsible information cards detailing features like the *Social Hearth*, *Cocoon Chairs*, and *Tensile Shades*.
- **Interactive Control Center:** Client-side Settings Panel allowing users to toggle:
  - **Smooth Scroll** (via custom snap targets and interpolation controls).
  - **Text Visibility** (on a per-scene basis or globally).
  - **Info Box Visibility** (on a per-scene basis or globally).
- **Asset Optimization:** Cloudinary-integrated pipeline to automatically serve high-performance `webp` image formats dynamically sized based on viewport widths.

---

## 🛠️ Tech Stack & Libraries

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 & PostCSS
- **Animations:** GSAP & GSAP `ScrollTrigger`
- **Cloud Infrastructure:** Cloudinary SDK (for asset uploads and webp conversion)

---

## 📁 Key File Structure

```bash
├── app/
│   ├── layout.tsx            # Global layout setting fonts (Playfair & Inter)
│   ├── page.tsx              # Main Page: 2D Canvas Image Sequence experience
│   ├── globals.css           # Global Tailwind configurations
│   └── scroll/
│       └── page.tsx          # Redirects /scroll to the root page (/)
├── upload_to_cloudinary.js   # Script to sequentially upload & optimize frames as webp
└── package.json              # Project dependencies and run scripts
```

---

## ⚙️ Development & Scripts

### Getting Started
First, clone the repository, install dependencies, and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the 2D image sequence. Any attempts to visit `/scroll` will automatically redirect to the home page.

### Optimization & Assets Pipeline
To upload and compress your image frames to Cloudinary:
1. Create a `.env` file at the root with your credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
2. Place your frames inside directories structured as `public/part1/`, `public/part2/`, etc.
3. Run the upload utility script:
   ```bash
   node upload_to_cloudinary.js
   ```
