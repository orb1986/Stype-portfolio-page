/**
 * Image Compression Script
 * Compresses all images in the images/ directory for better web performance
 *
 * Usage: node compress-images.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.error('\n❌ Sharp package not found. Installing...\n');
    console.error('Please run: npm install sharp\n');
    process.exit(1);
}

// Configuration
const CONFIG = {
    maxWidth: 1920,           // Max width in pixels
    quality: 85,              // JPEG quality (1-100)
    pngQuality: 90,           // PNG quality (1-100)
    createBackup: true,       // Create backup of originals
    imagesDir: './images'     // Images directory
};

// Statistics
let stats = {
    total: 0,
    compressed: 0,
    skipped: 0,
    errors: 0,
    originalSize: 0,
    newSize: 0
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
 * Recursively get all image files
 */
function getImageFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getImageFiles(filePath, fileList);
        } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

/**
 * Compress a single image
 */
async function compressImage(filePath) {
    try {
        const originalStats = fs.statSync(filePath);
        stats.originalSize += originalStats.size;

        // Create backup if enabled
        if (CONFIG.createBackup) {
            const backupDir = path.join(path.dirname(filePath), '.backup');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            const backupPath = path.join(backupDir, path.basename(filePath));
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(filePath, backupPath);
            }
        }

        // Get image metadata
        const metadata = await sharp(filePath).metadata();

        // Skip if image is already small enough
        if (originalStats.size < 200000 && metadata.width <= CONFIG.maxWidth) {
            stats.skipped++;
            return;
        }

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
        stats.newSize += newStats.size;

        // Only replace if new file is smaller
        if (newStats.size < originalStats.size) {
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);

            const saved = originalStats.size - newStats.size;
            const percent = Math.round((saved / originalStats.size) * 100);
            console.log(`✓ ${path.relative('.', filePath)} - Saved ${formatBytes(saved)} (${percent}%)`);
            stats.compressed++;
        } else {
            // New file is larger, keep original
            fs.unlinkSync(tempPath);
            stats.newSize += originalStats.size - newStats.size; // Adjust stats
            stats.skipped++;
        }

    } catch (error) {
        console.error(`✗ Error compressing ${filePath}:`, error.message);
        stats.errors++;
    }
}

/**
 * Main function
 */
async function main() {
    console.log('🖼️  Image Compression Tool\n');
    console.log('Configuration:');
    console.log(`  Max Width: ${CONFIG.maxWidth}px`);
    console.log(`  JPEG Quality: ${CONFIG.quality}%`);
    console.log(`  PNG Quality: ${CONFIG.pngQuality}%`);
    console.log(`  Backup Originals: ${CONFIG.createBackup ? 'Yes' : 'No'}\n`);

    // Get all images
    console.log('📁 Scanning for images...\n');
    const imageFiles = getImageFiles(CONFIG.imagesDir);
    stats.total = imageFiles.length;

    if (stats.total === 0) {
        console.log('No images found!');
        return;
    }

    console.log(`Found ${stats.total} images\n`);
    console.log('🔄 Compressing images...\n');

    // Process images with a limit to avoid memory issues
    const batchSize = 10;
    for (let i = 0; i < imageFiles.length; i += batchSize) {
        const batch = imageFiles.slice(i, i + batchSize);
        await Promise.all(batch.map(file => compressImage(file)));
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Compression Summary');
    console.log('='.repeat(60));
    console.log(`Total Images:      ${stats.total}`);
    console.log(`Compressed:        ${stats.compressed}`);
    console.log(`Skipped:           ${stats.skipped}`);
    console.log(`Errors:            ${stats.errors}`);
    console.log(`Original Size:     ${formatBytes(stats.originalSize)}`);
    console.log(`New Size:          ${formatBytes(stats.newSize)}`);
    console.log(`Saved:             ${formatBytes(stats.originalSize - stats.newSize)}`);
    console.log(`Reduction:         ${Math.round(((stats.originalSize - stats.newSize) / stats.originalSize) * 100)}%`);
    console.log('='.repeat(60));

    if (CONFIG.createBackup) {
        console.log('\n💾 Original images backed up in .backup folders');
    }

    console.log('\n✨ Done!');
}

// Run
main().catch(console.error);
