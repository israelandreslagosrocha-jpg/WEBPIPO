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

    // All 32 communes of La Araucanía and their central coordinates
    const COMUNAS_COORDS = {
        'Todos': [-38.7396, -72.5984],
        'Temuco': [-38.7396, -72.5984],
        'Padre Las Casas': [-38.7667, -72.6000],
        'Villarrica': [-39.2783, -72.2272],
        'Teodoro Schmidt': [-39.2045, -73.0538],
        'Angol': [-37.7975, -72.7153],
        'Carahue': [-38.7058, -73.1678],
        'Cholchol': [-38.6083, -72.6833],
        'Collipulli': [-37.9575, -72.4419],
        'Cunco': [-38.9242, -72.0333],
        'Curacautín': [-38.4386, -71.8844],
        'Curarrehue': [-39.3622, -71.5878],
        'Ercilla': [-38.0506, -72.3917],
        'Freire': [-38.9564, -72.6567],
        'Galvarino': [-38.4069, -72.7831],
        'Gorbea': [-39.1000, -72.6833],
        'Lautaro': [-38.5303, -72.4475],
        'Loncoche': [-39.3667, -72.7833],
        'Lonquimay': [-38.4411, -71.2403],
        'Los Sauces': [-37.9692, -72.8250],
        'Lumaco': [-38.1500, -72.9167],
        'Melipeuco': [-38.8981, -71.6967],
        'Nueva Imperial': [-38.7439, -72.9511],
        'Perquenco': [-38.4167, -72.3833],
        'Pitrufquén': [-38.9833, -72.6333],
        'Pucón': [-39.2736, -71.9744],
        'Purén': [-38.0333, -73.0833],
        'Renaico': [-37.6692, -72.5897],
        'Saavedra': [-38.7906, -73.3986],
        'Toltén': [-39.2167, -73.2167],
        'Traiguén': [-38.2500, -72.6833],
        'Victoria': [-38.2333, -72.3333],
        'Vilcún': [-38.6500, -72.2333]
    };
    const COMUNAS_LIST = Object.keys(COMUNAS_COORDS).filter(c => c !== 'Todos').sort((a, b) => a.localeCompare(b));

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
            { id: 'wentruart', name: 'Wentruart', location: 'Temuco', plan: 'Premium', status: 'Verificado' },
            { id: 'tattoopucon', name: 'Tattoo Pucón', location: 'Pucón', plan: 'Premium', status: 'Verificado' },
            { id: 'puertotinta', name: 'Puerto Tinta', location: 'Saavedra', plan: 'Premium', status: 'Verificado' }
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
            instagram: 'https://www.instagram.com/pipo.tattooo/',
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
            instagram: 'https://www.instagram.com/pipo.tattooo/',
            avatar: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086795/compressed_Logo_rojo_idv5bn.webp',
            coords: [-39.2045, -73.0538]
        },
        'wentruart': {
            name: 'Wentruart',
            location: 'Temuco',
            bio: 'Taller de tatuajes enfocado en el arte tradicional y neotradicional. Diseños de autor que cuentan historias en la piel.',
            instagram: 'https://www.instagram.com/wentruart',
            avatar: 'https://unavatar.io/instagram/wentruart',
            coords: [-38.7450, -72.6020]
        },
        'tattoopucon': {
            name: 'Tattoo Pucón',
            location: 'Pucón',
            bio: 'El estudio pionero en Pucón. Realismo, puntillismo, acuarela y piezas tribales de gran envergadura.',
            instagram: 'https://www.instagram.com/tattoopucon/',
            avatar: 'https://unavatar.io/instagram/tattoopucon',
            coords: [-39.2736, -71.9744]
        },
        'puertotinta': {
            name: 'Puerto Tinta',
            location: 'Saavedra',
            bio: 'Estudio independiente a orillas de la costa. Diseños inspirados en la naturaleza marina y cultura tradicional.',
            instagram: 'https://www.instagram.com/puertotinta/',
            avatar: 'https://unavatar.io/instagram/puertotinta',
            coords: [-38.7906, -73.3986]
        }
    };

    

    // ==========================================================================

    // 2. DOM ELEMENTS CACHE

    // ==========================================================================

    // DOM ELEMENTS
    const viewPanels = document.querySelectorAll('.view-panel');
    const navLinks = document.querySelectorAll('.nav-link');
    const btnLogoHome = document.getElementById('btn-logo-home');
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
    let carouselItems = document.querySelectorAll('.carousel-3d-item');
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

        // Hide/show yellow menu on dashboard views
        if (targetViewId === 'dashboard-admin-view' || targetViewId === 'dashboard-tatuador-view') {
            appContainer.classList.add('dashboard-active');
        } else {
            appContainer.classList.remove('dashboard-active');
        }

        // Dynamic back-to-home button visibility across all sidebars
        document.querySelectorAll('.floating-sidebar-menu .btn-sidebar-back-home').forEach(btn => {
            if (targetViewId !== 'home-view') {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });

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
        
        // Sync yellow sidebar active state across all sidebars
        document.querySelectorAll('.floating-sidebar-menu .sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        if (targetViewId === 'home-view') {
            document.querySelectorAll('.floating-sidebar-menu .btn-sidebar-home').forEach(item => item.classList.add('active'));
        } else if (targetViewId === 'sabias-que-view') {
            document.querySelectorAll('.floating-sidebar-menu .btn-sidebar-sabias-que').forEach(item => item.classList.add('active'));
        } else if (targetViewId === 'history-view') {
            document.querySelectorAll('.floating-sidebar-menu .btn-sidebar-historia').forEach(item => item.classList.add('active'));
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
    
    // Bind all back-to-home buttons inside dashboards
    document.querySelectorAll('.btn-back-to-home').forEach(btn => {
        btn.addEventListener('click', () => switchView('home-view'));
    });
    

    

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

    // Yellow Sidebar Click Handlers (binds to all instances)
    document.querySelectorAll('.floating-sidebar-menu').forEach(menu => {
        const logo = menu.querySelector('.item-logo');
        if (logo) {
            logo.addEventListener('click', () => switchView('landing-view'));
        }

        const home = menu.querySelector('.btn-sidebar-home');
        if (home) {
            home.addEventListener('click', () => {
                state.activeFilters.onlyFavorites = false;
                document.querySelectorAll('.btn-sidebar-guardados').forEach(btn => btn.classList.remove('active'));
                switchView('home-view');
                applyFilters();
            });
        }

        const backHome = menu.querySelector('.btn-sidebar-back-home');
        if (backHome) {
            backHome.addEventListener('click', () => switchView('home-view'));
        }

        const sabiasQue = menu.querySelector('.btn-sidebar-sabias-que');
        if (sabiasQue) {
            sabiasQue.addEventListener('click', () => switchView('sabias-que-view'));
        }

        const historia = menu.querySelector('.btn-sidebar-historia');
        if (historia) {
            historia.addEventListener('click', () => {
                switchView('history-view');
                const worldTabBtn = document.querySelector('[data-history-tab="history-world"]');
                if (worldTabBtn) worldTabBtn.click();
            });
        }

        const guardados = menu.querySelector('.btn-sidebar-guardados');
        if (guardados) {
            guardados.addEventListener('click', () => {
                state.activeFilters.onlyFavorites = !state.activeFilters.onlyFavorites;
                document.querySelectorAll('.btn-sidebar-guardados').forEach(btn => {
                    if (state.activeFilters.onlyFavorites) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                if (state.activeFilters.onlyFavorites) {
                    showToast('Filtrando por favoritos');
                } else {
                    showToast('Mostrando todos los artistas');
                }
                applyFilters();
            });
        }
    });

    // Trivia balloon "Ver más" link click
    const btnTriviaVerMas = document.getElementById('btn-home-trivia-ver-mas');
    if (btnTriviaVerMas) {
        btnTriviaVerMas.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('sabias-que-view');
        });
    }

    // ¿Sabías que? Editorial interactive slider and details
    const SABIAS_QUE_DATA = [
        {
            title: "1. El origen de la palabra",
            icon: "help-circle",
            colorClass: "yellow",
            body: `La palabra "tatuaje" proviene del término samoano <strong>"tatau"</strong>, que significa "marcar" o "golpear dos veces" (en referencia al sonido rítmico de las herramientas tradicionales de golpeteo). El explorador James Cook la introdujo en el idioma inglés como "tattoo" en el siglo XVIII después de sus expediciones a la Polinesia. Históricamente, este término describe no solo la alteración de la piel, sino todo el ritual social y espiritual que acompañaba al proceso en las islas del Pacífico, donde el tatuaje marcaba el estatus, valor y linaje de una persona.`
        },
        {
            title: "2. La momia de Ötzi y la acupuntura antigua",
            icon: "history",
            colorClass: "red",
            body: `Ötzi, la momia humana natural más antigua descubierta (cerca del 3300 a.C. en los Alpes), cuenta con 61 tatuajes en su cuerpo. Se trata de grupos de líneas y cruces situados en articulaciones y la espalda baja, coincidiendo exactamente con puntos de acupuntura terapéutica moderna, sugiriendo un uso medicinal más que estético. Los escaneos detallados revelaron que Ötzi sufría de artrosis en las zonas tatuadas, lo que refuerza la teoría de que estos cortes rellenos de carbón vegetal tenían un propósito puramente analgésico y de alivio del dolor crónico.`
        },
        {
            title: "3. Tintas modernas y veganismo",
            icon: "shield-check",
            colorClass: "purple",
            body: `En el pasado, muchas tintas utilizaban aglutinantes de origen animal, como gelatina o glicerina, o pigmentos basados en carbón de huesos quemados. Actualmente, la gran mayoría de los artistas de vanguardia emplean tintas 100% veganas y cruelty-free, elaboradas a base de glicerina vegetal y pigmentos minerales de alta pureza. Estas tintas no solo protegen la vida animal, sino que también reducen notablemente el riesgo de reacciones alérgicas y cicatrizaciones defectuosas, siendo mucho más seguras para el organismo.`
        },
        {
            title: "4. ¿Por qué el tatuaje es permanente?",
            icon: "hourglass",
            colorClass: "blue",
            body: `La tinta no se inyecta en la capa externa de la piel (epidermis), sino en la dermis intermedia, cuyas células son sumamente estables. Cuando las agujas depositan la tinta, el cuerpo activa glóbulos blancos (macrófagos) que engullen el pigmento para intentar removerlo, pero al no poder destruirlo, quedan suspendidos en la dermis con el color intacto. A medida que las células de la dermis mueren y se renuevan, son reemplazadas por nuevas células que absorben el mismo pigmento, perpetuando el diseño de por vida.`
        },
        {
            title: "5. El registro arqueológico chileno",
            icon: "map-pin",
            colorClass: "green",
            body: `En el norte de Chile se conserva la evidencia física de tatuajes más antigua de toda América: la momia del cementerio El Morro en Arica (cultura Chinchorro, aprox. 2500 a.C.), que presenta un sutil tatuaje en forma de puntos alineados que forman un bigote falso en el labio superior de un hombre adulto. Este hallazgo demuestra que los pueblos prehispánicos de la costa andina ya utilizaban la modificación corporal permanente con fines identitarios o rituales milenios antes de la llegada de los colonizadores europeos.`
        },
        {
            title: "6. La invención de la máquina eléctrica",
            icon: "zap",
            colorClass: "orange",
            body: `En 1891, el artista neoyorquino Samuel O'Reilly patentó la primera máquina de tatuar eléctrica. Para lograrlo, modificó un invento previo de Thomas Edison: la pluma rotativa para calcar documentos de oficina, agregándole un sistema de bobinas y un tubo portaagujas para inyectar tinta velozmente. Esta innovación revolucionó la industria del tatuaje al permitir realizar diseños mucho más complejos, precisos y rápidos en comparación con los métodos manuales ancestrales.`
        }
    ];

    document.querySelectorAll('.editorial-slide-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.getAttribute('data-index'));
            const data = SABIAS_QUE_DATA[index];
            if (!data) return;

            // Remove active class from all slide cards
            document.querySelectorAll('.editorial-slide-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            // Update details view
            const detailBlock = document.getElementById('editorial-detail-block');
            if (detailBlock) {
                const titleEl = document.getElementById('detail-title');
                const bodyEl = document.getElementById('detail-body');
                const iconWrapper = document.getElementById('detail-icon-wrapper');
                
                if (titleEl) titleEl.textContent = data.title;
                if (bodyEl) bodyEl.innerHTML = data.body;
                
                if (iconWrapper) {
                    iconWrapper.className = `editorial-card-icon-wrapper ${data.colorClass}`;
                    iconWrapper.innerHTML = `<i data-lucide="${data.icon}"></i>`;
                }

                // Re-create lucide icons for the newly injected icon
                lucide.createIcons();
            }
        });
    });

    // Curiosidades Slide Navigation Buttons
    const slideContainer = document.getElementById('editorial-slide-container');
    const btnSlidePrev = document.getElementById('btn-slide-prev');
    const btnSlideNext = document.getElementById('btn-slide-next');

    if (slideContainer && btnSlidePrev && btnSlideNext) {
        btnSlidePrev.addEventListener('click', () => {
            // Scroll left by exactly one card (300px) + gap (20px) = 320px
            slideContainer.scrollBy({ left: -320, behavior: 'smooth' });
        });

        btnSlideNext.addEventListener('click', () => {
            // Scroll right by exactly one card (300px) + gap (20px) = 320px
            slideContainer.scrollBy({ left: 320, behavior: 'smooth' });
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
            state.activeFilters.userCoords = COMUNAS_COORDS[locVal] || COMUNAS_COORDS['Todos'];
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

        document.querySelectorAll('.btn-sidebar-guardados').forEach(btn => btn.classList.remove('active'));

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
        const currentCards = document.querySelectorAll('.artist-card');
        
        currentCards.forEach(card => {
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

            // 1. Distance & location filter
            if (state.activeFilters.locationName && state.activeFilters.locationName !== 'Todos') {
                if (state.activeFilters.distance === 150) {
                    // Strict commune filter (default when no radius is set)
                    if (cardLocation !== state.activeFilters.locationName) {
                        showCard = false;
                    }
                } else {
                    // Radius filter around selected commune
                    const artistCoords = artistCoordinates[cardId];
                    if (artistCoords && state.activeFilters.userCoords) {
                        const dist = getHaversineDistance(state.activeFilters.userCoords, artistCoords);
                        if (dist > state.activeFilters.distance) {
                            showCard = false;
                        }
                    } else {
                        showCard = false;
                    }
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
    document.querySelectorAll('.artist-card').forEach(card => {
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

        const instaHandleEl = document.getElementById('ficha-artist-insta-handle');
        if (instaHandleEl) {
            const handle = details.instagram.substring(details.instagram.lastIndexOf('/') + 1) || 'instagram';
            instaHandleEl.innerHTML = `<i data-lucide="instagram" style="width: 16px; height: 16px;"></i> @${escapeHTML(handle)}`;
        }

        // Render client reviews
        renderFichaComments(artistId);

        // Recreate icons
        lucide.createIcons();

        // Fetch portfolio items for this artist dynamically
        if (supabaseClient) {
            supabaseClient
                .from('portfolio')
                .select('*')
                .eq('artist_id', artistId)
                .then(({ data: items, error }) => {
                    if (!error && items && items.length > 0) {
                        state.portfolioItems = items.map(item => ({
                            src: item.image_url,
                            title: item.title || 'Diseño',
                            style: item.style || 'Fine Line',
                            zone: (item.body_part || 'Brazos').toLowerCase().replace('brazos', 'brazo')
                        }));
                    } else {
                        // Fallback static items
                        state.portfolioItems = [
                            { src: 'assets/tattoo_flower.png', title: 'Diseño Botánico', style: 'Fine Line', zone: 'brazo' },
                            { src: 'assets/tattoo_butterfly.png', title: 'Mariposa Líneas', style: 'Fine Line', zone: 'brazo' }
                        ];
                    }
                    renderFilteredProfileGallery();
                    rebuildCarouselDOM();
                });
        } else {
            renderFilteredProfileGallery();
            rebuildCarouselDOM();
        }

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

                const profInstaLink = document.getElementById('profile-detail-instagram-link');
                if (profInstaLink) profInstaLink.href = details.instagram;
                
                const profInstaHandle = document.getElementById('profile-detail-insta-handle');
                if (profInstaHandle) {
                    const handle = details.instagram.substring(details.instagram.lastIndexOf('/') + 1) || 'instagram';
                    profInstaHandle.innerHTML = `<i data-lucide="instagram" style="width: 16px; height: 16px;"></i> @${escapeHTML(handle)}`;
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
            { id: 'wentruart', name: 'Wentruart', coords: [-38.7450, -72.6020], popup: '<strong>Wentruart</strong><br>Temuco' },
            { id: 'tattoopucon', name: 'Tattoo Pucón', coords: [-39.2736, -71.9744], popup: '<strong>Tattoo Pucón</strong><br>Pucón' },
            { id: 'puertotinta', name: 'Puerto Tinta', coords: [-38.7906, -73.3986], popup: '<strong>Puerto Tinta</strong><br>Saavedra' }
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
    }
        
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
                        instagram: 'https://www.instagram.com/pipo.tattooo/',
                        coords: [-39.2045, -73.0538],
                        styles: ['Fine Line', 'Blackwork'],
                        inks: ['Dynamic Ink', 'Eternal Ink', 'Solid Ink'],
                        needles: ['Kwadron Cartridges', 'Cheyenne Safety Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086795/compressed_Logo_rojo_idv5bn.webp'
                    },
                    {
                        id: 'danilobravotattoo',
                        name: 'Danilo Bravo Tattoo',
                        location: 'Temuco',
                        experience: 10,
                        price: 'Especialista',
                        bio: 'Artista del tatuaje con más de 10 años de experiencia en realismo, dotwork y composiciones personalizadas de gran detalle.',
                        instagram: 'https://www.instagram.com/danilobravotattoo/',
                        coords: [-38.7396, -72.5984],
                        styles: ['Realismo', 'Blackwork', 'Black & Grey'],
                        inks: ['Dynamic Ink', 'Intenze Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'wentruart',
                        name: 'Wentruart',
                        location: 'Temuco',
                        experience: 6,
                        price: 'Intermedio',
                        bio: 'Taller de tatuajes enfocado en el arte tradicional y neotradicional. Diseños de autor que cuentan historias en la piel.',
                        instagram: 'https://www.instagram.com/wentruart',
                        coords: [-38.7450, -72.6020],
                        styles: ['Neo Tradicional', 'Tradicional'],
                        inks: ['Solid Ink', 'Eternal Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'aflordepielchile',
                        name: 'A Flor de Piel Chile',
                        location: 'Temuco',
                        experience: 5,
                        price: 'Accesible',
                        bio: 'Estudio de tatuajes y arte corporal enfocado en Fine Line, botánica y diseños minimalistas con trazos limpios y delicados.',
                        instagram: 'https://www.instagram.com/aflordepielchile',
                        coords: [-38.7350, -72.5900],
                        styles: ['Fine Line', 'Acuarela'],
                        inks: ['Dynamic Ink', 'Silverback Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'andresblacktattoostudios',
                        name: 'Andres Black Tattoo',
                        location: 'Temuco',
                        experience: 7,
                        price: 'Premium',
                        bio: 'Especialista en estilos oscuros, Blackwork denso, realismo y lettering de alto impacto.',
                        instagram: 'https://www.instagram.com/andres_blacktattoostudios',
                        coords: [-38.7420, -72.6100],
                        styles: ['Blackwork', 'Lettering', 'Realismo'],
                        inks: ['Dynamic Ink', 'Intenze Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'rumeltatuajes',
                        name: 'Rumel Tatuajes',
                        location: 'Temuco',
                        experience: 8,
                        price: 'Intermedio',
                        bio: 'Especialista en tatuajes de realismo en sombras y color, con énfasis en retratos y diseños personalizados.',
                        instagram: 'https://www.instagram.com/rumel_tatuajes',
                        coords: [-38.7390, -72.5970],
                        styles: ['Realismo', 'Black & Grey'],
                        inks: ['Solid Ink', 'Eternal Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'rodrigovillaart',
                        name: 'Rodrigo Villa Art',
                        location: 'Victoria',
                        experience: 9,
                        price: 'Especialista',
                        bio: 'Tatuador con una destacada trayectoria nacional. Especialista en realismo a color, retratos y covers complejos.',
                        instagram: 'https://www.instagram.com/rodrigovilla_art',
                        coords: [-38.2333, -72.3333],
                        styles: ['Realismo', 'Full Color', 'Cover-up'],
                        inks: ['Dynamic Ink', 'Intenze Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'pablogtatuajes',
                        name: 'Pablog Tatuajes',
                        location: 'Temuco',
                        experience: 5,
                        price: 'Intermedio',
                        bio: 'Artista enfocado en el estilo ilustrativo, dotwork y Blackwork, entregando piezas originales basadas en tus ideas.',
                        instagram: 'https://www.instagram.com/Pablog_tatuajes',
                        coords: [-38.7405, -72.6080],
                        styles: ['Ilustrativo', 'Puntillismo', 'Blackwork'],
                        inks: ['Solid Ink', 'Dynamic Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'medusatattoochile',
                        name: 'Medusa Tattoo Chile',
                        location: 'Temuco',
                        experience: 6,
                        price: 'Accesible',
                        bio: 'Estudio integrado por artistas emergentes. Diseños personalizados de anime, pop culture y Fine Line.',
                        instagram: 'https://www.instagram.com/medusatattoochile/',
                        coords: [-38.7360, -72.5950],
                        styles: ['Anime', 'Fine Line', 'Full Color'],
                        inks: ['Eternal Ink', 'Solid Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'estudiothelake',
                        name: 'Estudio The Lake',
                        location: 'Villarrica',
                        experience: 7,
                        price: 'Premium',
                        bio: 'Estudio boutique a orillas del lago. Tatuajes de autor en Black & Grey, naturaleza y realismo botánico.',
                        instagram: 'https://www.instagram.com/estudio.thelake/',
                        coords: [-39.2820, -72.2310],
                        styles: ['Black & Grey', 'Fine Line', 'Ilustrativo'],
                        inks: ['Solid Ink', 'Eternal Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'tattoopucon',
                        name: 'Tattoo Pucón',
                        location: 'Pucón',
                        experience: 11,
                        price: 'Especialista',
                        bio: 'El estudio pionero en Pucón. Realismo, puntillismo, acuarela y piezas tribales de gran envergadura.',
                        instagram: 'https://www.instagram.com/tattoopucon/',
                        coords: [-39.2736, -71.9744],
                        styles: ['Realismo', 'Puntillismo', 'Tribal'],
                        inks: ['Dynamic Ink', 'Intenze Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'damiencarrasco',
                        name: 'Damien Carrasco',
                        location: 'Villarrica',
                        experience: 6,
                        price: 'Intermedio',
                        bio: 'Especialista en biomecánico, surrealismo oscuro y Blackwork con técnicas de sombreado avanzadas.',
                        instagram: 'https://www.instagram.com/damien.carrasco',
                        coords: [-39.2770, -72.2220],
                        styles: ['Blackwork', 'Surrealismo', 'Biomecánico'],
                        inks: ['Solid Ink', 'Dynamic Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'francistattoocolor',
                        name: 'Francis Tattoo Color',
                        location: 'Victoria',
                        experience: 5,
                        price: 'Accesible',
                        bio: 'Especialista en tatuajes de acuarela, ilustración botánica y piezas full color con trazos delicados.',
                        instagram: 'https://www.instagram.com/francis_tattoo_color/',
                        coords: [-38.2310, -72.3360],
                        styles: ['Acuarela', 'Full Color', 'Fine Line'],
                        inks: ['Solid Ink', 'Eternal Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'koteknt',
                        name: 'Knt Tattoos',
                        location: 'Cunco',
                        experience: 8,
                        price: 'Intermedio',
                        bio: 'Diseños de autor en estilo tradicional americano, neotradicional y japonés, con colores vibrantes y líneas sólidas.',
                        instagram: 'https://www.instagram.com/koteknt',
                        coords: [-38.9242, -72.0333],
                        styles: ['Tradicional', 'Neo Tradicional', 'Japonés'],
                        inks: ['Solid Ink', 'Eternal Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'abnerjacob',
                        name: 'Abner Jacob',
                        location: 'Lautaro',
                        experience: 7,
                        price: 'Intermedio',
                        bio: 'Piezas realistas y detalladas en Black & Grey, retratos y arte sacro adaptado para la piel.',
                        instagram: 'https://www.instagram.com/abnerjacob_/',
                        coords: [-38.5303, -72.4475],
                        styles: ['Realismo', 'Black & Grey'],
                        inks: ['Solid Ink', 'Dynamic Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'gotapiedratatoo',
                        name: 'Gota Piedra Tattoo',
                        location: 'Victoria',
                        experience: 4,
                        price: 'Accesible',
                        bio: 'Estudio local enfocado en tatuaje comercial, lettering, tribal y piezas minimalistas con excelente higiene.',
                        instagram: 'https://www.instagram.com/gota_piedra_tatoo_victoria/reels/',
                        coords: [-38.2350, -72.3410],
                        styles: ['Lettering', 'Tribal', 'Fine Line'],
                        inks: ['Solid Ink', 'Dynamic Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'puertotinta',
                        name: 'Puerto Tinta',
                        location: 'Saavedra',
                        experience: 6,
                        price: 'Intermedio',
                        bio: 'Estudio independiente a orillas de la costa. Diseños inspirados en la naturaleza marina y cultura tradicional.',
                        instagram: 'https://www.instagram.com/puertotinta/',
                        coords: [-38.7906, -73.3986],
                        styles: ['Tradicional', 'Blackwork'],
                        inks: ['Solid Ink', 'Dynamic Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'tattooantu',
                        name: 'Antu Tattoo',
                        location: 'Carahue',
                        experience: 4,
                        price: 'Accesible',
                        bio: 'Tatuajes de autor inspirados en la flora y fauna local de Carahue. Especialidad en sombras y dotwork.',
                        instagram: 'https://www.instagram.com/tattoo_antu/',
                        coords: [-38.7058, -73.1678],
                        styles: ['Blackwork', 'Puntillismo'],
                        inks: ['Solid Ink', 'Dynamic Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'tattooandroses',
                        name: 'Tattoo & Roses',
                        location: 'Lonquimay',
                        experience: 6,
                        price: 'Intermedio',
                        bio: 'Tatuajes delicados, rosas detalladas, Fine Line y Lettering elegante en la cordillera de Lonquimay.',
                        instagram: 'https://www.instagram.com/tattooandroses/?hl=es-la',
                        coords: [-38.4411, -71.2403],
                        styles: ['Fine Line', 'Lettering'],
                        inks: ['Solid Ink', 'Eternal Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'emiliosftattoos',
                        name: 'Emilio SF Tattoos',
                        location: 'Freire',
                        experience: 5,
                        price: 'Intermedio',
                        bio: 'Especialista en estilos tradicionales, líneas gruesas y colores sólidos. Tatuando desde Freire para toda la región.',
                        instagram: 'https://www.instagram.com/emili0_sf_t4tt0s_/',
                        coords: [-38.9564, -72.6567],
                        styles: ['Tradicional', 'Full Color'],
                        inks: ['Solid Ink', 'Eternal Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'blasphemytattoo',
                        name: 'Blasphemy Tattoo',
                        location: 'Curarrehue',
                        experience: 7,
                        price: 'Premium',
                        bio: 'Estudio privado en Curarrehue. Blackwork oscuro, neotradicional y piezas ilustrativas de gran escala.',
                        instagram: 'https://www.instagram.com/blasphemy_tattoo/?hl=es-la',
                        coords: [-39.3622, -71.5878],
                        styles: ['Blackwork', 'Neo Tradicional', 'Ilustrativo'],
                        inks: ['Solid Ink', 'Dynamic Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'oskargutierreztattoos',
                        name: 'Oskar Gutierrez Tattoos',
                        location: 'Galvarino',
                        experience: 9,
                        price: 'Especialista',
                        bio: 'Artista del tatuaje con trayectoria internacional. Especialista en realismo black & grey de alta gama en Galvarino.',
                        instagram: 'https://www.instagram.com/oskargutierrez.tattoos/?hl=es',
                        coords: [-38.4069, -72.7831],
                        styles: ['Realismo', 'Black & Grey'],
                        inks: ['Dynamic Ink', 'Intenze Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'dannatattoo',
                        name: 'Danna Tattoo',
                        location: 'Loncoche',
                        experience: 4,
                        price: 'Accesible',
                        bio: 'Tatuadora especializada en trazos finos, diseños florales, minimalismo y puntillismo en Loncoche.',
                        instagram: 'https://www.instagram.com/danna.tattoo_/?hl=es-la',
                        coords: [-39.3667, -72.7833],
                        styles: ['Fine Line', 'Puntillismo'],
                        inks: ['Solid Ink', 'Eternal Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'tatuajesaraucania',
                        name: 'Tatuajes Araucanía',
                        location: 'Melipeuco',
                        experience: 6,
                        price: 'Intermedio',
                        bio: 'Tatuajes inspirados en la cordillera de Melipeuco y el Parque Conguillío. Realismo, naturaleza y blackwork.',
                        instagram: 'https://www.instagram.com/tatuajes_araucania/',
                        coords: [-38.8981, -71.6967],
                        styles: ['Realismo', 'Blackwork', 'Ilustrativo'],
                        inks: ['Solid Ink', 'Dynamic Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'yesstattoo',
                        name: 'Yess Tattoo',
                        location: 'Nueva Imperial',
                        experience: 5,
                        price: 'Accesible',
                        bio: 'Estudio de tatuaje higiénico y acogedor en Nueva Imperial. Todo tipo de diseños, covers y lettering personalizado.',
                        instagram: 'https://www.instagram.com/yesstattoo._/',
                        coords: [-38.7439, -72.9511],
                        styles: ['Lettering', 'Fine Line', 'Cover-up'],
                        inks: ['Solid Ink', 'Dynamic Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'basic',
                        avatar_url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'jacketattoos',
                        name: 'Jacke Tattoos',
                        location: 'Pitrufquén',
                        experience: 8,
                        price: 'Intermedio',
                        bio: 'Artista enfocado en el estilo tradicional japonés y neotradicional. Diseños a color y sombras en Pitrufquén.',
                        instagram: 'https://www.instagram.com/jacke_tattoos/',
                        coords: [-38.9833, -72.6333],
                        styles: ['Japonés', 'Neo Tradicional'],
                        inks: ['Solid Ink', 'Eternal Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face'
                    },
                    {
                        id: 'nelsonvergaratatuajes',
                        name: 'Nelson Vergara Tattoos',
                        location: 'Renaico',
                        experience: 8,
                        price: 'Premium',
                        bio: 'Especialista en realismo, retratos familiares y cubrimientos complejos en Renaico y alrededores.',
                        instagram: 'https://www.instagram.com/nelsonvergaratatuajes/',
                        coords: [-37.6692, -72.5897],
                        styles: ['Realismo', 'Black & Grey', 'Cover-up'],
                        inks: ['Solid Ink', 'Dynamic Ink'],
                        needles: ['Kwadron Cartridges'],
                        billing_status: 'paid',
                        plan: 'premium',
                        avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face'
                    }
                ];

                // Map avatars to real Instagram ones dynamically
                const processedProfiles = defaultProfiles.map(p => {
                    if (p.id !== 'pipo') {
                        let username = p.id;
                        try {
                            const urlStr = p.instagram.replace(/\/+$/, '');
                            username = urlStr.substring(urlStr.lastIndexOf('/') + 1);
                            if (username.indexOf('?') > -1) {
                                username = username.substring(0, username.indexOf('?'));
                            }
                        } catch (e) {}
                        p.avatar_url = `https://unavatar.io/instagram/${username}`;
                    }
                    return p;
                });

                const { error: insertError } = await supabaseClient
                    .from('profiles')
                    .insert(processedProfiles);

                if (insertError) {
                    console.error("Error seeding default profiles", insertError);
                    return;
                }

                // Insert default portfolio items
                const defaultPortfolio = [
                    { artist_id: 'pipo', title: 'Trabajo mano', style: 'Fine Line', body_part: 'Brazos', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_mano_tdwwzv.webp' },
                    { artist_id: 'pipo', title: 'Diseño geométrico', style: 'Blackwork', body_part: 'Espalda', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_IMG_4595_wspfa6.webp' },
                    { artist_id: 'pipo', title: 'Tatuaje líneas', style: 'Fine Line', body_part: 'Brazos', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_WhatsApp_Image_2026-07-07_at_10.14.53_PM_ntqzyz.webp' },
                    { artist_id: 'pipo', title: 'Línea fina floral', style: 'Fine Line', body_part: 'Piernas', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_IMG_4314_kezisl.webp' },
                    { artist_id: 'pipo', title: 'Blackwork abstract', style: 'Blackwork', body_part: 'Brazos', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_IMG_4495_bdmmfp.webp' },
                    { artist_id: 'pipo', title: 'Trazos continuos', style: 'Fine Line', body_part: 'Brazos', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086758/compressed_IMG_4125_uuvbwh.webp' },
                    { artist_id: 'pipo', title: 'Tatuaje ornamental', style: 'Blackwork', body_part: 'Espalda', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086758/compressed_IMG_4144_fir9qv.webp' },
                    { artist_id: 'pipo', title: 'Puntillismo flor', style: 'Puntillismo', body_part: 'Piernas', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086756/compressed_IMG_4075_mfide8.webp' },
                    { artist_id: 'pipo', title: 'Composición botánica', style: 'Fine Line', body_part: 'Brazos', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086756/compressed_IMG_3997_k5nt4b.webp' },
                    { artist_id: 'pipo', title: 'Silueta minimalista', style: 'Fine Line', body_part: 'Torso', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086756/compressed_IMG_3861_wa3yyf.webp' },
                    { artist_id: 'pipo', title: 'Tatuaje lineal', style: 'Fine Line', body_part: 'Manos', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086756/compressed_IMG_3179_fvx7ev.webp' },
                    { artist_id: 'pipo', title: 'Diseño lineal fino', style: 'Fine Line', body_part: 'Brazos', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086756/compressed_IMG_3168_zcazow.webp' },
                    { artist_id: 'pipo', title: 'Blackwork flor', style: 'Blackwork', body_part: 'Piernas', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086755/compressed_IMG_2512_vwcl9a.webp' },
                    { artist_id: 'pipo', title: 'Geometría lineal', style: 'Blackwork', body_part: 'Espalda', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086755/compressed_IMG_2638_klaumh.webp' },
                    { artist_id: 'pipo', title: 'Ornamento floral', style: 'Fine Line', body_part: 'Brazos', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086755/compressed_IMG_2014_jxqfuj.webp' },
                    { artist_id: 'pipo', title: 'Trabajo brazo', style: 'Fine Line', body_part: 'Brazos', image_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086755/compressed_brazo_bswodc.webp' },
                    { artist_id: 'danilobravotattoo', title: 'Composición de Mariposas', style: 'Fine Line', body_part: 'Brazos', image_url: 'assets/tattoo_butterfly.png' },
                    { artist_id: 'wentruart', title: 'Ilustración Alien Sketch', style: 'Blackwork', body_part: 'Piernas', image_url: 'assets/tattoo_alien.png' },
                    { artist_id: 'aflordepielchile', title: 'Flor de Loto Fina', style: 'Fine Line', body_part: 'Brazos', image_url: 'assets/tattoo_flower.png' },
                    { artist_id: 'andresblacktattoostudios', title: 'Mandala Puntillista', style: 'Blackwork', body_part: 'Brazos', image_url: 'assets/tattoo_mandala.png' },
                    { artist_id: 'rumeltatuajes', title: 'León Realista', style: 'Realismo', body_part: 'Brazos', image_url: 'assets/tattoo_lion.png' },
                    { artist_id: 'rodrigovillaart', title: 'León Realista en Sombras', style: 'Realismo', body_part: 'Espalda', image_url: 'assets/tattoo_lion.png' },
                    { artist_id: 'pablogtatuajes', title: 'Ilustración Alien Sketch', style: 'Blackwork', body_part: 'Piernas', image_url: 'assets/tattoo_alien.png' },
                    { artist_id: 'medusatattoochile', title: 'Anime Goku Color', style: 'Anime', body_part: 'Piernas', image_url: 'assets/tattoo_anime.png' },
                    { artist_id: 'estudiothelake', title: 'Mandala Puntillista', style: 'Black & Grey', body_part: 'Brazos', image_url: 'assets/tattoo_mandala.png' },
                    { artist_id: 'tattoopucon', title: 'León Realista', style: 'Realismo', body_part: 'Brazos', image_url: 'assets/tattoo_lion.png' },
                    { artist_id: 'damiencarrasco', title: 'Ilustración Alien Sketch', style: 'Blackwork', body_part: 'Piernas', image_url: 'assets/tattoo_alien.png' },
                    { artist_id: 'francistattoocolor', title: 'Flor de Loto Fina', style: 'Acuarela', body_part: 'Brazos', image_url: 'assets/tattoo_flower.png' },
                    { artist_id: 'koteknt', title: 'Composición de Mariposas', style: 'Tradicional', body_part: 'Brazos', image_url: 'assets/tattoo_butterfly.png' },
                    { artist_id: 'abnerjacob', title: 'León Realista', style: 'Realismo', body_part: 'Brazos', image_url: 'assets/tattoo_lion.png' },
                    { artist_id: 'gotapiedratatoo', title: 'Flor de Loto Fina', style: 'Fine Line', body_part: 'Brazos', image_url: 'assets/tattoo_flower.png' },
                    { artist_id: 'puertotinta', title: 'Ilustración Alien Sketch', style: 'Blackwork', body_part: 'Piernas', image_url: 'assets/tattoo_alien.png' },
                    { artist_id: 'tattooantu', title: 'Flor de Loto Fina', style: 'Fine Line', body_part: 'Brazos', image_url: 'assets/tattoo_flower.png' },
                    { artist_id: 'tattooandroses', title: 'Composición de Mariposas', style: 'Fine Line', body_part: 'Brazos', image_url: 'assets/tattoo_butterfly.png' },
                    { artist_id: 'emiliosftattoos', title: 'Ilustración Alien Sketch', style: 'Blackwork', body_part: 'Piernas', image_url: 'assets/tattoo_alien.png' },
                    { artist_id: 'blasphemytattoo', title: 'Mandala Puntillista', style: 'Blackwork', body_part: 'Brazos', image_url: 'assets/tattoo_mandala.png' },
                    { artist_id: 'oskargutierreztattoos', title: 'León Realista', style: 'Realismo', body_part: 'Brazos', image_url: 'assets/tattoo_lion.png' },
                    { artist_id: 'dannatattoo', title: 'Flor de Loto Fina', style: 'Fine Line', body_part: 'Brazos', image_url: 'assets/tattoo_flower.png' },
                    { artist_id: 'tatuajesaraucania', title: 'León Realista en Sombras', style: 'Realismo', body_part: 'Espalda', image_url: 'assets/tattoo_lion.png' },
                    { artist_id: 'yesstattoo', title: 'Flor de Loto Fina', style: 'Fine Line', body_part: 'Brazos', image_url: 'assets/tattoo_flower.png' },
                    { artist_id: 'jacketattoos', title: 'Composición de Mariposas', style: 'Neo Tradicional', body_part: 'Brazos', image_url: 'assets/tattoo_butterfly.png' },
                    { artist_id: 'nelsonvergaratatuajes', title: 'León Realista', style: 'Realismo', body_part: 'Brazos', image_url: 'assets/tattoo_lion.png' }
                ];

                await supabaseClient.from('portfolio').insert(defaultPortfolio);

                // Insert default comments
                const defaultComments = [
                    { artist_id: 'pipo', client_name: 'Martina Rojas', text: 'Increíble trabajo de trazo fino. Muy higiénico y detallista.', status: 'approved' },
                    { artist_id: 'pipo', client_name: 'Lucas Valenzuela', text: 'Excelente atención. Me encantó el diseño de Blackwork que armamos.', status: 'approved' },
                    { artist_id: 'pipo', client_name: 'Sofía Muñoz', text: '¿Tienen disponibilidad para este sábado? Me gustaría cotizar.', status: 'pending' }
                ];

                await supabaseClient.from('comments').insert(defaultComments);
                
                // Insert stats
                const defaultStats = [
                    { artist_id: 'pipo', impressions: 1240, clicks: 340, messages: 18 },
                    { artist_id: 'danilobravotattoo', impressions: 1540, clicks: 420, messages: 24 },
                    { artist_id: 'wentruart', impressions: 930, clicks: 220, messages: 11 },
                    { artist_id: 'aflordepielchile', impressions: 780, clicks: 180, messages: 8 },
                    { artist_id: 'andresblacktattoostudios', impressions: 1150, clicks: 310, messages: 19 },
                    { artist_id: 'rumeltatuajes', impressions: 1220, clicks: 340, messages: 21 },
                    { artist_id: 'rodrigovillaart', impressions: 1410, clicks: 390, messages: 26 },
                    { artist_id: 'pablogtatuajes', impressions: 690, clicks: 150, messages: 6 },
                    { artist_id: 'medusatattoochile', impressions: 840, clicks: 190, messages: 9 },
                    { artist_id: 'estudiothelake', impressions: 1300, clicks: 360, messages: 22 },
                    { artist_id: 'tattoopucon', impressions: 1620, clicks: 450, messages: 31 },
                    { artist_id: 'damiencarrasco', impressions: 790, clicks: 180, messages: 8 },
                    { artist_id: 'francistattoocolor', impressions: 710, clicks: 160, messages: 7 },
                    { artist_id: 'koteknt', impressions: 980, clicks: 230, messages: 12 },
                    { artist_id: 'abnerjacob', impressions: 1040, clicks: 260, messages: 14 },
                    { artist_id: 'gotapiedratatoo', impressions: 610, clicks: 120, messages: 4 },
                    { artist_id: 'puertotinta', impressions: 890, clicks: 200, messages: 10 },
                    { artist_id: 'tattooantu', impressions: 640, clicks: 130, messages: 5 },
                    { artist_id: 'tattooandroses', impressions: 950, clicks: 210, messages: 9 },
                    { artist_id: 'emiliosftattoos', impressions: 720, clicks: 160, messages: 7 },
                    { artist_id: 'blasphemytattoo', impressions: 1120, clicks: 290, messages: 15 },
                    { artist_id: 'oskargutierreztattoos', impressions: 1450, clicks: 380, messages: 23 },
                    { artist_id: 'dannatattoo', impressions: 590, clicks: 110, messages: 4 },
                    { artist_id: 'tatuajesaraucania', impressions: 830, clicks: 190, messages: 10 },
                    { artist_id: 'yesstattoo', impressions: 690, clicks: 140, messages: 6 },
                    { artist_id: 'jacketattoos', impressions: 1020, clicks: 240, messages: 13 },
                    { artist_id: 'nelsonvergaratatuajes', impressions: 1250, clicks: 310, messages: 18 }
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

            // Fetch portfolio to get cover images
            const { data: portfolioItems, error: portError } = await supabaseClient
                .from('portfolio')
                .select('*');

            const portfolioCovers = {};
            if (!portError && portfolioItems) {
                portfolioItems.forEach(item => {
                    if (!portfolioCovers[item.artist_id]) {
                        portfolioCovers[item.artist_id] = item.image_url;
                    }
                });
            }

            // Silent DB updates for static demo profiles
            try {
                const pipoProfile = profiles.find(p => p.id === 'pipo');
                if (pipoProfile && (pipoProfile.avatar_url !== 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086795/compressed_Logo_rojo_idv5bn.webp' || pipoProfile.instagram !== 'https://www.instagram.com/pipo.tattooo/')) {
                    supabaseClient
                        .from('profiles')
                        .update({ 
                            avatar_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086795/compressed_Logo_rojo_idv5bn.webp',
                            instagram: 'https://www.instagram.com/pipo.tattooo/'
                        })
                        .eq('id', 'pipo')
                        .then(() => console.log("Supabase: pipo profile corrected in database"));
                }
            } catch (err) {
                console.error("Database self-healing update failed", err);
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
                    instagram: p.id === 'pipo' ? 'https://www.instagram.com/pipo.tattooo/' : (p.instagram || ''),
                    avatar: p.id === 'pipo' ? 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086795/compressed_Logo_rojo_idv5bn.webp' : 
                            (p.avatar_url || 'assets/logo_pipo.png'),
                    coords: p.coords,
                    experience: p.experience,
                    price: p.price,
                    styles: p.styles || [],
                    inks: p.inks || [],
                    needles: p.needles || [],
                    coverImage: portfolioCovers[p.id] || 'assets/tattoo_flower.png'
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
                        instagram: 'https://www.instagram.com/pipo.tattooo/',
                        avatar_url: 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086795/compressed_Logo_rojo_idv5bn.webp',
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
            updateLocationDropdowns();

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
            addNewArtistCardToGrid(artist.name, artist.location, artist.experience || 5, artist.styles, id, artist.avatar, artist.coverImage);
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
        if (totalItems === 0) return;
        
        carouselItems.forEach((item, index) => {
            item.className = 'carousel-3d-item'; // Reset class names
            
            if (index === state.carouselIndex) {
                item.classList.add('active');
            } else if (totalItems >= 3) {
                if (index === (state.carouselIndex - 1 + totalItems) % totalItems) {
                    item.classList.add('prev');
                } else if (index === (state.carouselIndex + 1) % totalItems) {
                    item.classList.add('next');
                }
            } else if (totalItems === 2) {
                if (index !== state.carouselIndex) {
                    item.classList.add('next');
                }
            }
        });
    }

    function rebuildCarouselDOM() {
        const container = document.getElementById('carousel-3d');
        if (!container) return;
        
        container.innerHTML = ''; // Clear static ones
        
        const itemsToUse = state.portfolioItems.slice(0, 5);
        if (itemsToUse.length === 0) return;
        
        itemsToUse.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'carousel-3d-item';
            div.innerHTML = `<img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.title)}">`;
            
            div.addEventListener('click', () => {
                if (state.carouselIndex !== index) {
                    state.carouselIndex = index;
                    updateCarouselDOM();
                } else {
                    openLightbox(item.src, item.title);
                }
            });
            
            container.appendChild(div);
        });
        
        state.carouselIndex = 0;
        carouselItems = container.querySelectorAll('.carousel-3d-item');
        updateCarouselDOM();
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
            const pricingBasicInput = document.getElementById('pricing-basic-val');
            const pricingPremiumInput = document.getElementById('pricing-premium-val');
            
            if (pricingBasicInput && pricingPremiumInput) {
                const basicVal = pricingBasicInput.value.trim();
                const premiumVal = pricingPremiumInput.value.trim();
                
                if (basicVal !== '' && premiumVal !== '') {
                    localStorage.setItem('pricing_basic', basicVal);
                    localStorage.setItem('pricing_premium', premiumVal);
                    
                    updateDynamicPricingUI();
                    showToast('¡Configuración de tarifas guardada y aplicada!');
                } else {
                    showToast('Por favor, ingresa tarifas válidas.');
                }
            }
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
            updateDynamicPricingUI();
            
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

            // Update location dropdowns dynamically based on active locations
            updateLocationDropdowns();

            showToast('¡Perfil creado exitosamente! Bienvenido a Tinta Conectada.');
            refreshTatuadorWorkspace();
        });
    }

    // Helper to dynamically inject new artist card
    function addNewArtistCardToGrid(name, loc, exp, styles, artistId, avatarUrl, coverImage) {
        const grid = document.getElementById('artist-grid');
        // Use explicit artistId if provided, else derive from name
        const safeId = artistId || name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const avatar = (avatarUrl === 'assets/logo_pipo.png' && safeId !== 'pipo') 
            ? 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1782924161/compressed_Group_5_exrcfx.webp' 
            : (avatarUrl || 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1782924161/compressed_Group_5_exrcfx.webp');
        
        const card = document.createElement('article');
        card.className = 'artist-card';
        card.setAttribute('data-id', safeId);
        card.setAttribute('data-location', loc);
        
        const stylesStr = JSON.stringify(styles || ['Fine Line']).replace(/"/g, "'");
        card.setAttribute('data-styles', stylesStr);
        card.setAttribute('data-exp', exp);
        card.setAttribute('data-price', 'Intermedio');

        const artistInfo = artistsDetails[safeId];
        const instagram = (artistInfo && artistInfo.instagram) ? artistInfo.instagram : 'https://instagram.com';
        const instagramHandle = instagram.substring(instagram.lastIndexOf('/') + 1) || 'instagram';
        
        const safeCover = coverImage || (artistInfo && artistInfo.coverImage) || 'assets/tattoo_flower.png';
        
        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${escapeHTML(safeCover)}" alt="Tatuaje de ${escapeHTML(name)}" class="card-tattoo-img">
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
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span class="artist-loc"><i data-lucide="map-pin"></i> ${escapeHTML(loc)}</span>
                            <span class="artist-insta"><i data-lucide="instagram"></i> @${escapeHTML(instagramHandle)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="artist-tags">
                     ${(styles || ['Fine Line']).slice(0, 2).map(s => `<span class="tag">${escapeHTML(s)}</span>`).join('')}
                     ${(styles || []).length > 2 ? `<span class="tag tag-count">+${(styles || []).length - 2}</span>` : ''}
                </div>
                
                <div class="artist-meta">
                     <span class="meta-exp">${escapeHTML(String(exp))} años tatuando</span>
                     <a href="${escapeHTML(instagram)}" target="_blank" class="btn-contactar" rel="noopener noreferrer">Contactar</a>
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
            updateBillingUI();
            updateDynamicPricingUI();
            
            document.getElementById('workspace-sidebar-name').textContent = state.tatuadorProfile.name;
            document.getElementById('workspace-sidebar-plan').textContent = state.selectedSubscriptionPlan === 'basic' ? 'Plan Básico' : 'Plan Premium';
            
            renderWorkspacePortfolio();
            renderWorkspaceAppointments();
            renderDashboardComments();

            // Refresh Leaflet map size to avoid grey container when workspace goes visible
            if (window.artistProfileMapInstance) {
                setTimeout(() => {
                    window.artistProfileMapInstance.invalidateSize();
                    if (state.tatuadorProfile.coords) {
                        window.artistProfileMapInstance.setView(state.tatuadorProfile.coords, 13);
                        if (window.artistProfileMarkerInstance) {
                            window.artistProfileMarkerInstance.setLatLng(state.tatuadorProfile.coords);
                        }
                        // Reverse-geocode coordinates to load correct street address on screen refresh!
                        reverseGeocodeMock(state.tatuadorProfile.coords[0], state.tatuadorProfile.coords[1]);
                    }
                }, 150);
            }
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
            console.log("Profile form submit event triggered.");
            showToast('Guardando y sincronizando datos...');
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
            const sidebarNameEl = document.getElementById('workspace-sidebar-name');
            if (sidebarNameEl) sidebarNameEl.textContent = name;
            
            // Sync drawer details on active profile if it matches first card
            const bioTextEl = document.getElementById('profile-bio-text');
            if (bioTextEl) bioTextEl.textContent = bio;
            
            const expTextEl = document.getElementById('profile-exp-text');
            if (expTextEl) expTextEl.textContent = `${exp}+ Años de trayectoria profesional`;
            
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
                
                const cardNameEl = card.querySelector('.artist-name');
                if (cardNameEl) cardNameEl.textContent = name;

                const cardLocEl = card.querySelector('.artist-loc');
                if (cardLocEl) cardLocEl.innerHTML = `<i data-lucide="map-pin"></i> ${escapeHTML(loc)}`;

                const cardExpEl = card.querySelector('.meta-exp');
                if (cardExpEl) cardExpEl.textContent = `${escapeHTML(exp)}+ años tatuando`;
                
                const priceEl = card.querySelector('.meta-price');
                if (priceEl) {
                    let priceSymbols = '$$';
                    if (price === 'Accesible') priceSymbols = '$';
                    else if (price === 'Premium') priceSymbols = '$$$';
                    else if (price === 'Especialista') priceSymbols = '$$$$';
                    priceEl.innerHTML = `<span class="price-highlight">${priceSymbols}</span> ${escapeHTML(price)}`;
                }
                
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

            // Update location dropdowns dynamically based on active locations
            updateLocationDropdowns();

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
                        if (error) {
                            console.error("Error saving profile to Supabase:", error);
                            showToast(`Error al guardar en Supabase: ${error.message || 'Sin autorización o RLS'}`);
                        } else {
                            console.log(`Supabase: Profile updated successfully for ${artistId}`);
                            showToast('¡Ficha guardada y sincronizada con la nube!');
                        }
                    })
                    .catch((err) => {
                        console.error("Supabase upsert rejected:", err);
                        showToast(`Fallo de conexión o consulta: ${err.message || err}`);
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
                        window.artistProfileMapInstance.invalidateSize();
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
            updateDynamicPricingUI();

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
            updateDynamicPricingUI();

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

    // 12. DYNAMIC LOCATION DROPDOWN UPDATER
    function updateLocationDropdowns() {
        const activeLocations = new Set(Object.values(artistsDetails).map(artist => artist.location));

        // 1. Populate/Update the public search filter dropdown (#filter-location-select)
        const filterSelect = document.getElementById('filter-location-select');
        if (filterSelect) {
            const currentValue = filterSelect.value;
            filterSelect.innerHTML = '<option value="Todos">Ubicación (Todas)</option>';
            
            COMUNAS_LIST.forEach(comuna => {
                const opt = document.createElement('option');
                opt.value = comuna;
                const hasArtist = activeLocations.has(comuna);
                if (hasArtist) {
                    opt.textContent = comuna;
                } else {
                    opt.textContent = `${comuna} (Sin artistas)`;
                    opt.disabled = true;
                }
                filterSelect.appendChild(opt);
            });
            // Re-set current selection if it exists and is not disabled
            const selectedOpt = filterSelect.querySelector(`option[value="${currentValue}"]`);
            if (selectedOpt && !selectedOpt.disabled) {
                filterSelect.value = currentValue;
            } else {
                filterSelect.value = 'Todos';
                state.activeFilters.locationName = 'Todos';
            }
        }

        // 2. Populate/Update the artist registration dropdown (#reg-art-location)
        const regSelect = document.getElementById('reg-art-location');
        if (regSelect) {
            const currentValue = regSelect.value;
            regSelect.innerHTML = '';
            COMUNAS_LIST.forEach(comuna => {
                const opt = document.createElement('option');
                opt.value = comuna;
                opt.textContent = comuna;
                regSelect.appendChild(opt);
            });
            if (currentValue && regSelect.querySelector(`option[value="${currentValue}"]`)) {
                regSelect.value = currentValue;
            } else {
                regSelect.value = 'Temuco';
            }
        }

        // 3. Populate/Update the artist dashboard edit profile dropdown (#edit-art-location)
        const editSelect = document.getElementById('edit-art-location');
        if (editSelect) {
            const currentValue = editSelect.value;
            editSelect.innerHTML = '';
            COMUNAS_LIST.forEach(comuna => {
                const opt = document.createElement('option');
                opt.value = comuna;
                opt.textContent = comuna;
                editSelect.appendChild(opt);
            });
            if (currentValue && editSelect.querySelector(`option[value="${currentValue}"]`)) {
                editSelect.value = currentValue;
            } else if (state.tatuadorProfile && state.tatuadorProfile.location) {
                editSelect.value = state.tatuadorProfile.location;
            } else {
                editSelect.value = 'Teodoro Schmidt';
            }
        }
    }

    // Dynamic pricing manager
    function updateDynamicPricingUI() {
        const priceBasic = localStorage.getItem('pricing_basic') || '14990';
        const pricePremium = localStorage.getItem('pricing_premium') || '29990';

        const formatCLP = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(parseInt(val));

        // 1. Update Admin inputs
        const pricingBasicInput = document.getElementById('pricing-basic-val');
        const pricingPremiumInput = document.getElementById('pricing-premium-val');
        if (pricingBasicInput) pricingBasicInput.value = priceBasic;
        if (pricingPremiumInput) pricingPremiumInput.value = pricePremium;

        // 2. Update Onboarding plan cards text
        const onboardingBasicPrice = document.querySelector('.plans-container .plan-card:nth-child(1) .plan-price');
        if (onboardingBasicPrice) onboardingBasicPrice.innerHTML = `${formatCLP(priceBasic)} <small>/mes</small>`;
        const onboardingPremiumPrice = document.querySelector('.plans-container .plan-card:nth-child(2) .plan-price');
        if (onboardingPremiumPrice) onboardingPremiumPrice.innerHTML = `${formatCLP(pricePremium)} <small>/mes</small>`;

        // 3. Update Onboarding step 3 price details
        const paymentPlanPriceEl = document.getElementById('payment-plan-price');
        if (paymentPlanPriceEl) {
            paymentPlanPriceEl.textContent = `${formatCLP(state.selectedSubscriptionPlan === 'basic' ? priceBasic : pricePremium)}/mes`;
        }

        // 4. Update Tatuador Dashboard "Mi Plan" comparison cards
        const comparisonBasicPrice = document.querySelector('#tatuador-my-plan .pricing-comparison-grid .pricing-plan-card:nth-child(1) .price-tag');
        if (comparisonBasicPrice) comparisonBasicPrice.innerHTML = `${formatCLP(priceBasic)} <span style="font-size: 1rem; font-weight: 700;">CLP / mes</span>`;
        const comparisonPremiumPrice = document.querySelector('#tatuador-my-plan .pricing-comparison-grid .pricing-plan-card:nth-child(2) .price-tag');
        if (comparisonPremiumPrice) comparisonPremiumPrice.innerHTML = `${formatCLP(pricePremium)} <span style="font-size: 1rem; font-weight: 700; color: #000000;">CLP / mes</span>`;

        // 5. Update Billing amount text
        const billingAmountEl = document.getElementById('billing-amount');
        if (billingAmountEl) {
            billingAmountEl.textContent = `${formatCLP(state.selectedSubscriptionPlan === 'basic' ? priceBasic : pricePremium)} CLP`;
        }
    }

    // Initial pricing sync
    updateDynamicPricingUI();

});