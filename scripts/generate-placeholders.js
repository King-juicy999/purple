// Generate placeholder SVG images for portfolio
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '..', 'images');

const images = [
  {
    filename: 'portfolio-1-hero-banner.jpg',
    title: 'Grand Wedding Ceremony',
    color: '#3D1766',
    accent: '#C9A15C',
  },
  {
    filename: 'portfolio-2-staff-setup.jpg',
    title: 'Corporate Gala Setup',
    color: '#1A0B2E',
    accent: '#C9A15C',
  },
  {
    filename: 'portfolio-3-client-collab.jpg',
    title: 'Client Consultation',
    color: '#3D1766',
    accent: '#C9A15C',
  },
  {
    filename: 'portfolio-4-radisson-blu.jpg',
    title: 'Radisson Blu Event',
    color: '#2D1455',
    accent: '#C9A15C',
  },
  {
    filename: 'portfolio-5-one-year.jpg',
    title: 'First Anniversary',
    color: '#1A0B2E',
    accent: '#C9A15C',
  },
  {
    filename: 'portfolio-6-50th-cherry-blossom.jpg',
    title: '50th Anniversary Cherry Blossom',
    color: '#3D1766',
    accent: '#C9A15C',
  },
  {
    filename: 'portfolio-7-floral-photoshoot.jpg',
    title: 'Floral Photoshoot',
    color: '#2D1455',
    accent: '#C9A15C',
  },
];

function generateSVG({ title, color, accent }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color}"/>
      <stop offset="100%" style="stop-color:#0D051A"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${accent}"/>
      <stop offset="100%" style="stop-color:#E8C58A"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <circle cx="600" cy="350" r="80" fill="none" stroke="url(#accent)" stroke-width="3" opacity="0.3"/>
  <circle cx="600" cy="350" r="50" fill="none" stroke="url(#accent)" stroke-width="2" opacity="0.5"/>
  <circle cx="600" cy="350" r="20" fill="url(#accent)" opacity="0.8"/>
  <text x="600" y="500" font-family="Georgia, serif" font-size="32" fill="${accent}" text-anchor="middle" font-weight="bold">${title}</text>
  <text x="600" y="540" font-family="Georgia, serif" font-size="18" fill="${accent}" text-anchor="middle" opacity="0.7">Purple Ribbons by Amy</text>
  <line x1="500" y1="560" x2="700" y2="560" stroke="url(#accent)" stroke-width="2" opacity="0.5"/>
  <text x="600" y="590" font-family="Georgia, serif" font-size="14" fill="${accent}" text-anchor="middle" opacity="0.5">Lagos, Nigeria • Est. 2015</text>
</svg>`;
}

async function generateAllImages() {
  console.log('Generating placeholder images...\n');

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  for (const image of images) {
    const filepath = path.join(IMAGES_DIR, image.filename);
    const svgContent = generateSVG(image);

    // Save as SVG first, then we'll convert or just use SVG
    const svgPath = filepath.replace('.jpg', '.svg');
    fs.writeFileSync(svgPath, svgContent);
    console.log(`  ✓ Generated ${svgPath}`);
  }

  console.log('\nAll placeholder SVGs generated!');
  console.log('Note: Update index.html to reference .svg files or convert to JPG.');
}

generateAllImages().catch(console.error);