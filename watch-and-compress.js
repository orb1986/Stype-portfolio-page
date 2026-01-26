/**
 * File Watcher for Automatic Image Compression
 * Watches the images/ directory and automatically compresses new images
 *
 * Usage: node watch-and-compress.js
 * (Keep it running while you work on adding images)
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Check if dependencies are installed
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.error('\n❌ Sharp package not found.');
    console.error('Please run: npm install sharp chokidar\n');
    process.exit(1);
}

// Configuration
const CONFIG = {
    maxWidth: 1920,
    quality: 85,
    pngQuality: 90,
    imagesDir: './images',
    minSizeToCompress: 200000 // 200KB - only compress files larger than this
};

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Compress a single image
 */
async function compressImage(filePath) {
    try {
        // Wait a bit to ensure file is fully written
        await new Promise(resolve => setTimeout(resolve, 1000));

        const originalStats = fs.statSync(filePath);

        // Skip small files
        if (originalStats.size < CONFIG.minSizeToCompress) {
            console.log(`⏭️  Skipped ${path.basename(filePath)} (already small: ${formatBytes(originalStats.size)})`);
            return;
        }

        console.log(`🔄 Compressing ${path.basename(filePath)} (${formatBytes(originalStats.size)})...`);

        // Create backup
        const backupDir = path.join(path.dirname(filePath), '.backup');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        const backupPath = path.join(backupDir, path.basename(filePath));
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(filePath, backupPath);
        }

        // Get image metadata
        const metadata = await sharp(filePath).metadata();

        // Process image
        let pipeline = sharp(filePath);

        // Resize if needed
        if (metadata.width > CONFIG.maxWidth) {
            pipeline = pipeline.resize(CONFIG.maxWidth, null, {
                withoutEnlargement: true,
                fit: 'inside'
            });
        }

        // Compress based on format
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg') {
            pipeline = pipeline.jpeg({
                quality: CONFIG.quality,
                progressive: true,
                mozjpeg: true
            });
        } else if (ext === '.png') {
            pipeline = pipeline.png({
                quality: CONFIG.pngQuality,
                compressionLevel: 9,
                progressive: true
            });
        }

        // Save to temporary file
        const tempPath = filePath + '.tmp';
        await pipeline.toFile(tempPath);

        // Check new size
        const newStats = fs.statSync(tempPath);

        // Only replace if new file is smaller
        if (newStats.size < originalStats.size) {
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);

            const saved = originalStats.size - newStats.size;
            const percent = Math.round((saved / originalStats.size) * 100);
            console.log(`✅ Compressed ${path.basename(filePath)} - Saved ${formatBytes(saved)} (${percent}%)`);
        } else {
            // New file is larger, keep original
            fs.unlinkSync(tempPath);
            console.log(`⏭️  Kept original ${path.basename(filePath)} (compressed version was larger)`);
        }

    } catch (error) {
        console.error(`❌ Error compressing ${filePath}:`, error.message);
    }
}

/**
 * Main function
 */
function main() {
    console.log('👁️  Image Watcher Started\n');
    console.log('Configuration:');
    console.log(`  Watching: ${CONFIG.imagesDir}`);
    console.log(`  Max Width: ${CONFIG.maxWidth}px`);
    console.log(`  JPEG Quality: ${CONFIG.quality}%`);
    console.log(`  PNG Quality: ${CONFIG.pngQuality}%`);
    console.log(`  Min Size to Compress: ${formatBytes(CONFIG.minSizeToCompress)}\n`);
    console.log('🔍 Watching for new images...\n');
    console.log('Press Ctrl+C to stop\n');

    // Initialize watcher
    const watcher = chokidar.watch(`${CONFIG.imagesDir}/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}`, {
        ignored: [
            '**/node_modules/**',
            '**/.backup/**',
            '**/*.tmp'
        ],
        persistent: true,
        ignoreInitial: true, // Don't process existing files
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    // Watch for new files
    watcher.on('add', async (filePath) => {
        console.log(`\n📸 New image detected: ${path.basename(filePath)}`);
        await compressImage(filePath);
    });

    // Watch for changed files
    watcher.on('change', async (filePath) => {
        // Skip if this is the backup directory
        if (filePath.includes('.backup')) return;

        console.log(`\n🔄 Image modified: ${path.basename(filePath)}`);
        await compressImage(filePath);
    });

    watcher.on('error', error => {
        console.error('❌ Watcher error:', error);
    });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping watcher...');
    process.exit(0);
});

// Run
main();
