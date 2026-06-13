# Scroll Effects Website 🌊✨

An interactive, high-end web experience featuring advanced scroll-driven animations. The project showcases two distinct approaches to immersive scroll-based storytelling: a high-performance **2D Canvas Image Sequence** and a real-time **3D React Three Fiber / GSAP** environment.

---

## 🚀 Experience Modes

### 1. The 2D Canvas Image Sequence (Main Page)
Located at the root route (`/`), this mode delivers a high-fidelity, cinema-like experience simulating a luxurious building/residence walkthrough.
- **768 Frame Sequence:** Orchestrated across 4 logical parts (192 frames each) utilizing custom scroll mapping.
- **Performance Optimized:** Canvas-drawn frames utilizing dynamic requestAnimationFrame (RAF) rendering loops with soft interpolation (easing) for custom smooth scrolling.
- **Glassmorphic UI Overlay:** Immersive hotspots and collapsible information cards detailing features like the *Social Hearth*, *Cocoon Chairs*, and *Tensile Shades*.
- **Interactive Control Center:** Client-side Settings Panel allowing users to toggle:
  - **Smooth Scroll** (via custom snap targets and interpolation controls).
  - **Text Visibility** (on a per-scene basis or globally).
  - **Info Box Visibility** (on a per-scene basis or globally).
- **Asset Optimization:** Cloudinary-integrated pipeline to automatically serve high-performance `webp` image formats dynamically sized based on viewport widths.

### 2. The 3D Scene Controller (R3F Experience)
Located at the `/scroll` route, this page serves a fully real-time WebGL environment.
- **Dynamic 3D Canvas:** Built with `@react-three/fiber` and `@react-three/drei`.
- **Hybrid Controls:** Combined GSAP `ScrollTrigger` camera animations in spherical coordinates with manual OrbitControls. This allows the user to rotate azimuthal angles (horizontally) freely while the camera's polar angle and height follow scroll milestones.
- **Procedural and External 3D Models:**
  - **External Model:** Supports loading complex GLB models (with auto-scaling, centering, and shadow maps).
  - **Procedural Model:** A gorgeous backup featuring 24 glowing stacked biophilic translucent platforms, a central rotating cybernetic matrix column, gold structural rods, and floating energy nodes.
- **Dynamic Environment:** Twinkling background starfields and smooth particle systems drifting alongside camera movements.

---

## 🛠️ Tech Stack & Libraries

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 & PostCSS
- **Animations:** GSAP & GSAP `ScrollTrigger`
- **3D Graphics:** Three.js, `@react-three/fiber` (R3F), and `@react-three/drei`
- **Cloud Infrastructure:** Cloudinary SDK (for asset uploads and webp conversion)

---

## 📁 Key File Structure

```bash
├── app/
│   ├── layout.tsx            # Global layout setting fonts (Playfair & Inter)
│   ├── page.tsx              # Main Page: 2D Canvas Image Sequence experience
│   ├── globals.css           # Global Tailwind configurations
│   └── scroll/
│       └── page.tsx          # Renders the ScrollStory component
├── ScrollStory.tsx           # 3D WebGL experience using R3F + GSAP
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

Open [http://localhost:3000](http://localhost:3000) to view the 2D image sequence or [http://localhost:3000/scroll](http://localhost:3000/scroll) to view the 3D scene.

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
