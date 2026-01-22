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
// Load and render gallery from images.json
// =============================================
async function loadGallery() {
    try {
        const response = await fetch('images.json');
        const data = await response.json();
        allImages = data.images;
        renderGallery(allImages);
        initGalleryFilter();
        initLightbox();
    } catch (error) {
        console.error('Error loading images:', error);
        // Show placeholder message if images.json fails to load
        const grid = document.getElementById('galleryGrid');
        if (grid) {
            grid.innerHTML = '<p style="padding: 2rem; text-align: center; color: #888;">Add images to images.json to display your gallery.</p>';
        }
    }
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
    columns.forEach((columnImages, colIndex) => {
        html += '<div class="masonry-column">';
        columnImages.forEach(img => {
            const title = currentLang === 'hr' && img.title_hr ? img.title_hr : img.title;
            const aspectRatio = getAspectRatio(img.aspect);

            html += `
                <div class="gallery-item" data-category="${img.category}" data-title="${title}" data-src="${img.src}" style="padding-bottom: ${aspectRatio};">
                    <div class="gallery-image">
                        <img src="${img.src}" alt="${title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'><span>${title}</span></div>'; this.parentElement.parentElement.querySelector('.gallery-overlay').style.display='none';">
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

    if (!slideshow || !dotsContainer) return;

    // Clear existing slides and dots
    slideshow.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Create slides
    images.forEach(img => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        const title = currentLang === 'hr' && img.title_hr ? img.title_hr : img.title;
        slide.innerHTML = `<img src="${img.src}" alt="${title}" loading="lazy">`;
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

// =============================================
// Gallery filter - filter by category via nav
// =============================================
function initGalleryFilter() {
    const navLinks = document.querySelectorAll('.nav-link[data-filter]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const filter = link.getAttribute('data-filter');
            renderGallery(allImages, filter);

            // Re-init lightbox for new items
            initLightbox();

            closeMobileMenu();
        });
    });
}

// =============================================
// Lightbox
// =============================================
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxTitle = lightbox.querySelector('.lightbox-title');
    const lightboxCategory = lightbox.querySelector('.lightbox-category');
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.getAttribute('data-title') || '';
            const category = item.getAttribute('data-category') || '';
            const src = item.getAttribute('data-src') || '';

            lightboxTitle.textContent = title;
            lightboxCategory.textContent = category.charAt(0).toUpperCase() + category.slice(1);

            // Show image in lightbox
            if (src) {
                lightboxImage.innerHTML = `<img src="${src}" alt="${title}" style="max-width: 100%; max-height: 70vh; object-fit: contain;">`;
            }

            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Remove old listeners and add new ones
    const newClose = lightboxClose.cloneNode(true);
    lightboxClose.parentNode.replaceChild(newClose, lightboxClose);

    newClose.addEventListener('click', closeLightbox);

    lightbox.onclick = (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    };

    document.onkeydown = (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    };

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// =============================================
// Contact form handling
// =============================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = form.querySelector('#name').value;
        const email = form.querySelector('#email').value;
        const message = form.querySelector('#message').value;

        if (!name || !email || !message) {
            alert('Please fill in all fields.');
            return;
        }

        const successMessage = currentLang === 'en'
            ? 'Thank you for your message! I will get back to you soon.'
            : 'Hvala na poruci! Javit ću vam se uskoro.';

        alert(successMessage);
        form.reset();
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
