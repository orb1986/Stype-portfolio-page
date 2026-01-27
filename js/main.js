// =============================================
// Portfolio Website - Main JavaScript
// =============================================

// Global state
let currentLang = 'en';
let allImages = [];

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initLanguageToggle();
    initBackToTop();
    loadGallery();
    initContactForm();
    setCurrentYear();
    initSlideshow();
});

// =============================================
// Header scroll effect
// =============================================
function initHeader() {
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                closeMobileMenu();
            }
        });
    });
}

// =============================================
// Mobile menu toggle
// =============================================
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMain = document.querySelector('.nav-main');

    if (!mobileMenuBtn || !navMain) return;

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMain.classList.toggle('active');

        if (navMain.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
}

function closeMobileMenu() {
    const navMain = document.querySelector('.nav-main');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (navMain && navMain.classList.contains('active')) {
        navMain.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// =============================================
// Language toggle (EN/HR)
// =============================================
function initLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    if (!langToggle) return;

    const langCurrent = langToggle.querySelector('.lang-current');
    const langOther = langToggle.querySelector('.lang-other');

    currentLang = localStorage.getItem('portfolio-lang') || 'en';

    applyLanguage(currentLang);
    updateLangButton(currentLang);

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'hr' : 'en';
        localStorage.setItem('portfolio-lang', currentLang);
        applyLanguage(currentLang);
        updateLangButton(currentLang);
        // Re-render gallery with new language
        if (allImages.length > 0) {
            renderGallery(allImages);
        }
    });

    function updateLangButton(lang) {
        if (lang === 'en') {
            langCurrent.textContent = 'EN';
            langOther.textContent = 'HR';
        } else {
            langCurrent.textContent = 'HR';
            langOther.textContent = 'EN';
        }
    }
}

function applyLanguage(lang) {
    document.documentElement.lang = lang;

    const t = translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t[key];
            } else if (el.tagName === 'TITLE') {
                document.title = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        const descriptions = {
            en: "Professional portfolio showcasing creative work in photography, design, and digital art. View my latest projects and get in touch.",
            hr: "Profesionalni portfolio koji prikazuje kreativne radove u fotografiji, dizajnu i digitalnoj umjetnosti. Pogledajte moje najnovije projekte i kontaktirajte me."
        };
        metaDesc.setAttribute('content', descriptions[lang]);
    }
}

// =============================================
// Back to top button
// =============================================
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =============================================
// Shuffle array (Fisher-Yates algorithm)
// =============================================
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// =============================================
// Load and render gallery from images.json
// =============================================
async function loadGallery() {
    try {
        const response = await fetch('images.json');
        const data = await response.json();
        allImages = shuffleArray(data.images);
        renderGallery(allImages);
        initGalleryFilter();
        initLightbox();

        // Preload all images in background for smooth category switching
        preloadAllImages(data.images);
    } catch (error) {
        console.error('Error loading images:', error);
        // Show placeholder message if images.json fails to load
        const grid = document.getElementById('galleryGrid');
        if (grid) {
            grid.innerHTML = '<p style="padding: 2rem; text-align: center; color: #888;">Add images to images.json to display your gallery.</p>';
        }
    }
}

// =============================================
// Preload all images for smooth category switching
// =============================================
function preloadAllImages(images) {
    // Wait a bit before starting preload to not interfere with initial render
    setTimeout(() => {
        console.log('Starting background image preload...');

        // Filter out 'about' category as it's not shown in gallery
        const galleryImages = images.filter(img => img.category !== 'about');

        // Preload in batches to avoid overwhelming the browser
        const batchSize = 10;
        let currentIndex = 0;

        function preloadBatch() {
            const batch = galleryImages.slice(currentIndex, currentIndex + batchSize);

            batch.forEach(imageData => {
                const img = new Image();
                img.src = imageData.src;
            });

            currentIndex += batchSize;

            // Schedule next batch
            if (currentIndex < galleryImages.length) {
                setTimeout(preloadBatch, 200); // 200ms delay between batches
            } else {
                console.log(`Preloaded ${galleryImages.length} images for smooth navigation`);
            }
        }

        preloadBatch();
    }, 2000); // Start preloading 2 seconds after initial load
}

function renderGallery(images, filter = 'all') {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    // Filter images - exclude "about" category from main gallery
    let filteredImages = images.filter(img => img.category !== 'about');

    if (filter !== 'all') {
        filteredImages = filteredImages.filter(img => img.category === filter);
    }

    // Update mobile gallery slideshow
    updateMobileGallerySlideshow(filteredImages);

    // Distribute images into 4 columns for masonry effect
    const columns = [[], [], [], []];
    filteredImages.forEach((img, index) => {
        columns[index % 4].push(img);
    });

    // Build HTML
    let html = '';
    columns.forEach((columnImages) => {
        html += '<div class="masonry-column">';
        columnImages.forEach(img => {
            const title = currentLang === 'hr' && img.title_hr ? img.title_hr : img.title;
            const aspectRatio = getAspectRatio(img.aspect);

            html += `
                <div class="gallery-item" data-category="${img.category}" data-title="${title}" data-src="${img.src}" style="padding-bottom: ${aspectRatio};">
                    <div class="gallery-image">
                        <img src="${img.src}" alt="${title}" loading="lazy" onerror="var p=this.parentElement.parentElement; p.querySelector('.gallery-image').innerHTML='<div class=\\'image-placeholder\\'><span>${title}</span></div>'; p.querySelector('.gallery-overlay').style.display='none';">
                    </div>
                    <div class="gallery-overlay">
                        <h3>${title}</h3>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    });

    grid.innerHTML = html;
}

function getAspectRatio(aspect) {
    const ratios = {
        'portrait': '140%',
        'square': '100%',
        'landscape': '75%',
        'wide': '56%'
    };
    return ratios[aspect] || '75%';
}

function updateMobileGallerySlideshow(images) {
    const slideshow = document.getElementById('gallerySlideshow');
    const dotsContainer = document.getElementById('gallerySlideshowDots');
    const lightbox = document.getElementById('lightbox');

    if (!slideshow || !dotsContainer) return;

    // Clear existing slides and dots
    slideshow.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Create slides
    images.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        const title = currentLang === 'hr' && img.title_hr ? img.title_hr : img.title;
        slide.innerHTML = `<img src="${img.src}" alt="${title}" loading="lazy" data-index="${index}" data-src="${img.src}" data-title="${title}" data-category="${img.category}">`;

        // Add click event to open in fullscreen lightbox
        slide.addEventListener('click', () => {
            if (!lightbox) return;

            const lightboxTitle = lightbox.querySelector('.lightbox-title');
            const lightboxCategory = lightbox.querySelector('.lightbox-category');
            const lightboxImage = lightbox.querySelector('.lightbox-image');

            if (lightboxTitle && lightboxCategory && lightboxImage) {
                lightboxTitle.textContent = title;
                lightboxCategory.textContent = img.category.charAt(0).toUpperCase() + img.category.slice(1);

                lightboxImage.innerHTML = `
                    <div class="lightbox-image-wrapper">
                        <img src="${img.src}" alt="${title}">
                    </div>
                `;

                const wrapper = lightboxImage.querySelector('.lightbox-image-wrapper');
                const info = lightbox.querySelector('.lightbox-info');
                if (wrapper && info) {
                    wrapper.appendChild(info);
                }

                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';

                // Auto-enter fullscreen on mobile
                setTimeout(() => {
                    if (lightbox.requestFullscreen) {
                        lightbox.requestFullscreen();
                    } else if (lightbox.webkitRequestFullscreen) {
                        lightbox.webkitRequestFullscreen();
                    } else if (lightbox.mozRequestFullScreen) {
                        lightbox.mozRequestFullScreen();
                    } else if (lightbox.msRequestFullscreen) {
                        lightbox.msRequestFullscreen();
                    }
                }, 100);
            }
        });

        slideshow.appendChild(slide);
    });

    // Initialize slideshow if we have slides
    if (images.length > 0) {
        initMobileGallerySlideshow();
    }
}

function initMobileGallerySlideshow() {
    const track = document.getElementById('gallerySlideshow');
    const dotsContainer = document.getElementById('gallerySlideshowDots');
    const prevBtn = document.getElementById('gallerySlideshowPrev');
    const nextBtn = document.getElementById('gallerySlideshowNext');

    if (!track || !dotsContainer) return;

    const slides = track.querySelectorAll('.slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    let autoplayInterval;
    let touchStartX = 0;
    let touchEndX = 0;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'slideshow-dot' + (index === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slideshow-dot');

    function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${index * 100}%)`;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }

    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prev);
    }

    // Auto-play every 4 seconds
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Touch gesture support for swipe left/right
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
    });

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left, go to next slide
                nextSlide();
            } else {
                // Swiped right, go to previous slide
                prevSlide();
            }
        }
    }

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Add button event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoplay();
            prevSlide();
            startAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoplay();
            nextSlide();
            startAutoplay();
        });
    }

    // Start autoplay
    startAutoplay();
}

// =============================================
// Gallery filter - filter by category via nav
// =============================================
function initGalleryFilter() {
    const navLinks = document.querySelectorAll('.nav-link[data-filter]');
    const logo = document.querySelector('.logo');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const filter = link.getAttribute('data-filter');
            renderGallery(allImages, filter);

            // Scroll to top of gallery when switching sections
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Re-init lightbox for new items
            initLightbox();

            closeMobileMenu();
        });
    });

    // Logo click shows all galleries
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active state from all nav links
            navLinks.forEach(l => l.classList.remove('active'));

            // Show all galleries
            renderGallery(allImages, 'all');

            // Scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Re-init lightbox for new items
            initLightbox();

            closeMobileMenu();
        });
    }
}

// =============================================
// Lightbox
// =============================================
// Store lightbox state globally to prevent re-initialization issues
let lightboxState = {
    currentItemIndex: 0,
    isFullscreen: false,
    initialized: false,
    zoomLevel: 1,
    isDragging: false,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0,
    touchStartX: 0,
    touchStartY: 0
};

// Global function to update image transform for zoom
function updateImageTransform(img) {
    if (!img) return;

    const cursor = lightboxState.zoomLevel > 1 ? 'grab' : 'zoom-in';
    img.style.cursor = cursor;
    img.style.transform = `scale(${lightboxState.zoomLevel}) translate(${lightboxState.translateX / lightboxState.zoomLevel}px, ${lightboxState.translateY / lightboxState.zoomLevel}px)`;
    img.style.transition = lightboxState.isDragging ? 'none' : 'transform 0.2s ease';
}

// Global function to setup zoom controls on an image
function setupZoomControls(img) {
    // Mouse wheel zoom
    img.addEventListener('wheel', (e) => {
        if (!lightboxState.isFullscreen) return;
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        lightboxState.zoomLevel = Math.min(Math.max(1, lightboxState.zoomLevel + delta), 4);

        updateImageTransform(img);
    });

    // Click to toggle zoom
    img.addEventListener('click', (e) => {
        if (!lightboxState.isFullscreen) return;
        e.stopPropagation();

        if (lightboxState.zoomLevel === 1) {
            lightboxState.zoomLevel = 2;
        } else {
            lightboxState.zoomLevel = 1;
            lightboxState.translateX = 0;
            lightboxState.translateY = 0;
        }

        updateImageTransform(img);
    });

    // Drag to pan when zoomed
    img.addEventListener('mousedown', (e) => {
        if (!lightboxState.isFullscreen || lightboxState.zoomLevel === 1) return;
        e.preventDefault();

        lightboxState.isDragging = true;
        lightboxState.startX = e.clientX - lightboxState.translateX;
        lightboxState.startY = e.clientY - lightboxState.translateY;
        img.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!lightboxState.isDragging) return;

        lightboxState.translateX = e.clientX - lightboxState.startX;
        lightboxState.translateY = e.clientY - lightboxState.startY;

        updateImageTransform(img);
    });

    document.addEventListener('mouseup', () => {
        if (lightboxState.isDragging) {
            lightboxState.isDragging = false;
            if (img) {
                img.style.cursor = lightboxState.zoomLevel > 1 ? 'grab' : 'zoom-in';
            }
        }
    });

    // Touch pinch zoom for mobile
    let initialDistance = 0;
    let initialZoom = 1;

    img.addEventListener('touchstart', (e) => {
        if (!lightboxState.isFullscreen) return;
        if (e.touches.length === 2) {
            e.preventDefault();
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialZoom = lightboxState.zoomLevel;
        }
    });

    img.addEventListener('touchmove', (e) => {
        if (!lightboxState.isFullscreen) return;
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const scale = currentDistance / initialDistance;
            lightboxState.zoomLevel = Math.min(Math.max(1, initialZoom * scale), 4);
            updateImageTransform(img);
        }
    });
}

// Global toggleFullscreen function
function toggleFullscreen() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    if (!document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement) {
        // Enter fullscreen
        if (lightbox.requestFullscreen) {
            lightbox.requestFullscreen();
        } else if (lightbox.webkitRequestFullscreen) {
            lightbox.webkitRequestFullscreen();
        } else if (lightbox.mozRequestFullScreen) {
            lightbox.mozRequestFullScreen();
        } else if (lightbox.msRequestFullscreen) {
            lightbox.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Global updateFullscreenButton function
function updateFullscreenButton() {
    const currentFullscreen = document.getElementById('lightboxFullscreen');
    if (!currentFullscreen) return;

    const expandIcon = currentFullscreen.querySelector('.fullscreen-icon-expand');
    const collapseIcon = currentFullscreen.querySelector('.fullscreen-icon-collapse');

    lightboxState.isFullscreen = !!(document.fullscreenElement ||
                     document.webkitFullscreenElement ||
                     document.mozFullScreenElement ||
                     document.msFullscreenElement);

    if (lightboxState.isFullscreen) {
        if (expandIcon) expandIcon.style.display = 'none';
        if (collapseIcon) collapseIcon.style.display = 'block';
    } else {
        if (expandIcon) expandIcon.style.display = 'block';
        if (collapseIcon) collapseIcon.style.display = 'none';
    }
}

// Global closeLightbox function
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    // Exit fullscreen if active
    if (lightboxState.isFullscreen) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Global displayItem function so it can be called from anywhere
function displayLightboxItem(index) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    if (!lightboxImage) return;

    const galleryItemsArray = Array.from(document.querySelectorAll('.gallery-item'));
    if (galleryItemsArray.length === 0) return;

    lightboxState.currentItemIndex = (index + galleryItemsArray.length) % galleryItemsArray.length;
    const item = galleryItemsArray[lightboxState.currentItemIndex];

    const title = item.getAttribute('data-title') || '';
    const category = item.getAttribute('data-category') || '';
    const src = item.getAttribute('data-src') || '';

    // Reset zoom and position when changing images
    lightboxState.zoomLevel = 1;
    lightboxState.translateX = 0;
    lightboxState.translateY = 0;

    // Show image in lightbox with wrapper and info (recreate info each time)
    if (src) {
        lightboxImage.innerHTML = `
            <div class="lightbox-image-wrapper">
                <img src="${src}" alt="${title}" style="transform: scale(1) translate(0, 0); cursor: zoom-in;">
                <div class="lightbox-info">
                    <h3 class="lightbox-title">${title}</h3>
                    <p class="lightbox-category">${category.charAt(0).toUpperCase() + category.slice(1)}</p>
                </div>
            </div>
        `;

        // Add zoom functionality to the image
        const wrapper = lightboxImage.querySelector('.lightbox-image-wrapper');
        const img = wrapper ? wrapper.querySelector('img') : null;
        if (img) {
            setupZoomControls(img);
        }
    }
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    // Use event delegation for gallery items - attach to parent container
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid && !galleryGrid.hasAttribute('data-lightbox-init')) {
        galleryGrid.setAttribute('data-lightbox-init', 'true');
        galleryGrid.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (!galleryItem) return;

            // Get current array of visible items when opening lightbox
            const currentGalleryItems = Array.from(document.querySelectorAll('.gallery-item'));
            lightboxState.currentItemIndex = currentGalleryItems.indexOf(galleryItem);

            displayLightboxItem(lightboxState.currentItemIndex);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Auto-enter fullscreen on mobile devices
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    toggleFullscreen();
                }, 100);
            }
        });
    }

    // Setup lightbox controls only once
    if (!lightboxState.initialized) {
        // Navigation buttons - use onclick to replace any previous handler
        const prevBtn = document.getElementById('lightboxPrev');
        const nextBtn = document.getElementById('lightboxNext');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const fullscreenBtn = document.getElementById('lightboxFullscreen');

        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.stopPropagation();
                displayLightboxItem(lightboxState.currentItemIndex - 1);
            };
        }

        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                displayLightboxItem(lightboxState.currentItemIndex + 1);
            };
        }

        if (closeBtn) {
            closeBtn.onclick = closeLightbox;
        }

        if (fullscreenBtn) {
            fullscreenBtn.onclick = toggleFullscreen;
        }

        // Setup lightbox background click to close
        lightbox.onclick = (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        };

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                displayLightboxItem(lightboxState.currentItemIndex - 1);
            } else if (e.key === 'ArrowRight') {
                displayLightboxItem(lightboxState.currentItemIndex + 1);
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            }
        });

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
        document.addEventListener('mozfullscreenchange', updateFullscreenButton);
        document.addEventListener('MSFullscreenChange', updateFullscreenButton);

        // Add swipe gesture navigation for lightbox (mobile)
        lightbox.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                lightboxState.touchStartX = e.touches[0].clientX;
                lightboxState.touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1 && lightboxState.zoomLevel === 1) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const diffX = lightboxState.touchStartX - touchEndX;
                const diffY = lightboxState.touchStartY - touchEndY;

                // Only trigger swipe if horizontal movement is greater than vertical
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        // Swiped left - next image
                        displayLightboxItem(lightboxState.currentItemIndex + 1);
                    } else {
                        // Swiped right - previous image
                        displayLightboxItem(lightboxState.currentItemIndex - 1);
                    }
                }
            }
        }, { passive: true });

        lightboxState.initialized = true;
    }
}

// =============================================
// Contact form handling
// =============================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = form.querySelector('#name').value;
        const email = form.querySelector('#email').value;
        const message = form.querySelector('#message').value;

        if (!name || !email || !message) {
            const errorMessage = currentLang === 'en'
                ? 'Please fill in all fields.'
                : 'Molimo ispunite sva polja.';
            alert(errorMessage);
            return;
        }

        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = currentLang === 'en' ? 'Sending...' : 'Slanje...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const successMessage = currentLang === 'en'
                    ? 'Thank you for your message! I will get back to you soon.'
                    : 'Hvala na poruci! Javit ću vam se uskoro.';
                alert(successMessage);
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            const errorMessage = currentLang === 'en'
                ? 'Oops! Something went wrong. Please try again or email me directly.'
                : 'Ups! Nešto je pošlo po zlu. Pokušajte ponovo ili mi pošaljite email direktno.';
            alert(errorMessage);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// =============================================
// Set current year in footer
// =============================================
function setCurrentYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// =============================================
// About Slideshow
// =============================================
function initSlideshow() {
    const track = document.getElementById('slideshowTrack');
    const dotsContainer = document.getElementById('slideshowDots');

    if (!track || !dotsContainer) return;

    const slides = track.querySelectorAll('.slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    let autoplayInterval;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'slideshow-dot' + (index === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slideshow-dot');

    function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${index * 100}%)`;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }

    // Auto-play every 4 seconds
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Start autoplay
    startAutoplay();
}
