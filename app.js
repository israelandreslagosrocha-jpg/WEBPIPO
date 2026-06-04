/**
 * TINTA CONECTADA - APPLICATION LOGIC
 * High-fidelity Single Page Application (SPA) Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // App state
    const state = {
        currentView: 'home-view',
        favorites: new Set(),
        activeFilters: {
            location: 'all',
            styles: new Set(),
            experience: 'all',
            price: 'all',
            availability: new Set(),
            category: 'Todos',
            distance: 105
        },
        carouselIndex: 1, // Start at active image
        // Portfolio pictures mapping for Studio Tatto Pipo
        portfolio: {
            tatuajes: [
                { src: 'assets/tattoo_flower.png', title: 'Diseño Botánico Fine Line' },
                { src: 'assets/tattoo_butterfly.png', title: 'Composición de Mariposas' },
                { src: 'assets/tattoo_alien.png', title: 'Ilustración Alien Sketch' },
                { src: 'assets/tattoo_mandala.png', title: 'Geométrico Mandala' }
            ],
            brazo: [
                { src: 'assets/tattoo_flower.png', title: 'Diseño Botánico Fine Line' },
                { src: 'assets/tattoo_butterfly.png', title: 'Composición de Mariposas' }
            ],
            manos: [
                { src: 'assets/tattoo_mandala.png', title: 'Geométrico Mandala' }
            ],
            torso: [
                { src: 'assets/tattoo_lion.png', title: 'León Realista' }
            ],
            piernas: [
                { src: 'assets/tattoo_anime.png', title: 'Anime Goku Color' }
            ]
        }
    };

    // DOM ELEMENTS
    const viewPanels = document.querySelectorAll('.view-panel');
    const navLinks = document.querySelectorAll('.nav-link');
    const btnLogoHome = document.getElementById('btn-logo-home');
    const artistCards = document.querySelectorAll('.artist-card');
    const btnBackHome = document.getElementById('btn-back-home');
    const btnArtistsNav = document.getElementById('nav-btn-artists');
    const btnViewAllArtists = document.getElementById('btn-view-all-artists');
    
    // Drawers & Overlays
    const overlayFilterArtists = document.getElementById('overlay-filter-artists');
    const overlayArtistInfo = document.getElementById('overlay-artist-info');
    const btnGlobalFilter = document.getElementById('btn-global-filter');
    const btnProfileFilters = document.getElementById('btn-profile-filters');
    const btnCloseFilterArtists = document.getElementById('btn-close-filter-artists');
    const btnCloseArtistInfo = document.getElementById('btn-close-artist-info');
    const btnApplyArtistFilters = document.getElementById('btn-apply-artist-filters');
    const triggerInfoDrawer = document.getElementById('trigger-info-drawer');
    const inputDistance = document.getElementById('input-distance');
    const valDistance = document.getElementById('val-distance');
    
    // Sidebar Filters
    const sidebarFilters = document.getElementById('sidebar-filters');
    const btnMenuToggle = document.getElementById('btn-menu-toggle');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    const filterLocation = document.getElementById('filter-location');
    const btnStyles = document.querySelectorAll('.btn-style:not(.btn-more-styles)');
    const btnExperiences = document.querySelectorAll('.btn-experience');
    const btnPrices = document.querySelectorAll('.btn-price');
    const checkAvailWeek = document.getElementById('avail-week');
    const checkAvailMonth = document.getElementById('avail-month');
    const btnApplyFilters = document.getElementById('btn-apply-filters');
    const btnClearFilters = document.getElementById('btn-clear-filters');
    
    // Categories Carousel
    const btnCategories = document.querySelectorAll('.btn-category');
    
    // Search bar
    const searchInput = document.getElementById('search-input');
    const btnSearchTrigger = document.getElementById('btn-search-trigger');
    
    // Carousel 3D
    const carouselItems = document.querySelectorAll('.carousel-3d-item');
    const btnCarouselPrev = document.getElementById('btn-carousel-prev');
    const btnCarouselNext = document.getElementById('btn-carousel-next');
    
    // Tabs & Gallery
    const tabLinks = document.querySelectorAll('.tab-link');
    const galleryGrid = document.getElementById('tab-gallery-grid');
    
    // Interactive Map
    const btnToggleMapExpand = document.getElementById('btn-toggle-map-expand');
    const mapWrapper = document.querySelector('.map-container-wrapper');
    let mapInstance = null;
    let markersGroup = [];

    // ==========================================================================
    // 1. VIEW NAVIGATION (SPA SWITCHES)
    // ==========================================================================
    function switchView(targetViewId) {
        state.currentView = targetViewId;
        
        // Hide all views with class transitions
        viewPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Show target panel
        const targetPanel = document.getElementById(targetViewId);
        if (targetPanel) {
            targetPanel.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Sync header nav-links
        navLinks.forEach(link => {
            if (link.getAttribute('data-target') === targetViewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // If switching to home view, refresh map rendering
        if (targetViewId === 'home-view' && mapInstance) {
            setTimeout(() => {
                mapInstance.invalidateSize();
            }, 400);
        }
        
        // If switching to artist view, render default tab
        if (targetViewId === 'artist-view') {
            renderGalleryTab('tatuajes');
            setupCarousel3D();
        }
    }

    // Nav actions
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            if (target) switchView(target);
        });
    });

    btnLogoHome.addEventListener('click', () => switchView('home-view'));
    btnBackHome.addEventListener('click', () => switchView('home-view'));
    btnArtistsNav.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('home-view');
        // Scroll to artist grid
        document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth' });
    });
    btnViewAllArtists.addEventListener('click', (e) => {
        e.preventDefault();
        // Clear style filters to show all
        clearAllFilters();
        document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth' });
    });

    // Handle artist card click to navigate to Pipo's profile
    artistCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Check if user clicked the favorite heart button
            if (e.target.closest('.btn-favorite')) {
                return;
            }
            
            const artistId = card.getAttribute('data-id');
            // For this premium prototype, all cards can navigate to Pipo's detail profile
            // to show off the custom carousel 3D, tabs, info panel, etc.
            switchView('artist-view');
            
            // Customize details based on card clicked (e.g. title, avatar)
            if (artistId !== 'pipo') {
                const name = card.querySelector('.artist-name').textContent;
                const loc = card.querySelector('.artist-loc').textContent.trim();
                const avatarSrc = card.querySelector('.artist-avatar-circle img').src;
                
                document.querySelector('.profile-name').textContent = name;
                document.querySelector('.profile-location').innerHTML = `<i data-lucide="map-pin"></i> ${loc}`;
                document.querySelector('.profile-avatar-img').src = avatarSrc;
                document.querySelector('.info-title').textContent = name;
                document.querySelector('.info-avatar-circle img').src = avatarSrc;
                lucide.createIcons();
            } else {
                // Restore default Pipo details
                document.querySelector('.profile-name').textContent = "Studio tatto pipo";
                document.querySelector('.profile-location').innerHTML = `<i data-lucide="map-pin"></i> Teodoro Schmidt`;
                document.querySelector('.profile-avatar-img').src = "assets/logo_pipo.png";
                document.querySelector('.info-title').textContent = "Studio tatto pipo";
                document.querySelector('.info-avatar-circle img').src = "assets/logo_pipo.png";
                lucide.createIcons();
            }
        });
    });

    // Soy tatuador alert
    document.getElementById('btn-soy-tatuador').addEventListener('click', () => {
        showToast('¡Pronto! Formulario de registro para artistas se abrirá en la versión final.');
    });

    // ==========================================================================
    // 2. INTERACTIVE SIDEBAR FILTERS (HOME VIEW)
    // ==========================================================================
    // Toggle Mobile Sidebar Drawer
    btnMenuToggle.addEventListener('click', () => {
        sidebarFilters.classList.add('mobile-open');
    });
    btnCloseSidebar.addEventListener('click', () => {
        sidebarFilters.classList.remove('mobile-open');
    });

    // Filter Logic: Location dropdown
    filterLocation.addEventListener('change', (e) => {
        state.activeFilters.location = e.target.value;
    });

    // Style button clicks
    btnStyles.forEach(btn => {
        btn.addEventListener('click', () => {
            const style = btn.getAttribute('data-style');
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                state.activeFilters.styles.delete(style);
            } else {
                btn.classList.add('active');
                state.activeFilters.styles.add(style);
            }
        });
    });

    // Experience button clicks (Single choice)
    btnExperiences.forEach(btn => {
        btn.addEventListener('click', () => {
            const exp = btn.getAttribute('data-exp');
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                state.activeFilters.experience = 'all';
            } else {
                btn.classList.remove('active');
                btnExperiences.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.activeFilters.experience = exp;
            }
        });
    });

    // Price button clicks (Single choice)
    btnPrices.forEach(btn => {
        btn.addEventListener('click', () => {
            const price = btn.getAttribute('data-price');
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                state.activeFilters.price = 'all';
            } else {
                btnPrices.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.activeFilters.price = price;
            }
        });
    });

    // Availability Checkboxes
    checkAvailWeek.addEventListener('change', (e) => {
        if (e.target.checked) state.activeFilters.availability.add('week');
        else state.activeFilters.availability.delete('week');
    });
    checkAvailMonth.addEventListener('change', (e) => {
        if (e.target.checked) state.activeFilters.availability.add('month');
        else state.activeFilters.availability.delete('month');
    });

    // Apply button
    btnApplyFilters.addEventListener('click', () => {
        applyFilters();
        sidebarFilters.classList.remove('mobile-open'); // Close drawer on mobile
        showToast('Filtros aplicados con éxito');
    });

    // Clear filters
    btnClearFilters.addEventListener('click', (e) => {
        e.preventDefault();
        clearAllFilters();
        showToast('Filtros restablecidos');
    });

    function clearAllFilters() {
        filterLocation.value = 'all';
        state.activeFilters.location = 'all';
        
        btnStyles.forEach(b => b.classList.remove('active'));
        state.activeFilters.styles.clear();
        
        btnExperiences.forEach(b => b.classList.remove('active'));
        state.activeFilters.experience = 'all';
        
        btnPrices.forEach(b => b.classList.remove('active'));
        state.activeFilters.price = 'all';
        
        checkAvailWeek.checked = false;
        checkAvailMonth.checked = false;
        state.activeFilters.availability.clear();

        state.activeFilters.category = 'Todos';
        btnCategories.forEach(b => {
            if (b.getAttribute('data-category') === 'Todos') b.classList.add('active');
            else b.classList.remove('active');
        });
        
        if (searchInput) searchInput.value = '';
        
        applyFilters();
    }

    // Apply Filter Logic to Card DOM elements
    function applyFilters() {
        let visibleCount = 0;
        
        artistCards.forEach(card => {
            const cardLocation = card.getAttribute('data-location');
            const cardPrice = card.getAttribute('data-price');
            const cardExp = parseInt(card.getAttribute('data-exp'));
            
            // Read array-like style list string
            const rawStyles = card.getAttribute('data-styles') || '';
            const cardStyles = eval(rawStyles); // Convert string to Array
            
            let showCard = true;

            // 1. Location filter
            if (state.activeFilters.location !== 'all' && state.activeFilters.location !== cardLocation) {
                // Check if card is 'Studio Tatto Pipo' under Temuco but cardDetailed lists Teodoro Schmidt
                if (!(state.activeFilters.location === 'Temuco' && cardLocation === 'Teodoro Schmidt')) {
                    showCard = false;
                }
            }

            // 2. Style filter
            if (state.activeFilters.styles.size > 0) {
                let hasMatchingStyle = false;
                cardStyles.forEach(s => {
                    if (state.activeFilters.styles.has(s)) hasMatchingStyle = true;
                });
                if (!hasMatchingStyle) showCard = false;
            }

            // 3. Category Filter (from Horizontal Scrollbar)
            if (state.activeFilters.category !== 'Todos') {
                if (!cardStyles.includes(state.activeFilters.category)) {
                    showCard = false;
                }
            }

            // 4. Experience filter
            if (state.activeFilters.experience !== 'all') {
                if (state.activeFilters.experience === '0-2' && cardExp > 2) showCard = false;
                if (state.activeFilters.experience === '3-5' && (cardExp < 3 || cardExp > 5)) showCard = false;
                if (state.activeFilters.experience === '5-10' && (cardExp < 5 || cardExp > 10)) showCard = false;
                if (state.activeFilters.experience === '10+' && cardExp < 10) showCard = false;
            }

            // 5. Price filter
            if (state.activeFilters.price !== 'all' && state.activeFilters.price !== cardPrice) {
                showCard = false;
            }

            // 6. Search input text
            const searchVal = searchInput.value.toLowerCase().trim();
            if (searchVal !== '') {
                const cardName = card.querySelector('.artist-name').textContent.toLowerCase();
                const matchedStyle = cardStyles.some(s => s.toLowerCase().includes(searchVal));
                const matchedLoc = cardLocation.toLowerCase().includes(searchVal);
                if (!cardName.includes(searchVal) && !matchedStyle && !matchedLoc) {
                    showCard = false;
                }
            }

            // Toggle element visibility
            if (showCard) {
                card.style.display = 'flex';
                card.style.opacity = '0';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.3s ease';
                    card.style.opacity = '1';
                }, 10);
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Toggle map marker visibility based on current card visibility
        markersGroup.forEach(item => {
            const cardId = item.id;
            const matchingCard = document.querySelector(`.artist-card[data-id="${cardId}"]`);
            if (matchingCard && matchingCard.style.display !== 'none') {
                item.marker.addTo(mapInstance);
            } else {
                mapInstance.removeLayer(item.marker);
            }
        });
    }

    // ==========================================================================
    // 3. CATEGORIES CAROUSEL TAB CLICKS
    // ==========================================================================
    btnCategories.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-category');
            if (!cat) return; // 'Ver más' handles overlay
            
            btnCategories.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.activeFilters.category = cat;
            applyFilters();
        });
    });

    document.getElementById('btn-more-categories').addEventListener('click', () => {
        toggleDrawer(overlayFilterArtists, true);
    });

    // ==========================================================================
    // 4. SEARCH TRIGGER
    // ==========================================================================
    btnSearchTrigger.addEventListener('click', () => {
        applyFilters();
        document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth' });
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
            document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // ==========================================================================
    // 5. DRAWERS & MODALS INTERACTIVITY
    // ==========================================================================
    function toggleDrawer(drawerElement, show) {
        if (show) {
            drawerElement.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock scroll
        } else {
            drawerElement.classList.remove('active');
            document.body.style.overflow = ''; // Unlock scroll
        }
    }

    // Open/Close Handlers
    btnGlobalFilter.addEventListener('click', () => toggleDrawer(overlayFilterArtists, true));
    btnProfileFilters.addEventListener('click', () => toggleDrawer(overlayFilterArtists, true));
    btnCloseFilterArtists.addEventListener('click', () => toggleDrawer(overlayFilterArtists, false));
    
    // Close on overlay backdrop clicks
    overlayFilterArtists.addEventListener('click', (e) => {
        if (e.target === overlayFilterArtists) toggleDrawer(overlayFilterArtists, false);
    });
    overlayArtistInfo.addEventListener('click', (e) => {
        if (e.target === overlayArtistInfo) toggleDrawer(overlayArtistInfo, false);
    });

    // Distance Slider text update
    inputDistance.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (val > 100) {
            valDistance.textContent = 'Sin límite';
            state.activeFilters.distance = 105;
        } else {
            valDistance.textContent = `${val} km`;
            state.activeFilters.distance = val;
        }
    });

    // Apply button inside Filtrar Artistas Drawer
    btnApplyArtistFilters.addEventListener('click', () => {
        // Collect checkbox states
        const activeToggles = {
            puntillismo: document.getElementById('toggle-puntillismo').checked,
            blackwork: document.getElementById('toggle-blackwork').checked,
            realismo: document.getElementById('toggle-realismo').checked,
            blackGrey: document.getElementById('toggle-black-grey').checked,
            acuarela: document.getElementById('toggle-acuarela').checked,
            fineline: document.getElementById('toggle-fineline').checked
        };

        // Sync sidebar active styles
        state.activeFilters.styles.clear();
        btnStyles.forEach(btn => btn.classList.remove('active'));

        if (activeToggles.blackwork) {
            state.activeFilters.styles.add('Blackwork');
            document.querySelector('.btn-style[data-style="Blackwork"]').classList.add('active');
        }
        if (activeToggles.realismo) {
            state.activeFilters.styles.add('Realismo');
            document.querySelector('.btn-style[data-style="Realismo"]').classList.add('active');
        }
        if (activeToggles.fineline) {
            state.activeFilters.styles.add('Fine Line');
            document.querySelector('.btn-style[data-style="Fine Line"]').classList.add('active');
        }
        if (activeToggles.acuarela) {
            state.activeFilters.styles.add('Acuarela');
            document.querySelector('.btn-style[data-style="Acuarela"]').classList.add('active');
        }

        applyFilters();
        toggleDrawer(overlayFilterArtists, false);
        showToast('Filtros de artistas aplicados');
    });

    // Artist Info Drawer Tabs (Image 2)
    triggerInfoDrawer.addEventListener('click', () => {
        toggleDrawer(overlayArtistInfo, true);
    });
    btnCloseArtistInfo.addEventListener('click', () => {
        toggleDrawer(overlayArtistInfo, false);
    });

    const infoActionLinks = document.querySelectorAll('.info-action-link');
    const infoSubSections = document.querySelectorAll('.info-sub-section');

    infoActionLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetSection = link.getAttribute('data-section');
            
            // Toggle active states of links
            infoActionLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Toggle panel displays
            infoSubSections.forEach(sec => {
                if (sec.id === `sec-${targetSection}`) {
                    sec.classList.add('active');
                } else {
                    sec.classList.remove('active');
                }
            });
        });
    });

    // ==========================================================================
    // 6. PORTFOLIO CAROUSEL 3D (ARTIST VIEW)
    // ==========================================================================
    function setupCarousel3D() {
        updateCarouselDOM();
    }

    function updateCarouselDOM() {
        const totalItems = carouselItems.length;
        
        carouselItems.forEach((item, index) => {
            item.className = 'carousel-3d-item'; // Reset class names
            
            if (index === state.carouselIndex) {
                item.classList.add('active');
            } else if (index === (state.carouselIndex - 1 + totalItems) % totalItems) {
                item.classList.add('prev');
            } else if (index === (state.carouselIndex + 1) % totalItems) {
                item.classList.add('next');
            }
        });
    }

    btnCarouselPrev.addEventListener('click', () => {
        const totalItems = carouselItems.length;
        state.carouselIndex = (state.carouselIndex - 1 + totalItems) % totalItems;
        updateCarouselDOM();
    });

    btnCarouselNext.addEventListener('click', () => {
        const totalItems = carouselItems.length;
        state.carouselIndex = (state.carouselIndex + 1) % totalItems;
        updateCarouselDOM();
    });

    // Click carousel item to trigger centering
    carouselItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (state.carouselIndex !== index) {
                state.carouselIndex = index;
                updateCarouselDOM();
            } else {
                // If clicked active one, trigger zoom lightbox
                const imgUrl = item.querySelector('img').src;
                openLightbox(imgUrl, 'Diseño Destacado');
            }
        });
    });

    // Drag / Swipe support for 3D Carousel
    let startX = 0;
    let isSwiping = false;
    const carouselContainer = document.getElementById('carousel-3d');
    
    carouselContainer.addEventListener('mousedown', (e) => {
        startX = e.pageX;
        isSwiping = true;
    });

    carouselContainer.addEventListener('mouseup', (e) => {
        if (!isSwiping) return;
        isSwiping = false;
        const diff = e.pageX - startX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swipe right -> prev
                btnCarouselPrev.click();
            } else {
                // Swipe left -> next
                btnCarouselNext.click();
            }
        }
    });

    carouselContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
        isSwiping = true;
    });

    carouselContainer.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        isSwiping = false;
        const diff = e.changedTouches[0].pageX - startX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) {
                btnCarouselPrev.click();
            } else {
                btnCarouselNext.click();
            }
        }
    });

    // ==========================================================================
    // 7. PORTFOLIO TABS AND GRID IN ARTIST PROFILE
    // ==========================================================================
    tabLinks.forEach(tab => {
        tab.addEventListener('click', () => {
            tabLinks.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const category = tab.getAttribute('data-tab');
            renderGalleryTab(category);
        });
    });

    function renderGalleryTab(category) {
        galleryGrid.innerHTML = ''; // Clear previous
        const items = state.portfolio[category] || [];
        
        items.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${item.src}" alt="${item.title}">
                <div class="gallery-item-overlay">
                    <span><i data-lucide="zoom-in"></i> Ampliar</span>
                </div>
            `;
            
            galleryGrid.appendChild(galleryItem);
            
            // Add Lightbox Event
            galleryItem.addEventListener('click', () => {
                openLightbox(item.src, item.title);
            });
        });
        
        lucide.createIcons();
    }

    // Lightbox modal creator
    function openLightbox(imgSrc, title) {
        const lightbox = document.createElement('div');
        lightbox.style.position = 'fixed';
        lightbox.style.inset = '0';
        lightbox.style.backgroundColor = 'rgba(0,0,0,0.85)';
        lightbox.style.backdropFilter = 'blur(6px)';
        lightbox.style.zIndex = '9999';
        lightbox.style.display = 'flex';
        lightbox.style.flexDirection = 'column';
        lightbox.style.alignItems = 'center';
        lightbox.style.justifyContent = 'center';
        lightbox.style.cursor = 'zoom-out';
        lightbox.style.opacity = '0';
        lightbox.style.transition = 'opacity 0.3s ease';

        lightbox.innerHTML = `
            <div style="position: relative; max-width: 90%; max-height: 80%; display: flex; flex-direction: column; align-items: center;">
                <img src="${imgSrc}" alt="${title}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: var(--border-radius-md); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <p style="color: white; font-family: var(--font-stack); font-weight: 600; margin-top: 16px; font-size: 1.1rem; letter-spacing: 0.5px;">${title}</p>
                <button style="position: absolute; top: -48px; right: 0; background: none; border: none; color: white; cursor: pointer; font-size: 1.5rem;"><i data-lucide="x"></i></button>
            </div>
        `;

        document.body.appendChild(lightbox);
        setTimeout(() => lightbox.style.opacity = '1', 50);
        lucide.createIcons();

        // Close on click or close button click
        const closeLightbox = () => {
            lightbox.style.opacity = '0';
            setTimeout(() => lightbox.remove(), 300);
        };

        lightbox.addEventListener('click', closeLightbox);
    }

    // ==========================================================================
    // 8. FAVORITES HEART TOGGLE
    // ==========================================================================
    const heartButtons = document.querySelectorAll('.btn-favorite');
    heartButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering card navigation
            const card = btn.closest('.artist-card');
            const artistId = card.getAttribute('data-id');
            const heartIcon = btn.querySelector('.icon-heart');
            
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                state.favorites.delete(artistId);
                showToast('Eliminado de tus favoritos');
            } else {
                btn.classList.add('active');
                state.favorites.add(artistId);
                showToast('¡Guardado en tus favoritos!');
                
                // Animate heart pump
                btn.style.transform = 'scale(1.3)';
                setTimeout(() => btn.style.transform = '', 200);
            }
        });
    });

    // ==========================================================================
    // 9. LEAFLET.JS MAP INTERACTION
    // ==========================================================================
    function initMap() {
        // Location coordinates
        const centerCoords = [-38.7396, -72.5984]; // Temuco
        
        // Initialize Map
        mapInstance = L.map('interactive-map', {
            zoomControl: false,
            attributionControl: false
        }).setView(centerCoords, 10);

        // Add Tile layer (CartoDB Positron is very clean and matches our theme)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(mapInstance);

        // Pins locations details
        const locations = [
            { id: 'pipo', name: 'Studio Tatto Pipo', coords: [-38.7396, -72.5984], popup: '<strong>Studio tatto pipo</strong><br>Temuco (Teodoro Schmidt)' },
            { id: 'lara', name: 'Ink Lara', coords: [-38.7500, -72.6300], popup: '<strong>Ink Lara</strong><br>Padre Las Casas' },
            { id: 'kame', name: 'Kame Tattoo', coords: [-38.7200, -72.5800], popup: '<strong>Kame Tattoo</strong><br>Temuco' },
            { id: 'sombra', name: 'Sombra Negra', coords: [-39.2783, -72.2272], popup: '<strong>Sombra Negra</strong><br>Villarrica' }
        ];

        // Custom Leaflet marker icons with purple theme
        const purpleIcon = L.divIcon({
            html: '<div style="background-color: #5d32a8; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>',
            className: 'custom-map-pin',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        // Add markers to map
        locations.forEach(loc => {
            const marker = L.marker(loc.coords, { icon: purpleIcon }).addTo(mapInstance);
            
            // Create nice popup
            marker.bindPopup(loc.popup);
            
            markersGroup.push({
                id: loc.id,
                marker: marker
            });

            // Click marker to focus and filter card
            marker.on('click', () => {
                const targetCard = document.querySelector(`.artist-card[data-id="${loc.id}"]`);
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Visual pulse effect on card
                    targetCard.style.borderColor = '#7b4ad8';
                    targetCard.style.boxShadow = '0 0 16px rgba(123, 74, 216, 0.4)';
                    setTimeout(() => {
                        targetCard.style.borderColor = '';
                        targetCard.style.boxShadow = '';
                    }, 1200);
                }
            });
        });
    }

    // Expand Map widget logic
    btnToggleMapExpand.addEventListener('click', () => {
        if (mapWrapper.classList.contains('expanded')) {
            mapWrapper.classList.remove('expanded');
            mapWrapper.style.height = '160px';
            btnToggleMapExpand.innerHTML = '<i data-lucide="map"></i> Ver en mapa';
        } else {
            mapWrapper.classList.add('expanded');
            mapWrapper.style.height = '400px';
            btnToggleMapExpand.innerHTML = '<i data-lucide="map-flat"></i> Contraer mapa';
        }
        
        lucide.createIcons();
        
        // Re-align map centering
        setTimeout(() => {
            mapInstance.invalidateSize();
            mapInstance.setView([-38.7396, -72.5984], 10);
        }, 300);
    });

    // Initialize Map on start
    initMap();

    // ==========================================================================
    // 10. TOAST NOTIFICATION UTILITY
    // ==========================================================================
    function showToast(message) {
        // Remove existing toast if any
        const oldToast = document.querySelector('.toast-notification');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        toast.style.backgroundColor = '#1e1b24';
        toast.style.color = '#ffffff';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '30px';
        toast.style.fontSize = '0.9rem';
        toast.style.fontWeight = '600';
        toast.style.boxShadow = '0 10px 24px rgba(0,0,0,0.3)';
        toast.style.zIndex = '10000';
        toast.style.opacity = '0';
        toast.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 50);

        // Dismiss after 2.5s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
});
