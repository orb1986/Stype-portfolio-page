# Portfolio Website

A modern, minimalist portfolio website with a clean white design inspired by professional photography portfolios like [mirjageh.com](https://www.mirjageh.com/). Built with vanilla HTML, CSS, and JavaScript.

## Features

- **Clean White Design** - Minimalist aesthetic with focus on imagery
- **Masonry Grid Layout** - Pinterest-style gallery with varied image heights
- **Smart Image Loading** - Lazy load + background preload for optimal performance
- **Easy Image Management** - Just edit `images.json` to add/remove photos
- **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **Language Toggle** - Switch between English and Croatian (HR/EN)
- **Back to Top Button** - Smooth scroll back to top when scrolling down
- **Category Navigation** - Filter work by category (Action, Baptism, Events, Food, Motion, Nature, Outdoor, People)
- **About Section Slideshow** - Auto-rotating image gallery in contact section
- **Lightbox Gallery** - Click on portfolio items to view details with left/right navigation
- **Fullscreen Mode** - View images in fullscreen with F key or fullscreen button
- **Smart Title Overlay** - Transparent title that matches photo width, not screen width
- **Auto-scroll on Section Switch** - Automatically scrolls to top when changing gallery categories
- **Randomized Gallery** - Images are shuffled on each page load for dynamic viewing experience
- **Image Compression** - Built-in tools to optimize images for web performance
- **SEO Optimized** - Complete meta tags, Open Graph, and Twitter cards

## Project Structure

```
Stype-portfolio-page/
├── index.html              # Main website
├── admin.html              # ADMIN TOOL - Drag & drop image manager
├── images.json             # Image configuration (400 images)
├── compress-images.js      # One-time batch image compression
├── watch-and-compress.js   # Auto-compress new images (file watcher)
├── .gitignore              # Git ignore rules (backups, node_modules, etc.)
├── package.json            # Node.js dependencies (if created)
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── main.js             # Core functionality
│   └── translations.js     # EN/HR translations
├── images/                 # Your photos organized by category
│   ├── Action/             # Sports and action photography (56 images)
│   ├── Baptism/            # Baptism and christening ceremonies (29 images)
│   ├── Events/             # Concerts, festivals, and celebrations (49 images)
│   ├── Food/               # Food photography (48 images)
│   ├── Motion/             # Vehicles, trains, and motion blur (77 images)
│   ├── Nature/             # Wildlife and nature scenes (19 images)
│   ├── Outdoor/            # Landscapes, architecture, and outdoor (59 images)
│   ├── People/             # Portraits and people photography (61 images)
│   └── about/              # About/personal photos for slideshow (2 images)
├── assets/
│   └── favicon.svg         # Site favicon
└── README.md
```

## How to Manage Photos

### Option 1: Use the Admin Tool (Easiest)

1. Copy your images to the appropriate `images/` subfolder
2. Open `admin.html` in your browser (via local server, e.g., VS Code Live Server)
3. **Enter the admin password** (default: `admin`) - IMPORTANT: Change this in admin.html script!
4. **One-time setup (Chrome/Edge):** Click "Connect File" and select your `images.json` file
5. Drag & drop the same images into the admin page
6. Fill in titles (auto-generated from filename) and adjust categories
7. Click "Save Changes" - it saves directly to your file!

The admin tool:
- Auto-loads existing images.json on startup
- Auto-detects image aspect ratios
- Generates titles from filenames
- Lets you edit everything visually
- **One-click saving** (Chrome/Edge) - no manual file replacement needed
- Falls back to download for Firefox/Safari

### Option 2: Edit images.json manually

#### Step 1: Add your images to folders

Put your photos in the appropriate category folder:
- `images/Action/` - Sports and action photography
- `images/Baptism/` - Baptism and christening ceremonies
- `images/Events/` - Concerts, festivals, and celebrations
- `images/Food/` - Food photography
- `images/Motion/` - Vehicles, trains, and motion blur
- `images/Nature/` - Wildlife and nature scenes
- `images/Outdoor/` - Landscapes, architecture, and outdoor
- `images/People/` - Portraits and people photography

#### Step 2: Edit images.json

Open `images.json` and add/edit entries. Each image needs:

```json
{
  "src": "images/Action/my-photo.jpg",
  "title": "Photo Title (English)",
  "title_hr": "Naslov Fotografije (Croatian)",
  "category": "action",
  "aspect": "landscape"
}
```

**Fields explained:**
| Field | Description | Options |
|-------|-------------|---------|
| `src` | Path to the image file | Any valid path |
| `title` | Title shown in English | Any text |
| `title_hr` | Title shown in Croatian | Any text |
| `category` | Which filter it appears under | `action`, `baptism`, `events`, `food`, `motion`, `nature`, `outdoor`, `people`, `about` |
| `aspect` | Image aspect ratio | `portrait`, `landscape`, `square`, `wide` |

**Special Categories:**
- `about` - Images are hidden from the main gallery and only appear in the About slideshow in the contact section

**Aspect ratio options:**
- `portrait` - Tall images (140% height, good for vertical shots)
- `landscape` - Standard landscape (75% height)
- `square` - Square images (100% height)
- `wide` - Cinematic/widescreen (56% height)

### Example: Adding a new photo

1. Save your photo to `images/Action/mountain-bike.jpg`
2. Open `images.json`
3. Add this entry to the `images` array:

```json
{
  "src": "images/Action/mountain-bike.jpg",
  "title": "Mountain Biking",
  "title_hr": "Brdski Biciklizam",
  "category": "action",
  "aspect": "landscape"
}
```

4. Save the file - the gallery updates automatically!

### Example: Removing a photo

Simply delete the entry from `images.json` and optionally delete the image file.

## Adding New Categories

1. Add a new nav link in `index.html`:
```html
<li><a href="#" class="nav-link" data-filter="newcategory" data-i18n="filter_newcategory">New Category</a></li>
```

2. Add translations in `js/translations.js`:
```javascript
filter_newcategory: "New Category",  // English (in the 'en' object)
filter_newcategory: "Nova Kategorija",  // Croatian (in the 'hr' object)
```

3. Create the folder: `images/Newcategory/` (use capital first letter for consistency)

4. Add images with `"category": "newcategory"` (lowercase) in `images.json`

## Customization

### Updating Your Info

1. **Logo**: Replace `images/PF_Visual_Creations.png` with your own logo image, or edit the `<img>` tag in `index.html` to point to your logo file
2. **Contact Info**: Update email and location in the contact section
3. **Social Links**: Update the `href` attributes for Instagram, LinkedIn, Facebook, and Pic-Time Portfolio

### Customizing the About Slideshow

The contact section features a side-by-side layout with an auto-rotating slideshow on the left and contact information on the right. To customize:

1. **Add/Remove Slides**: Edit the slides in `index.html` contact section
2. **Auto-rotation Speed**: Change the interval in `js/main.js` in the `initSlideshow()` function (default: 4 seconds)
3. **Image Sizing**: Adjust slideshow height in CSS (`.slide img` - currently 400px on desktop, 280px on mobile)

### Lightbox Navigation

The lightbox gallery includes navigation features for browsing images:

- **Left/Right Arrow Buttons** - Click arrows on the sides to navigate through images
- **Keyboard Navigation** - Use arrow keys (← →) to browse images
- **Fullscreen Mode** - Press F key or click the fullscreen button (⛶) for immersive viewing
- **Close** - Press Escape or click the X button to close (auto-exits fullscreen)
- **Smart Title Display** - Transparent overlay (50% opacity) that matches the photo's width
- **Responsive Scaling** - Images scale to fit screen while maintaining aspect ratio

Images are navigable in the order they appear in the current filtered view.

### Disabling Gallery Randomization

By default, gallery images are randomized on each page load for a dynamic viewing experience. To disable this:

1. Open `js/main.js`
2. In the `loadGallery()` function (around line 189), change:
   ```javascript
   allImages = shuffleArray(data.images);
   ```
   to:
   ```javascript
   allImages = data.images;
   ```
3. Save the file - the gallery will now display images in their original order

**Note:** Gallery filtering and category navigation will maintain consistent orderings within each filtered view.

### Auto-scroll on Category Switch

When switching between gallery categories (e.g., from Action to Events), the page automatically scrolls to the top with a smooth animation. This ensures you always start viewing a new category from the beginning, regardless of your scroll position.

This behavior is automatic and requires no configuration.

### Background Image Preloading

To ensure smooth navigation between categories, the portfolio implements intelligent background preloading:

**How it works:**
1. Initial page load shows the first category immediately (fast first load)
2. After 2 seconds, background preloading starts automatically
3. All 400 images are loaded in small batches (10 images every 200ms)
4. Once preloaded, switching categories is instant with no loading delay

**Benefits:**
- Fast initial page load (only loads visible images first)
- Smooth category switching after preload completes
- Doesn't overwhelm browser or network
- Works automatically - no configuration needed

**Browser console:** You'll see "Preloaded X images for smooth navigation" when complete.

**Note:** The preload respects browser caching, so subsequent page visits will be even faster.

### Image Compression & Optimization

The portfolio includes tools to compress and optimize images for better web performance:

#### One-Time Compression (All Images)

Compress all images in your gallery at once:

```bash
node compress-images.js
```

This will:
- Compress all images to 85% quality (JPEG) or 90% (PNG)
- Resize images larger than 1920px width
- Create `.backup` folders with original images
- Only replace files if compression makes them smaller
- Typical savings: 85-95% reduction in file size

**Important:** Stop Live Server before running compression to avoid file access errors.

#### Auto-Compression (File Watcher)

Watch for new images and compress them automatically:

```bash
node watch-and-compress.js
```

Keep this running while you work. It will:
- Monitor the `images/` directory for new or modified images
- Automatically compress images as they're added
- Skip images smaller than 200KB
- Run in the background (press Ctrl+C to stop)

**Perfect for:** Local development when adding many images incrementally.

#### Production / Live Server Options

For a live server, you have several options:

1. **Pre-compress before deployment** - Run `compress-images.js` locally before uploading
2. **CI/CD Pipeline** - Add compression to your build/deploy process
3. **CDN with Image Optimization** - Use services like:
   - Cloudflare (automatic image optimization)
   - ImageKit or Imgix (image CDN with on-the-fly optimization)
   - Vercel or Netlify (built-in image optimization)
4. **Server-side automation** - Schedule the compression script via cron job

**Note:** The Node.js scripts (`compress-images.js`, `watch-and-compress.js`) require server-side access and won't run on static hosting alone.

#### What Gets Ignored

A `.gitignore` file is included to prevent unnecessary files from being tracked in git:
- `.backup/` folders (created by compression scripts)
- `node_modules/` (npm dependencies)
- System files (`.DS_Store`, `Thumbs.db`, etc.)
- Temporary files (`*.tmp`, `*.log`)

The backup folders contain original uncompressed images, so you can safely restore them if needed.

### Securing the Admin Panel

The admin panel (`admin.html`) is password-protected. To change the password:

1. Open `admin.html` in a text editor
2. Find this line (around line 607 in the `<script>` section):
   ```javascript
   const ADMIN_PASSWORD = 'admin';  // Change to a strong password!
   ```
3. Replace `'admin'` with your desired password:
   ```javascript
   const ADMIN_PASSWORD = 'your-secure-password-123';
   ```

**Security Notes:**
- The password is stored on the client side, so it's visible in the page source (not truly secure)
- For a more secure solution, consider using a backend service or authentication API
- The authentication session clears when you close the browser tab
- Change the default password immediately for safety

### Color Variables

Edit these in `css/styles.css`:

```css
:root {
    --color-bg: #ffffff;
    --color-bg-secondary: #f8f8f8;
    --color-text: #1a1a1a;
    --color-text-secondary: #555555;
    --color-text-muted: #888888;
    --color-border: #e0e0e0;
}
```

## Running Locally

Open `index.html` directly in a browser, or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# VS Code
# Right-click index.html → Open with Live Server
```

**Note:** Due to browser security, `images.json` requires a local server to load properly. Opening `index.html` directly may not work in some browsers.

## Recent Updates & Improvements

### Gallery Reorganization
- **New Category Structure**: Reorganized from 4 to 8 specialized categories (Action, Baptism, Events, Food, Motion, Nature, Outdoor, People)
- **400 Images**: Comprehensive `images.json` with all portfolio images properly categorized
- **Translations**: Full EN/HR support for all new categories

### Performance Enhancements
- **Image Compression Tools**: Two Node.js scripts for optimizing images (saved 1.84 GB / 92% on initial run)
  - `compress-images.js` - Batch compression
  - `watch-and-compress.js` - Auto-compress on file add
- **Smart Image Loading**: Initial lazy loading for fast page load, then background preloading of all images
- **Browser Caching**: All 400 images preloaded in background for instant category switching
- **Batch Preloading**: Images loaded in small batches to avoid overwhelming the browser

### User Experience Improvements
- **Fullscreen Mode**: Press F or click button to view images fullscreen
- **Smart Title Overlay**: Transparent (50% opacity) title that matches photo width
- **Auto-scroll**: Automatically scrolls to top when switching gallery categories
- **Improved Navigation**: Keyboard shortcuts and intuitive controls

### Development Tools
- **Git Ignore**: Proper `.gitignore` for backups, node_modules, and system files
- **Admin Panel**: Visual drag-and-drop tool for managing `images.json`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal and commercial use.
