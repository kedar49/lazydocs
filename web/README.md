# LazyDocs Website

Modern, minimal landing page with creamy white theme and smooth animations.

## ✨ Features

- **Modern Design** - Clean, minimal aesthetic with creamy white theme
- **Lucide Icons** - Beautiful, consistent icon system
- **Smooth Animations** - Fade-ins, parallax effects, and hover animations
- **Interactive Elements** - Copy-to-clipboard, sparkle effects, scroll reveals
- **Responsive** - Works perfectly on all devices
- **No Build Step** - Pure HTML, CSS, and vanilla JavaScript

## 🎨 Design Elements

- Animated background blobs with parallax
- Smooth scroll reveals
- Hover effects on cards
- Copy buttons with visual feedback
- Gradient text effects
- Floating animations
- Terminal-style code blocks

## 🚀 Quick Start

Just open `index.html` in your browser!

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

## 📦 What's Included

```
web/
├── index.html    # Main HTML with Lucide icons
├── styles.css    # Modern CSS with animations
├── script.js     # Interactive features
└── README.md     # This file
```

## 🎯 Key Features

### Animations
- Fade in on scroll
- Parallax mouse tracking
- Hover scale effects
- Smooth transitions
- Floating blobs

### Interactive
- Copy code blocks
- Sparkle button effects
- Scroll-triggered animations
- Navbar shadow on scroll
- Easter egg (Konami code!)

### Icons
Uses [Lucide Icons](https://lucide.dev/) - beautiful, consistent, and lightweight.

## 🌐 Deployment

### GitHub Pages

1. Push to GitHub
2. Settings → Pages
3. Select branch and `/web` folder
4. Done!

### Netlify

```bash
# Drag and drop the web folder
# Or use Netlify CLI
cd web
netlify deploy
```

### Vercel

```bash
cd web
vercel
```

## 🎨 Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --cream: #FFFEF9;
    --accent: #FF6B6B;
    --text: #2C2C2C;
    /* ... */
}
```

### Animations

Adjust animation timing in `styles.css`:

```css
.feature-card {
    animation: fadeInUp 0.6s ease-out forwards;
}
```

### Icons

Replace Lucide icons in `index.html`:

```html
<i data-lucide="icon-name"></i>
```

Browse icons at [lucide.dev](https://lucide.dev/)

## 🐛 Easter Eggs

Try the Konami code: ↑↑↓↓←→←→BA

## 📄 License

MIT

---

Built with ❤️ using Lucide Icons
