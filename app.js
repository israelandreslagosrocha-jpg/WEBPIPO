/**
 * TINTA CONECTADA - APPLICATION LOGIC
 * High-fidelity Single Page Application (SPA) Interactions
 */


document.addEventListener('DOMContentLoaded', () => {

    // Initialize Supabase JS Client
    const SUPABASE_URL = "https://xoxazrbkibxzchxqlosn.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhveGF6cmJraWJ4emNoeHFsb3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTY1MDAsImV4cCI6MjA5ODU5MjUwMH0.gszC4U6sU8DsdpLUGUeuXuOQA3VU3fCWzSI8SknitvY";
    
    let supabaseClient = null;
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error("Supabase SDK CDN failed to load. Make sure you are connected to the internet.");
    }

    // Safe HTML Escaping Helper to prevent XSS
    function escapeHTML(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // ==========================================================================

    // 1. STATE & STATIC DATABASE CONFIGURATIONS

    // ==========================================================================


    // Initialize Lucide Icons
    lucide.createIcons();

    // App state
    const state = {
        currentView: 'landing-view', // Starts on the exclusive landing page!
        favorites: new Set(),
        activeFilters: {
            userCoords: null,
            styles: new Set(),
            availability: new Set(),
            category: 'Todos',
            distance: 150,
            onlyFavorites: false
        },
        carouselIndex: 1, // Start at active image
        
        // Dynamic filters for artist profile portfolio
        activeProfileZone: 'all-zones',
        activeProfileStyle: 'all-styles',

        // Body zone and style classifications for artist portfolio
        portfolioItems: [
            { src: 'assets/tattoo_flower.png', title: 'Diseño Botánico Hojas', style: 'Fine Line', zone: 'brazo' },
            { src: 'assets/tattoo_butterfly.png', title: 'Composición de Mariposas', style: 'Fine Line', zone: 'brazo' },
            { src: 'assets/tattoo_alien.png', title: 'Ilustración Alien Sketch', style: 'Blackwork', zone: 'piernas' },
            { src: 'assets/tattoo_mandala.png', title: 'Geométrico Mandala', style: 'Black & Grey', zone: 'manos' },
            { src: 'assets/tattoo_lion.png', title: 'León Realista', style: 'Realismo', zone: 'torso' },
            { src: 'assets/tattoo_anime.png', title: 'Anime Goku Color', style: 'Acuarela', zone: 'piernas' }
        ],

        // Admin dynamic state
        suspendedArtists: new Set(),
        artistsData: [
            { id: 'pipo', name: 'Studio tatto pipo', location: 'Teodoro Schmidt', plan: 'Premium', status: 'Verificado' },
            { id: 'lara', name: 'Ink Lara', location: 'Padre Las Casas', plan: 'Premium', status: 'Pendiente' },
            { id: 'kame', name: 'Kame Tattoo', location: 'Temuco', plan: 'Básico', status: 'Verificado' },
            { id: 'sombra', name: 'Sombra Negra', location: 'Villarrica', plan: 'Premium', status: 'Verificado' }
        ],

        // Tatuador dashboard dynamic state (Pre-logged in demo mode active by default)
        selectedSubscriptionPlan: 'premium',
        isTatuadorSubscribed: true,
        tatuadorProfile: {
            name: 'Studio tatto pipo',
            location: 'Teodoro Schmidt',
            experience: 5,
            price: 'Intermedio',
            bio: 'Artista especializado en trazos finos y composiciones geométricas personalizadas con más de 5 años de trayectoria.',
            inks: ['Dynamic Ink', 'Eternal Ink', 'Solid Ink'],
            needles: ['Kwadron Cartridges', 'Cheyenne Safety Cartridges'],
            instagram: 'https://instagram.com/studiotattopipo',
            coords: [-39.2045, -73.0538],
            styles: ['Fine Line', 'Blackwork'],
            billingStatus: 'paid'
        },
        tatuadorAppointments: [
            { id: 1, clientName: 'Carolina Soto', email: 'caro.soto@gmail.com', phone: '+56 9 8877 6655', style: 'Fine Line', date: '2026-06-25', message: 'Hola, me gustaría cotizar una flor fina de unos 10cm en el antebrazo. Quedo atenta, gracias!', status: 'pending' },
            { id: 2, clientName: 'Andrés Morales', email: 'andres.m@yahoo.com', phone: '+56 9 5544 3322', style: 'Blackwork', date: '2026-06-28', message: 'Estimado, busco turno para un diseño geométrico de mandala en la muñeca. Saludos.', status: 'approved' }
        ],
        // Client reviews dynamic state (moderated by the artist)
        tatuadorComments: [
            { id: 1, artistId: 'pipo', clientName: 'Martina Rojas', text: 'Increíble trabajo de trazo fino. Muy higiénico y detallista.', status: 'approved' },
            { id: 2, artistId: 'pipo', clientName: 'Lucas Valenzuela', text: 'Excelente atención. Me encantó el diseño de Blackwork que armamos.', status: 'approved' },
            { id: 3, artistId: 'pipo', clientName: 'Sofía Muñoz', text: '¿Tienen disponibilidad para este sábado? Me gustaría cotizar.', status: 'pending' }
        ]
    };

    

    // Artist details database for the Quick Ficha ( Araucanía region )
    const artistsDetails = {
        'pipo': {
            name: 'Studio tatto pipo',
            location: 'Teodoro Schmidt',
            bio: 'Artista especializado en trazos finos y composiciones geométricas personalizadas con más de 5 años de trayectoria en la Araucanía.',
            instagram: 'https://instagram.com/studiotattopipo',
            avatar: 'assets/logo_pipo.png',
            coords: [-39.2045, -73.0538]
        },
        'lara': {
            name: 'Ink Lara',
            location: 'Padre Las Casas',
            bio: 'Especialista en realismo en sombras y retratos hiperrealistas. Amplia experiencia en coberturas (cover-up) complejas y piezas de gran formato.',
            instagram: 'https://instagram.com/inklara',
            avatar: 'assets/logo_pipo.png',
            avatarFilter: 'hue-rotate(90deg)',
            coords: [-38.7500, -72.6300]
        },
        'kame': {
            name: 'Kame Tattoo',
            location: 'Temuco',
            bio: 'Ilustradora y tatuadora dedicada al estilo anime, acuarela y full color vibrante. Diseños personalizados inspirados en cultura pop y videojuegos.',
            instagram: 'https://instagram.com/kametattoo',
            avatar: 'assets/logo_pipo.png',
            avatarFilter: 'hue-rotate(180deg)',
            coords: [-38.7200, -72.5800]
        },
        'sombra': {
            name: 'Sombra Negra',
            location: 'Villarrica',
            bio: 'Estudio enfocado en el blackwork extremo, puntillismo y geometría sagrada. Diseños oscuros y composiciones fluidas adaptadas a la anatomía corporal.',
            instagram: 'https://instagram.com/sombranegratattoo',
            avatar: 'assets/logo_pipo.png',
            avatarFilter: 'hue-rotate(270deg)',
            coords: [-39.2783, -72.2272]
        }
    };

    

    // ==========================================================================

    // 2. DOM ELEMENTS CACHE

    // ==========================================================================

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
     const btnRequestLocation = document.getElementById('btn-request-location');
     const locationStatus = document.getElementById('location-status');
     
     // Sidebar Filters
     const sidebarFilters = document.getElementById('sidebar-filters');
     const btnMenuToggle = document.getElementById('btn-menu-toggle');
     const btnCloseSidebar = document.getElementById('btn-close-sidebar');
     const btnStyles = document.querySelectorAll('.btn-style');
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

    

    // ==========================================================================

    // 3. SPA ROUTING & NAVIGATION SWITCHES

    // ==========================================================================

    let artistProfileMapInstance = null;
    let resumeLandingParticles = () => {};

    function switchView(targetViewId) {
        const overlay = document.querySelector('.page-transition-overlay');
        
        if (overlay) {
            overlay.classList.add('animating');
            
            // Swap view content at the transition midpoint (350ms)
            setTimeout(() => {
                executeSwitchView(targetViewId);
            }, 350);
            
            // Fade out overlay after transition completes (750ms)
            setTimeout(() => {
                overlay.classList.remove('animating');
            }, 750);
        } else {
            // Fallback if overlay element is not found
            executeSwitchView(targetViewId);
        }
    }

    function executeSwitchView(targetViewId) {
        state.currentView = targetViewId;
        
        const appContainer = document.getElementById('app-container');
        if (targetViewId === 'landing-view') {
            appContainer.classList.add('landing-active');
            resumeLandingParticles();
        } else {
            appContainer.classList.remove('landing-active');
        }

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
        
        // Sync yellow sidebar active state
        document.querySelectorAll('.floating-sidebar-menu .sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        if (targetViewId === 'home-view') {
            const homeItem = document.getElementById('sidebar-btn-home');
            if (homeItem) homeItem.classList.add('active');
        } else if (targetViewId === 'sabias-que-view') {
            const triviaItem = document.getElementById('sidebar-btn-sabias-que-side');
            if (triviaItem) triviaItem.classList.add('active');
        } else if (targetViewId === 'history-view') {
            const historyItem = document.getElementById('sidebar-btn-historia-side');
            if (historyItem) historyItem.classList.add('active');
        }
        
        // If switching to home view, refresh map rendering
        if (targetViewId === 'home-view' && mapInstance) {
            setTimeout(() => {
                mapInstance.invalidateSize();
            }, 100);
        }
        
        // If switching to artist view, render default tab
        if (targetViewId === 'artist-view') {
            state.activeProfileZone = 'all-zones';
            state.activeProfileStyle = 'all-styles';
            
            document.querySelectorAll('.body-zones-list .tab-link').forEach(btn => {
                if (btn.getAttribute('data-tab') === 'all-zones') btn.classList.add('active');
                else btn.classList.remove('active');
            });
            document.querySelectorAll('.style-filters-list .style-tab-link').forEach(btn => {
                if (btn.getAttribute('data-style') === 'all-styles') btn.classList.add('active');
                else btn.classList.remove('active');
            });

            renderFilteredProfileGallery();
            setupCarousel3D();
            
            initArtistProfileMap();
        }

        // Refresh admin dashboard
        if (targetViewId === 'dashboard-admin-view') {
            renderAdminArtistsTable();
            refreshAdminStats();
        }

        // Refresh tatuador portal
        if (targetViewId === 'dashboard-tatuador-view') {
            refreshTatuadorWorkspace();
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

    if (btnLogoHome) {
        btnLogoHome.addEventListener('click', () => switchView('home-view'));
    }
    if (btnBackHome) {
        btnBackHome.addEventListener('click', () => switchView('home-view'));
    }
    

    

    // ==========================================================================

    // 4. MAIN LANDING PAGE CTAs & GLOBAL NAV LINK REGISTRIES

    // ==========================================================================

    // Landing view CTAs
    const btnLandingEnter = document.getElementById('btn-landing-enter-magnetic');
    if (btnLandingEnter) {
        btnLandingEnter.addEventListener('click', () => switchView('home-view'));
    }
    const btnLandingArtist = document.getElementById('btn-landing-artist');
    if (btnLandingArtist) {
        btnLandingArtist.addEventListener('click', () => switchView('dashboard-tatuador-view'));
    }
    const btnLandingAdmin = document.getElementById('btn-landing-admin');
    if (btnLandingAdmin) {
        btnLandingAdmin.addEventListener('click', () => switchView('dashboard-admin-view'));
    }

    // Header buttons (Soy tatuador and Admin)
    const btnSoyTatuador = document.getElementById('btn-soy-tatuador');
    if (btnSoyTatuador) {
        btnSoyTatuador.addEventListener('click', () => switchView('dashboard-tatuador-view'));
    }
    const btnAdminPanel = document.getElementById('btn-admin-panel');
    if (btnAdminPanel) {
        btnAdminPanel.addEventListener('click', () => switchView('dashboard-admin-view'));
    }


    // Custom Navigation Event Listeners
    const navBtnArtistas = document.getElementById('nav-btn-artistas');
    if (navBtnArtistas) {
        navBtnArtistas.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('home-view');
            setTimeout(() => {
                const grid = document.getElementById('artist-grid');
                if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 400);
        });
    }

    const navBtnDestacados = document.getElementById('nav-btn-destacados');
    if (navBtnDestacados) {
        navBtnDestacados.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('home-view');
            setTimeout(() => {
                const grid = document.getElementById('artist-grid');
                if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 400);
        });
    }

    const navBtnSabiasQue = document.getElementById('nav-btn-sabias-que');
    if (navBtnSabiasQue) {
        navBtnSabiasQue.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('sabias-que-view');
        });
    }

    const navBtnHistoria = document.getElementById('nav-btn-historia');
    if (navBtnHistoria) {
        navBtnHistoria.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('history-view');
            const worldTabBtn = document.querySelector('[data-history-tab="history-world"]');
            if (worldTabBtn) worldTabBtn.click();
        });
    }

    const btnViewAllArtistsBottom = document.getElementById('btn-view-all-artists-bottom');
    if (btnViewAllArtistsBottom) {
        btnViewAllArtistsBottom.addEventListener('click', (e) => {
            e.preventDefault();
            clearAllFilters();
            showToast('Mostrando todos los artistas');
        });
    }

    // Yellow Sidebar Click Handlers
    const sidebarLogo = document.getElementById('sidebar-btn-logo');
    if (sidebarLogo) {
        sidebarLogo.addEventListener('click', () => switchView('landing-view'));
    }

    const sidebarHome = document.getElementById('sidebar-btn-home');
    if (sidebarHome) {
        sidebarHome.addEventListener('click', () => switchView('home-view'));
    }

    const sidebarSabiasQue = document.getElementById('sidebar-btn-sabias-que-side');
    if (sidebarSabiasQue) {
        sidebarSabiasQue.addEventListener('click', () => switchView('sabias-que-view'));
    }

    const sidebarHistoria = document.getElementById('sidebar-btn-historia-side');
    if (sidebarHistoria) {
        sidebarHistoria.addEventListener('click', () => {
            switchView('history-view');
            const worldTabBtn = document.querySelector('[data-history-tab="history-world"]');
            if (worldTabBtn) worldTabBtn.click();
        });
    }

    const sidebarGuardados = document.getElementById('sidebar-btn-guardados');
    if (sidebarGuardados) {
        sidebarGuardados.addEventListener('click', () => {
            state.activeFilters.onlyFavorites = !state.activeFilters.onlyFavorites;
            if (state.activeFilters.onlyFavorites) {
                sidebarGuardados.classList.add('active');
                showToast('Filtrando por favoritos');
            } else {
                sidebarGuardados.classList.remove('active');
                showToast('Mostrando todos los artistas');
            }
            applyFilters();
        });
    }

    // Trivia balloon "Ver más" link click
    const btnTriviaVerMas = document.getElementById('btn-home-trivia-ver-mas');
    if (btnTriviaVerMas) {
        btnTriviaVerMas.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('sabias-que-view');
        });
    }

    // Editorial back button click
    const btnEditorialBackHome = document.getElementById('btn-editorial-back-home');
    if (btnEditorialBackHome) {
        btnEditorialBackHome.addEventListener('click', () => {
            switchView('home-view');
        });
    }


    

    // ==========================================================================

    // 5. SEARCH & INTERACTIVE FILTERS MODULE

    // ==========================================================================

    // Style pills row handlers
    const stylePills = document.querySelectorAll('.style-pill');
    stylePills.forEach(pill => {
        pill.addEventListener('click', () => {
            stylePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            
            const selectedStyle = pill.getAttribute('data-style');
            state.activeFilters.category = selectedStyle;
            applyFilters();
        });
    });

    // Location and Radius Select Dropdowns
    const locationSelect = document.getElementById('filter-location-select');
    const radiusSelect = document.getElementById('filter-radius-select');

    if (locationSelect) {
        locationSelect.addEventListener('change', () => {
            const locVal = locationSelect.value;
            const cityCoords = {
                'Todos': [-38.7396, -72.5984],
                'Temuco': [-38.7396, -72.5984],
                'Padre Las Casas': [-38.7500, -72.6300],
                'Villarrica': [-39.2783, -72.2272],
                'Teodoro Schmidt': [-39.2045, -73.0538]
            };
            state.activeFilters.userCoords = cityCoords[locVal] || cityCoords['Todos'];
            state.activeFilters.locationName = locVal;
            applyFilters();
        });
    }

    if (radiusSelect) {
        radiusSelect.addEventListener('change', () => {
            state.activeFilters.distance = parseFloat(radiusSelect.value);
            applyFilters();
        });
    }


    // ==========================================================================
    // 2. INTERACTIVE SIDEBAR FILTERS (HOME VIEW)
    // ==========================================================================
    // Toggle Mobile Sidebar Drawer
    if (btnMenuToggle && sidebarFilters) {
        btnMenuToggle.addEventListener('click', () => {
            sidebarFilters.classList.add('mobile-open');
        });
    }
    if (btnCloseSidebar && sidebarFilters) {
        btnCloseSidebar.addEventListener('click', () => {
            sidebarFilters.classList.remove('mobile-open');
        });
    }

    // Geolocation Request
    if (btnRequestLocation) {
        btnRequestLocation.addEventListener('click', () => {
            if (navigator.geolocation) {
                locationStatus.textContent = "Solicitando permiso...";
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        state.activeFilters.userCoords = [lat, lng];
                        
                        locationStatus.innerHTML = `<span style="color: #48bb78; font-weight: 500;"><i data-lucide="check-circle" style="width:12px;height:12px;display:inline;"></i> Ubicación compartida</span>`;
                        lucide.createIcons();
                        
                        // Add marker for user on interactive map
                        if (mapInstance) {
                            if (window.userLocationMarker) {
                                window.userLocationMarker.setLatLng([lat, lng]);
                            } else {
                                const userIcon = L.divIcon({
                                    html: '<div style="background-color: #ff4a5a; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(255, 74, 90, 0.6);"></div>',
                                    className: 'user-map-pin',
                                    iconSize: [14, 14],
                                    iconAnchor: [7, 7]
                                });
                                window.userLocationMarker = L.marker([lat, lng], { icon: userIcon }).addTo(mapInstance);
                                window.userLocationMarker.bindPopup("<strong>Tu ubicación actual</strong>");
                            }
                            mapInstance.setView([lat, lng], 10);
                        }
                        
                        showToast("Permiso de ubicación concedido");
                        applyFilters();
                    },
                    (error) => {
                        console.error(error);
                        locationStatus.innerHTML = `<span style="color: #f56565;">Permiso denegado (usando centro regional Temuco)</span>`;
                        showToast("Permiso denegado o error de ubicación");
                    }
                );
            } else {
                locationStatus.textContent = "Geolocalización no soportada por el navegador";
            }
        });
    }

    // Distance Slider text update and state change
    if (inputDistance) {
        inputDistance.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (valDistance) valDistance.textContent = `${val} km`;
            state.activeFilters.distance = val;
            applyFilters();
        });
    }

    // Style button clicks
    if (btnStyles) {
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
    }

    // Availability Checkboxes
    if (checkAvailWeek) {
        checkAvailWeek.addEventListener('change', (e) => {
            if (e.target.checked) state.activeFilters.availability.add('week');
            else state.activeFilters.availability.delete('week');
        });
    }
    if (checkAvailMonth) {
        checkAvailMonth.addEventListener('change', (e) => {
            if (e.target.checked) state.activeFilters.availability.add('month');
            else state.activeFilters.availability.delete('month');
        });
    }

    // Apply button
    if (btnApplyFilters) {
        btnApplyFilters.addEventListener('click', () => {
            applyFilters();
            if (sidebarFilters) sidebarFilters.classList.remove('mobile-open'); // Close drawer on mobile
            showToast('Filtros aplicados con éxito');
        });
    }

    // Clear filters
    if (btnClearFilters) {
        btnClearFilters.addEventListener('click', (e) => {
            e.preventDefault();
            clearAllFilters();
            showToast('Filtros restablecidos');
        });
    }

    // Artist GPS Coordinates (La Araucanía region)
    const artistCoordinates = {
        'pipo': [-39.2045, -73.0538], // Teodoro Schmidt center
        'lara': [-38.7500, -72.6300], // Padre Las Casas
        'kame': [-38.7200, -72.5800], // Temuco
        'sombra': [-39.2783, -72.2272]  // Villarrica
    };

    // Haversine geodesic distance helper (in km)
    function getHaversineDistance(coords1, coords2) {
        const lat1 = coords1[0];
        const lon1 = coords1[1];
        const lat2 = coords2[0];
        const lon2 = coords2[1];
        
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function clearAllFilters() {
        state.activeFilters.userCoords = null;
        state.activeFilters.distance = 150;
        state.activeFilters.locationName = 'Todos';
        state.activeFilters.onlyFavorites = false;
        state.activeFilters.category = 'Todos';
        
        if (inputDistance) inputDistance.value = 100;
        if (valDistance) valDistance.textContent = '100 km';
        if (locationStatus) locationStatus.innerHTML = 'Ubicación no autorizada (usando centro regional Temuco)';
        
        const locationSelect = document.getElementById('filter-location-select');
        if (locationSelect) locationSelect.value = 'Todos';

        const radiusSelect = document.getElementById('filter-radius-select');
        if (radiusSelect) radiusSelect.value = '150';

        const stylePills = document.querySelectorAll('.style-pill');
        stylePills.forEach(pill => {
            if (pill.getAttribute('data-style') === 'Todos') {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });

        const sidebarGuardados = document.getElementById('sidebar-btn-guardados');
        if (sidebarGuardados) sidebarGuardados.classList.remove('active');

        // Remove user marker from map
        if (window.userLocationMarker && mapInstance) {
            mapInstance.removeLayer(window.userLocationMarker);
            window.userLocationMarker = null;
        }
        
        if (btnStyles) btnStyles.forEach(b => b.classList.remove('active'));
        state.activeFilters.styles.clear();
        
        if (checkAvailWeek) checkAvailWeek.checked = false;
        if (checkAvailMonth) checkAvailMonth.checked = false;
        if (state.activeFilters.availability) state.activeFilters.availability.clear();

        if (btnCategories) {
            btnCategories.forEach(b => {
                if (b.getAttribute('data-category') === 'Todos') b.classList.add('active');
                else b.classList.remove('active');
            });
        }
        
        if (searchInput) searchInput.value = '';
        
        applyFilters();
    }

    function applyFilters() {
        let visibleCount = 0;
        
        artistCards.forEach(card => {
            const cardLocation = card.getAttribute('data-location');
            
            // Read array-like style list string
            const rawStyles = card.getAttribute('data-styles') || '';
            const cardStyles = eval(rawStyles); // Convert string to Array
            
            let showCard = true;

            // 0. Suspended artist check
            const cardId = card.getAttribute('data-id');
            if (state.suspendedArtists.has(cardId)) {
                showCard = false;
            }

            // 1. Distance & location permission filter (Facebook Marketplace style radius)
            const artistCoords = artistCoordinates[cardId] || [-38.7396, -72.5984];
            const center = state.activeFilters.userCoords || [-38.7396, -72.5984]; // Default to Temuco regional center
            const dist = getHaversineDistance(center, artistCoords);
            
            if (dist > state.activeFilters.distance) {
                showCard = false;
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

            // 4. Search input text (safeguarded)
            if (searchInput) {
                const searchVal = searchInput.value.toLowerCase().trim();
                if (searchVal !== '') {
                    const cardName = card.querySelector('.artist-name').textContent.toLowerCase();
                    const matchedStyle = cardStyles.some(s => s.toLowerCase().includes(searchVal));
                    const matchedLoc = cardLocation.toLowerCase().includes(searchVal);
                    if (!cardName.includes(searchVal) && !matchedStyle && !matchedLoc) {
                        showCard = false;
                    }
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

    const btnMoreCategories = document.getElementById('btn-more-categories');
    if (btnMoreCategories) {
        btnMoreCategories.addEventListener('click', () => {
            toggleDrawer(overlayFilterArtists, true);
        });
    }


    // ==========================================================================
    // 4. SEARCH TRIGGER
    // ==========================================================================
    if (btnSearchTrigger) {
        btnSearchTrigger.addEventListener('click', () => {
            applyFilters();
            const featSec = document.querySelector('.featured-section');
            if (featSec) featSec.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
                const featSec = document.querySelector('.featured-section');
                if (featSec) featSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }


    

    // ==========================================================================

    // 6. ARTIST EXPLORER GRID & CARDS MODULE

    // ==========================================================================

    // Handle artist card click to select and update Ficha card
    artistCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-favorite')) {
                return;
            }
            
            const artistId = card.getAttribute('data-id');
            updateQuickFicha(artistId);
            
            // Open the slide-out quick-sheet drawer
            const drawer = document.getElementById('artist-quick-sheet');
            if (drawer) {
                drawer.classList.add('active');
            }
            
            // Push layout grid column to accommodate the drawer
            const homeLayout = document.querySelector('.home-layout');
            if (homeLayout) {
                homeLayout.classList.add('has-sidebar-open');
            }
        });
    });

    // Close button click handler for quick-sheet drawer
    const btnFichaClose = document.getElementById('btn-ficha-close');
    if (btnFichaClose) {
        btnFichaClose.addEventListener('click', () => {
            const drawer = document.getElementById('artist-quick-sheet');
            if (drawer) {
                drawer.classList.remove('active');
            }
            // Collapse layout grid column
            const homeLayout = document.querySelector('.home-layout');
            if (homeLayout) {
                homeLayout.classList.remove('has-sidebar-open');
            }
            // Remove active style from cards in explorer grid
            document.querySelectorAll('.artist-card').forEach(card => {
                card.classList.remove('active');
            });
        });
    }

    // Render reviews inside the public Quick Sheet
    function renderFichaComments(artistId) {
        const commentsListEl = document.getElementById('ficha-comments-list');
        const commentsCountEl = document.getElementById('ficha-comments-count');
        if (!commentsListEl) return;

        const list = state.tatuadorComments.filter(c => c.artistId === artistId && c.status === 'approved');
        
        if (commentsCountEl) {
            commentsCountEl.textContent = list.length;
        }

        if (list.length === 0) {
            commentsListEl.innerHTML = `<p style="font-size: 0.8rem; font-weight: 500; color: #718096; text-align: center; margin: 12px 0;">Aún no hay recomendaciones aprobadas.</p>`;
            return;
        }

        commentsListEl.innerHTML = list.map(c => `
            <div class="ficha-comment-bubble" style="margin-bottom: 8px;">
                <div class="ficha-comment-bubble-inner">
                    <p style="margin: 0; font-weight: 600;">${escapeHTML(c.text)}</p>
                </div>
            </div>
            <div class="ficha-comment-author" style="margin-bottom: 12px;">
                &mdash; ${escapeHTML(c.clientName)}
            </div>
        `).join('');
    }

    // Toggle comments form inside Ficha drawer
    const btnShowAddComment = document.getElementById('btn-show-add-comment');
    const addCommentFormContainer = document.getElementById('add-comment-form-container');
    if (btnShowAddComment && addCommentFormContainer) {
        btnShowAddComment.addEventListener('click', () => {
            if (addCommentFormContainer.style.display === 'none') {
                addCommentFormContainer.style.display = 'block';
                btnShowAddComment.style.display = 'none';
            } else {
                addCommentFormContainer.style.display = 'none';
                btnShowAddComment.style.display = 'block';
            }
        });
    }

    const btnCancelComment = document.getElementById('btn-cancel-comment');
    if (btnCancelComment && addCommentFormContainer && btnShowAddComment) {
        btnCancelComment.addEventListener('click', () => {
            addCommentFormContainer.style.display = 'none';
            btnShowAddComment.style.display = 'block';
            document.getElementById('comment-client-name').value = '';
            document.getElementById('comment-client-text').value = '';
        });
    }

    // Submit client review
    const btnSubmitComment = document.getElementById('btn-submit-comment');
    if (btnSubmitComment && addCommentFormContainer && btnShowAddComment) {
        btnSubmitComment.addEventListener('click', async () => {
            const nameVal = document.getElementById('comment-client-name').value.trim();
            const textVal = document.getElementById('comment-client-text').value.trim();
            
            if (nameVal === '' || textVal === '') {
                showToast('Por favor, ingresa tu nombre y comentario.');
                return;
            }

            // Persist to Supabase and get back the inserted row with its auto-generated ID
            if (supabaseClient) {
                const { data, error } = await supabaseClient
                    .from('comments')
                    .insert({
                        artist_id: currentFichaArtistId,
                        client_name: nameVal,
                        text: textVal,
                        status: 'pending'
                    })
                    .select()
                    .single();

                if (error) {
                    console.error("Error submitting comment to Supabase:", error);
                    showToast('Error al enviar. Intenta de nuevo.');
                    return;
                }

                // Push to local state with the real DB id
                state.tatuadorComments.push({
                    id: parseInt(data.id),
                    artistId: data.artist_id,
                    clientName: data.client_name,
                    text: data.text,
                    status: data.status
                });
            } else {
                // Fallback: offline only
                state.tatuadorComments.push({
                    id: state.tatuadorComments.length + 1,
                    artistId: currentFichaArtistId,
                    clientName: nameVal,
                    text: textVal,
                    status: 'pending'
                });
            }

            showToast('¡Gracias! Tu recomendación ha sido enviada para moderación.');
            
            // Collapse form and reset fields
            addCommentFormContainer.style.display = 'none';
            btnShowAddComment.style.display = 'block';
            document.getElementById('comment-client-name').value = '';
            document.getElementById('comment-client-text').value = '';

            // Update dashboards
            renderDashboardComments();
        });
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

    // 7. QUICK FICHA MODULE & INTERACTIVE MAIN MAP

    // ==========================================================================

    let currentFichaArtistId = 'pipo';

    // Update Quick Ficha panel (Right panel)
    function updateQuickFicha(artistId) {
        const details = artistsDetails[artistId];
        if (!details) return;

        currentFichaArtistId = artistId;

        // Update active class on card in the grid
        document.querySelectorAll('.artist-card').forEach(card => {
            if (card.getAttribute('data-id') === artistId) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Update DOM elements inside the Ficha
        const avatarImg = document.getElementById('ficha-artist-avatar');
        if (avatarImg) {
            avatarImg.src = details.avatar;
            if (details.avatarFilter) {
                avatarImg.style.filter = details.avatarFilter;
            } else {
                avatarImg.style.filter = '';
            }
        }

        const nameEl = document.getElementById('ficha-artist-name');
        if (nameEl) nameEl.textContent = details.name;

        const locEl = document.getElementById('ficha-artist-location');
        if (locEl) locEl.innerHTML = `<i data-lucide="map-pin"></i> ${details.location}`;

        const bioEl = document.getElementById('ficha-artist-bio');
        if (bioEl) bioEl.textContent = details.bio;

        const instaEl = document.getElementById('ficha-artist-instagram');
        if (instaEl) instaEl.href = details.instagram;

        // Render client reviews
        renderFichaComments(artistId);

        // Recreate icons
        lucide.createIcons();

        // Update map focus and marker popup
        if (mapInstance) {
            // Re-align map rendering
            setTimeout(() => {
                mapInstance.invalidateSize();
                mapInstance.setView(details.coords, 11);
                
                // Find and open popup for this marker
                const item = markersGroup.find(m => m.id === artistId);
                if (item && item.marker) {
                    item.marker.openPopup();
                }
            }, 100);
        }
    }

    // Ficha navigation controls
    const btnFichaPrev = document.getElementById('btn-ficha-toggle-prev');
    const btnFichaNext = document.getElementById('btn-ficha-toggle-next');

    function getVisibleArtistIds() {
        const visibleCards = Array.from(document.querySelectorAll('.artist-card'))
            .filter(card => card.style.display !== 'none');
        return visibleCards.map(card => card.getAttribute('data-id'));
    }

    if (btnFichaPrev) {
        btnFichaPrev.addEventListener('click', () => {
            const visibleIds = getVisibleArtistIds();
            if (visibleIds.length === 0) return;
            let index = visibleIds.indexOf(currentFichaArtistId);
            if (index === -1) index = 0;
            const newIndex = (index - 1 + visibleIds.length) % visibleIds.length;
            updateQuickFicha(visibleIds[newIndex]);
        });
    }

    if (btnFichaNext) {
        btnFichaNext.addEventListener('click', () => {
            const visibleIds = getVisibleArtistIds();
            if (visibleIds.length === 0) return;
            let index = visibleIds.indexOf(currentFichaArtistId);
            if (index === -1) index = 0;
            const newIndex = (index + 1) % visibleIds.length;
            updateQuickFicha(visibleIds[newIndex]);
        });
    }

    // Ficha View Portfolio Button (Navigates to full portfolio view)
    const btnFichaPortfolio = document.getElementById('btn-ficha-view-portfolio');
    if (btnFichaPortfolio) {
        btnFichaPortfolio.addEventListener('click', () => {
            switchView('artist-view');
            const details = artistsDetails[currentFichaArtistId];
            if (details) {
                document.querySelector('.profile-name').textContent = details.name;
                document.querySelector('.profile-location').innerHTML = `<i data-lucide="map-pin"></i> ${details.location}`;
                const profAvatar = document.querySelector('.profile-avatar-img');
                if (profAvatar) {
                    profAvatar.src = details.avatar;
                    if (details.avatarFilter) profAvatar.style.filter = details.avatarFilter;
                    else profAvatar.style.filter = '';
                }
                const infoTitle = document.querySelector('.info-title');
                if (infoTitle) infoTitle.textContent = details.name;
                
                const infoAvatar = document.querySelector('.info-avatar-circle img');
                if (infoAvatar) {
                    infoAvatar.src = details.avatar;
                    if (details.avatarFilter) infoAvatar.style.filter = details.avatarFilter;
                    else infoAvatar.style.filter = '';
                }
                lucide.createIcons();
            }
        });
    }


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
            { id: 'pipo', name: 'Studio Tatto Pipo', coords: [-39.2045, -73.0538], popup: '<strong>Studio tatto pipo</strong><br>Teodoro Schmidt' },
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
    if (btnToggleMapExpand && mapWrapper) {
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
    }

    function addOrUpdateArtistMarker(artistId, name, coords, location) {
        if (!mapInstance) return;
        
        // Remove existing marker if it exists
        const existingIdx = markersGroup.findIndex(m => m.id === artistId);
        if (existingIdx !== -1) {
            mapInstance.removeLayer(markersGroup[existingIdx].marker);
            markersGroup.splice(existingIdx, 1);
        }

        const purpleIcon = L.divIcon({
            html: '<div style="background-color: #5d32a8; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>',
            className: 'custom-map-pin',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        const marker = L.marker(coords, { icon: purpleIcon }).addTo(mapInstance);
        marker.bindPopup(`<strong>${escapeHTML(name)}</strong><br>${escapeHTML(location)}`);
        
        markersGroup.push({
            id: artistId,
            marker: marker
        });

        marker.on('click', () => {
            const targetCard = document.querySelector(`.artist-card[data-id="${artistId}"]`);
            if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetCard.style.borderColor = '#7b4ad8';
                targetCard.style.boxShadow = '0 0 16px rgba(123, 74, 216, 0.4)';
                setTimeout(() => {
                    targetCard.style.borderColor = '';
                    targetCard.style.boxShadow = '';
                }, 1200);
            }
        });
        
        // Initialize dashboard profile editor map
        const profileMapEl = document.getElementById('profile-editor-map');
        if (profileMapEl) {
            window.artistProfileMapInstance = L.map('profile-editor-map', {
                zoomControl: true,
                attributionControl: false
            }).setView([-39.2045, -73.0538], 12);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(window.artistProfileMapInstance);

            const initialCoords = state.tatuadorProfile.coords || [-39.2045, -73.0538];
            const profileMarker = L.marker(initialCoords, { draggable: true }).addTo(window.artistProfileMapInstance);
            
            // Map click listener
            window.artistProfileMapInstance.on('click', (e) => {
                const { lat, lng } = e.latlng;
                profileMarker.setLatLng([lat, lng]);
                document.getElementById('edit-art-coords').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                reverseGeocodeMock(lat, lng);
            });

            // Marker drag listener
            profileMarker.on('dragend', () => {
                const position = profileMarker.getLatLng();
                const lat = position.lat;
                const lng = position.lng;
                document.getElementById('edit-art-coords').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                reverseGeocodeMock(lat, lng);
            });

            window.artistProfileMarkerInstance = profileMarker;
        }
    }

    // Mock reverse geocoding to keep the address input synced with map clicks
    async function reverseGeocodeMock(lat, lng) {
        const addressInput = document.getElementById('edit-art-address');
        if (!addressInput) return;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data && data.display_name) {
                const parts = data.display_name.split(',');
                const shortAddress = parts.slice(0, 3).join(',').trim();
                addressInput.value = shortAddress;
                return;
            }
        } catch (e) {
            console.warn("Geocoding failed, using fallback coordinates text representation", e);
        }

        addressInput.value = `Calle Tatuajes, Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }

    // Auto-seed default database records if Supabase has 0 entries
    async function seedDatabaseIfEmpty() {
        if (!supabaseClient) return;

        try {
            const { count, error } = await supabaseClient
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.error("Error checking profiles count", error);
                return;
            }

            if (count === 0) {
                console.log("Database is empty. Seeding mockup profiles...");
                
                const defaultProfiles = [
                    {
                        id: 'pipo',
                        name: 'Studio tatto pipo',
                        location: 'Teodoro Schmidt',
                        experience: 5,
                        price: 'Intermedio',
                        bio: 'Artista especializado en trazos finos y composiciones geométricas personalizadas con más de 5 años de trayectoria en la Araucanía.',
                        instagram: 'https://instagram.com/studiotattopipo',
                        coords: [-39.2045, -73.0538],
                        styles: ['Fine Line', 'Blackwork'],
                        inks: ['Dynamic Ink', 'Eternal Ink', 'Solid Ink'],
                        needles: ['Kwadron Cartridges', 'Cheyenne Safety Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'assets/logo_pipo.png'
                    },
                    {
                        id: 'lara',
                        name: 'Ink Lara',
                        location: 'Padre Las Casas',
                        experience: 4,
                        price: 'Accesible',
                        bio: 'Especialista en Realismo de sombras, retratos y Black & Grey detallado.',
                        instagram: 'https://instagram.com/inklara',
                        coords: [-38.7500, -72.6300],
                        styles: ['Realismo', 'Black & Grey'],
                        inks: ['Dynamic Ink', 'Silverback Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'assets/logo_pipo.png'
                    },
                    {
                        id: 'kame',
                        name: 'Kame Tattoo',
                        location: 'Temuco',
                        experience: 8,
                        price: 'Especialista',
                        bio: 'Estudio de tatuajes anime y full color inspirado en la cultura geek en pleno centro de Temuco.',
                        instagram: 'https://instagram.com/kametattoo',
                        coords: [-38.7200, -72.5800],
                        styles: ['Acuarela', 'Full Color', 'Anime'],
                        inks: ['Eternal Ink', 'Fusion Ink'],
                        needles: ['Cheyenne Safety Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'assets/logo_pipo.png'
                    },
                    {
                        id: 'sombra',
                        name: 'Sombra Negra',
                        location: 'Villarrica',
                        experience: 6,
                        price: 'Premium',
                        bio: 'Especialistas en Blackwork tribal de gran cobertura y puntillismo geométrico.',
                        instagram: 'https://instagram.com/sombranegratattoo',
                        coords: [-39.2783, -72.2272],
                        styles: ['Blackwork', 'Puntillismo'],
                        inks: ['Dynamic Ink', 'Solid Ink'],
                        needles: ['Cheyenne Hawk Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'assets/logo_pipo.png'
                    }
                ];

                const { error: insertError } = await supabaseClient
                    .from('profiles')
                    .insert(defaultProfiles);

                if (insertError) {
                    console.error("Error seeding default profiles", insertError);
                    return;
                }

                // Insert default portfolio items
                const defaultPortfolio = [
                    { artist_id: 'pipo', title: 'Flor de Loto Fina', style: 'Fine Line', body_part: 'Brazos', image_url: 'assets/tattoo_flower.png' },
                    { artist_id: 'pipo', title: 'Geometría Sagrada', style: 'Blackwork', body_part: 'Espalda', image_url: 'assets/tattoo_flower.png' },
                    { artist_id: 'lara', title: 'León Realista en Sombras', style: 'Realismo', body_part: 'Brazos', image_url: 'assets/tattoo_lion.png' },
                    { artist_id: 'kame', title: 'Goku Super Saiyajin Full Color', style: 'Anime', body_part: 'Piernas', image_url: 'assets/tattoo_goku.png' },
                    { artist_id: 'sombra', title: 'Mandala Puntillista', style: 'Puntillismo', body_part: 'Brazos', image_url: 'assets/tattoo_mandala.png' }
                ];

                await supabaseClient.from('portfolio').insert(defaultPortfolio);

                // Insert default comments
                const defaultComments = [
                    { artist_id: 'pipo', client_name: 'Martina Rojas', text: 'Increíble trabajo de trazo fino. Muy higiénico y detallista.', status: 'approved' },
                    { artist_id: 'pipo', client_name: 'Lucas Valenzuela', text: 'Excelente atención. Me encantó el diseño de Blackwork que armamos.', status: 'approved' },
                    { artist_id: 'pipo', client_name: 'Sofía Muñoz', text: '¿Tienen disponibilidad para este sábado? Me gustaría cotizar.', status: 'pending' },
                    { artist_id: 'lara', client_name: 'Ignacio Fuentes', text: 'El realismo de león quedó brutal. Lo recomiendo 100%.', status: 'approved' }
                ];

                await supabaseClient.from('comments').insert(defaultComments);
                
                // Insert stats
                const defaultStats = [
                    { artist_id: 'pipo', impressions: 1240, clicks: 340, messages: 18 },
                    { artist_id: 'lara', impressions: 980, clicks: 210, messages: 12 },
                    { artist_id: 'kame', impressions: 850, clicks: 190, messages: 8 },
                    { artist_id: 'sombra', impressions: 1100, clicks: 290, messages: 14 }
                ];
                
                await supabaseClient.from('stats').insert(defaultStats);
                
                console.log("Database seeded successfully.");
            }
        } catch (e) {
            console.error("Seeding operation failed", e);
        }
    }

    // Load and synchronize data from Supabase
    async function loadSupabaseData() {
        if (!supabaseClient) return;

        // 1. Seed database if it is empty
        await seedDatabaseIfEmpty();

        try {
            // 2. Fetch all profiles
            const { data: profiles, error: pError } = await supabaseClient
                .from('profiles')
                .select('*');

            if (pError) {
                console.error("Error loading profiles from Supabase", pError);
                return;
            }

            // Clear static arrays
            state.artistsData = [];
            
            // Re-populate state and maps
            profiles.forEach(p => {
                state.artistsData.push({
                    id: p.id,
                    name: p.name,
                    location: p.location,
                    plan: p.plan === 'basic' ? 'Básico' : 'Premium',
                    status: 'Verificado'
                });

                artistsDetails[p.id] = {
                    name: p.name,
                    location: p.location,
                    bio: p.bio || '',
                    instagram: p.instagram || '',
                    avatar: p.avatar_url || 'assets/logo_pipo.png',
                    coords: p.coords,
                    experience: p.experience,
                    price: p.price,
                    styles: p.styles || [],
                    inks: p.inks || [],
                    needles: p.needles || []
                };

                artistCoordinates[p.id] = p.coords;

                // Sync logged-in artist profile default settings if id is 'pipo'
                if (p.id === 'pipo') {
                    state.tatuadorProfile = {
                        name: p.name,
                        location: p.location,
                        experience: p.experience,
                        price: p.price,
                        bio: p.bio,
                        inks: p.inks || [],
                        needles: p.needles || [],
                        instagram: p.instagram,
                        coords: p.coords,
                        styles: p.styles || [],
                        billingStatus: p.billing_status
                    };
                    state.selectedSubscriptionPlan = p.plan;
                }
            });

            // 3. Fetch comments
            const { data: comments, error: cError } = await supabaseClient
                .from('comments')
                .select('*');

            if (!cError && comments) {
                state.tatuadorComments = comments.map(c => ({
                    id: parseInt(c.id),
                    artistId: c.artist_id,
                    clientName: c.client_name,
                    text: c.text,
                    status: c.status
                }));
            }

            // 4. Fetch appointments
            const { data: appointments, error: aError } = await supabaseClient
                .from('appointments')
                .select('*');

            if (!aError && appointments) {
                state.tatuadorAppointments = appointments.map(a => ({
                    id: parseInt(a.id),
                    clientName: a.client_name,
                    email: a.email,
                    phone: a.phone,
                    style: a.style,
                    date: a.date,
                    message: a.message || '',
                    status: a.status
                }));
            }

            // 5. Update UI Grid from Supabase records
            renderPublicArtistCardsFromSupabase();

            // 6. Refresh workspace UI panels
            refreshTatuadorWorkspace();
            
            // Re-render Leaflet map markers
            if (mapInstance) {
                // Clear existing markers
                markersGroup.forEach(m => mapInstance.removeLayer(m.marker));
                markersGroup.length = 0; // Empty array
                
                // Add new markers
                Object.keys(artistsDetails).forEach(id => {
                    const artist = artistsDetails[id];
                    addOrUpdateArtistMarker(id, artist.name, artist.coords, artist.location);
                });
            }

            updateQuickFicha('pipo');
            document.querySelectorAll('.artist-card').forEach(card => card.classList.remove('active'));
        } catch (e) {
            console.error("Supabase data loading failed", e);
        }
    }

    function renderPublicArtistCardsFromSupabase() {
        const grid = document.getElementById('artist-grid');
        if (!grid) return;
        grid.innerHTML = ''; // Clear hardcoded ones
        
        Object.keys(artistsDetails).forEach(id => {
            const artist = artistsDetails[id];
            addNewArtistCardToGrid(artist.name, artist.location, artist.experience || 5, artist.styles, id, artist.avatar);
        });

        // Set card click handlers & favorites setup
        document.querySelectorAll('.artist-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-favorite')) return;
                const cardId = card.getAttribute('data-id');
                updateQuickFicha(cardId);
                
                const drawer = document.getElementById('artist-quick-sheet');
                if (drawer) drawer.classList.add('active');
                
                const homeLayout = document.querySelector('.home-layout');
                if (homeLayout) homeLayout.classList.add('has-sidebar-open');
            });
        });
        
        lucide.createIcons();
    }

    // Initialize Map on start
    initMap();
    
    // Load and synchronize data from Supabase
    loadSupabaseData();


    

    // ==========================================================================

    // 8. ARTIST DETAIL PROFILE MODULE (GALLERY, CAROUSEL 3D, LIGHTBOX, MAPS)

    // ==========================================================================

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

    if (btnCarouselPrev) {
        btnCarouselPrev.addEventListener('click', () => {
            const totalItems = carouselItems.length;
            state.carouselIndex = (state.carouselIndex - 1 + totalItems) % totalItems;
            updateCarouselDOM();
        });
    }

    if (btnCarouselNext) {
        btnCarouselNext.addEventListener('click', () => {
            const totalItems = carouselItems.length;
            state.carouselIndex = (state.carouselIndex + 1) % totalItems;
            updateCarouselDOM();
        });
    }

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
    
    if (carouselContainer) {
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
    }


    // ==========================================================================
    // 7. PORTFOLIO TABS AND GRID IN ARTIST PROFILE
    // ==========================================================================
    // Tab Zone Filters
    tabLinks.forEach(tab => {
        tab.addEventListener('click', () => {
            tabLinks.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            state.activeProfileZone = tab.getAttribute('data-tab');
            renderFilteredProfileGallery();
        });
    });

    // Style Tab Filters
    document.querySelectorAll('.style-filters-list .style-tab-link').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.style-filters-list .style-tab-link').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.activeProfileStyle = btn.getAttribute('data-style');
            renderFilteredProfileGallery();
        });
    });

    function renderFilteredProfileGallery() {
        galleryGrid.innerHTML = '';
        
        // Filter items based on active tabs
        const filtered = state.portfolioItems.filter(item => {
            const zoneMatch = state.activeProfileZone === 'all-zones' || item.zone === state.activeProfileZone;
            const styleMatch = state.activeProfileStyle === 'all-styles' || item.style === state.activeProfileStyle;
            return zoneMatch && styleMatch;
        });

        if (filtered.length === 0) {
            galleryGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0; font-family: var(--font-stack);">No se encontraron diseños para este filtro.</p>`;
            return;
        }

        filtered.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${item.src}" alt="${item.title}">
                <div class="gallery-item-overlay">
                    <span><i data-lucide="zoom-in"></i> Ampliar</span>
                </div>
            `;
            
            galleryGrid.appendChild(galleryItem);
            
            galleryItem.addEventListener('click', () => {
                openLightbox(item.src, `${item.title} (${item.style} - ${item.zone.toUpperCase()})`);
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
    if (btnGlobalFilter && overlayFilterArtists) {
        btnGlobalFilter.addEventListener('click', () => toggleDrawer(overlayFilterArtists, true));
    }
    if (btnProfileFilters && overlayFilterArtists) {
        btnProfileFilters.addEventListener('click', () => toggleDrawer(overlayFilterArtists, true));
    }
    if (btnCloseFilterArtists && overlayFilterArtists) {
        btnCloseFilterArtists.addEventListener('click', () => toggleDrawer(overlayFilterArtists, false));
    }
    
    // Close on overlay backdrop clicks
    if (overlayFilterArtists) {
        overlayFilterArtists.addEventListener('click', (e) => {
            if (e.target === overlayFilterArtists) toggleDrawer(overlayFilterArtists, false);
        });
    }
    if (overlayArtistInfo) {
        overlayArtistInfo.addEventListener('click', (e) => {
            if (e.target === overlayArtistInfo) toggleDrawer(overlayArtistInfo, false);
        });
    }

    // Distance Slider text update
    if (inputDistance && valDistance) {
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
    }

    // Apply button inside Filtrar Artistas Drawer
    if (btnApplyArtistFilters) {
        btnApplyArtistFilters.addEventListener('click', () => {
            // Collect checkbox states safely
            const togglePuntillismo = document.getElementById('toggle-puntillismo');
            const toggleBlackwork = document.getElementById('toggle-blackwork');
            const toggleRealismo = document.getElementById('toggle-realismo');
            const toggleBlackGrey = document.getElementById('toggle-black-grey');
            const toggleAcuarela = document.getElementById('toggle-acuarela');
            const toggleFineline = document.getElementById('toggle-fineline');

            const activeToggles = {
                puntillismo: togglePuntillismo ? togglePuntillismo.checked : false,
                blackwork: toggleBlackwork ? toggleBlackwork.checked : false,
                realismo: toggleRealismo ? toggleRealismo.checked : false,
                blackGrey: toggleBlackGrey ? toggleBlackGrey.checked : false,
                acuarela: toggleAcuarela ? toggleAcuarela.checked : false,
                fineline: toggleFineline ? toggleFineline.checked : false
            };

            // Sync sidebar active styles
            state.activeFilters.styles.clear();
            if (btnStyles) btnStyles.forEach(btn => btn.classList.remove('active'));

            if (activeToggles.puntillismo) {
                state.activeFilters.styles.add('Puntillismo');
                const btn = document.querySelector('.btn-style[data-style="Puntillismo"]');
                if (btn) btn.classList.add('active');
            }
            if (activeToggles.blackwork) {
                state.activeFilters.styles.add('Blackwork');
                const btn = document.querySelector('.btn-style[data-style="Blackwork"]');
                if (btn) btn.classList.add('active');
            }
            if (activeToggles.realismo) {
                state.activeFilters.styles.add('Realismo');
                const btn = document.querySelector('.btn-style[data-style="Realismo"]');
                if (btn) btn.classList.add('active');
            }
            if (activeToggles.blackGrey) {
                state.activeFilters.styles.add('Black & Grey');
                const btn = document.querySelector('.btn-style[data-style="Black & Grey"]');
                if (btn) btn.classList.add('active');
            }
            if (activeToggles.acuarela) {
                state.activeFilters.styles.add('Acuarela');
                const btn = document.querySelector('.btn-style[data-style="Acuarela"]');
                if (btn) btn.classList.add('active');
            }
            if (activeToggles.fineline) {
                state.activeFilters.styles.add('Fine Line');
                const btn = document.querySelector('.btn-style[data-style="Fine Line"]');
                if (btn) btn.classList.add('active');
            }

            applyFilters();
            toggleDrawer(overlayFilterArtists, false);
            showToast('Filtros de artistas aplicados');
        });
    }

    // Artist Info Drawer Tabs (Image 2)
    if (triggerInfoDrawer) {
        triggerInfoDrawer.addEventListener('click', () => {
            toggleDrawer(overlayArtistInfo, true);
        });
    }
    if (btnCloseArtistInfo) {
        btnCloseArtistInfo.addEventListener('click', () => {
            toggleDrawer(overlayArtistInfo, false);
        });
    }

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

    // 9. ADDITIONAL BUSINESS LOGIC (ADMIN, TATUADOR WORKSPACE, ONBOARDING)

    // ==========================================================================

    // ==========================================================================
    // 11. ADDITIONAL LOGIC: HISTORY TABS, NEEDLES INFO, MAPS, DASHBOARDS
    // ==========================================================================

    // History & Trivia View Tab switching
    document.querySelectorAll('.btn-history-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-history-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const target = btn.getAttribute('data-history-tab');
            document.querySelectorAll('.history-tab-content').forEach(panel => {
                if (panel.id === `history-sec-${target}`) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
        });
    });

    // Profile Map initialization
    function initArtistProfileMap() {
        let coords = [-38.9705, -73.0487]; // Teodoro Schmidt (Pipo)
        const activeName = document.querySelector('.profile-name').textContent.toLowerCase();
        
        if (activeName.includes('lara')) {
            coords = [-38.7500, -72.6300];
        } else if (activeName.includes('kame')) {
            coords = [-38.7200, -72.5800];
        } else if (activeName.includes('sombra')) {
            coords = [-39.2783, -72.2272];
        }

        document.getElementById('profile-map-artist-name').textContent = document.querySelector('.profile-name').textContent;

        setTimeout(() => {
            const mapContainer = document.getElementById('artist-profile-map');
            if (!mapContainer) return;
            
            if (artistProfileMapInstance) {
                artistProfileMapInstance.remove();
                artistProfileMapInstance = null;
            }

            artistProfileMapInstance = L.map('artist-profile-map', {
                zoomControl: true,
                attributionControl: false
            }).setView(coords, 12);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(artistProfileMapInstance);

            const purpleIcon = L.divIcon({
                html: '<div style="background-color: #5d32a8; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>',
                className: 'custom-map-pin',
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            L.marker(coords, { icon: purpleIcon }).addTo(artistProfileMapInstance)
                .bindPopup(`<strong>${document.querySelector('.profile-name').textContent}</strong>`)
                .openPopup();
        }, 300);
    }

    // Admin dashboard: navigation tabs
    document.querySelectorAll('#dashboard-admin-view .db-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('#dashboard-admin-view .db-nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const tab = link.getAttribute('data-db-tab');
            document.querySelectorAll('#dashboard-admin-view .db-tab-panel').forEach(panel => {
                if (panel.id === tab) panel.classList.add('active');
                else panel.classList.remove('active');
            });
        });
    });

    // Admin dashboard: render table of artists
    function renderAdminArtistsTable() {
        const tbody = document.getElementById('admin-artists-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        state.artistsData.forEach(art => {
            const tr = document.createElement('tr');
            
            let statusBadgeClass = 'badge-success';
            if (art.status === 'Pendiente') statusBadgeClass = 'badge-warning';
            else if (art.status === 'Suspendido') statusBadgeClass = 'badge-danger';
            
            let planBadgeClass = 'badge-premium';
            if (art.plan === 'Básico') planBadgeClass = 'badge-basic';

            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 10px; font-weight: 600;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background-color: var(--primary-light); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">
                            ${escapeHTML(art.name.charAt(0).toUpperCase())}
                        </div>
                        ${escapeHTML(art.name)}
                    </div>
                </td>
                <td>${escapeHTML(art.location)}</td>
                <td><span class="badge ${planBadgeClass}">${art.plan}</span></td>
                <td><span class="badge ${statusBadgeClass}">${art.status}</span></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        ${art.status === 'Pendiente' ? `
                             <button class="btn btn-primary btn-xs btn-admin-action" data-id="${art.id}" data-action="verify">Verificar</button>
                        ` : ''}
                        ${art.status !== 'Suspendido' ? `
                             <button class="btn btn-outline btn-xs btn-admin-action" data-id="${art.id}" data-action="suspend" style="color: #e53e3e; border-color: #e53e3e;">Suspender</button>
                        ` : `
                             <button class="btn btn-outline btn-xs btn-admin-action" data-id="${art.id}" data-action="reactivate" style="color: #38a169; border-color: #38a169;">Reactivar</button>
                        `}
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Table action click handlers
        document.querySelectorAll('.btn-admin-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const action = btn.getAttribute('data-action');
                const artist = state.artistsData.find(a => a.id === id);
                
                if (artist) {
                    if (action === 'verify') {
                        artist.status = 'Verificado';
                        showToast(`Artista ${artist.name} verificado`);
                    } else if (action === 'suspend') {
                        artist.status = 'Suspendido';
                        state.suspendedArtists.add(id);
                        showToast(`Artista ${artist.name} suspendido`);
                    } else if (action === 'reactivate') {
                        artist.status = 'Verificado';
                        state.suspendedArtists.delete(id);
                        showToast(`Artista ${artist.name} reactivado`);
                    }
                    renderAdminArtistsTable();
                    refreshAdminStats();
                    applyFilters();
                }
            });
        });
    }

    function refreshAdminStats() {
        const totalArtistsEl = document.getElementById('admin-stat-artists');
        const pendingEl = document.getElementById('admin-stat-pending');
        
        if (totalArtistsEl) totalArtistsEl.textContent = state.artistsData.length;
        if (pendingEl) {
            const pendingCount = state.artistsData.filter(a => a.status === 'Pendiente').length;
            pendingEl.textContent = pendingCount;
        }
    }

    // Save plans configs
    document.querySelectorAll('.btn-save-plan').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('¡Configuración de tarifas guardada!');
        });
    });

    // Add artist invitation simulation
    const btnAdminAddArtist = document.getElementById('btn-admin-add-artist');
    if (btnAdminAddArtist) {
        btnAdminAddArtist.addEventListener('click', () => {
            showToast('Enlace de invitación copiado al portapapeles');
        });
    }

    // Tatuador onboarding choose plan
    document.querySelectorAll('.btn-select-plan').forEach(btn => {
        btn.addEventListener('click', () => {
            const plan = btn.getAttribute('data-plan');
            state.selectedSubscriptionPlan = plan;
            
            const nameEl = document.getElementById('payment-plan-name');
            const priceEl = document.getElementById('payment-plan-price');
            
            if (nameEl) {
                if (plan === 'basic') {
                    nameEl.textContent = 'Plan Explorador (Básico)';
                } else {
                    nameEl.textContent = 'Plan Máster (Premium)';
                }
            }
            if (priceEl) {
                if (plan === 'basic') {
                    priceEl.textContent = '$14.990/mes';
                } else {
                    priceEl.textContent = '$29.990/mes';
                }
            }
            
            const step1 = document.getElementById('onb-step-1');
            const step2 = document.getElementById('onb-step-2');
            const view1 = document.getElementById('onb-view-1');
            const view2 = document.getElementById('onb-view-2');
            if (step1) step1.classList.remove('active');
            if (step2) step2.classList.add('active');
            if (view1) view1.classList.remove('active');
            if (view2) view2.classList.add('active');
        });
    });

    const btnCancelPayment = document.getElementById('btn-cancel-payment');
    if (btnCancelPayment) {
        btnCancelPayment.addEventListener('click', (e) => {
            e.preventDefault();
            const step1 = document.getElementById('onb-step-1');
            const step2 = document.getElementById('onb-step-2');
            const view1 = document.getElementById('onb-view-1');
            const view2 = document.getElementById('onb-view-2');
            if (step2) step2.classList.remove('active');
            if (step1) step1.classList.add('active');
            if (view2) view2.classList.remove('active');
            if (view1) view1.classList.add('active');
        });
    }

    // Onboarding Payment credit card form submit
    const btnSubmitPayment = document.getElementById('btn-submit-payment');
    if (btnSubmitPayment) {
        btnSubmitPayment.addEventListener('click', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('pay-card-name');
            const numberInput = document.getElementById('pay-card-number');
            
            if (nameInput && numberInput) {
                if (nameInput.value.trim() === '' || numberInput.value.trim() === '') {
                    showToast('Por favor, completa los datos de pago.');
                    return;
                }
            }

            showToast('Procesando pago seguro...');
            
            setTimeout(() => {
                showToast('¡Pago procesado con éxito!');
                state.isTatuadorSubscribed = true;
                
                const step2 = document.getElementById('onb-step-2');
                const step3 = document.getElementById('onb-step-3');
                const view2 = document.getElementById('onb-view-2');
                const view3 = document.getElementById('onb-view-3');
                if (step2) step2.classList.remove('active');
                if (step3) step3.classList.add('active');
                if (view2) view2.classList.remove('active');
                if (view3) view3.classList.add('active');
            }, 1200);
        });
    }

    // Fast Registration Form submit
    const btnSubmitRegister = document.getElementById('btn-submit-register');
    if (btnSubmitRegister) {
        btnSubmitRegister.addEventListener('click', () => {
            const artNameEl = document.getElementById('reg-art-name');
            const locEl = document.getElementById('reg-art-location');
            const expEl = document.getElementById('reg-art-exp');
            const bioEl = document.getElementById('reg-art-bio');
            const instagramEl = document.getElementById('reg-art-instagram');
            const coordsEl = document.getElementById('reg-art-coords');
            
            const artName = artNameEl ? artNameEl.value.trim() : '';
            const loc = locEl ? locEl.value : '';
            const exp = expEl ? expEl.value : '';
            const bio = bioEl ? bioEl.value.trim() : '';
            const instagram = instagramEl ? instagramEl.value.trim() : '';
            const coordsStr = coordsEl ? coordsEl.value.trim() : '';
            
            if (artName === '' || exp === '' || instagram === '' || coordsStr === '') {
                showToast('Por favor, completa los campos requeridos.');
                return;
            }

            let coords = [-38.7396, -72.5984]; // Default to Temuco
            const parts = coordsStr.split(',').map(p => parseFloat(p.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                coords = parts;
            } else {
                showToast('Coordenadas GPS inválidas. Formato: Latitud, Longitud');
                return;
            }

            const selectedStyles = [];
            document.querySelectorAll('input[name="reg-art-styles"]:checked').forEach(cb => {
                selectedStyles.push(cb.value);
            });
            if (selectedStyles.length === 0) {
                showToast('Por favor, selecciona al menos un estilo de tatuaje.');
                return;
            }

            const safeId = artName.toLowerCase().replace(/[^a-z0-9]/g, '');

            // Update profile in state
            state.tatuadorProfile.name = artName;
            state.tatuadorProfile.location = loc;
            state.tatuadorProfile.experience = parseInt(exp);
            state.tatuadorProfile.bio = bio;
            state.tatuadorProfile.instagram = instagram;
            state.tatuadorProfile.coords = coords;
            state.tatuadorProfile.styles = selectedStyles;
            state.tatuadorProfile.billingStatus = 'paid';
            
            // Push into admin list
            state.artistsData.push({
                id: safeId,
                name: artName,
                location: loc,
                plan: state.selectedSubscriptionPlan === 'basic' ? 'Básico' : 'Premium',
                status: 'Verificado'
            });

            // Save details to global coordinate and info maps
            artistCoordinates[safeId] = coords;
            artistsDetails[safeId] = {
                name: artName,
                location: loc,
                bio: bio,
                instagram: instagram,
                avatar: 'assets/logo_pipo.png',
                coords: coords
            };

            // Dynamically add card to grids
            addNewArtistCardToGrid(artName, loc, exp, selectedStyles);

            // Add Leaflet map marker
            addOrUpdateArtistMarker(safeId, artName, coords, loc);

            showToast('¡Perfil creado exitosamente! Bienvenido a Tinta Conectada.');
            refreshTatuadorWorkspace();
        });
    }

    // Helper to dynamically inject new artist card
    function addNewArtistCardToGrid(name, loc, exp, styles, artistId, avatarUrl) {
        const grid = document.getElementById('artist-grid');
        // Use explicit artistId if provided, else derive from name
        const safeId = artistId || name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const avatar = avatarUrl || 'assets/logo_pipo.png';
        
        const card = document.createElement('article');
        card.className = 'artist-card';
        card.setAttribute('data-id', safeId);
        card.setAttribute('data-location', loc);
        
        const stylesStr = JSON.stringify(styles || ['Fine Line']).replace(/"/g, "'");
        card.setAttribute('data-styles', stylesStr);
        card.setAttribute('data-exp', exp);
        card.setAttribute('data-price', 'Intermedio');
        
        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="assets/tattoo_flower.png" alt="Tatuaje de ${escapeHTML(name)}" class="card-tattoo-img">
                <button class="btn-favorite" aria-label="Agregar a favoritos">
                     <i data-lucide="heart" class="icon-heart"></i>
                </button>
            </div>
            <div class="card-info">
                <div class="artist-brand-row">
                    <div class="artist-avatar-circle">
                        <img src="${escapeHTML(avatar)}" alt="${escapeHTML(name)} Avatar">
                    </div>
                    <div class="artist-brand-text">
                        <h3 class="artist-name">${escapeHTML(name)}</h3>
                        <span class="artist-loc"><i data-lucide="map-pin"></i> ${escapeHTML(loc)}</span>
                    </div>
                </div>
                
                <div class="artist-tags">
                     ${(styles || ['Fine Line']).slice(0, 2).map(s => `<span class="tag">${escapeHTML(s)}</span>`).join('')}
                     ${(styles || []).length > 2 ? `<span class="tag tag-count">+${(styles || []).length - 2}</span>` : ''}
                </div>
                
                <div class="artist-meta">
                     <span class="meta-exp">${escapeHTML(String(exp))}+ años tatuando</span>
                     <span class="meta-price"><span class="price-highlight">$$</span> Intermedio</span>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
        
        // Click action — opens quick sheet drawer
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-favorite')) return;
            updateQuickFicha(safeId);

            const drawer = document.getElementById('artist-quick-sheet');
            if (drawer) drawer.classList.add('active');
            const homeLayout = document.querySelector('.home-layout');
            if (homeLayout) homeLayout.classList.add('has-sidebar-open');

            document.querySelectorAll('.artist-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
        
        // Favorite heart action
        const heart = card.querySelector('.btn-favorite');
        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            if (heart.classList.contains('active')) {
                heart.classList.remove('active');
                state.favorites.delete(safeId);
                showToast('Eliminado de tus favoritos');
            } else {
                heart.classList.add('active');
                state.favorites.add(safeId);
                showToast('¡Guardado en tus favoritos!');
            }
        });
        
        lucide.createIcons();
    }

    // Refresh active workspace panels
    function refreshTatuadorWorkspace() {
        const onboardingPanel = document.getElementById('tatuador-onboarding-panel');
        const workspacePanel = document.getElementById('tatuador-workspace-panel');
        
        if (state.isTatuadorSubscribed) {
            onboardingPanel.style.display = 'none';
            workspacePanel.style.display = 'flex';
            
            // Populate workspace form fields
            document.getElementById('edit-art-name').value = state.tatuadorProfile.name;
            document.getElementById('edit-art-location').value = state.tatuadorProfile.location;
            document.getElementById('edit-art-exp').value = state.tatuadorProfile.experience;
            document.getElementById('edit-art-price').value = state.tatuadorProfile.price;
            document.getElementById('edit-art-bio').value = state.tatuadorProfile.bio;
            document.getElementById('edit-art-inks').value = state.tatuadorProfile.inks.join(', ');
            document.getElementById('edit-art-needles').value = state.tatuadorProfile.needles.join(', ');
            document.getElementById('edit-art-instagram').value = state.tatuadorProfile.instagram || '';
            document.getElementById('edit-art-coords').value = (state.tatuadorProfile.coords || []).join(', ');
            
            // Populate styles checkboxes
            const currentStyles = state.tatuadorProfile.styles || [];
            document.querySelectorAll('input[name="edit-art-styles"]').forEach(cb => {
                cb.checked = currentStyles.includes(cb.value);
            });

            // Populate account balance / billing info
            const planTypeEl = document.getElementById('billing-plan-type');
            if (planTypeEl) {
                planTypeEl.textContent = state.selectedSubscriptionPlan === 'basic' ? 'Plan Básico' : 'Plan Premium';
            }
            const amountEl = document.getElementById('billing-amount');
            if (amountEl) {
                amountEl.textContent = state.selectedSubscriptionPlan === 'basic' ? '$14.990 CLP' : '$29.990 CLP';
            }
            updateBillingUI();
            
            document.getElementById('workspace-sidebar-name').textContent = state.tatuadorProfile.name;
            document.getElementById('workspace-sidebar-plan').textContent = state.selectedSubscriptionPlan === 'basic' ? 'Plan Básico' : 'Plan Premium';
            
            renderWorkspacePortfolio();
            renderWorkspaceAppointments();
            renderDashboardComments();
        } else {
            onboardingPanel.style.display = 'block';
            workspacePanel.style.display = 'none';
            
            // Reset onboarding steps
            document.getElementById('onb-step-1').className = 'onboarding-step active';
            document.getElementById('onb-step-2').className = 'onboarding-step';
            document.getElementById('onb-step-3').className = 'onboarding-step';
            document.getElementById('onb-view-1').className = 'onboarding-content-step active';
            document.getElementById('onb-view-2').className = 'onboarding-content-step';
            document.getElementById('onb-view-3').className = 'onboarding-content-step';
        }
    }

    // Workspace uploader selection & drag-drop
    const dragArea = document.getElementById('upload-drag-area');
    const fileInput = document.getElementById('input-portfolio-file');
    const fileNameIndicator = document.getElementById('file-name-indicator');

    if (dragArea && fileInput) {
        dragArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileNameIndicator.textContent = `Archivo: ${fileInput.files[0].name}`;
            }
        });
    }

    // Upload portfolio trigger
    const btnAddToPortfolio = document.getElementById('btn-add-to-portfolio');
    if (btnAddToPortfolio) {
        btnAddToPortfolio.addEventListener('click', () => {
            const titleInput = document.getElementById('new-tattoo-title');
            const title = titleInput.value.trim();
            const style = document.getElementById('new-tattoo-style').value;
            const zone = document.getElementById('new-tattoo-zone').value;
            
            if (title === '') {
                showToast('Por favor, ingresa un título para el diseño.');
                return;
            }

            const newImg = {
                src: 'assets/tattoo_flower.png', // Fallback to existing asset
                title: title,
                style: style,
                zone: zone
            };
            
            state.portfolioItems.push(newImg);
            titleInput.value = '';
            if (fileNameIndicator) fileNameIndicator.textContent = '';
            
            showToast('¡Diseño agregado a tu portafolio público!');
            renderWorkspacePortfolio();
            renderFilteredProfileGallery();
        });
    }

    function renderWorkspacePortfolio() {
        const grid = document.getElementById('workspace-portfolio-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        state.portfolioItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'uploaded-item';
            div.innerHTML = `
                <img src="${item.src}" alt="${item.title}">
                <div class="uploaded-item-info">
                    <span>${item.title}</span>
                    <small>${item.style} / ${item.zone.toUpperCase()}</small>
                </div>
                <button class="btn-delete-uploaded" data-index="${index}" title="Eliminar diseño"><i data-lucide="trash-2"></i></button>
            `;
            grid.appendChild(div);
        });

        // Delete handlers
        document.querySelectorAll('.btn-delete-uploaded').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                state.portfolioItems.splice(index, 1);
                showToast('Diseño eliminado');
                renderWorkspacePortfolio();
                renderFilteredProfileGallery();
            });
        });

        lucide.createIcons();
    }

    // Render client appointment list
    function renderWorkspaceAppointments() {
        const list = document.getElementById('workspace-appointments-list');
        if (!list) return;
        
        list.innerHTML = '';
        state.tatuadorAppointments.forEach(app => {
            const card = document.createElement('div');
            card.className = 'appointment-card';
            
            let badgeClass = 'badge-warning';
            let statusText = 'Pendiente';
            if (app.status === 'approved') {
                badgeClass = 'badge-success';
                statusText = 'Aprobada';
            } else if (app.status === 'declined') {
                badgeClass = 'badge-danger';
                statusText = 'Declinada';
            }

            card.innerHTML = `
                <div class="appointment-info">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h4>${escapeHTML(app.clientName)}</h4>
                        <span class="badge ${badgeClass}">${escapeHTML(statusText)}</span>
                    </div>
                    <div class="appointment-meta">
                        <span><i data-lucide="mail"></i> ${escapeHTML(app.email)}</span>
                        <span><i data-lucide="phone"></i> ${escapeHTML(app.phone)}</span>
                        <span><i data-lucide="calendar"></i> Propuesto: ${escapeHTML(app.date)}</span>
                        <span><i data-lucide="shapes"></i> Estilo: ${escapeHTML(app.style)}</span>
                    </div>
                    <div class="appointment-msg">"${escapeHTML(app.message)}"</div>
                </div>
                <div class="appointment-actions">
                    ${app.status === 'pending' ? `
                        <button class="btn btn-primary btn-sm btn-app-action" data-id="${app.id}" data-action="approve"><i data-lucide="check"></i> Aprobar</button>
                        <button class="btn btn-outline btn-sm btn-app-action" data-id="${app.id}" data-action="decline" style="color: #e53e3e; border-color: #e53e3e;"><i data-lucide="x"></i> Declinar</button>
                    ` : `
                        <button class="btn btn-outline btn-sm btn-app-action" data-id="${app.id}" data-action="reset">Restablecer</button>
                    `}
                </div>
            `;
            list.appendChild(card);
        });

        // App actions click handlers
        document.querySelectorAll('.btn-app-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const action = btn.getAttribute('data-action');
                const appointment = state.tatuadorAppointments.find(a => a.id === id);
                
                if (appointment) {
                    let newStatus = 'pending';
                    if (action === 'approve') {
                        newStatus = 'approved';
                        showToast('Cita aprobada con éxito');
                    } else if (action === 'decline') {
                        newStatus = 'declined';
                        showToast('Cita declinada');
                    }
                    appointment.status = newStatus;

                    // Persist to Supabase
                    if (supabaseClient) {
                        supabaseClient
                            .from('appointments')
                            .update({ status: newStatus })
                            .eq('id', id)
                            .then(({ error }) => {
                                if (error) console.error("Error updating appointment status:", error);
                            });
                    }

                    renderWorkspaceAppointments();
                }
            });
        });

        lucide.createIcons();
    }

    // Render comments list inside Dashboard Comments Moderation tab
    function renderDashboardComments() {
        const container = document.getElementById('db-comments-manager-container');
        if (!container) return;

        // Current artist represents logged-in user
        const list = state.tatuadorComments.filter(c => c.artistId === (currentAuthUserId || 'pipo'));
        
        container.innerHTML = '';
        if (list.length === 0) {
            container.innerHTML = `<p style="font-size: 0.95rem; font-weight: 500; color: #4a5568; text-align: center; margin: 20px 0;">No has recibido ninguna recomendación de clientes aún.</p>`;
            return;
        }

        list.forEach(c => {
            const card = document.createElement('div');
            card.className = 'comment-item-card';

            let statusClass = 'comment-status-pending';
            let statusText = 'Pendiente de Aprobación';
            if (c.status === 'approved') {
                statusClass = 'comment-status-approved';
                statusText = 'Aprobado (Visible)';
            } else if (c.status === 'hidden') {
                statusClass = 'comment-status-hidden';
                statusText = 'Oculto (No visible)';
            }

            card.innerHTML = `
                <div class="comment-item-header">
                    <span class="comment-item-name"><i data-lucide="user" style="display:inline-block; width:14px; height:14px; vertical-align:middle; margin-right: 4px;"></i> ${escapeHTML(c.clientName)}</span>
                    <span class="comment-item-status-badge ${statusClass}">${escapeHTML(statusText)}</span>
                </div>
                <div class="comment-item-body">
                    "${escapeHTML(c.text)}"
                </div>
                <div class="comment-item-actions">
                    ${c.status === 'pending' || c.status === 'hidden' ? `
                        <button type="button" class="btn btn-primary btn-sm btn-comment-action" data-id="${c.id}" data-action="approve"><i data-lucide="check"></i> Aprobar para Perfil</button>
                    ` : ''}
                    ${c.status === 'approved' ? `
                        <button type="button" class="btn btn-outline btn-sm btn-comment-action" data-id="${c.id}" data-action="hide" style="color:#e53e3e; border-color:#e53e3e;"><i data-lucide="eye-off"></i> Ocultar</button>
                    ` : ''}
                </div>
            `;
            container.appendChild(card);
        });

        // Add action event listeners
        container.querySelectorAll('.btn-comment-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const action = btn.getAttribute('data-action');
                const comment = state.tatuadorComments.find(c => c.id === id);

                if (comment) {
                    let newStatus = comment.status;
                    if (action === 'approve') {
                        newStatus = 'approved';
                        showToast('Recomendación aprobada y publicada.');
                    } else if (action === 'hide') {
                        newStatus = 'hidden';
                        showToast('Recomendación oculta.');
                    }
                    comment.status = newStatus;

                    // Persist status change to Supabase
                    if (supabaseClient) {
                        supabaseClient
                            .from('comments')
                            .update({ status: newStatus })
                            .eq('id', id)
                            .then(({ error }) => {
                                if (error) console.error("Error updating comment status:", error);
                            });
                    }

                    renderDashboardComments();
                    // Also refresh public reviews inside quick sheet in case it's currently open
                    renderFichaComments(currentFichaArtistId);
                }
            });
        });

        lucide.createIcons();
    }

    // Edit profile submit handler
    const formTatuadorProfile = document.getElementById('form-tatuador-profile-edit');
    if (formTatuadorProfile) {
        formTatuadorProfile.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('edit-art-name').value.trim();
            const loc = document.getElementById('edit-art-location').value;
            const exp = document.getElementById('edit-art-exp').value;
            const price = document.getElementById('edit-art-price').value;
            const bio = document.getElementById('edit-art-bio').value.trim();
            const inks = document.getElementById('edit-art-inks').value.split(',').map(s => s.trim());
            const needles = document.getElementById('edit-art-needles').value.split(',').map(s => s.trim());
            const instagram = document.getElementById('edit-art-instagram').value.trim();
            const coordsStr = document.getElementById('edit-art-coords').value.trim();
            
            if (name === '' || exp === '') {
                showToast('Por favor, completa tu nombre y años de experiencia.');
                return;
            }

            // Coords: use map field if filled, otherwise fallback to existing saved coords
            let coords = state.tatuadorProfile.coords || [-39.2045, -73.0538];
            if (coordsStr !== '') {
                const parts = coordsStr.split(',').map(p => parseFloat(p.trim()));
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    coords = parts;
                }
                // If format is invalid, silently keep the existing coords (non-blocking)
            }

            const selectedStyles = [];
            document.querySelectorAll('input[name="edit-art-styles"]:checked').forEach(cb => {
                selectedStyles.push(cb.value);
            });
            if (selectedStyles.length === 0) {
                showToast('Por favor, selecciona al menos un estilo de tatuaje.');
                return;
            }
            
            state.tatuadorProfile.name = name;
            state.tatuadorProfile.location = loc;
            state.tatuadorProfile.experience = parseInt(exp);
            state.tatuadorProfile.price = price;
            state.tatuadorProfile.bio = bio;
            state.tatuadorProfile.inks = inks;
            state.tatuadorProfile.needles = needles;
            state.tatuadorProfile.instagram = instagram;
            state.tatuadorProfile.coords = coords;
            state.tatuadorProfile.styles = selectedStyles;
            
            // Sync database maps
            const artistId = currentAuthUserId || 'pipo';
            artistCoordinates[artistId] = coords;
            if (!artistsDetails[artistId]) {
                artistsDetails[artistId] = {};
            }
            artistsDetails[artistId].name = name;
            artistsDetails[artistId].location = loc;
            artistsDetails[artistId].bio = bio;
            artistsDetails[artistId].instagram = instagram;
            artistsDetails[artistId].coords = coords;

            // Sync Leaflet marker
            addOrUpdateArtistMarker(artistId, name, coords, loc);

            // Sync workspace sidebar details
            document.getElementById('workspace-sidebar-name').textContent = name;
            
            // Sync drawer details on active profile if it matches first card
            document.getElementById('profile-bio-text').textContent = bio;
            document.getElementById('profile-exp-text').textContent = `${exp}+ Años de trayectoria profesional`;
            
            const inkList = document.getElementById('profile-inks-list');
            if (inkList) inkList.innerHTML = inks.map(ink => `<li><strong>${escapeHTML(ink)}</strong></li>`).join('');
            
            const needleList = document.getElementById('profile-needles-list');
            if (needleList) needleList.innerHTML = needles.map(n => `<li><strong>${escapeHTML(n)}</strong></li>`).join('');
            
            // Sync public explorer cards
            let card = document.querySelector(`.artist-card[data-id="${artistId}"]`);
            if (!card) {
                renderPublicArtistCardsFromSupabase();
                card = document.querySelector(`.artist-card[data-id="${artistId}"]`);
            }
            if (card) {
                card.setAttribute('data-location', loc);
                card.setAttribute('data-exp', exp);
                card.setAttribute('data-price', price);
                
                const stylesStr = JSON.stringify(selectedStyles).replace(/"/g, "'");
                card.setAttribute('data-styles', stylesStr);
                
                card.querySelector('.artist-name').textContent = name;
                card.querySelector('.artist-loc').innerHTML = `<i data-lucide="map-pin"></i> ${escapeHTML(loc)}`;
                card.querySelector('.meta-exp').textContent = `${escapeHTML(exp)}+ años tatuando`;
                
                let priceSymbols = '$$';
                if (price === 'Accesible') priceSymbols = '$';
                else if (price === 'Premium') priceSymbols = '$$$';
                else if (price === 'Especialista') priceSymbols = '$$$$';
                card.querySelector('.meta-price').innerHTML = `<span class="price-highlight">${priceSymbols}</span> ${escapeHTML(price)}`;
                
                // Re-generate tags in card
                const tagsContainer = card.querySelector('.artist-tags');
                if (tagsContainer) {
                    tagsContainer.innerHTML = `
                        ${selectedStyles.slice(0, 2).map(s => `<span class="tag">${escapeHTML(s)}</span>`).join('')}
                        ${selectedStyles.length > 2 ? `<span class="tag tag-count">+${selectedStyles.length - 2}</span>` : ''}
                    `;
                }
            }

            // Immediately apply filters to update map markers visibility and search grid
            applyFilters();

            // Persist to Supabase
            if (supabaseClient) {
                supabaseClient
                    .from('profiles')
                    .upsert({
                        id: artistId,
                        name,
                        location: loc,
                        experience: parseInt(exp),
                        price,
                        bio,
                        inks,
                        needles,
                        instagram,
                        coords,
                        styles: selectedStyles,
                        billing_status: state.tatuadorProfile.billingStatus,
                        plan: state.selectedSubscriptionPlan
                    })
                    .then(({ error }) => {
                        if (error) console.error("Error saving profile to Supabase:", error);
                        else showToast('¡Ficha guardada y sincronizada con la nube!');
                    });
            } else {
                showToast('¡Ficha del perfil del estudio guardada!');
            }

            lucide.createIcons();
        });
    }

    // Log-out tatuador
    const btnTatuadorLogout = document.getElementById('btn-tatuador-logout');
    if (btnTatuadorLogout) {
        btnTatuadorLogout.addEventListener('click', () => {
            state.isTatuadorSubscribed = false;
            showToast('Sesión de artista cerrada');
            switchView('landing-view');
        });
    }

    // Tatuador dashboard: navigation tabs switching
    document.querySelectorAll('#tatuador-workspace-panel .db-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('#tatuador-workspace-panel .db-nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const tab = link.getAttribute('data-db-tab');
            document.querySelectorAll('#tatuador-workspace-panel .db-tab-panel').forEach(panel => {
                if (panel.id === tab) panel.classList.add('active');
                else panel.classList.remove('active');
            });
            
            // Re-render Leaflet maps if switching to stats or others where Leaflet needs to refresh size
            if (tab === 'tatuador-profile' && window.artistProfileMapInstance) {
                setTimeout(() => window.artistProfileMapInstance.invalidateSize(), 100);
            }
        });
    });

    // Update Billing UI
    function updateBillingUI() {
        const badge = document.getElementById('billing-status-badge');
        const payBtn = document.getElementById('btn-pay-pending');
        
        if (!badge) return;
        
        if (state.tatuadorProfile.billingStatus === 'paid') {
            badge.className = 'billing-badge billing-badge-active';
            badge.textContent = 'Al día';
            if (payBtn) payBtn.style.display = 'none';
        } else {
            badge.className = 'billing-badge billing-badge-owed';
            badge.textContent = 'Deuda Pendiente';
            if (payBtn) payBtn.style.display = 'block';
        }
    }

    // Billing status simulation toggle
    const btnToggleBilling = document.getElementById('btn-toggle-billing-status');
    if (btnToggleBilling) {
        btnToggleBilling.addEventListener('click', () => {
            if (state.tatuadorProfile.billingStatus === 'paid') {
                state.tatuadorProfile.billingStatus = 'unpaid';
                showToast('Estado de cuenta: Deuda pendiente simulada.');
            } else {
                state.tatuadorProfile.billingStatus = 'paid';
                showToast('Estado de cuenta: Al día.');
            }
            updateBillingUI();
        });
    }

    // Pay pending balance
    const btnPayPending = document.getElementById('btn-pay-pending');
    if (btnPayPending) {
        btnPayPending.addEventListener('click', () => {
            state.tatuadorProfile.billingStatus = 'paid';
            showToast('¡Pago de mensualidad procesado con éxito!');
            updateBillingUI();

            // Persist to Supabase
            if (supabaseClient) {
                supabaseClient
                    .from('profiles')
                    .update({ billing_status: 'paid' })
                    .eq('id', currentAuthUserId || 'pipo')
                    .then(({ error }) => {
                        if (error) console.error('Error updating billing status:', error);
                    });
            }
        });
    }

    // Address Search geocoding
    const btnSearchAddress = document.getElementById('btn-search-address');
    if (btnSearchAddress) {
        btnSearchAddress.addEventListener('click', async () => {
            const addressInput = document.getElementById('edit-art-address');
            if (!addressInput) return;

            const query = addressInput.value.trim();
            if (query === '') {
                showToast('Ingresa una dirección para buscar.');
                return;
            }

            showToast('Buscando ubicación...');
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                const data = await res.json();
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lng = parseFloat(data[0].lon);
                    
                    document.getElementById('edit-art-coords').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    
                    if (window.artistProfileMapInstance && window.artistProfileMarkerInstance) {
                        window.artistProfileMapInstance.setView([lat, lng], 13);
                        window.artistProfileMarkerInstance.setLatLng([lat, lng]);
                    }
                    showToast('Ubicación encontrada y fijada en el mapa.');
                } else {
                    showToast('No se encontró la dirección. Intenta con otra comuna o calle.');
                }
            } catch (e) {
                console.error("Geocoding search failed", e);
                showToast('Error de búsqueda. Intenta marcar la ubicación haciendo clic en el mapa.');
            }
        });
    }

    // Plan Switching Simulation
    const btnChangePlanBasic = document.getElementById('btn-change-plan-basic');
    if (btnChangePlanBasic) {
        btnChangePlanBasic.addEventListener('click', () => {
            if (state.selectedSubscriptionPlan === 'basic') return;
            
            state.selectedSubscriptionPlan = 'basic';
            showToast('Te has cambiado al Plan Básico.');
            
            // Update workspace sidebar plan badge
            const sidebarPlan = document.getElementById('workspace-sidebar-plan');
            if (sidebarPlan) {
                sidebarPlan.textContent = 'Plan Básico';
                sidebarPlan.className = 'badge';
                sidebarPlan.style.background = '#4a5568';
            }

            // Update UI elements in pricing tab
            const btnCurrentBasic = document.getElementById('btn-change-plan-basic');
            const btnCurrentPremium = document.getElementById('btn-current-plan-premium');
            
            if (btnCurrentBasic) {
                btnCurrentBasic.textContent = 'Tu Plan Actual';
                btnCurrentBasic.disabled = true;
                btnCurrentBasic.style.cursor = 'default';
            }
            
            if (btnCurrentPremium) {
                btnCurrentPremium.textContent = 'Cambiar a este plan';
                btnCurrentPremium.disabled = false;
                btnCurrentPremium.style.cursor = 'pointer';
                btnCurrentPremium.className = 'btn btn-primary btn-block';
            }

            // Update billing amounts
            const planTypeEl = document.getElementById('billing-plan-type');
            if (planTypeEl) {
                planTypeEl.textContent = 'Plan Básico';
                planTypeEl.className = 'badge';
                planTypeEl.style.background = '#4a5568';
            }
            const amountEl = document.getElementById('billing-amount');
            if (amountEl) {
                amountEl.textContent = '$14.990 CLP';
            }

            // Persist plan change to Supabase
            if (supabaseClient) {
                supabaseClient
                    .from('profiles')
                    .update({ plan: 'basic' })
                    .eq('id', currentAuthUserId || 'pipo')
                    .then(({ error }) => {
                        if (error) console.error('Error saving plan change to Supabase:', error);
                    });
            }
        });
    }

    // Set up back to Premium click handler if Premium button is clicked (when not active)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#btn-current-plan-premium');
        if (btn && !btn.disabled && state.selectedSubscriptionPlan === 'basic') {
            state.selectedSubscriptionPlan = 'premium';
            showToast('¡Te has cambiado al Plan Premium!');

            const sidebarPlan = document.getElementById('workspace-sidebar-plan');
            if (sidebarPlan) {
                sidebarPlan.textContent = 'Plan Premium';
                sidebarPlan.className = 'badge badge-premium';
                sidebarPlan.style.background = '';
            }

            const btnCurrentBasic = document.getElementById('btn-change-plan-basic');
            if (btnCurrentBasic) {
                btnCurrentBasic.textContent = 'Cambiar a este plan';
                btnCurrentBasic.disabled = false;
                btnCurrentBasic.style.cursor = 'pointer';
            }

            btn.textContent = 'Tu Plan Actual';
            btn.disabled = true;
            btn.style.cursor = 'default';

            // Update billing amounts
            const planTypeEl = document.getElementById('billing-plan-type');
            if (planTypeEl) {
                planTypeEl.textContent = 'Plan Premium';
                planTypeEl.className = 'badge badge-premium';
                planTypeEl.style.background = '';
            }
            const amountEl = document.getElementById('billing-amount');
            if (amountEl) {
                amountEl.textContent = '$29.990 CLP';
            }

            // Persist plan change to Supabase
            if (supabaseClient) {
                supabaseClient
                    .from('profiles')
                    .update({ plan: 'premium' })
                    .eq('id', currentAuthUserId || 'pipo')
                    .then(({ error }) => {
                        if (error) console.error('Error saving plan change to Supabase:', error);
                    });
            }
        }
    });


    

    // ==========================================================================

    // 10. VISUAL FX ENGINE (PARTICLES, MAGNETIC BUTTON, CUSTOM CURSOR)

    // ==========================================================================

    // ==========================================================================
    // 8. VISUAL EFFECTS ENGINE (PARTICLES, MAGNET, TILT)
    // ==========================================================================
    function initLandingParticles() {
        const canvas = document.getElementById('landing-particles');
        const container = document.getElementById('landing-view');
        if (!canvas || !container) return;
        
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        let mouse = {
            x: null,
            y: null,
            radius: 120
        };
        
        function resizeCanvas() {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            initParticles();
        }
        
        window.addEventListener('mousemove', (e) => {
            if (state.currentView !== 'landing-view') return;
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
        
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.baseX = this.x;
                this.baseY = this.y;
                this.size = Math.random() * 2 + 1;
                this.color = this.getRandomColor();
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.density = (Math.random() * 20) + 10;
            }
            
            getRandomColor() {
                const rand = Math.random();
                if (rand < 0.6) return 'rgba(122, 0, 194, ' + (Math.random() * 0.3 + 0.2) + ')'; // Purple
                if (rand < 0.85) return 'rgba(255, 200, 44, ' + (Math.random() * 0.4 + 0.3) + ')'; // Yellow
                return 'rgba(27, 27, 27, ' + (Math.random() * 0.2 + 0.15) + ')'; // Charcoal/Dark Grey
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            
            update() {
                this.baseX += this.vx;
                this.baseY += this.vy;
                
                if (this.baseX < 0) this.baseX = canvas.width;
                if (this.baseX > canvas.width) this.baseX = 0;
                if (this.baseY < 0) this.baseY = canvas.height;
                if (this.baseY > canvas.height) this.baseY = 0;
                
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = forceDirectionX * force * this.density;
                        let directionY = forceDirectionY * force * this.density;
                        
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        if (this.x !== this.baseX) {
                            let dxHome = this.x - this.baseX;
                            this.x -= dxHome / 20;
                        }
                        if (this.y !== this.baseY) {
                            let dyHome = this.y - this.baseY;
                            this.y -= dyHome / 20;
                        }
                    }
                } else {
                    if (this.x !== this.baseX) {
                        let dxHome = this.x - this.baseX;
                        this.x -= dxHome / 20;
                    }
                    if (this.y !== this.baseY) {
                        let dyHome = this.y - this.baseY;
                        this.y -= dyHome / 20;
                    }
                }
            }
        }
        
        function initParticles() {
            particlesArray = [];
            const numberOfParticles = Math.floor((canvas.width * canvas.height) / 11000);
            for (let i = 0; i < numberOfParticles; i++) {
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                particlesArray.push(new Particle(x, y));
            }
        }
        
        let isAnimating = false;
        function animate() {
            if (state.currentView !== 'landing-view') {
                isAnimating = false;
                return;
            }
            isAnimating = true;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            connectParticles();
            requestAnimationFrame(animate);
        }
        
        function connectParticles() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let dx = particlesArray[a].x - particlesArray[b].x;
                    let dy = particlesArray[a].y - particlesArray[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 75) {
                        opacityValue = 1 - (distance / 75);
                        ctx.strokeStyle = 'rgba(122, 0, 194, ' + opacityValue * 0.12 + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        resumeLandingParticles = function() {
            if (!isAnimating) {
                animate();
            }
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();
    }

    function initMagneticButton() {
        const button = document.getElementById('btn-landing-enter-magnetic');
        if (!button) return;
        
        document.addEventListener('mousemove', (e) => {
            if (state.currentView !== 'landing-view') return;
            
            const bound = button.getBoundingClientRect();
            const buttonCenterX = bound.left + bound.width / 2;
            const buttonCenterY = bound.top + bound.height / 2;
            
            const deltaX = e.clientX - buttonCenterX;
            const deltaY = e.clientY - buttonCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            const pullRadius = 140;
            
            if (distance < pullRadius) {
                const force = (pullRadius - distance) / pullRadius;
                const pullX = deltaX * force * 0.45;
                const pullY = deltaY * force * 0.45;
                
                button.style.transition = 'transform 0.1s ease-out';
                button.style.transform = `translate(${pullX}px, ${pullY}px)`;
            } else {
                button.style.transition = 'transform 0.3s ease-out';
                button.style.transform = 'translate(0px, 0px)';
            }
        });
    }

    function initCardTiltEffect() {
        const grid = document.getElementById('artist-grid');
        if (!grid) return;
        
        grid.addEventListener('mousemove', (e) => {
            const card = e.target.closest('.artist-card');
            if (!card) return;
            
            const rect = card.getBoundingClientRect();
            const cardWidth = rect.width;
            const cardHeight = rect.height;
            
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const xVal = (mouseX - cardWidth / 2) / (cardWidth / 2); // -1 to 1
            const yVal = (mouseY - cardHeight / 2) / (cardHeight / 2); // -1 to 1
            
            const maxTilt = 10;
            const rotateX = -yVal * maxTilt;
            const rotateY = xVal * maxTilt;
            
            card.style.transition = 'transform 0.05s ease-out';
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        grid.addEventListener('mouseout', (e) => {
            const card = e.target.closest('.artist-card');
            if (!card) return;
            
            const related = e.relatedTarget;
            if (related && card.contains(related)) return;
            
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    }

    function initCustomCursor() {
        const dot = document.getElementById('custom-cursor-dot');
        const ring = document.getElementById('custom-cursor-ring');
        
        if (!dot || !ring) return;
        
        // Detect touch devices (no precise pointer) and disable custom cursor
        if (window.matchMedia('(pointer: coarse)').matches) {
            dot.style.display = 'none';
            ring.style.display = 'none';
            return;
        }
        
        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;
        
        // Initially hide cursor until first mouse movement
        dot.style.opacity = '0';
        ring.style.opacity = '0';
        dot.style.transition = 'opacity 0.3s ease, width 0.2s ease, height 0.2s ease, background-color 0.2s ease';
        ring.style.transition = 'opacity 0.3s ease, width 0.3s ease, height 0.3s ease, border-color 0.3s ease, background-color 0.3s ease';
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Instantly position the central dot
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
            
            // Fade in cursors upon mouse activity
            dot.style.opacity = '1';
            ring.style.opacity = '1';
        });
        
        // Trailing ring with lag/inertia using requestAnimationFrame loop (60fps)
        function animateRing() {
            // Ring lags slightly (moves 15% closer to target coordinates per frame)
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            
            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;
            
            requestAnimationFrame(animateRing);
        }
        animateRing();
        
        // Hover state trigger for interactive targets
        document.addEventListener('mouseover', (e) => {
            const target = e.target;
            const isInteractive = target.closest('a') || 
                                  target.closest('button') || 
                                  target.closest('select') || 
                                  target.closest('input') || 
                                  target.closest('textarea') || 
                                  target.closest('label') ||
                                  target.closest('.artist-card') || 
                                  target.closest('.btn-style') || 
                                  target.closest('.btn-category') ||
                                  target.closest('.carousel-3d-item') ||
                                  target.closest('.gallery-item') ||
                                  target.closest('.tab-link') ||
                                  target.closest('.btn-favorite') ||
                                  target.closest('.nav-link') ||
                                  target.closest('.info-action-link') ||
                                  target.closest('.btn-more-styles') ||
                                  target.style.cursor === 'pointer';
                                  
            if (isInteractive) {
                dot.classList.add('hovered');
                ring.classList.add('hovered');
            } else {
                dot.classList.remove('hovered');
                ring.classList.remove('hovered');
            }
        });
        
        // Click effect triggers scale/color changes
        window.addEventListener('mousedown', () => {
            ring.classList.add('active');
            dot.classList.add('active');
        });
        
        window.addEventListener('mouseup', () => {
            ring.classList.remove('active');
            dot.classList.remove('active');
        });
        
        // Hide custom cursor elements if mouse leaves the screen viewport bounds
        document.addEventListener('mouseleave', () => {
            dot.style.opacity = '0';
            ring.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            dot.style.opacity = '1';
            ring.style.opacity = '1';
        });
    }

    function initTattooDrawingAnimation() {
        const svg = document.getElementById('landing-drawing-svg');
        if (!svg) return;
        
        // Define paths for 3 designs (relative to a 200x200 viewBox)
        const designs = [
            {
                name: 'mandala',
                viewBox: '0 0 200 200',
                paths: [
                    'M 100,100 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0',
                    'M 95,65 A 35,35 0 0,0 95,135 A 30,30 0 0,1 95,65',
                    'M 100,50 L 100,20',
                    'M 100,150 L 100,180',
                    'M 50,100 L 20,100',
                    'M 150,100 L 180,100',
                    'M 65,65 L 45,45',
                    'M 135,65 L 155,45',
                    'M 65,135 L 45,155',
                    'M 135,135 L 155,155',
                    'M 100,100 m -55,0 a 55,55 0 1,0 110,0 a 55,55 0 1,0 -110,0'
                ]
            },
            {
                name: 'rose',
                viewBox: '0 0 200 200',
                paths: [
                    'M 100,60 C 80,45 60,65 80,85 C 95,100 115,80 100,60', // central petal
                    'M 80,85 C 65,95 75,115 100,105 C 120,95 115,75 100,60', // outer petal 1
                    'M 100,105 C 105,125 115,145 100,175', // stem
                    'M 102,120 C 120,125 125,115 102,120', // leaf right
                    'M 98,135 C 80,140 75,130 98,135', // leaf left
                    'M 100,60 C 110,40 130,55 115,75' // outer petal 2
                ]
            },
            {
                name: 'swallow',
                viewBox: '0 0 200 200',
                paths: [
                    'M 40,85 C 45,80 55,75 60,80', // beak
                    'M 60,80 C 80,45 110,15 120,35 C 105,50 90,70 80,85', // top wing
                    'M 80,85 C 95,95 110,100 130,105', // body line
                    'M 130,105 C 150,110 165,105 175,115 C 160,120 150,130 140,125 C 125,120 105,115 80,110', // tail
                    'M 80,110 C 70,125 50,160 40,150 C 55,135 70,105 80,85' // bottom wing
                ]
            }
        ];
        
        let currentDrawTimeout = null;
        let isActive = true;
        
        function drawNextTattoo() {
            if (!isActive || state.currentView !== 'landing-view') return;
            
            // Clean previous drawing elements
            svg.innerHTML = '';
            
            // Pick a random design
            const design = designs[Math.floor(Math.random() * designs.length)];
            
            // Position randomly in the landing-view
            const containerWidth = svg.clientWidth || window.innerWidth;
            const containerHeight = svg.clientHeight || window.innerHeight;
            
            // Avoid center area where logo, tagline, and button are located
            const onRight = Math.random() > 0.5;
            let posX, posY;
            
            if (containerWidth > 900) {
                // Wide screen: place on sides
                posX = onRight 
                    ? Math.random() * (containerWidth / 2 - 280) + (containerWidth / 2 + 100)
                    : Math.random() * (containerWidth / 2 - 280) + 50;
                posY = Math.random() * (containerHeight - 350) + 80;
            } else {
                // Narrow screen: place randomly in top or bottom
                posX = Math.random() * (containerWidth - 220) + 20;
                posY = Math.random() > 0.5 
                    ? Math.random() * 80 + 30
                    : Math.random() * 120 + (containerHeight - 280);
            }
            
            // Create a group for the design
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${posX}, ${posY}) scale(${Math.random() * 0.4 + 0.8})`);
            svg.appendChild(g);
            
            // Colors from palette: Purple (#7A00C2), Yellow/Gold (#FFC82C), Charcoal (#1B1B1B)
            const colors = ['#7A00C2', '#1B1B1B', '#FFC82C'];
            const designColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Create a needle indicator
            const needle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            needle.setAttribute('class', 'tattoo-needle-tip');
            needle.setAttribute('r', '5');
            g.appendChild(needle);
            
            let currentPathIndex = 0;
            
            function drawPath() {
                if (!isActive || state.currentView !== 'landing-view') return;
                
                if (currentPathIndex >= design.paths.length) {
                    // Finished drawing this design! Hide needle, wait, then fade out and draw next
                    needle.classList.remove('active');
                    currentDrawTimeout = setTimeout(() => {
                        g.style.transition = 'opacity 1.5s ease';
                        g.style.opacity = '0';
                        currentDrawTimeout = setTimeout(drawNextTattoo, 1600);
                    }, 4000); // Remain visible for 4s
                    return;
                }
                
                const pathStr = design.paths[currentPathIndex];
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('class', 'tattoo-path active');
                path.setAttribute('d', pathStr);
                path.setAttribute('stroke', designColor);
                path.setAttribute('stroke-width', design.name === 'rose' || design.name === 'swallow' ? '1.8' : '1.3');
                
                // Add path before needle
                g.insertBefore(path, needle);
                
                // Calculate length for drawing effect
                const length = path.getTotalLength();
                path.style.strokeDasharray = length;
                path.style.strokeDashoffset = length;
                
                // Show needle tip
                needle.classList.add('active');
                
                // Animate path drawing and needle position
                const duration = length * 8; // milliseconds per pixel
                let start = null;
                
                function step(timestamp) {
                    if (!isActive || state.currentView !== 'landing-view') return;
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const percent = Math.min(progress / duration, 1);
                    
                    // Draw path
                    path.style.strokeDashoffset = length * (1 - percent);
                    
                    // Move needle to current point
                    try {
                        const currentPoint = path.getPointAtLength(length * percent);
                        needle.setAttribute('cx', currentPoint.x);
                        needle.setAttribute('cy', currentPoint.y);
                    } catch (e) {}
                    
                    if (percent < 1) {
                        requestAnimationFrame(step);
                    } else {
                        currentPathIndex++;
                        setTimeout(drawPath, 150); // Pause between paths
                    }
                }
                
                requestAnimationFrame(step);
            }
            
            setTimeout(drawPath, 200);
        }
        
        // Listen to view changes to toggle animation
        const observer = new MutationObserver(() => {
            const isLandingActive = document.getElementById('landing-view').classList.contains('active');
            if (isLandingActive) {
                if (!isActive) {
                    isActive = true;
                    drawNextTattoo();
                }
            } else {
                isActive = false;
                clearTimeout(currentDrawTimeout);
                svg.innerHTML = '';
            }
        });
        observer.observe(document.getElementById('landing-view'), { attributes: true, attributeFilter: ['class'] });
        
        drawNextTattoo();
        
        window.addEventListener('resize', () => {
            if (state.currentView === 'landing-view') {
                clearTimeout(currentDrawTimeout);
                drawNextTattoo();
            }
        });
    }

    function initLandingVideos() {
        const logoVideo = document.querySelector('.landing-logo-video');
        const logoFallback = document.querySelector('.landing-logo-fallback');
        const maskContainer = document.querySelector('.landing-logo-mask-container');
        const bgVideo = document.querySelector('.landing-bg-video');
        
        // Browser security policies (Same-Origin) block CSS masks of local files under file://
        // If loaded locally via folder double-click, we hide the video elements to fallback cleanly.
        if (window.location.protocol === 'file:') {
            if (logoVideo) logoVideo.style.display = 'none';
            if (bgVideo) bgVideo.style.display = 'none';
            if (logoFallback) logoFallback.style.opacity = '1';
            return;
        }
        
        if (logoVideo && logoFallback && maskContainer) {
            // When the video actually starts playing, transition opacity to show the ink effect inside the mask
            logoVideo.addEventListener('playing', () => {
                maskContainer.style.opacity = '1';
                logoFallback.style.opacity = '0';
            });
            
            // If the video fails to load, stay on the fallback image
            logoVideo.addEventListener('error', () => {
                maskContainer.style.opacity = '0';
                logoFallback.style.opacity = '1';
            });
            
            // Fallback play trigger (in case browser blocks autoplay)
            logoVideo.play().catch(() => {
                maskContainer.style.opacity = '0';
                logoFallback.style.opacity = '1';
            });
        }
    }

    // ==========================================================================
    // HOW IT WORKS — DYNAMIC STEP CARD INTERACTIONS
    // ==========================================================================
    function initHowItWorksCards() {
        const stepCards = document.querySelectorAll('.step-card');
        if (!stepCards.length) return;

        // 1. Scroll-triggered entrance animation using IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger each card entrance by 120ms
                    const delay = parseInt(entry.target.dataset.stepNum || '0') * 120;
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        stepCards.forEach(card => observer.observe(card));

        // 2. Ripple on click + action routing
        const cardActions = {
            'step-card-1': () => {
                // Scroll smoothly to the search/filter area
                const searchInput = document.getElementById('global-search-input');
                if (searchInput) {
                    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => searchInput.focus(), 400);
                }
                showToast('🔍 Usa los filtros de estilo para encontrar tu artista');
            },
            'step-card-2': () => {
                // Scroll to the artist grid cards
                const grid = document.getElementById('artist-grid');
                if (grid) {
                    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                showToast('❤️ Revisa los portafolios y recomendaciones de clientes');
            },
            'step-card-3': () => {
                // Open the first artist's quick sheet drawer to show the booking form
                const firstCard = document.querySelector('.artist-card');
                if (firstCard) {
                    firstCard.click();
                }
                showToast('📅 ¡Así de fácil puedes agendar tu cita!');
            }
        };

        stepCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Ripple effect
                const ripple = document.createElement('span');
                ripple.className = 'step-ripple';
                const rect = card.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * 2;
                ripple.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${e.clientX - rect.left - size / 2}px;
                    top: ${e.clientY - rect.top - size / 2}px;
                `;
                card.appendChild(ripple);
                ripple.addEventListener('animationend', () => ripple.remove());

                // Route to action
                const action = cardActions[card.id];
                if (action) {
                    setTimeout(action, 200);
                }
            });

            // Subtle bounce on mouseenter
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease, background-color 0.2s ease';
            });
        });
    }

    // Initialize Visual FX
    initLandingParticles();
    initMagneticButton();
    initCardTiltEffect();
    initCustomCursor();
    initTattooDrawingAnimation();
    initLandingVideos();
    initHowItWorksCards();

    // ==========================================================================
    // SUPABASE AUTH — LOGIN, REGISTER, SESSION MANAGEMENT
    // ==========================================================================

    // Track current logged-in user id (null when not logged in)
    let currentAuthUserId = null;

    // Helper: set auth button loading state
    function setAuthLoading(formId, loading) {
        const form = document.getElementById(formId);
        if (!form) return;
        const btn = form.querySelector('.auth-submit-btn');
        if (!btn) return;
        btn.disabled = loading;
        btn.querySelector('.btn-text').style.display = loading ? 'none' : 'inline';
        btn.querySelector('.btn-loader').style.display = loading ? 'inline-flex' : 'none';
        lucide.createIcons();
    }

    // Helper: show auth error
    function showAuthError(errorId, message) {
        const el = document.getElementById(errorId);
        if (!el) return;
        el.textContent = message;
        el.style.display = 'block';
    }

    function hideAuthError(errorId) {
        const el = document.getElementById(errorId);
        if (el) el.style.display = 'none';
    }

    // Load artist profile from Supabase by userId
    async function loadArtistProfile(userId) {
        if (!supabaseClient || !userId) return;

        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            // First-time login: new artist — show onboarding
            const authPanel = document.getElementById('tatuador-auth-panel');
            const onboardingPanel = document.getElementById('tatuador-onboarding-panel');
            if (authPanel) authPanel.style.display = 'none';
            if (onboardingPanel) onboardingPanel.style.display = 'block';
            return;
        }

        // Populate state with real profile from Supabase
        state.tatuadorProfile = {
            name: profile.name,
            location: profile.location || 'Araucanía',
            experience: profile.experience || 1,
            price: profile.price || 'Intermedio',
            bio: profile.bio || '',
            inks: profile.inks || [],
            needles: profile.needles || [],
            instagram: profile.instagram || '',
            coords: profile.coords || [-38.7396, -72.5984],
            styles: profile.styles || [],
            billingStatus: profile.billing_status || 'paid'
        };
        state.selectedSubscriptionPlan = profile.plan || 'basic';
        state.isTatuadorSubscribed = true;
        currentAuthUserId = userId;

        // Hydrate or update the artist details in memory
        if (!artistsDetails[userId]) {
            artistsDetails[userId] = {};
        }
        artistsDetails[userId] = {
            name: profile.name,
            location: profile.location || 'Araucanía',
            bio: profile.bio || '',
            instagram: profile.instagram || '',
            avatar: profile.avatar_url || 'assets/logo_pipo.png',
            coords: profile.coords || [-38.7396, -72.5984],
            experience: profile.experience || 1,
            price: profile.price || 'Intermedio',
            styles: profile.styles || [],
            inks: profile.inks || [],
            needles: profile.needles || []
        };
        artistCoordinates[userId] = profile.coords || [-38.7396, -72.5984];

        // Keep 'pipo' default instagram up to date if this user is 'pipo'
        if (userId === 'pipo') {
            artistsDetails['pipo'].instagram = profile.instagram || 'https://www.instagram.com/pipo.tattooo/';
        }

        // Hide auth panel, show workspace
        const authPanel = document.getElementById('tatuador-auth-panel');
        if (authPanel) authPanel.style.display = 'none';

        // Show workspace
        refreshTatuadorWorkspace();

        // Update navbar button to show name
        const btnSoyTatuador = document.getElementById('btn-soy-tatuador');
        if (btnSoyTatuador) {
            btnSoyTatuador.textContent = profile.name || 'Mi Panel';
        }
    }

    // Listen for session changes (handles page reload with active session)
    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await loadArtistProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                currentAuthUserId = null;
                state.isTatuadorSubscribed = false;
                const btnSoyTatuador = document.getElementById('btn-soy-tatuador');
                if (btnSoyTatuador) btnSoyTatuador.textContent = 'Soy tatuador/a';
            }
        });
    }

    // Auth panel tab switching
    const authTabLogin = document.getElementById('auth-tab-login');
    const authTabRegister = document.getElementById('auth-tab-register');
    const authFormLogin = document.getElementById('auth-form-login');
    const authFormRegister = document.getElementById('auth-form-register');

    function switchAuthTab(tab) {
        const isLogin = tab === 'login';
        authTabLogin.classList.toggle('active', isLogin);
        authTabLogin.setAttribute('aria-selected', isLogin);
        authTabRegister.classList.toggle('active', !isLogin);
        authTabRegister.setAttribute('aria-selected', !isLogin);
        authFormLogin.style.display = isLogin ? 'flex' : 'none';
        authFormRegister.style.display = isLogin ? 'none' : 'flex';
        // Hide success/error states
        const successEl = document.getElementById('auth-success-confirm');
        if (successEl) successEl.style.display = 'none';
        hideAuthError('auth-login-error');
        hideAuthError('auth-register-error');
    }

    if (authTabLogin) authTabLogin.addEventListener('click', () => switchAuthTab('login'));
    if (authTabRegister) authTabRegister.addEventListener('click', () => switchAuthTab('register'));

    const btnBackToLogin = document.getElementById('btn-back-to-login');
    if (btnBackToLogin) {
        btnBackToLogin.addEventListener('click', () => {
            document.getElementById('auth-success-confirm').style.display = 'none';
            switchAuthTab('login');
        });
    }

    // Password visibility toggle
    document.querySelectorAll('.auth-toggle-pw').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.querySelector('i').setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
            lucide.createIcons();
        });
    });

    // Password strength meter
    const pwInput = document.getElementById('auth-reg-password');
    const pwFill = document.getElementById('pw-strength-fill');
    const pwLabel = document.getElementById('pw-strength-label');

    if (pwInput && pwFill && pwLabel) {
        pwInput.addEventListener('input', () => {
            const val = pwInput.value;
            let score = 0;
            if (val.length >= 8) score++;
            if (val.length >= 12) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;

            const levels = [
                { pct: '20%', color: '#e53e3e', label: 'Muy débil' },
                { pct: '40%', color: '#dd6b20', label: 'Débil' },
                { pct: '60%', color: '#d69e2e', label: 'Media' },
                { pct: '80%', color: '#38a169', label: 'Fuerte' },
                { pct: '100%', color: '#276749', label: 'Muy fuerte' }
            ];
            const level = levels[Math.max(0, score - 1)] || levels[0];
            pwFill.style.width = val.length ? level.pct : '0%';
            pwFill.style.backgroundColor = level.color;
            pwLabel.textContent = val.length ? level.label : '';
            pwLabel.style.color = val.length ? level.color : '';
        });
    }

    // Login form submit
    if (authFormLogin) {
        authFormLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAuthError('auth-login-error');

            const email = document.getElementById('auth-login-email').value.trim();
            const password = document.getElementById('auth-login-password').value;

            if (!email || !password) {
                showAuthError('auth-login-error', 'Por favor, ingresa tu correo y contraseña.');
                return;
            }

            if (!supabaseClient) {
                showAuthError('auth-login-error', 'Error de conexión con el servidor.');
                return;
            }

            setAuthLoading('auth-form-login', true);

            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

            setAuthLoading('auth-form-login', false);

            if (error) {
                const msg = error.message.includes('Invalid login') || error.message.includes('invalid_credentials')
                    ? 'Correo o contraseña incorrectos.'
                    : error.message.includes('Email not confirmed')
                    ? 'Tu correo no ha sido confirmado. Revisa tu bandeja de entrada.'
                    : `Error: ${error.message}`;
                showAuthError('auth-login-error', msg);
                return;
            }

            // onAuthStateChange will handle the rest
        });
    }

    // Register form submit
    if (authFormRegister) {
        authFormRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAuthError('auth-register-error');

            const studioName = document.getElementById('auth-reg-name').value.trim();
            const email = document.getElementById('auth-reg-email').value.trim();
            const password = document.getElementById('auth-reg-password').value;
            const confirm = document.getElementById('auth-reg-confirm').value;

            if (!studioName || !email || !password || !confirm) {
                showAuthError('auth-register-error', 'Por favor, completa todos los campos.');
                return;
            }
            if (password.length < 8) {
                showAuthError('auth-register-error', 'La contraseña debe tener al menos 8 caracteres.');
                return;
            }
            if (password !== confirm) {
                showAuthError('auth-register-error', 'Las contraseñas no coinciden.');
                return;
            }

            if (!supabaseClient) {
                showAuthError('auth-register-error', 'Error de conexión con el servidor.');
                return;
            }

            setAuthLoading('auth-form-register', true);

            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { display_name: studioName }
                }
            });

            setAuthLoading('auth-form-register', false);

            if (error) {
                const msg = error.message.includes('already registered') || error.message.includes('User already registered')
                    ? 'Ese correo ya tiene una cuenta. Inicia sesión.'
                    : `Error: ${error.message}`;
                showAuthError('auth-register-error', msg);
                return;
            }

            if (data.user) {
                // Create a stub profile row in the DB for this artist
                await supabaseClient.from('profiles').upsert({
                    id: data.user.id,
                    name: studioName,
                    location: 'Araucanía',
                    experience: 1,
                    price: 'Intermedio',
                    bio: '',
                    inks: [],
                    needles: [],
                    instagram: '',
                    coords: [-38.7396, -72.5984],
                    styles: [],
                    billing_status: 'paid',
                    plan: 'basic',
                    avatar_url: 'assets/logo_pipo.png'
                });
            }

            // If email confirmation is enabled, show success message
            if (data.user && !data.session) {
                authFormRegister.style.display = 'none';
                const successEl = document.getElementById('auth-success-confirm');
                if (successEl) successEl.style.display = 'flex';
                return;
            }

            // Auto-confirmed (dev mode) — session already active
            if (data.session) {
                await loadArtistProfile(data.user.id);
            }
        });
    }

    // Updated logout to use Supabase signOut
    const btnTatuadorLogoutEl = document.getElementById('btn-tatuador-logout');
    if (btnTatuadorLogoutEl) {
        // Remove any existing listener by cloning the node
        const freshLogout = btnTatuadorLogoutEl.cloneNode(true);
        btnTatuadorLogoutEl.parentNode.replaceChild(freshLogout, btnTatuadorLogoutEl);

        freshLogout.addEventListener('click', async () => {
            if (supabaseClient) await supabaseClient.auth.signOut();
            
            // Reset local state
            state.isTatuadorSubscribed = false;
            currentAuthUserId = null;
            state.tatuadorProfile = {
                name: 'Studio tatto pipo',
                location: 'Teodoro Schmidt',
                experience: 5,
                price: 'Intermedio',
                bio: '',
                inks: [],
                needles: [],
                instagram: 'https://www.instagram.com/pipo.tattooo/',
                coords: [-39.2045, -73.0538],
                styles: ['Fine Line', 'Blackwork'],
                billingStatus: 'paid'
            };

            // Reset auth panel back to login view
            const authPanel = document.getElementById('tatuador-auth-panel');
            const onboardingPanel = document.getElementById('tatuador-onboarding-panel');
            const workspacePanel = document.getElementById('tatuador-workspace-panel');
            if (authPanel) authPanel.style.display = 'flex';
            if (onboardingPanel) onboardingPanel.style.display = 'none';
            if (workspacePanel) workspacePanel.style.display = 'none';
            switchAuthTab('login');

            // Reset form fields
            ['auth-login-email', 'auth-login-password'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });

            showToast('Sesión cerrada correctamente.');
            switchView('landing-view');
        });
    }

    // Show auth panel by default when clicking "Soy tatuador/a" (unless already logged in)
    const authPanel = document.getElementById('tatuador-auth-panel');
    const tatuadorOnboardingPanel = document.getElementById('tatuador-onboarding-panel');
    const tatuadorWorkspacePanel = document.getElementById('tatuador-workspace-panel');

    // Intercept the "Soy tatuador/a" nav button to manage panel visibility
    const originalBtnSoyTatuador = document.getElementById('btn-soy-tatuador');
    if (originalBtnSoyTatuador) {
        originalBtnSoyTatuador.addEventListener('click', () => {
            // If already logged in, go straight to workspace
            if (state.isTatuadorSubscribed && currentAuthUserId) {
                if (authPanel) authPanel.style.display = 'none';
                if (tatuadorOnboardingPanel) tatuadorOnboardingPanel.style.display = 'none';
                refreshTatuadorWorkspace();
                return;
            }
            // Otherwise show auth panel
            if (authPanel) authPanel.style.display = 'flex';
            if (tatuadorOnboardingPanel) tatuadorOnboardingPanel.style.display = 'none';
            if (tatuadorWorkspacePanel) tatuadorWorkspacePanel.style.display = 'none';
            switchAuthTab('login');
            lucide.createIcons();
        }, { capture: true }); // capture: true so this runs before other click handlers
    }

    // Default start view: landing page
    switchView('landing-view');

    

    // ==========================================================================

    // 11. GENERAL UTILITY HELPER METHODS

    // ==========================================================================

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