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

    const INSTAGRAM_ICON_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>';

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
        activeFilters: {
            userCoords: null,
            styles: new Set(),
            availability: new Set(),
            category: 'Todos',
            distance: 150
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
            {
                        "id": "pipo",
                        "name": "Studio tatto pipo",
                        "location": "Teodoro Schmidt",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "connaink",
                        "name": "Connaink",
                        "location": "Temuco",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "nowss",
                        "name": "nowss.ttt",
                        "location": "Temuco",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "tatto_zimple",
                        "name": "Tatto Zimple",
                        "location": "Padre Las Casas",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "majesus",
                        "name": "majesus.ink",
                        "location": "Villarrica",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "sasori",
                        "name": "sasori.tattoo",
                        "location": "Temuco",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "milenkorn",
                        "name": "milenkorn",
                        "location": "Puc\u00f3n",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "neblink",
                        "name": "Neblink Tattoo",
                        "location": "Temuco",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "anima",
                        "name": "\u00c1nima Artist",
                        "location": "Angol",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "balentina",
                        "name": "balentina.ttt",
                        "location": "Temuco",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "dulcedelimon",
                        "name": "Dulce de Lim\u00f3n Ink",
                        "location": "Villarrica",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "pandetinta",
                        "name": "Pan de Tinta",
                        "location": "Temuco",
                        "plan": "Premium",
                        "status": "Verificado"
            },
            {
                        "id": "denussa",
                        "name": "Denussa Tatua",
                        "location": "Temuco",
                        "plan": "Premium",
                        "status": "Verificado"
            }
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

    

    // Artist details database for the Quick Ficha & Catalog (Araucanía region)
    // Absolute Rule: Zero AI / Stock photos. Only real Cloudinary photos.
    const TINTA_CONECTADA_BRAND_LOGO = 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1782924161/compressed_Group_5_exrcfx.webp';
    const PIPO_OFFICIAL_LOGO = 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086795/compressed_Logo_rojo_idv5bn.webp';

    let artistsDetails = {
        "pipo": {
            "name": "Studio tatto pipo",
            "location": "Teodoro Schmidt",
            "bio": "Tatuador profesional en Teodoro Schmidt, La Araucanía. Especialista en Fine Line, Blackwork, Puntillismo, Botanica, Geometrico.",
            "instagram": "https://www.instagram.com/pipo.tattooo/",
            "handle": "@pipo.tattooo",
            "avatar": PIPO_OFFICIAL_LOGO,
            "coords": [-39.2045, -73.0538],
            "experience": "5 años",
            "price": "Intermedio",
            "styles": ["Fine Line", "Blackwork", "Puntillismo", "Botanica", "Geometrico"],
            "inks": "Dynamic Ink, Eternal Ink, Solid Ink",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_mano_tdwwzv.webp",
            "portfolio": [
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_mano_tdwwzv.webp", "title": "Trabajo Mano", "style": "Fine Line" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_IMG_4595_wspfa6.webp", "title": "Diseño Geométrico Espalda", "style": "Blackwork" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_WhatsApp_Image_2026-07-07_at_10.14.53_PM_ntqzyz.webp", "title": "Tatuaje Líneas Continuas", "style": "Fine Line" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_IMG_4314_kezisl.webp", "title": "Línea Fina Floral Pierna", "style": "Fine Line" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_IMG_4495_bdmmfp.webp", "title": "Blackwork Abstracto Brazo", "style": "Blackwork" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086758/compressed_IMG_4125_uuvbwh.webp", "title": "Trazos Continuos Delicados", "style": "Fine Line" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086758/compressed_IMG_4144_fir9qv.webp", "title": "Tatuaje Ornamental Espalda", "style": "Blackwork" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086756/compressed_IMG_4075_mfide8.webp", "title": "Puntillismo Botánico Flor", "style": "Puntillismo" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086756/compressed_IMG_3997_k5nt4b.webp", "title": "Composición Botánica Brazo", "style": "Botanica" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086756/compressed_IMG_3861_wa3yyf.webp", "title": "Silueta Minimalista Torso", "style": "Fine Line" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086756/compressed_IMG_3179_fvx7ev.webp", "title": "Tatuaje Lineal Manos", "style": "Fine Line" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086756/compressed_IMG_3168_zcazow.webp", "title": "Diseño Lineal Fino Brazo", "style": "Fine Line" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086755/compressed_IMG_2512_vwcl9a.webp", "title": "Blackwork Flor Pierna", "style": "Blackwork" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086755/compressed_IMG_2638_klaumh.webp", "title": "Geometría Lineal Espalda", "style": "Geometrico" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086755/compressed_IMG_2014_jxqfuj.webp", "title": "Ornamento Floral Brazo", "style": "Fine Line" },
                { "src": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086755/compressed_brazo_bswodc.webp", "title": "Composición Completa Brazo", "style": "Fine Line" }
            ]
        },        "connaink": {
            "name": "Connaink",
            "location": "Temuco",
            "bio": "Tatuadora profesional en Temuco, La Araucanía. Especialista en Fine Line y Puntillismo.",
            "instagram": "https://www.instagram.com/connaink/",
            "handle": "@connaink",
            "avatar": "assets/artists_real/connaink/avatar.jpg",
            "coords": [-38.7396, -72.5984],
            "experience": "Menos de 1 año",
            "price": "Intermedio",
            "styles": ["Fine Line", "Puntillismo"],
            "inks": "Dynamic",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "assets/artists_real/connaink/tattoo_1.jpg",
            "portfolio": [
                { "src": "assets/artists_real/connaink/tattoo_1.jpg", "title": "Composición Floral Delicada", "style": "Fine Line" },
                { "src": "assets/artists_real/connaink/tattoo_2.jpg", "title": "Trazo Continuo y Sombra Fina", "style": "Fine Line" },
                { "src": "assets/artists_real/connaink/tattoo_3.jpg", "title": "Diseño de Autor a Pedido", "style": "Fine Line" },
                { "src": "assets/artists_real/connaink/tattoo_4.jpg", "title": "Puntillismo Botánico Fino", "style": "Puntillismo" },
                { "src": "assets/artists_real/connaink/tattoo_5.jpg", "title": "Línea Minimalista en Brazo", "style": "Fine Line" },
                { "src": "assets/artists_real/connaink/tattoo_6.jpg", "title": "Detalle Botánico en Pierna", "style": "Fine Line" },
                { "src": "assets/artists_real/connaink/tattoo_7.jpg", "title": "Lirios Artísticos", "style": "Fine Line" },
                { "src": "assets/artists_real/connaink/tattoo_8.jpg", "title": "Composición Fine Line", "style": "Fine Line" }
            ]
        },
        "nowss": {
            "name": "nowss.ttt",
            "location": "Temuco",
            "bio": "Tatuador profesional en Temuco, La Araucanía. Especialista en Blackwork, Fine Line, Realismo y Puntillismo.",
            "instagram": "https://www.instagram.com/nowss.ttt/",
            "handle": "@nowss.ttt",
            "avatar": "assets/artists_real/nowss/avatar.jpg",
            "coords": [-38.7346, -72.6024],
            "experience": "3–5 años",
            "price": "Intermedio",
            "styles": ["Blackwork", "Fine Line", "Realismo", "Puntillismo"],
            "inks": "Dynamic, Eternal Ink",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "assets/artists_real/nowss/tattoo_1.jpg",
            "portfolio": [
                { "src": "assets/artists_real/nowss/tattoo_1.jpg", "title": "Texturas y Contrastes en Blackwork", "style": "Blackwork" },
                { "src": "assets/artists_real/nowss/tattoo_2.jpg", "title": "Puro Blackwork Geométrico", "style": "Blackwork" },
                { "src": "assets/artists_real/nowss/tattoo_3.jpg", "title": "Sombreado Opaco Profundo", "style": "Blackwork" },
                { "src": "assets/artists_real/nowss/tattoo_4.jpg", "title": "Pieza Blackwork en Brazo", "style": "Blackwork" },
                { "src": "assets/artists_real/nowss/tattoo_5.jpg", "title": "Tatuaje Realista y Textura", "style": "Realismo" },
                { "src": "assets/artists_real/nowss/tattoo_6.jpg", "title": "Detalle Dark Ornamental", "style": "Blackwork" },
                { "src": "assets/artists_real/nowss/tattoo_7.jpg", "title": "Blackwork Pecho y Cuello", "style": "Blackwork" },
                { "src": "assets/artists_real/nowss/tattoo_8.jpg", "title": "Composición Tonal Fina", "style": "Fine Line" }
            ]
        },
        "tatto_zimple": {
            "name": "Tatto Zimple",
            "location": "Padre Las Casas",
            "bio": "Tatuador profesional en Padre Las Casas, La Araucanía. Especialista en Blackwork, Black and Gray, Fine Line, Puntillismo.",
            "instagram": "https://www.instagram.com/tatto_zimple/",
            "handle": "@tatto_zimple",
            "avatar": TINTA_CONECTADA_BRAND_LOGO,
            "coords": [-38.7612, -72.5991],
            "experience": "3–5 años",
            "price": "Intermedio",
            "styles": ["Blackwork", "Black and Gray", "Fine Line", "Puntillismo"],
            "inks": "Dynamic, Solid Ink",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "",
            "portfolio": []
        },
        "majesus": {
            "name": "majesus.ink",
            "location": "Villarrica",
            "bio": "Tatuadora profesional en Villarrica, La Araucanía. Especialista en Fine Line y Lettering.",
            "instagram": "https://www.instagram.com/majesus.ink/",
            "handle": "@majesus.ink",
            "avatar": "assets/artists_real/majesus/avatar.jpg",
            "coords": [-39.2821, -72.2268],
            "experience": "1–3 años",
            "price": "Intermedio",
            "styles": ["Fine Line", "Lettering"],
            "inks": "Dynamic, Radiant",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "assets/artists_real/majesus/tattoo_1.jpg",
            "portfolio": [
                { "src": "assets/artists_real/majesus/tattoo_1.jpg", "title": "Tatuaje Floral Delicado", "style": "Fine Line" },
                { "src": "assets/artists_real/majesus/tattoo_2.jpg", "title": "Lettering Personalizado en Brazo", "style": "Lettering" },
                { "src": "assets/artists_real/majesus/tattoo_3.jpg", "title": "Fine Line Botánico Clavícula", "style": "Fine Line" },
                { "src": "assets/artists_real/majesus/tattoo_4.jpg", "title": "Trazos Finos y Sutiles", "style": "Fine Line" },
                { "src": "assets/artists_real/majesus/tattoo_5.jpg", "title": "Tipografía Exclusiva Mano", "style": "Lettering" },
                { "src": "assets/artists_real/majesus/tattoo_6.jpg", "title": "Ornamento Lineal en Espalda", "style": "Fine Line" },
                { "src": "assets/artists_real/majesus/tattoo_7.jpg", "title": "Mini Tatuaje Lineal", "style": "Fine Line" },
                { "src": "assets/artists_real/majesus/tattoo_8.jpg", "title": "Composición Fine Line Tobillo", "style": "Fine Line" }
            ]
        },
        "sasori": {
            "name": "sasori.tattoo",
            "location": "Temuco",
            "bio": "Tatuador profesional en Temuco, La Araucanía. Especialista en Blackwork, Neotribal, Cybersigilism, Dark Ornamental.",
            "instagram": "https://www.instagram.com/sasori.tattoo.cl/",
            "handle": "@sasori.tattoo.cl",
            "avatar": TINTA_CONECTADA_BRAND_LOGO,
            "coords": [-38.7312, -72.5854],
            "experience": "3–5 años",
            "price": "Intermedio",
            "styles": ["Blackwork", "Neotribal", "Cybersigilism", "Dark Ornamental"],
            "inks": "Dynamic, Eternal Ink, Radiant",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "",
            "portfolio": []
        },
        "milenkorn": {
            "name": "milenkorn",
            "location": "Pucón",
            "bio": "Tatuadora profesional en Pucón, La Araucanía. Especialista en Blackwork y Black and Gray.",
            "instagram": "https://www.instagram.com/milenkorn/",
            "handle": "@milenkorn",
            "avatar": "assets/artists_real/milenkorn/avatar.jpg",
            "coords": [-39.2789, -71.9754],
            "experience": "1–3 años",
            "price": "Intermedio",
            "styles": ["Blackwork", "Black and Gray"],
            "inks": "Dynamic",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "assets/artists_real/milenkorn/tattoo_1.jpg",
            "portfolio": [
                { "src": "assets/artists_real/milenkorn/tattoo_1.jpg", "title": "Metal Gear Solid Arte Playstation", "style": "Blackwork" },
                { "src": "assets/artists_real/milenkorn/tattoo_2.jpg", "title": "Blackwork Ilustrativo Espalda", "style": "Blackwork" },
                { "src": "assets/artists_real/milenkorn/tattoo_3.jpg", "title": "Black and Gray Contrastes", "style": "Black and Gray" },
                { "src": "assets/artists_real/milenkorn/tattoo_4.jpg", "title": "Ilustración Oscura en Brazo", "style": "Blackwork" },
                { "src": "assets/artists_real/milenkorn/tattoo_5.jpg", "title": "Composición Blackwork Pierna", "style": "Blackwork" },
                { "src": "assets/artists_real/milenkorn/tattoo_6.jpg", "title": "Sombreado Black and Gray", "style": "Black and Gray" },
                { "src": "assets/artists_real/milenkorn/tattoo_7.jpg", "title": "Diseño de Personaje en Tinta", "style": "Blackwork" },
                { "src": "assets/artists_real/milenkorn/tattoo_8.jpg", "title": "Pieza Completa Blackwork", "style": "Blackwork" }
            ]
        },
        "neblink": {
            "name": "Neblink Tattoo",
            "location": "Temuco",
            "bio": "Tatuador profesional en Temuco, La Araucanía. Especialista en Blackwork, Black and Gray, Fine Line y Realismo.",
            "instagram": "https://www.instagram.com/nebl.ink/",
            "handle": "@nebl.ink",
            "avatar": TINTA_CONECTADA_BRAND_LOGO,
            "coords": [-38.7380, -72.5940],
            "experience": "3–5 años",
            "price": "Intermedio",
            "styles": ["Blackwork", "Black and Gray", "Fine Line", "Realismo"],
            "inks": "Dynamic, Solid Ink",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "",
            "portfolio": []
        },
        "anima": {
            "name": "Ánima Artist",
            "location": "Angol",
            "bio": "Tatuador profesional en Angol, La Araucanía. Especialista en Blackwork, Fine Line y Ornamental.",
            "instagram": "https://www.instagram.com/anima.artist/",
            "handle": "@anima.artist",
            "avatar": "assets/artists_real/anima/avatar.jpg",
            "coords": [-37.7975, -72.7153],
            "experience": "Más de 5 años",
            "price": "Intermedio",
            "styles": ["Blackwork", "Fine Line", "Ornamental"],
            "inks": "Dynamic, World Famous Tattoo Ink, Intenze, Radiant",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "assets/artists_real/anima/tattoo_1.jpg",
            "portfolio": [
                { "src": "assets/artists_real/anima/tattoo_1.jpg", "title": "Composición Floral y Ornamental", "style": "Ornamental" },
                { "src": "assets/artists_real/anima/tattoo_2.jpg", "title": "Ornamental en Antebrazo", "style": "Ornamental" },
                { "src": "assets/artists_real/anima/tattoo_3.jpg", "title": "Fine Line y Textura Mística", "style": "Fine Line" },
                { "src": "assets/artists_real/anima/tattoo_4.jpg", "title": "Patrón Ornamental Pecho", "style": "Ornamental" },
                { "src": "assets/artists_real/anima/tattoo_5.jpg", "title": "Blackwork Botánico Delicado", "style": "Blackwork" },
                { "src": "assets/artists_real/anima/tattoo_6.jpg", "title": "Diseño Ornamental Espalda", "style": "Ornamental" },
                { "src": "assets/artists_real/anima/tattoo_7.jpg", "title": "Líneas Florales y Acentos", "style": "Fine Line" },
                { "src": "assets/artists_real/anima/tattoo_8.jpg", "title": "Composición Artística Pierna", "style": "Blackwork" }
            ]
        },
        "balentina": {
            "name": "balentina.ttt",
            "location": "Temuco",
            "bio": "Tatuadora profesional en Temuco, La Araucanía. Especialista en Blackwork y Puntillismo.",
            "instagram": "https://www.instagram.com/balentina.ttt/",
            "handle": "@balentina.ttt",
            "avatar": "assets/artists_real/balentina/avatar.jpg",
            "coords": [-38.7456, -72.6034],
            "experience": "3–5 años",
            "price": "Intermedio",
            "styles": ["Blackwork", "Puntillismo"],
            "inks": "Dynamic",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "assets/artists_real/balentina/tattoo_1.jpg",
            "portfolio": [
                { "src": "assets/artists_real/balentina/tattoo_1.jpg", "title": "Diseño de Autor en Puntillismo", "style": "Puntillismo" },
                { "src": "assets/artists_real/balentina/tattoo_2.jpg", "title": "Blackwork Textura y Sombras", "style": "Blackwork" },
                { "src": "assets/artists_real/balentina/tattoo_3.jpg", "title": "Puntillismo Botánico Detallado", "style": "Puntillismo" },
                { "src": "assets/artists_real/balentina/tattoo_4.jpg", "title": "Ilustración en Blackwork", "style": "Blackwork" },
                { "src": "assets/artists_real/balentina/tattoo_5.jpg", "title": "Pieza Floral con Puntillismo", "style": "Puntillismo" },
                { "src": "assets/artists_real/balentina/tattoo_6.jpg", "title": "Composición en Brazo", "style": "Blackwork" },
                { "src": "assets/artists_real/balentina/tattoo_7.jpg", "title": "Puntillismo Ornamental", "style": "Puntillismo" },
                { "src": "assets/artists_real/balentina/tattoo_8.jpg", "title": "Diseño Personalizado en Pierna", "style": "Blackwork" }
            ]
        },
        "dulcedelimon": {
            "name": "Dulce de Limón Ink",
            "location": "Villarrica",
            "bio": "Tatuadora profesional en Villarrica, La Araucanía. Especialista en Blackwork, Fine Line y Puntillismo.",
            "instagram": "https://www.instagram.com/dulcedelimon.ink/",
            "handle": "@dulcedelimon.ink",
            "avatar": "assets/artists_real/dulcedelimon/avatar.jpg",
            "coords": [-39.2733, -72.2312],
            "experience": "1–3 años",
            "price": "Intermedio",
            "styles": ["Blackwork", "Fine Line", "Puntillismo"],
            "inks": "Dynamic",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "assets/artists_real/dulcedelimon/tattoo_1.jpg",
            "portfolio": [
                { "src": "assets/artists_real/dulcedelimon/tattoo_1.jpg", "title": "Zapatito Outdoor Estilizado", "style": "Blackwork" },
                { "src": "assets/artists_real/dulcedelimon/tattoo_2.jpg", "title": "Ave Fénix en Blackwork Fino", "style": "Blackwork" },
                { "src": "assets/artists_real/dulcedelimon/tattoo_3.jpg", "title": "Puntillismo y Trazos Suaves", "style": "Puntillismo" },
                { "src": "assets/artists_real/dulcedelimon/tattoo_4.jpg", "title": "Mini Ilustración en Tinta", "style": "Fine Line" },
                { "src": "assets/artists_real/dulcedelimon/tattoo_5.jpg", "title": "Diseño Botánico Fine Line", "style": "Fine Line" },
                { "src": "assets/artists_real/dulcedelimon/tattoo_6.jpg", "title": "Blackwork con Toque Divertido", "style": "Blackwork" },
                { "src": "assets/artists_real/dulcedelimon/tattoo_7.jpg", "title": "Composición Fina en Tobillo", "style": "Fine Line" },
                { "src": "assets/artists_real/dulcedelimon/tattoo_8.jpg", "title": "Ilustración Dulce de Limón", "style": "Fine Line" }
            ]
        },
        "pandetinta": {
            "name": "Pan de Tinta",
            "location": "Temuco",
            "bio": "Tatuador profesional en Temuco, La Araucanía. Especialista en Blackwork, Fine Line y Puntillismo.",
            "instagram": "https://www.instagram.com/pan.detinta/",
            "handle": "@pan.detinta",
            "avatar": "assets/artists_real/pandetinta/avatar.jpg",
            "coords": [-38.7366, -72.5914],
            "experience": "Más de 5 años",
            "price": "Intermedio",
            "styles": ["Blackwork", "Fine Line", "Puntillismo"],
            "inks": "Dynamic, World Famous Tattoo Ink",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "assets/artists_real/pandetinta/tattoo_1.jpg",
            "portfolio": [
                { "src": "assets/artists_real/pandetinta/tattoo_1.jpg", "title": "Ilustración Gráfica y Tinta Negra", "style": "Blackwork" },
                { "src": "assets/artists_real/pandetinta/tattoo_2.jpg", "title": "Blackwork Conceptual Brazo", "style": "Blackwork" },
                { "src": "assets/artists_real/pandetinta/tattoo_3.jpg", "title": "Puntillismo Texturizado", "style": "Puntillismo" },
                { "src": "assets/artists_real/pandetinta/tattoo_4.jpg", "title": "Diseño Artístico de Autor", "style": "Fine Line" },
                { "src": "assets/artists_real/pandetinta/tattoo_5.jpg", "title": "Pieza en Sombra y Contraste", "style": "Blackwork" },
                { "src": "assets/artists_real/pandetinta/tattoo_6.jpg", "title": "Líneas Fuertes y Fondo Negro", "style": "Blackwork" },
                { "src": "assets/artists_real/pandetinta/tattoo_7.jpg", "title": "Composición Gráfica en Pierna", "style": "Blackwork" },
                { "src": "assets/artists_real/pandetinta/tattoo_8.jpg", "title": "Arte Original Pan de Tinta", "style": "Fine Line" }
            ]
        },
        "denussa": {
            "name": "Denussa Tatua",
            "location": "Temuco",
            "bio": "Tatuadora profesional en Temuco, La Araucanía. Especialista en Fine Line y Puntillismo.",
            "instagram": "https://www.instagram.com/denussatatua/",
            "handle": "@denussatatua",
            "avatar": "assets/artists_real/denussa/avatar.jpg",
            "coords": [-38.7446, -72.5964],
            "experience": "3–5 años",
            "price": "Intermedio",
            "styles": ["Fine Line", "Puntillismo"],
            "inks": "Dynamic, Panthera Black Ink",
            "needles": "Kwadron, Cheyenne",
            "coverImage": "assets/artists_real/denussa/tattoo_1.jpg",
            "portfolio": [
                { "src": "assets/artists_real/denussa/tattoo_1.jpg", "title": "Fine Line Floral y Sutil", "style": "Fine Line" },
                { "src": "assets/artists_real/denussa/tattoo_2.jpg", "title": "Puntillismo Botánico en Brazo", "style": "Puntillismo" },
                { "src": "assets/artists_real/denussa/tattoo_3.jpg", "title": "Trazos Finos en Clavícula", "style": "Fine Line" },
                { "src": "assets/artists_real/denussa/tattoo_4.jpg", "title": "Composición Delicada de Autor", "style": "Fine Line" },
                { "src": "assets/artists_real/denussa/tattoo_5.jpg", "title": "Ilustración Floral Lineal", "style": "Fine Line" },
                { "src": "assets/artists_real/denussa/tattoo_6.jpg", "title": "Puntillismo Suave en Mano", "style": "Puntillismo" },
                { "src": "assets/artists_real/denussa/tattoo_7.jpg", "title": "Detalle Botánico Pierna", "style": "Fine Line" },
                { "src": "assets/artists_real/denussa/tattoo_8.jpg", "title": "Pieza Minimalista en Espalda", "style": "Fine Line" }
            ]
        }
    };
    window.artistsDetails = artistsDetails;

    let artistCoordinates = {
        "pipo": [
                -39.2045,
                -73.0538
        ],
        "connaink": [
                -38.7396,
                -72.5984
        ],
        "nowss": [
                -38.7346,
                -72.6024
        ],
        "tatto_zimple": [
                -38.7667,
                -72.6
        ],
        "majesus": [
                -39.2783,
                -72.2272
        ],
        "sasori": [
                -38.7436,
                -72.5924
        ],
        "milenkorn": [
                -39.2736,
                -71.9744
        ],
        "neblink": [
                -38.7326,
                -72.5934
        ],
        "anima": [
                -37.7975,
                -72.7153
        ],
        "balentina": [
                -38.7456,
                -72.6034
        ],
        "dulcedelimon": [
                -39.2733,
                -72.2312
        ],
        "pandetinta": [
                -38.7366,
                -72.5914
        ],
        "denussa": [
                -38.7446,
                -72.5964
        ]
};
    window.artistCoordinates = artistCoordinates;

    

    

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
        let activateSabiasQueTab = false;
        if (targetViewId === 'sabias-que-view') {
            targetViewId = 'history-view';
            activateSabiasQueTab = true;
        }

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

        // Handle unified landing double tabs activation
        if (targetViewId === 'history-view') {
            if (activateSabiasQueTab) {
                const sabiasBtn = document.getElementById('btn-tab-sabias-que');
                if (sabiasBtn) sabiasBtn.click();
            } else {
                const historiaBtn = document.getElementById('btn-tab-historia');
                if (historiaBtn && !document.getElementById('panel-sabias-que').classList.contains('active')) {
                    historiaBtn.click();
                }
            }
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
        } else if (targetViewId === 'history-view') {
            document.querySelectorAll('.floating-sidebar-menu .btn-sidebar-historia').forEach(item => item.classList.add('active'));
        }
        
        // If switching to home view, refresh map rendering and ensure data is synced
        if (targetViewId === 'home-view') {
            if (mapInstance && typeof mapInstance.resize === 'function') {
                setTimeout(() => {
                    mapInstance.resize();
                }, 100);
            }
            loadSupabaseData();
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
        btnLandingEnter.addEventListener('click', () => {
            switchView('home-view');
            loadSupabaseData();
            setTimeout(() => {
                openUpcomingEventsModal();
            }, 350);
        });
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
    });

    // Trivia bubble "Explorar historia" link click (Punto 7)
    const btnBubbleExploreTrivia = document.getElementById('btn-bubble-explore-trivia');
    if (btnBubbleExploreTrivia) {
        btnBubbleExploreTrivia.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('sabias-que-view');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    const btnTriviaVerMas = document.getElementById('btn-home-trivia-ver-mas');
    if (btnTriviaVerMas) {
        btnTriviaVerMas.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('sabias-que-view');
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Trivia interactive circular bubble dynamic cycle (Punto 7)
    const SABIAS_QUE_CIRCULAR_SUMMARIES = [
        "La palabra 'tatuaje' viene del samoano 'tatau': 'marcar o golpear dos veces'.",
        "Ötzi (3300 a.C.) tenía 61 tatuajes que coinciden con puntos de acupuntura medicinal.",
        "Las tintas modernas son 100% veganas, libres de carbón de hueso o gelatina animal.",
        "Los glóbulos blancos atrapan la tinta en la dermis y la fijan de por vida en la piel.",
        "En Arica (Chile) se halló el tatuaje más antiguo de América: un bigote de 2500 a.C.",
        "En 1891 se patentó la máquina eléctrica adaptando una pluma de Thomas Edison."
    ];

    let currentTriviaIndex = 1; // Start with Ötzi
    const btnCycleTrivia = document.getElementById('btn-cycle-trivia');
    const bubbleTriviaText = document.getElementById('bubble-trivia-text');

    function updateTriviaBubble(index, isAnimated = true) {
        const snippet = SABIAS_QUE_CIRCULAR_SUMMARIES[index];
        if (!snippet || !bubbleTriviaText) return;

        if (isAnimated) {
            bubbleTriviaText.classList.add('anim-fade');
            setTimeout(() => {
                bubbleTriviaText.textContent = snippet;
                bubbleTriviaText.classList.remove('anim-fade');
            }, 160);
        } else {
            bubbleTriviaText.textContent = snippet;
        }
    }

    if (btnCycleTrivia) {
        btnCycleTrivia.addEventListener('click', (e) => {
            e.stopPropagation();
            currentTriviaIndex = (currentTriviaIndex + 1) % SABIAS_QUE_CIRCULAR_SUMMARIES.length;
            updateTriviaBubble(currentTriviaIndex, true);
        });
    }

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
            // Scroll left by card (320px) + gap (20px) = 340px
            slideContainer.scrollBy({ left: -340, behavior: 'smooth' });
        });

        btnSlideNext.addEventListener('click', () => {
            // Scroll right by card (320px) + gap (20px) = 340px
            slideContainer.scrollBy({ left: 340, behavior: 'smooth' });
        });
    }


    

    // ==========================================================================

    // 5. SEARCH & INTERACTIVE FILTERS MODULE

    // ==========================================================================

    // ==========================================================================
    // 5. SELECTOR DE 21 ESTILOS, MODAL MULTISELECCIÓN & GUÍA EDUCATIVA (PUNTO 3)
    // ==========================================================================

    const ESTILOS_CATALOGO = [
        {
            id: 'fine-line',
            name: 'Fine Line',
            subtitle: '(Línea fina)',
            meaning: 'Técnica que utiliza trazos extremadamente delgados, sutiles y precisos. Se caracteriza por su ligereza visual, pulcritud geométrica y detalles diminutos sin bordes gruesos.',
            application: 'Se aplica principalmente con agujas de una sola punta (1RL o 3RL) calibradas a baja penetración dérmica. Exige pulso milimétrico del artista y es ideal para muñecas, clavículas, antebrazos y costillas.',
            artists: ['Studio tatto pipo (@pipo.tattooo)']
        },
        {
            id: 'puntillismo',
            name: 'Puntillismo',
            subtitle: '(Dotwork)',
            meaning: 'Estilo óptico que construye volúmenes, sombras profundas y figuras completas exclusivamente mediante miles de pequeños puntos de tinta agrupados con diferente densidad.',
            application: 'El artista varía la presión y separación entre impactos de la aguja para generar degradados tridimensionales limpios sin arrastre continuo. Provoca menor trauma en la piel y excelente curación.',
            artists: ['Studio tatto pipo (@pipo.tattooo)', 'Tattoo Pucón (@tattoopucon)']
        },
        {
            id: 'blackwork',
            name: 'Blackwork',
            subtitle: '(Tinta negra)',
            meaning: 'Enfoque audaz basado exclusivamente en tinta negra pura: bloques sólidos y densos, alto contraste visual, texturas gráficas y ausencia total de colores o diluciones intermedias.',
            application: 'Emplea agujas de gran calibre (Magnum) con saturación intensa y homogénea en dermis profunda. Perfecto para siluetas contundentes, mangas completas y tapado de tatuajes antiguos (cover-ups).',
            artists: ['Studio tatto pipo (@pipo.tattooo)', 'Puerto Tinta (@puertotinta)']
        },
        {
            id: 'realismo',
            name: 'Realismo',
            subtitle: '(Fotográfico)',
            meaning: 'Representación hiperfiel de personas, animales, esculturas o paisajes, emulando la textura, profundidad de campo, brillos y nitidez propios de una fotografía analógica de alta definición.',
            application: 'Construcción minuciosa capa por capa sin líneas de contorno rígidas, valiéndose del modelado de luz, sombra y contraste tonal. Requiere sesiones prolongadas y máxima precisión de degradado.',
            artists: ['Tattoo Pucón (@tattoopucon)']
        },
        {
            id: 'black-and-gray',
            name: 'Black and Gray',
            subtitle: '(Negro y gris)',
            meaning: 'Técnica legendaria que utiliza diluciones graduales de tinta negra pura con agua destilada (greywash) para lograr una transición sedosa de sombras, desde el gris humo hasta el negro azabache.',
            application: 'El tatuador utiliza copas dosificadas con diferentes porcentajes de dilución (20%, 40%, 60%, 80%) trabajando de tonos claros a oscuros. Reconocido por su extraordinaria durabilidad a través de las décadas.',
            artists: ['Tattoo Pucón (@tattoopucon)']
        },
        {
            id: 'lettering',
            name: 'Lettering',
            subtitle: '(Letras & Caligrafía)',
            meaning: 'Diseño artístico de tipografías originales, caligrafía gótica, cursiva chicana, inscripciones latinas y frases que transmiten mensajes con una fuerte identidad visual.',
            application: 'Se diseña adaptando las curvas y ligaduras a los arcos musculares y zonas de flexión (pecho, antebrazos, cuello). Se modula el grosor de trazo mediante alternancia de agujas finas y gruesas.',
            artists: ['Wentruart (@wentruart)']
        },
        {
            id: 'neotribal',
            name: 'Neotribal',
            subtitle: '(Tribal contemporáneo)',
            meaning: 'Evolución contemporánea del arte tribal que sintetiza líneas cinéticas fluidas, espinas dinámicas, curvas orgánicas y formas afiladas inspiradas en la biomecánica y el movimiento corporal.',
            application: 'Diseñado frecuentemente a mano alzada (freehand) directamente con plumones sobre la piel para acompañar el ritmo del cuerpo, combinando contornos nítidos con rellenos de negro puro.',
            artists: ['Wentruart (@wentruart)']
        },
        {
            id: 'cybersigilism',
            name: 'Cybersigilism',
            subtitle: '(Ciber-sigilismo digital)',
            meaning: 'Tendencia de vanguardia digital nacida en la cultura Y2K, que entrecruza símbolos místicos, sigilos esotéricos, espinas metálicas y circuitos informáticos estilizados.',
            application: 'Líneas microfinas ultra nítidas con puntas puntiagudas que parecen flotar sobre la piel. Se ubica típicamente en columna vertebral, esternón, hombros y manos.',
            artists: []
        },
        {
            id: 'dark-ornamental',
            name: 'Dark ornamental',
            subtitle: '(Ornamental oscuro)',
            meaning: 'Fusión de elementos decorativos barrocos, encajes victorianos, tracerías góticas y patrones geométricos con un aura sombría, enigmática y de alto impacto dramático.',
            application: 'Utiliza contrastes contundentes entre piel negativa clara y fondos negros macizos con filigranas detalladas. Muy cotizado para pecheras, cuellos, espaldas completas y mangas.',
            artists: []
        },
        {
            id: 'ornamental',
            name: 'Ornamental',
            subtitle: '(Mandala & Geometría sagrada)',
            meaning: 'Inspirado en la orfebrería, el arte textil ceremonial, mandalas sagrados y la joyería corporal, creado para armonizar y embellecer las formas naturales del cuerpo humano.',
            application: 'Exige simetría matemática rigurosa y calado impecable de espacios en blanco. A menudo se combina con puntillismo de arrastre para dar un acabado sedoso y tridimensional.',
            artists: ['Puerto Tinta (@puertotinta)']
        },
        {
            id: 'old-school',
            name: 'Old School',
            subtitle: '(Tradicional americano)',
            meaning: 'El estilo icónico del tatuaje marítimo occidental de mediados del siglo XX: bordes negros audaces, motivos atemporales (golondrinas, dagas, rosas, barcos) y paleta de colores primarios sólidos.',
            application: 'Trazado con agujas gruesas (Round Liner 9-14) que garantizan legibilidad eterna. Los sombreados en abanico (whip shading) permiten que el tatuaje resista décadas bajo el sol con gran nitidez.',
            artists: ['Wentruart (@wentruart)']
        },
        {
            id: 'acuarela',
            name: 'Acuarela',
            subtitle: '(Watercolor)',
            meaning: 'Recrea en la piel la frescura pictórica de las acuarelas sobre papel: manchas diluidas, salpicaduras aleatorias, veladuras de color traslúcidas y degradados pictóricos sin contorno estricto.',
            application: 'Pigmentos de color altamente saturados combinados con capas diluidas de solución mezcladora. Frecuentemente respaldado por una estructura de líneas finas negras para otorgar durabilidad en el tiempo.',
            artists: ['Tattoo Pucón (@tattoopucon)']
        },
        {
            id: 'new-school',
            name: 'New School',
            subtitle: '(Nueva escuela)',
            meaning: 'Estilo enérgico y vibrante originado en los años 90 e inspirado en los dibujos animados, el grafiti callejero y los cómics: dimensiones caricaturescas, ángulos exagerados y dinamismo extremo.',
            application: 'Líneas marcadas de grosor variable con sombreados multidireccionales en colores flúor y contrastes complementarios agresivos para un efecto 3D vibrante.',
            artists: []
        },
        {
            id: 'tribales',
            name: 'Tribales',
            subtitle: '(Polinesio, Maorí, Borneo)',
            meaning: 'Lenguaje visual ancestral que conecta a la persona con su linaje, tierra y espíritu guardián. Cada motivo geométrico, espiral y diente de tiburón tiene un significado jerárquico y protector.',
            application: 'Bloques negros de alta densidad y patrones repetitivos sincronizados con la musculatura esquelética (hombros, bíceps, pantorrillas) para proyectar fuerza física y espiritual.',
            artists: []
        },
        {
            id: 'kawaii',
            name: 'Tatuaje Estilo Kawaii',
            subtitle: '(Tierno / Pastel)',
            meaning: 'Subcultura japonesa caracterizada por la ternura, personajes adorables, expresiones de ojos brillantes, golosinas, criaturas mágicas y un universo de dulzura reconfortante.',
            application: 'Paletas de color en tonos pastel (rosa chicle, lila, menta, amarillo vainilla) con delineados limpios de colores o negro suave y destellos en tinta blanca acrílica.',
            artists: []
        },
        {
            id: 'fine-line-minimalista',
            name: 'Fine Line Minimalista',
            subtitle: '(Microtatuajes & Síntesis)',
            meaning: 'El arte de decir más con menos: símbolos de síntesis gráfica, siluetas despojadas, coordenadas o palabras microscópicas de máxima sutileza y discreción.',
            application: 'Agujas microscópicas (1RL) aplicadas con pasadas sumamente precisas y controladas. Son perfectos para dedos, detrás de oreja, tobillos y muñecas en sesiones cortas y de bajo dolor.',
            artists: ['Puerto Tinta (@puertotinta)']
        },
        {
            id: 'anime',
            name: 'Anime',
            subtitle: '(Manga & Animación japonesa)',
            meaning: 'Homenaje al arte gráfico del cómic japonés (manga) y series de animación de culto, capturando con fidelidad los rostros, expresiones intensas, tramas y efectos de movimiento.',
            application: 'Líneas de entintado nítidas como las de una pluma G-pen sobre papel de dibujo, sombreados con tramas de rayado (hatching) o colores planos idénticos a los fotogramas de animación cel.',
            artists: []
        },
        {
            id: 'botanica',
            name: 'Botanica',
            subtitle: '(Flores & Naturaleza)',
            meaning: 'Ilustración científica y artística inspirada en el reino vegetal: flores silvestres, hojas de helecho, plantas nativas, hierbas medicinales y frutos con delicadeza orgánica.',
            application: 'Diseños envolventes que acompañan las líneas del cuerpo con armonía natural. Utiliza texturas finas de punteado y líneas ligeras que dan la sensación de lámina botánica de herbario.',
            artists: ['Studio tatto pipo (@pipo.tattooo)', 'Puerto Tinta (@puertotinta)']
        },
        {
            id: 'japones',
            name: 'Japones',
            subtitle: '(Irezumi tradicional)',
            meaning: 'Una de las tradiciones más reverenciadas del arte corporal: mitología oriental con dragones ryu, carpas koi, samuráis, máscaras hanyas y flores de cerezo sobre fondos de olas y nubes.',
            application: 'Composiciones integrales a gran escala con sólidas líneas de contorno y fondos negros y grises (bokashi) que contrastan con los tonos vivos de los personajes míticos.',
            artists: []
        },
        {
            id: 'geometrico',
            name: 'Geometrico',
            subtitle: '(Patrones & Simetría)',
            meaning: 'Exploración de la geometría sagrada, proporciones doradas, teselados ópticos y polígonos complejos creando composiciones hipnóticas de exactitud matemática.',
            application: 'Exige una calibración absoluta del stencil sobre la anatomía para evitar deformaciones con el movimiento muscular. Combina líneas precisas con degradados en puntillismo para generar relieve.',
            artists: ['Studio tatto pipo (@pipo.tattooo)']
        },
        {
            id: 'biomecanico',
            name: 'Biomecanico',
            subtitle: '(Fusión orgánica & máquina)',
            meaning: 'Ilusión óptica de piel rasgada que expone engranajes de titanio, pistones hidráulicos, cables y fibra de carbono integrados quirúrgicamente con tendones y huesos humanos.',
            application: 'Técnicas de aerógrafo y sombreado hiperrealista con brillos en blanco metálico y negros profundos que generan un impactante efecto tridimensional de piel mecánica viva.',
            artists: []
        }
    ];

    // DOM Elements for Styles Modal & Filters
    const btnOpenStylesModal = document.getElementById('btn-open-styles-modal');
    const btnCloseStylesModal = document.getElementById('btn-close-styles-modal');
    const btnModalCancelStyles = document.getElementById('btn-modal-cancel-styles');
    const btnModalApplyStyles = document.getElementById('btn-modal-apply-styles');
    const stylesModalOverlay = document.getElementById('styles-modal-overlay');
    const stylesModalWindow = document.getElementById('styles-modal-window');
    const stylesListColumn = document.getElementById('styles-list-column');
    const stylesEducationalColumn = document.getElementById('styles-educational-column');
    const stylesListGrid = document.getElementById('styles-list-grid');
    const stylesSearchInput = document.getElementById('styles-search-input');
    const btnClearStylesSearch = document.getElementById('btn-clear-styles-search');
    const btnSelectAllStyles = document.getElementById('btn-select-all-styles');
    const btnUnselectAllStyles = document.getElementById('btn-unselect-all-styles');
    const stylesModalCountText = document.getElementById('styles-modal-count-text');
    const stylesBadgeCount = document.getElementById('styles-badge-count');
    const btnQuickAllStyles = document.getElementById('btn-quick-all-styles');
    const activeFiltersChipsBar = document.getElementById('active-filters-chips-bar');
    const activeChipsList = document.getElementById('active-chips-list');
    const btnClearAllChips = document.getElementById('btn-clear-all-chips');

    // Educational Guide elements
    const eduTitle = document.getElementById('edu-style-title');
    const eduSubtitle = document.getElementById('edu-style-subtitle');
    const eduMeaning = document.getElementById('edu-style-meaning');
    const eduApplication = document.getElementById('edu-style-application');
    const eduFooterNote = document.querySelector('.educational-footer-note');

    // Temporary selection set inside modal before clicking "Aplicar Filtros"
    let tempSelectedStyles = new Set();

    function updateEducationalPanel(style) {
        if (!style) {
            if (eduTitle) eduTitle.textContent = 'Explora los Estilos';
            if (eduSubtitle) eduSubtitle.textContent = 'Selección informada';
            if (eduMeaning) eduMeaning.textContent = 'Posiciónate sobre cualquier estilo de la lista para conocer su origen, técnica y cómo se traduce visualmente en el arte corporal.';
            if (eduApplication) eduApplication.textContent = 'Descubre qué tipo de trazos, agujas, tintas y zonas del cuerpo se adaptan mejor a cada técnica antes de cotizar.';
            if (eduFooterNote) {
                eduFooterNote.innerHTML = '<i data-lucide="check-circle-2"></i> Artistas disponibles con este estilo en La Araucanía';
                lucide.createIcons();
            }
            return;
        }

        if (eduTitle) eduTitle.textContent = style.name;
        if (eduSubtitle) eduSubtitle.textContent = style.subtitle;
        if (eduMeaning) eduMeaning.textContent = style.meaning;
        if (eduApplication) eduApplication.textContent = style.application;

        if (eduFooterNote) {
            if (style.artists && style.artists.length > 0) {
                eduFooterNote.innerHTML = `${INSTAGRAM_ICON_SVG} Artistas en La Araucanía: ${style.artists.join(' · ')}`;
            } else {
                eduFooterNote.innerHTML = `<i data-lucide="sparkles"></i> Próximamente más tatuadores con este estilo en La Araucanía`;
            }
            lucide.createIcons();
        }
    }

    function updateModalCountDisplay() {
        if (stylesModalCountText) {
            stylesModalCountText.textContent = `${tempSelectedStyles.size} de ${ESTILOS_CATALOGO.length} seleccionados`;
        }
    }

    function renderStylesGrid(filterQuery = '') {
        if (!stylesListGrid) return;
        stylesListGrid.innerHTML = '';
        const q = filterQuery.toLowerCase().trim();

        const filteredList = ESTILOS_CATALOGO.filter(item => {
            if (!q) return true;
            return item.name.toLowerCase().includes(q) || 
                   item.subtitle.toLowerCase().includes(q) ||
                   item.meaning.toLowerCase().includes(q);
        });

        if (filteredList.length === 0) {
            stylesListGrid.innerHTML = `
                <div style="padding: 30px 10px; text-align: center; color: #666; font-family: 'Outfit', sans-serif;">
                    <p style="font-weight: 700; margin-bottom: 5px;">No se encontró ningún estilo que coincida con "${filterQuery}"</p>
                    <small>Prueba buscando por palabras como "line", "negro", "color", "flores"...</small>
                </div>
            `;
            return;
        }

        filteredList.forEach(style => {
            const isSelected = tempSelectedStyles.has(style.name);
            const card = document.createElement('div');
            card.className = `style-row-card ${isSelected ? 'selected' : ''}`;
            card.setAttribute('data-id', style.id);
            card.setAttribute('data-name', style.name);
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'checkbox');
            card.setAttribute('aria-checked', isSelected ? 'true' : 'false');

            card.innerHTML = `
                <div class="style-row-info">
                    <span class="style-row-title">${style.name}</span>
                    <span class="style-row-subtitle">${style.subtitle}</span>
                </div>
                <div class="style-row-checkbox">
                    <i data-lucide="check"></i>
                </div>
            `;

            // Hover / Focus: Live educational preview
            const onFocusHover = () => {
                document.querySelectorAll('.style-row-card').forEach(c => c.classList.remove('highlighted'));
                card.classList.add('highlighted');
                updateEducationalPanel(style);
            };

            card.addEventListener('mouseenter', onFocusHover);
            card.addEventListener('focus', onFocusHover);

            // Click: Toggle selection
            card.addEventListener('click', () => {
                if (tempSelectedStyles.has(style.name)) {
                    tempSelectedStyles.delete(style.name);
                    card.classList.remove('selected');
                    card.setAttribute('aria-checked', 'false');
                } else {
                    tempSelectedStyles.add(style.name);
                    card.classList.add('selected');
                    card.setAttribute('aria-checked', 'true');
                }
                updateModalCountDisplay();
                updateEducationalPanel(style);
            });

            // Keyboard Space / Enter support
            card.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    card.click();
                }
            });

            stylesListGrid.appendChild(card);
        });

        lucide.createIcons();
    }

    function openStylesModal() {
        if (!stylesModalOverlay) return;
        tempSelectedStyles = new Set(state.activeFilters.styles);
        if (stylesSearchInput) stylesSearchInput.value = '';
        if (btnClearStylesSearch) btnClearStylesSearch.style.display = 'none';
        
        renderStylesGrid();
        updateModalCountDisplay();

        // Highlight first selected or first in catalog
        const firstSelected = ESTILOS_CATALOGO.find(s => tempSelectedStyles.has(s.name));
        updateEducationalPanel(firstSelected || ESTILOS_CATALOGO[0]);

        stylesModalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (stylesSearchInput) setTimeout(() => stylesSearchInput.focus(), 150);
    }

    function closeStylesModal() {
        if (!stylesModalOverlay) return;
        stylesModalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    function applyStylesModalSelection() {
        state.activeFilters.styles = new Set(tempSelectedStyles);
        closeStylesModal();
        updateStylesTriggerBadge();
        renderActiveChips();
        applyFilters();

        const count = state.activeFilters.styles.size;
        showToast(count > 0 ? `${count} estilo(s) seleccionado(s)` : 'Mostrando todos los estilos');
    }

    function updateStylesTriggerBadge() {
        const count = state.activeFilters.styles.size;
        if (stylesBadgeCount) stylesBadgeCount.textContent = `${count}/${ESTILOS_CATALOGO.length}`;
        if (btnQuickAllStyles) {
            if (count === 0) {
                btnQuickAllStyles.classList.add('active');
            } else {
                btnQuickAllStyles.classList.remove('active');
            }
        }
    }

    function renderActiveChips() {
        if (!activeChipsList || !activeFiltersChipsBar) return;
        activeChipsList.innerHTML = '';

        let hasAnyFilter = false;

        // 1. Style chips
        state.activeFilters.styles.forEach(styleName => {
            hasAnyFilter = true;
            const chip = document.createElement('div');
            chip.className = 'active-filter-chip chip-style';
            chip.innerHTML = `
                <span>${styleName}</span>
                <button type="button" class="active-filter-chip-remove" aria-label="Quitar filtro ${styleName}" data-remove-style="${styleName}">
                    <i data-lucide="x"></i>
                </button>
            `;
            activeChipsList.appendChild(chip);
        });

        // 2. Location chip (if not 'Todos')
        if (state.activeFilters.locationName && state.activeFilters.locationName !== 'Todos') {
            hasAnyFilter = true;
            const locChip = document.createElement('div');
            locChip.className = 'active-filter-chip chip-location';
            locChip.innerHTML = `
                <span><i data-lucide="map-pin"></i> ${state.activeFilters.locationName}</span>
                <button type="button" class="active-filter-chip-remove" aria-label="Quitar filtro de ubicación" data-remove-location="true">
                    <i data-lucide="x"></i>
                </button>
            `;
            activeChipsList.appendChild(locChip);
        }

        if (hasAnyFilter) {
            activeFiltersChipsBar.style.display = 'flex';
        } else {
            activeFiltersChipsBar.style.display = 'none';
        }

        // Attach event listeners to chips remove buttons
        activeChipsList.querySelectorAll('[data-remove-style]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const st = btn.getAttribute('data-remove-style');
                state.activeFilters.styles.delete(st);
                updateStylesTriggerBadge();
                renderActiveChips();
                applyFilters();
            });
        });

        activeChipsList.querySelectorAll('[data-remove-location]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                state.activeFilters.locationName = 'Todos';
                state.activeFilters.userCoords = COMUNAS_COORDS['Todos'];
                const locSelect = document.getElementById('filter-location-select');
                if (locSelect) locSelect.value = 'Todos';
                renderActiveChips();
                applyFilters();
            });
        });

        lucide.createIcons();
    }

    // Bind Modal Open & Close Listeners
    if (btnOpenStylesModal) btnOpenStylesModal.addEventListener('click', openStylesModal);
    if (btnCloseStylesModal) btnCloseStylesModal.addEventListener('click', closeStylesModal);
    if (btnModalCancelStyles) btnModalCancelStyles.addEventListener('click', closeStylesModal);
    if (btnModalApplyStyles) btnModalApplyStyles.addEventListener('click', applyStylesModalSelection);

    if (stylesModalOverlay) {
        stylesModalOverlay.addEventListener('click', (e) => {
            if (e.target === stylesModalOverlay) closeStylesModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && stylesModalOverlay && stylesModalOverlay.style.display !== 'none') {
            closeStylesModal();
        }
    });

    // Modal Search Bar
    if (stylesSearchInput) {
        stylesSearchInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (btnClearStylesSearch) {
                btnClearStylesSearch.style.display = val.length > 0 ? 'flex' : 'none';
            }
            renderStylesGrid(val);
        });
    }

    if (btnClearStylesSearch && stylesSearchInput) {
        btnClearStylesSearch.addEventListener('click', () => {
            stylesSearchInput.value = '';
            btnClearStylesSearch.style.display = 'none';
            renderStylesGrid('');
            stylesSearchInput.focus();
        });
    }

    // Modal Quick Select All / Unselect All
    if (btnSelectAllStyles) {
        btnSelectAllStyles.addEventListener('click', () => {
            ESTILOS_CATALOGO.forEach(s => tempSelectedStyles.add(s.name));
            renderStylesGrid(stylesSearchInput ? stylesSearchInput.value : '');
            updateModalCountDisplay();
        });
    }

    if (btnUnselectAllStyles) {
        btnUnselectAllStyles.addEventListener('click', () => {
            tempSelectedStyles.clear();
            renderStylesGrid(stylesSearchInput ? stylesSearchInput.value : '');
            updateModalCountDisplay();
        });
    }

    // Quick "Todos" Styles Button
    if (btnQuickAllStyles) {
        btnQuickAllStyles.addEventListener('click', () => {
            state.activeFilters.styles.clear();
            updateStylesTriggerBadge();
            renderActiveChips();
            applyFilters();
        });
    }

    // Clear All Chips Button
    if (btnClearAllChips) {
        btnClearAllChips.addEventListener('click', () => {
            clearAllFilters();
        });
    }

    // Direct wheel scroll acceleration for PC on styles and educational columns
    if (stylesListColumn) {
        stylesListColumn.addEventListener('wheel', (e) => {
            if (stylesListColumn.scrollHeight > stylesListColumn.clientHeight) {
                stylesListColumn.scrollTop += e.deltaY;
            }
        }, { passive: true });
    }
    if (stylesEducationalColumn) {
        stylesEducationalColumn.addEventListener('wheel', (e) => {
            if (stylesEducationalColumn.scrollHeight > stylesEducationalColumn.clientHeight) {
                stylesEducationalColumn.scrollTop += e.deltaY;
            }
        }, { passive: true });
    }

    // Location and Radius Select Dropdowns
    const locationSelect = document.getElementById('filter-location-select');
    const radiusSelect = document.getElementById('filter-radius-select');

    if (locationSelect) {
        locationSelect.addEventListener('change', () => {
            const locVal = locationSelect.value;
            state.activeFilters.userCoords = COMUNAS_COORDS[locVal] || COMUNAS_COORDS['Todos'];
            state.activeFilters.locationName = locVal;
            renderActiveChips();
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
                            const userLngLat = [lng, lat];
                            if (window.userLocationMarker) {
                                if (window.userLocationMarker.setLngLat) {
                                    window.userLocationMarker.setLngLat(userLngLat);
                                }
                            } else if (typeof maplibregl !== 'undefined') {
                                const userEl = document.createElement('div');
                                userEl.className = 'user-map-pin';
                                userEl.innerHTML = '<div style="background-color: #ff4a5a; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(255, 74, 90, 0.8);"></div>';
                                const userPopup = new maplibregl.Popup({ offset: 10 }).setHTML("<strong>Tu ubicación actual</strong>");
                                window.userLocationMarker = new maplibregl.Marker({ element: userEl })
                                    .setLngLat(userLngLat)
                                    .setPopup(userPopup)
                                    .addTo(mapInstance);
                            }
                            if (mapInstance.flyTo) {
                                mapInstance.flyTo({ center: userLngLat, zoom: 11 });
                            }
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
        state.activeFilters.category = 'Todos';
        state.activeFilters.styles.clear();
        
        if (inputDistance) inputDistance.value = 100;
        if (valDistance) valDistance.textContent = '100 km';
        if (locationStatus) locationStatus.innerHTML = 'Ubicación no autorizada (usando centro regional Temuco)';
        
        const locationSelect = document.getElementById('filter-location-select');
        if (locationSelect) locationSelect.value = 'Todos';

        const radiusSelect = document.getElementById('filter-radius-select');
        if (radiusSelect) radiusSelect.value = '150';

        updateStylesTriggerBadge();
        renderActiveChips();

        // Remove user marker from map
        if (window.userLocationMarker && mapInstance) {
            mapInstance.removeLayer(window.userLocationMarker);
            window.userLocationMarker = null;
        }
        
        if (btnStyles) btnStyles.forEach(b => b.classList.remove('active'));
        
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
            const cardLocation = card.getAttribute('data-location') || '';
            
            // Safe parse array-like style list string
            const rawStyles = card.getAttribute('data-styles') || '[]';
            let cardStyles = [];
            try {
                cardStyles = JSON.parse(rawStyles.replace(/'/g, '"'));
            } catch (e) {
                try {
                    cardStyles = eval(rawStyles);
                } catch (err) {
                    cardStyles = [];
                }
            }
            
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
                    if (cardLocation.toLowerCase() !== state.activeFilters.locationName.toLowerCase()) {
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

            // 2. Style filter (Multi-selection from 21 Styles Modal)
            if (state.activeFilters.styles.size > 0) {
                let hasMatchingStyle = false;
                const activeLower = Array.from(state.activeFilters.styles).map(s => s.toLowerCase().trim());
                cardStyles.forEach(s => {
                    if (activeLower.includes(s.toLowerCase().trim())) {
                        hasMatchingStyle = true;
                    }
                });
                if (!hasMatchingStyle) showCard = false;
            }

            // 3. Category Filter (fallback)
            if (state.activeFilters.category && state.activeFilters.category !== 'Todos') {
                const catLower = state.activeFilters.category.toLowerCase().trim();
                if (!cardStyles.some(s => s.toLowerCase().trim() === catLower)) {
                    showCard = false;
                }
            }

            // 4. Search input text (safeguarded)
            if (searchInput) {
                const searchVal = searchInput.value.toLowerCase().trim();
                if (searchVal !== '') {
                    const nameElem = card.querySelector('.artist-name');
                    const cardName = nameElem ? nameElem.textContent.toLowerCase() : '';
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

        // Handle empty state banner if no artists match current filters
        const artistGrid = document.getElementById('artist-grid');
        let emptyBanner = document.getElementById('artists-empty-filter-state');
        if (visibleCount === 0) {
            if (!emptyBanner && artistGrid) {
                emptyBanner = document.createElement('div');
                emptyBanner.id = 'artists-empty-filter-state';
                emptyBanner.className = 'artists-empty-filter-state';
                emptyBanner.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: #fff8f0; border: 3px solid #000; border-radius: 14px; box-shadow: 4px 4px 0 #000; margin: 15px 0;';
                emptyBanner.innerHTML = `
                    <div style="font-size: 2.2rem; margin-bottom: 10px;">🔍</div>
                    <h4 style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.25rem; margin-bottom: 8px; color: #000;">No se encontraron tatuadores con estos filtros</h4>
                    <p style="font-family: 'Outfit', sans-serif; font-size: 0.95rem; color: #444; max-width: 480px; margin: 0 auto 18px auto;">Prueba seleccionando otros estilos o quitando comunas para ver más artistas en La Araucanía.</p>
                    <button type="button" id="btn-reset-empty-filters" class="btn btn-primary" style="font-family: 'Outfit', sans-serif; font-weight: 800; border: 2px solid #000; box-shadow: 2px 2px 0 #000; border-radius: 8px; padding: 8px 20px;">
                        Restablecer todos los filtros
                    </button>
                `;
                artistGrid.appendChild(emptyBanner);
                const btnReset = emptyBanner.querySelector('#btn-reset-empty-filters');
                if (btnReset) btnReset.addEventListener('click', clearAllFilters);
            } else if (emptyBanner) {
                emptyBanner.style.display = 'block';
            }
        } else {
            if (emptyBanner) emptyBanner.style.display = 'none';
        }

        // Toggle map marker visibility based on current card visibility
        markersGroup.forEach(item => {
            const cardId = item.id;
            const matchingCard = document.querySelector(`.artist-card[data-id="${cardId}"]`);
            if (item.marker && item.marker.getElement) {
                const el = item.marker.getElement();
                if (el) {
                    if (matchingCard && matchingCard.style.display !== 'none') {
                        el.style.display = '';
                    } else {
                        el.style.display = 'none';
                        if (item.popup && item.popup.isOpen && item.popup.isOpen()) {
                            item.popup.remove();
                        }
                    }
                }
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
            const artistId = card.getAttribute('data-id');
            const btnExplorar = e.target.closest('.btn-explorar-tag');
            if (btnExplorar) {
                e.stopPropagation();
                switchView('artist-view');
                loadArtistProfile(artistId);
                return;
            }

            // Open drawer and layout grid column first so map container has non-zero dimensions
            const drawer = document.getElementById('artist-quick-sheet');
            if (drawer) {
                drawer.classList.add('active');
            }
            const homeLayout = document.querySelector('.home-layout');
            if (homeLayout) {
                homeLayout.classList.add('has-sidebar-open');
            }

            updateQuickFicha(artistId);
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
            avatarImg.alt = details.name;
            avatarImg.style.filter = '';
            const isBrandBadge = !details.portfolio || details.portfolio.length === 0 || 
                (typeof details.avatar === 'string' && (details.avatar.includes('compressed_Group_5') || details.avatar.includes('logo_pipo')));
            if (isBrandBadge) {
                avatarImg.classList.add('is-brand-badge');
            } else {
                avatarImg.classList.remove('is-brand-badge');
            }
        }

        const nameEl = document.getElementById('ficha-artist-name');
        if (nameEl) nameEl.textContent = details.name;

        const locEl = document.getElementById('ficha-artist-location');
        if (locEl) locEl.innerHTML = `<i data-lucide="map-pin"></i> ${escapeHTML(details.location)}`;

        const bioEl = document.getElementById('ficha-artist-bio');
        if (bioEl) bioEl.textContent = details.bio;

        const instaEl = document.getElementById('ficha-artist-instagram');
        if (instaEl) instaEl.href = details.instagram;

        const instaHandleEl = document.getElementById('ficha-artist-insta-handle');
        if (instaHandleEl) {
            const handle = details.handle || ('@' + (details.instagram ? details.instagram.substring(details.instagram.lastIndexOf('/') + 1) : 'instagram'));
            instaHandleEl.innerHTML = `${INSTAGRAM_ICON_SVG} ${escapeHTML(handle)}`;
        }

        // Use authentic real portfolio items for this artist (zero IA)
        state.portfolioItems = details.portfolio || [];

        // Ensure MapLibre map is ready, resized and centered
        ensureQuickSheetMap(artistId);

        lucide.createIcons();
    }

    // Ensures MapLibre GL map is resized and focused on active artist
    function ensureQuickSheetMap(artistId) {
        if (typeof maplibregl === 'undefined') return;
        const details = artistsDetails[artistId];
        if (!details) return;

        if (!mapInstance) {
            initMap();
        }

        const coords = details.coords || [-38.7396, -72.5984];
        const lngLat = toLngLat(coords);

        // Handle animation expansion: resize map at successive frames
        [50, 150, 300, 450, 600].forEach(delay => {
            setTimeout(() => {
                if (mapInstance && typeof mapInstance.resize === 'function') {
                    mapInstance.resize();
                    if (delay === 150 || delay === 450) {
                        try {
                            mapInstance.flyTo({
                                center: lngLat,
                                zoom: 12.5,
                                speed: 1.4,
                                curve: 1.1,
                                essential: true
                            });
                        } catch (e) {
                            mapInstance.setCenter(lngLat);
                        }
                    }
                }
            }, delay);
        });

        // Open popup and highlight active pin in MapLibre
        markersGroup.forEach(item => {
            if (item.marker && item.marker.getElement) {
                const el = item.marker.getElement();
                if (item.id === artistId) {
                    if (el) el.classList.add('active');
                    if (item.popup && !item.popup.isOpen()) {
                        try { item.popup.addTo(mapInstance); } catch(e) {}
                    }
                } else {
                    if (el) el.classList.remove('active');
                    if (item.popup && item.popup.isOpen()) {
                        try { item.popup.remove(); } catch(e) {}
                    }
                }
            }
        });
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

    // Helper to safely convert any coordinates format to [lng, lat]
    function toLngLat(coords) {
        if (!coords || !Array.isArray(coords) || coords.length < 2) return [-72.5984, -38.7396];
        // Longitude for Chile/Araucanía is ~ -70 to -75; Latitude is ~ -35 to -42
        if (coords[0] < -55) {
            return [coords[0], coords[1]];
        }
        return [coords[1], coords[0]];
    }

    // High-Performance MapLibre Vector Styles (Zero API Key, Open Infrastructure)
    const MAPLIBRE_STYLE = 'https://tiles.openfreemap.org/styles/positron';
    const MAPLIBRE_FALLBACK_STYLE = 'https://tiles.openfreemap.org/styles/bright';

    // Dedicated MapLibre instance for Profile Detail view
    let profileMapInstance = null;
    let profileMarkerInstance = null;

    function initProfileMap(coords, name, location) {
        const mapEl = document.getElementById('profile-detail-map');
        if (!mapEl || typeof maplibregl === 'undefined' || !coords) return;

        const lngLat = toLngLat(coords);

        try {
            if (!profileMapInstance) {
                profileMapInstance = new maplibregl.Map({
                    container: 'profile-detail-map',
                    style: MAPLIBRE_STYLE,
                    center: lngLat,
                    zoom: 12.5,
                    attributionControl: false
                });

                profileMapInstance.on('error', (e) => {
                    console.warn("MapLibre profile-detail-map style error, attempting fallback:", e);
                    if (e && e.error && profileMapInstance) {
                        try {
                            profileMapInstance.setStyle(MAPLIBRE_FALLBACK_STYLE);
                        } catch(err) {}
                    }
                });

                profileMapInstance.on('load', () => {
                    if (profileMapInstance) profileMapInstance.resize();
                });

                const pinEl = document.createElement('div');
                pinEl.className = 'custom-maplibre-pin active';
                pinEl.title = `${name} (${location})`;

                const popup = new maplibregl.Popup({ offset: 14, closeButton: false, closeOnClick: false })
                    .setHTML(`<strong>${escapeHTML(name)}</strong><span>${escapeHTML(location)}</span>`);

                profileMarkerInstance = new maplibregl.Marker({ element: pinEl })
                    .setLngLat(lngLat)
                    .setPopup(popup)
                    .addTo(profileMapInstance);
                
                profileMarkerInstance.togglePopup();

                [50, 150, 300, 500].forEach(delay => {
                    setTimeout(() => {
                        if (profileMapInstance && profileMapInstance.resize) {
                            profileMapInstance.resize();
                        }
                    }, delay);
                });
            } else {
                profileMapInstance.setCenter(lngLat);
                if (profileMarkerInstance) {
                    profileMarkerInstance.setLngLat(lngLat);
                    if (profileMarkerInstance.getPopup()) {
                        profileMarkerInstance.getPopup().setHTML(`<strong>${escapeHTML(name)}</strong><span>${escapeHTML(location)}</span>`);
                    }
                }
                [50, 150, 300].forEach(delay => {
                    setTimeout(() => {
                        if (profileMapInstance && profileMapInstance.resize) {
                            profileMapInstance.resize();
                        }
                    }, delay);
                });
            }
        } catch (err) {
            console.error("Profile MapLibre init failed:", err);
        }
    }

    // Load and render artist profile (High-Impact Style & Zero IA)
    function loadArtistProfile(artistId) {
        const details = artistsDetails[artistId];
        if (!details) {
            console.warn(`loadArtistProfile: no details found for artistId "${artistId}"`);
            return;
        }

        // Profile Name
        const nameEl = document.querySelector('.profile-name');
        if (nameEl) nameEl.textContent = details.name;

        // Location with map pin
        const locEl = document.querySelector('.profile-location');
        if (locEl) locEl.innerHTML = `<i data-lucide="map-pin"></i> ${escapeHTML(details.location)}`;

        // Profile Avatar
        const profAvatar = document.querySelector('.profile-avatar-img');
        if (profAvatar) {
            profAvatar.src = details.avatar;
            profAvatar.alt = details.name;
            const isBrandBadge = !details.portfolio || details.portfolio.length === 0 || 
                (typeof details.avatar === 'string' && (details.avatar.includes('compressed_Group_5') || details.avatar.includes('logo_pipo')));
            if (isBrandBadge) {
                profAvatar.classList.add('is-brand-badge');
            } else {
                profAvatar.classList.remove('is-brand-badge');
            }
        }

        // Instagram Link
        const profInstaLink = document.getElementById('profile-detail-instagram-link');
        if (profInstaLink) profInstaLink.href = details.instagram;

        // Instagram Handle
        const profInstaHandle = document.getElementById('profile-detail-insta-handle');
        if (profInstaHandle) {
            const handle = details.handle || ('@' + (details.instagram ? details.instagram.substring(details.instagram.lastIndexOf('/') + 1) : 'instagram'));
            profInstaHandle.innerHTML = `${INSTAGRAM_ICON_SVG} ${escapeHTML(handle)}`;
        }

        // Declared Styles Chips
        const stylesChipsEl = document.getElementById('profile-styles-chips');
        if (stylesChipsEl && details.styles) {
            stylesChipsEl.innerHTML = details.styles.map(s => `<span class="profile-style-badge">${escapeHTML(s)}</span>`).join('');
        }

        // Tech Specs: Experiencia & Tintas
        const expEl = document.getElementById('profile-detail-experience');
        if (expEl) expEl.textContent = details.experience || '3–5 años';

        const inksEl = document.getElementById('profile-detail-inks');
        if (inksEl) inksEl.textContent = details.inks || 'Dynamic';

        // Bio
        const bioEl = document.getElementById('profile-detail-bio');
        if (bioEl) bioEl.textContent = details.bio;

        // Update studio map location description
        const locMapText = document.getElementById('profile-map-location-text');
        if (locMapText) {
            locMapText.textContent = `${details.location}, Región de La Araucanía`;
        }

        // Render Photo Gallery (Real Cloudinary photos or Verified Zero-IA Notice)
        renderTattoosWizardGallery(details);

        // Render Studio Map in Profile View
        if (details.coords) {
            initProfileMap(details.coords, details.name, details.location);
        }

        lucide.createIcons();
    }
    window.loadArtistProfile = loadArtistProfile;

    // Render Portfolio Publication Carousel (Social Post Format + Neobrutalist Carrusel)
    function renderTattoosWizardGallery(details) {
        const galleryContainer = document.getElementById('tab-gallery-grid');
        if (!galleryContainer) return;

        galleryContainer.innerHTML = '';
        const portfolio = details.portfolio || [];

        if (portfolio.length === 0) {
            const handle = details.handle || ('@' + (details.instagram ? details.instagram.substring(details.instagram.lastIndexOf('/') + 1) : 'instagram'));
            galleryContainer.innerHTML = `
                <div class="empty-portfolio-notice" style="text-align: center; padding: 50px 24px; background: #ffffff; border: 3px solid #000000; border-radius: 16px; box-shadow: 5px 5px 0px #000000; margin: 30px auto; max-width: 620px; width: 100%;">
                    <div style="font-size: 2.8rem; margin-bottom: 12px;">🛡️</div>
                    <h3 style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.35rem; margin-bottom: 10px; color: #000000;">
                        No logré capturar info real de este perfil
                    </h3>
                    <p style="font-family: 'Outfit', sans-serif; font-size: 0.98rem; color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
                        Cumpliendo con la regla estricta de <strong>Cero Imágenes IA o de stock</strong>, sólo se visualizan fotografías verificadas. Puedes explorar todo el portafolio auténtico de <strong>${escapeHTML(details.name)}</strong> directamente en su cuenta oficial de Instagram.
                    </p>
                    <a href="${escapeHTML(details.instagram)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #7B4AD8; color: #ffffff; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.95rem; text-decoration: none; padding: 12px 24px; border: 2.5px solid #000000; border-radius: 100px; box-shadow: 3px 3px 0px #000000; transition: transform 0.15s ease;">
                        ${INSTAGRAM_ICON_SVG} Ver trabajos en ${escapeHTML(handle)}
                    </a>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        let currentIndex = 0;
        const total = portfolio.length;
        const handle = details.handle || ('@' + (details.instagram ? details.instagram.substring(details.instagram.lastIndexOf('/') + 1) : 'instagram'));

        const wrapper = document.createElement('div');
        wrapper.className = 'portfolio-publication-wrapper';

        wrapper.innerHTML = `
            <div class="portfolio-publication-card">
                <!-- Publication Header -->
                <div class="pub-card-header">
                    <div class="pub-artist-info">
                        <div class="pub-avatar-circle">
                            <img src="${escapeHTML(details.avatar)}" alt="${escapeHTML(details.name)}" onerror="this.onerror=null;this.src='https://res.cloudinary.com/dhgifjpkh/image/upload/v1782924161/compressed_Group_5_exrcfx.webp';">
                        </div>
                        <div class="pub-artist-meta">
                            <span class="pub-artist-name">${escapeHTML(details.name)}</span>
                            <span class="pub-artist-handle">${escapeHTML(handle)} • ${escapeHTML(details.location)}</span>
                        </div>
                    </div>
                    <div class="pub-header-badges">
                        <span class="pub-style-badge" id="pub-current-style">${escapeHTML(portfolio[0].style || 'Tatuaje')}</span>
                        <span class="pub-counter-badge" id="pub-current-counter">1 / ${total}</span>
                    </div>
                </div>

                <!-- Publication Stage (Carrusel) -->
                <div class="pub-stage-wrapper" id="pub-stage-wrapper">
                    <button class="pub-nav-btn pub-nav-prev" id="pub-btn-prev" type="button" aria-label="Foto anterior" title="Anterior">
                        <img src="https://res.cloudinary.com/dhgifjpkh/image/upload/v1788921807/botones-08_dsmcbo.svg" alt="Anterior">
                    </button>

                    <div class="pub-img-container" id="pub-img-container">
                        <img src="${portfolio[0].src}" alt="${escapeHTML(portfolio[0].title)}" id="pub-main-img" class="pub-main-img">
                        <div class="pub-zoom-indicator">
                            <i data-lucide="zoom-in" style="width: 15px; height: 15px;"></i> Click para ampliar
                        </div>
                    </div>

                    <button class="pub-nav-btn pub-nav-next" id="pub-btn-next" type="button" aria-label="Siguiente foto" title="Siguiente">
                        <img src="https://res.cloudinary.com/dhgifjpkh/image/upload/v1788921807/botones-07_f9nuup.svg" alt="Siguiente">
                    </button>
                </div>

                <!-- Dots Bar -->
                <div class="pub-dots-bar" id="pub-dots-bar">
                    ${portfolio.map((_, idx) => `
                        <button class="pub-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" type="button" aria-label="Ir a foto ${idx + 1}"></button>
                    `).join('')}
                </div>

                <!-- Publication Footer / Caption -->
                <div class="pub-card-footer">
                    <div class="pub-caption-content">
                        <div class="pub-caption-title-row">
                            <span class="pub-caption-author">${escapeHTML(details.name)}</span>
                            <span class="pub-caption-text" id="pub-caption-title">${escapeHTML(portfolio[0].title)}</span>
                        </div>
                    </div>
                    <div class="pub-actions-row">
                        <button class="pub-action-btn pub-btn-zoom" id="pub-btn-zoom" type="button">
                            <i data-lucide="maximize-2" style="width: 14px; height: 14px;"></i> Ampliar
                        </button>
                        <a href="${escapeHTML(details.instagram)}" target="_blank" rel="noopener noreferrer" class="pub-action-btn pub-btn-insta">
                            ${INSTAGRAM_ICON_SVG} Ver en Instagram
                        </a>
                    </div>
                </div>
            </div>

            <!-- Thumbnails Strip -->
            <div class="pub-thumbs-strip" id="pub-thumbs-strip">
                ${portfolio.map((item, idx) => `
                    <button class="pub-thumb-item ${idx === 0 ? 'active' : ''}" data-index="${idx}" type="button" title="${escapeHTML(item.title)}">
                        <img src="${item.src}" alt="${escapeHTML(item.title)}" loading="lazy">
                    </button>
                `).join('')}
            </div>
        `;

        galleryContainer.appendChild(wrapper);

        // References
        const mainImg = wrapper.querySelector('#pub-main-img');
        const styleBadge = wrapper.querySelector('#pub-current-style');
        const counterBadge = wrapper.querySelector('#pub-current-counter');
        const captionTitle = wrapper.querySelector('#pub-caption-title');
        const btnPrev = wrapper.querySelector('#pub-btn-prev');
        const btnNext = wrapper.querySelector('#pub-btn-next');
        const btnZoom = wrapper.querySelector('#pub-btn-zoom');
        const dots = wrapper.querySelectorAll('.pub-dot');
        const thumbs = wrapper.querySelectorAll('.pub-thumb-item');
        const stageWrapper = wrapper.querySelector('#pub-stage-wrapper');

        function goToSlide(newIndex) {
            if (newIndex < 0) newIndex = total - 1;
            if (newIndex >= total) newIndex = 0;
            currentIndex = newIndex;
            const item = portfolio[currentIndex];

            // Smooth fade transition
            mainImg.style.opacity = '0.3';
            mainImg.src = item.src;
            mainImg.alt = item.title;
            mainImg.onload = () => { mainImg.style.opacity = '1'; };

            styleBadge.textContent = item.style || 'Tatuaje';
            counterBadge.textContent = `${currentIndex + 1} / ${total}`;
            captionTitle.textContent = item.title;

            dots.forEach((d, i) => {
                if (i === currentIndex) d.classList.add('active');
                else d.classList.remove('active');
            });

            thumbs.forEach((th, i) => {
                if (i === currentIndex) {
                    th.classList.add('active');
                    th.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                } else {
                    th.classList.remove('active');
                }
            });
        }

        btnPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(currentIndex - 1);
        });

        btnNext.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(currentIndex + 1);
        });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.getAttribute('data-index'));
                goToSlide(idx);
            });
        });

        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const idx = parseInt(thumb.getAttribute('data-index'));
                goToSlide(idx);
            });
        });

        // Zoom / Lightbox
        const triggerZoom = () => {
            const item = portfolio[currentIndex];
            openLightbox(item.src, `${item.title} — ${details.name} (${details.location})`);
        };
        mainImg.addEventListener('click', triggerZoom);
        btnZoom.addEventListener('click', triggerZoom);

        // Touch swipe for mobile
        let touchStartX = 0;
        stageWrapper.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                touchStartX = e.touches[0].clientX;
            }
        }, { passive: true });

        stageWrapper.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches[0]) {
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchEndX - touchStartX;
                if (Math.abs(diff) > 40) {
                    if (diff < 0) goToSlide(currentIndex + 1);
                    else goToSlide(currentIndex - 1);
                }
            }
        }, { passive: true });

        // Global keyboard arrows listener (single instance cleanup)
        if (window._pubCarouselKeyHandler) {
            window.removeEventListener('keydown', window._pubCarouselKeyHandler);
        }
        window._pubCarouselKeyHandler = (e) => {
            const stage = document.getElementById('pub-stage-wrapper');
            if (!stage || !stage.isConnected) return;
            if (e.key === 'ArrowLeft') {
                goToSlide(currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                goToSlide(currentIndex + 1);
            }
        };
        window.addEventListener('keydown', window._pubCarouselKeyHandler);

        lucide.createIcons();
    }

    // Ficha View Portfolio Button (Navigates to full portfolio view)
    const btnFichaPortfolio = document.getElementById('btn-ficha-view-portfolio');
    if (btnFichaPortfolio) {
        btnFichaPortfolio.addEventListener('click', () => {
            switchView('artist-view');
            loadArtistProfile(currentFichaArtistId);
        });
    }

    // ==========================================================================
    // 9. MAPLIBRE GL JS INTERACTIVE MAIN MAP (High-Performance Vector/Raster WebGL)
    // ==========================================================================

    function initMap() {
        if (typeof maplibregl === 'undefined') {
            console.warn("MapLibre GL JS SDK not loaded yet.");
            return;
        }
        const mapEl = document.getElementById('interactive-map');
        if (!mapEl) return;

        try {
            if (mapInstance) {
                mapInstance.remove();
                mapInstance = null;
            }

            mapEl.innerHTML = '';
            // Center in Temuco: [lng, lat]
            const defaultCenter = [-72.5984, -38.7396];

            mapInstance = new maplibregl.Map({
                container: 'interactive-map',
                style: MAPLIBRE_STYLE,
                center: defaultCenter,
                zoom: 9.5,
                attributionControl: false
            });

            mapInstance.on('error', (e) => {
                console.warn("MapLibre interactive-map style error, attempting fallback:", e);
                if (e && e.error && mapInstance) {
                    try {
                        mapInstance.setStyle(MAPLIBRE_FALLBACK_STYLE);
                    } catch(err) {}
                }
            });

            mapInstance.on('load', () => {
                if (mapInstance) mapInstance.resize();
            });

            // Pins locations details (all 13 artists from La Araucanía)
            const safeArtists = (typeof artistsDetails !== 'undefined' && artistsDetails) ? artistsDetails : {};
            markersGroup = [];

            Object.keys(safeArtists).forEach(id => {
                const d = safeArtists[id];
                addOrUpdateArtistMarker(id, d.name, d.coords, d.location);
            });

        } catch (err) {
            console.error("MapLibre initMap failed:", err);
        }
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
            
            // Re-align MapLibre canvas
            setTimeout(() => {
                if (mapInstance && mapInstance.resize) {
                    mapInstance.resize();
                }
            }, 300);
        });
    }

    function addOrUpdateArtistMarker(artistId, name, coords, location) {
        if (!mapInstance || !coords || typeof maplibregl === 'undefined') return;

        // Remove existing marker if it exists
        const existingIdx = markersGroup.findIndex(m => m.id === artistId);
        if (existingIdx !== -1) {
            if (markersGroup[existingIdx].marker) {
                markersGroup[existingIdx].marker.remove();
            }
            markersGroup.splice(existingIdx, 1);
        }

        // MapLibre expects [lng, lat]
        const lngLat = toLngLat(coords);

        // Create Custom HTML Pin element for MapLibre
        const el = document.createElement('div');
        el.className = 'custom-maplibre-pin';
        el.setAttribute('data-artist-id', artistId);
        el.title = `${name} (${location})`;

        const popup = new maplibregl.Popup({ offset: 14, closeButton: false, closeOnClick: false })
            .setHTML(`<strong>${escapeHTML(name)}</strong><span>${escapeHTML(location)}</span>`);

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat(lngLat)
            .setPopup(popup)
            .addTo(mapInstance);

        // Click on pin focuses card & updates quick ficha
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            updateQuickFicha(artistId);

            const select = document.getElementById('filter-location-select');
            if (select && location) {
                select.value = location;
                state.activeFilters.locationName = location;
                if (typeof applyFilters === 'function') applyFilters();
            }

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

        markersGroup.push({
            id: artistId,
            marker: marker,
            popup: popup,
            lngLat: lngLat
        });
    }

    // Initialize dashboard profile editor map with MapLibre GL
    const profileMapEl = document.getElementById('profile-editor-map');
    if (profileMapEl && typeof maplibregl !== 'undefined') {
        try {
            const initialCoords = (state.tatuadorProfile && state.tatuadorProfile.coords) || [-39.2045, -73.0538];
            const initialLngLat = toLngLat(initialCoords);

            window.artistProfileMapInstance = new maplibregl.Map({
                container: 'profile-editor-map',
                style: MAPLIBRE_STYLE,
                center: initialLngLat,
                zoom: 12,
                attributionControl: false
            });

            const profileMarker = new maplibregl.Marker({ draggable: true })
                .setLngLat(initialLngLat)
                .addTo(window.artistProfileMapInstance);

            window.artistProfileMarkerInstance = profileMarker;

            window.artistProfileMapInstance.on('click', (e) => {
                const { lng, lat } = e.lngLat;
                profileMarker.setLngLat([lng, lat]);
                const coordInput = document.getElementById('edit-art-coords');
                if (coordInput) coordInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                reverseGeocodeMock(lat, lng);
            });

            profileMarker.on('dragend', () => {
                const lngLat = profileMarker.getLngLat();
                const coordInput = document.getElementById('edit-art-coords');
                if (coordInput) coordInput.value = `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`;
                reverseGeocodeMock(lngLat.lat, lngLat.lng);
            });
        } catch (e) {
            console.error("Profile editor map init failed", e);
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

        // 1. Seed database if it is empty (safe non-blocking check)
        try {
            await seedDatabaseIfEmpty();
        } catch (seedErr) {
            console.warn("Seeding check skipped:", seedErr);
        }

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

                const existing = artistsDetails[p.id] || {};
                artistsDetails[p.id] = {
                    ...existing,
                    name: p.name || existing.name,
                    location: p.location || existing.location,
                    bio: p.bio || existing.bio || '',
                    instagram: p.id === 'pipo' ? 'https://www.instagram.com/pipo.tattooo/' : (p.instagram || existing.instagram || ''),
                    handle: existing.handle || ('@' + ((p.instagram || existing.instagram || '').substring((p.instagram || existing.instagram || '').lastIndexOf('/') + 1) || 'instagram')),
                    avatar: p.id === 'pipo' 
                        ? PIPO_OFFICIAL_LOGO 
                        : (existing.avatar && existing.avatar !== TINTA_CONECTADA_BRAND_LOGO && existing.avatar !== 'assets/logo_pipo.png'
                            ? existing.avatar 
                            : (p.avatar_url || existing.avatar || TINTA_CONECTADA_BRAND_LOGO)),
                    coords: p.coords || existing.coords,
                    experience: p.experience || existing.experience,
                    price: p.price || existing.price,
                    styles: (p.styles && p.styles.length > 0) ? p.styles : (existing.styles || []),
                    inks: (p.inks && p.inks.length > 0) ? p.inks : (existing.inks || []),
                    needles: (p.needles && p.needles.length > 0) ? p.needles : (existing.needles || []),
                    coverImage: (existing.coverImage && existing.coverImage !== 'assets/tattoo_flower.png') 
                        ? existing.coverImage 
                        : (portfolioCovers[p.id] || existing.coverImage || ''),
                    portfolio: (existing.portfolio && existing.portfolio.length > 0) ? existing.portfolio : []
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
            
            // Re-render MapLibre map markers
            if (mapInstance) {
                // Clear existing markers
                markersGroup.forEach(m => {
                    if (m.marker && m.marker.remove) m.marker.remove();
                });
                markersGroup.length = 0; // Empty array
                
                // Add new markers
                Object.keys(artistsDetails).forEach(id => {
                    const artist = artistsDetails[id];
                    addOrUpdateArtistMarker(id, artist.name, artist.coords, artist.location);
                });
            }

            updateQuickFicha('pipo');
            document.querySelectorAll('.artist-card').forEach(card => card.classList.remove('active'));
            console.log(`✅ Supabase: Sincronizados ${profiles.length} tatuadores en el sistema.`);
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
        
        lucide.createIcons();
        if (typeof applyFilters === 'function') {
            applyFilters();
        }
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
                const zoneLabel = item.zone ? ' - ' + item.zone.toUpperCase() : '';
                openLightbox(item.src, `${item.title} (${item.style || 'Tatuaje'}${zoneLabel})`);
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
                <button type="button" class="lightbox-custom-close-btn" style="position: absolute; top: -52px; right: 0; background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; z-index: 10001;" aria-label="Cerrar">
                    <img src="https://res.cloudinary.com/dhgifjpkh/image/upload/v1788921807/botones-06_kf9bp1.svg" alt="Cerrar" style="width: 42px; height: 42px; filter: drop-shadow(2px 2px 0px #000000); transition: transform 0.15s ease;">
                </button>
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

    // Unified Cultura Landing: Double Main Tabs (Historia vs ¿Sabías que?)
    document.querySelectorAll('.btn-cultura-main-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-cultura-main-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetTab = btn.getAttribute('data-cultura-tab');
            document.querySelectorAll('.cultura-panel').forEach(panel => {
                if (panel.id === targetTab) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });

            // Update header title and subtitle dynamically according to active tab
            const headerTitle = document.getElementById('cultura-header-title');
            const headerDesc = document.getElementById('cultura-header-desc');
            if (targetTab === 'panel-sabias-que') {
                if (headerTitle) headerTitle.textContent = "¿Sabías que?";
                if (headerDesc) headerDesc.textContent = "Un recorrido por los secretos, curiosidades y datos más fascinantes de este arte milenario.";
            } else {
                if (headerTitle) headerTitle.textContent = "Historia del tatuaje";
                if (headerDesc) headerDesc.textContent = "Un recorrido cronológico por los hitos y la evolución del arte corporal en el mundo y en nuestro país.";
            }
            
            // Sync active sidebar icon (H active for both unified tabs)
            document.querySelectorAll('.floating-sidebar-menu .sidebar-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.floating-sidebar-menu .btn-sidebar-historia').forEach(i => i.classList.add('active'));
            
            lucide.createIcons();
        });
    });

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
            if (!mapContainer || typeof maplibregl === 'undefined') return;
            
            if (artistProfileMapInstance) {
                artistProfileMapInstance.remove();
                artistProfileMapInstance = null;
            }

            const lngLat = toLngLat(coords);

            try {
                artistProfileMapInstance = new maplibregl.Map({
                    container: 'artist-profile-map',
                    style: MAPLIBRE_STYLE,
                    center: lngLat,
                    zoom: 12,
                    attributionControl: false
                });

                const el = document.createElement('div');
                el.className = 'custom-maplibre-pin';
                const popup = new maplibregl.Popup({ offset: 12 })
                    .setHTML(`<strong>${escapeHTML(document.querySelector('.profile-name')?.textContent || 'Estudio')}</strong>`);

                new maplibregl.Marker({ element: el })
                    .setLngLat(lngLat)
                    .setPopup(popup)
                    .addTo(artistProfileMapInstance);
            } catch (err) {
                console.error("MapLibre artist profile map error:", err);
            }
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
        const isPipo = safeId === 'pipo';
        const artistInfo = artistsDetails[safeId];
        const avatar = (artistInfo && artistInfo.avatar) 
            ? artistInfo.avatar 
            : (avatarUrl || (isPipo ? PIPO_OFFICIAL_LOGO : TINTA_CONECTADA_BRAND_LOGO));

        const coverImg = (artistInfo && artistInfo.coverImage) 
            ? artistInfo.coverImage 
            : (coverImage || (isPipo ? 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086759/compressed_mano_tdwwzv.webp' : ''));

        const card = document.createElement('article');
        card.className = 'artist-card';
        card.setAttribute('data-id', safeId);
        card.setAttribute('data-location', loc);
        
        const stylesStr = JSON.stringify(styles || ['Fine Line']).replace(/"/g, "'");
        card.setAttribute('data-styles', stylesStr);
        card.setAttribute('data-exp', exp);
        card.setAttribute('data-price', 'Intermedio');

        const instagram = (artistInfo && artistInfo.instagram) ? artistInfo.instagram : 'https://instagram.com';
        const instagramHandle = (artistInfo && artistInfo.handle) ? artistInfo.handle.replace('@', '') : (instagram.substring(instagram.lastIndexOf('/') + 1) || 'instagram');
        
        // Zero AI Cover: real photo if available, otherwise verified brand badge
        let coverHTML = '';
        if (coverImg) {
            coverHTML = `<img src="${escapeHTML(coverImg)}" alt="Tatuaje de ${escapeHTML(name)}" class="card-tattoo-img" loading="lazy">`;
        } else {
            coverHTML = `
                <div class="card-verified-brand-cover">
                    <div class="brand-cover-badge">VERIFICADO</div>
                    <div class="brand-cover-handle">@${escapeHTML(instagramHandle)}</div>
                    <div class="brand-cover-cta">Portafolio en Instagram</div>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="card-image-wrapper">
                ${coverHTML}
            </div>
            <div class="card-info">
                <div class="artist-brand-row">
                    <div class="artist-avatar-circle">
                        <img src="${escapeHTML(avatar)}" alt="${escapeHTML(name)} Avatar" onerror="this.onerror=null;this.src='https://res.cloudinary.com/dhgifjpkh/image/upload/v1782924161/compressed_Group_5_exrcfx.webp';">
                    </div>
                    <div class="artist-brand-text">
                        <h3 class="artist-name">${escapeHTML(name)}</h3>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span class="artist-loc"><i data-lucide="map-pin"></i> ${escapeHTML(loc)}</span>
                            <span class="artist-insta">${INSTAGRAM_ICON_SVG} @${escapeHTML(instagramHandle)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="artist-tags">
                     ${(styles || ['Fine Line']).slice(0, 2).map(s => `<span class="tag">${escapeHTML(s)}</span>`).join('')}
                     ${(styles || []).length > 2 ? `<span class="tag tag-count">+${(styles || []).length - 2}</span>` : ''}
                </div>
                
                <div class="artist-meta">
                     <span class="meta-exp">${escapeHTML(String(exp))} años tatuando</span>
                     <button type="button" class="btn-explorar-tag" style="background-color: #FFC82C; border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; color: #000000; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; text-transform: uppercase; cursor: pointer;">Explorar <i data-lucide="arrow-right" style="width: 12px; height: 12px;"></i></button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
        
        // Click action — button goes directly to profile; clicking card opens quick sheet
        card.addEventListener('click', (e) => {
            const btnExplorar = e.target.closest('.btn-explorar-tag');
            if (btnExplorar) {
                e.stopPropagation();
                switchView('artist-view');
                loadArtistProfile(safeId);
                return;
            }

            updateQuickFicha(safeId);

            const drawer = document.getElementById('artist-quick-sheet');
            if (drawer) drawer.classList.add('active');
            const homeLayout = document.querySelector('.home-layout');
            if (homeLayout) homeLayout.classList.add('has-sidebar-open');

            document.querySelectorAll('.artist-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
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

            // Refresh MapLibre GL map size to avoid grey container when workspace goes visible
            if (window.artistProfileMapInstance) {
                setTimeout(() => {
                    if (typeof window.artistProfileMapInstance.resize === 'function') {
                        window.artistProfileMapInstance.resize();
                    }
                    if (state.tatuadorProfile.coords) {
                        const lngLat = toLngLat(state.tatuadorProfile.coords);
                        if (typeof window.artistProfileMapInstance.jumpTo === 'function') {
                            window.artistProfileMapInstance.jumpTo({ center: lngLat, zoom: 13 });
                        }
                        if (window.artistProfileMarkerInstance && typeof window.artistProfileMarkerInstance.setLngLat === 'function') {
                            window.artistProfileMarkerInstance.setLngLat(lngLat);
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
                    <small>${item.style || 'Tatuaje'}${item.zone ? ' / ' + item.zone.toUpperCase() : ''}</small>
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
            
            // Re-render MapLibre maps if switching to stats or others where map needs to refresh size
            if (tab === 'tatuador-profile' && window.artistProfileMapInstance) {
                setTimeout(() => {
                    if (typeof window.artistProfileMapInstance.resize === 'function') {
                        window.artistProfileMapInstance.resize();
                    }
                }, 100);
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
                    
                    if (window.artistProfileMapInstance) {
                        if (typeof window.artistProfileMapInstance.resize === 'function') {
                            window.artistProfileMapInstance.resize();
                        }
                        if (typeof window.artistProfileMapInstance.jumpTo === 'function') {
                            window.artistProfileMapInstance.jumpTo({ center: [lng, lat], zoom: 13 });
                        }
                    }
                    if (window.artistProfileMarkerInstance && typeof window.artistProfileMarkerInstance.setLngLat === 'function') {
                        window.artistProfileMarkerInstance.setLngLat([lng, lat]);
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
        // Handled directly and synchronously in index.html for maximum responsiveness and cache resilience
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
        // Punto 10: Steps son puramente informativos (sin comportamiento ni aspecto de botón)
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
    async function loadTatuadorAuthProfile(userId) {
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
            avatar: profile.avatar_url || 'https://res.cloudinary.com/dhgifjpkh/image/upload/v1782924161/compressed_Group_5_exrcfx.webp',
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
                await loadTatuadorAuthProfile(session.user.id);
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
                await loadTatuadorAuthProfile(data.user.id);
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

    // ==========================================================================
    // 12. EVENTOS & COMUNIDAD — POP-UP EMERGENTE, CARTELERA Y LIGHTBOX
    // ==========================================================================

    function openUpcomingEventsModal() {
        const modal = document.getElementById('upcoming-events-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (window.lucide) lucide.createIcons();
    }
    window.openUpcomingEventsModal = openUpcomingEventsModal;

    function closeUpcomingEventsModal() {
        const modal = document.getElementById('upcoming-events-modal');
        if (!modal) return;
        modal.style.display = 'none';
        const lightbox = document.getElementById('events-lightbox-modal');
        if (!lightbox || lightbox.style.display === 'none') {
            document.body.style.overflow = '';
        }
    }
    window.closeUpcomingEventsModal = closeUpcomingEventsModal;

    function openEventsLightbox(imageSrc, title) {
        if (!imageSrc) return;
        const lightbox = document.getElementById('events-lightbox-modal');
        const imgEl = document.getElementById('lightbox-poster-img');
        const captionEl = document.getElementById('lightbox-poster-caption');
        if (!lightbox || !imgEl) return;

        imgEl.src = imageSrc;
        if (captionEl) {
            captionEl.textContent = title || 'Afiche Oficial del Evento';
        }
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (window.lucide) lucide.createIcons();
    }

    function closeEventsLightbox() {
        const lightbox = document.getElementById('events-lightbox-modal');
        if (!lightbox) return;
        lightbox.style.display = 'none';
        const upcomingModal = document.getElementById('upcoming-events-modal');
        if (!upcomingModal || upcomingModal.style.display === 'none') {
            document.body.style.overflow = '';
        }
    }

    function initEventosView() {
        // 1. Modal Pop-up buttons
        const btnCloseEventsPopup = document.getElementById('btn-close-events-popup');
        if (btnCloseEventsPopup) {
            btnCloseEventsPopup.addEventListener('click', closeUpcomingEventsModal);
        }

        const btnPopupDismiss = document.getElementById('btn-popup-dismiss-events');
        if (btnPopupDismiss) {
            btnPopupDismiss.addEventListener('click', closeUpcomingEventsModal);
        }

        const btnPopupIrEventos = document.getElementById('btn-popup-ir-eventos');
        if (btnPopupIrEventos) {
            btnPopupIrEventos.addEventListener('click', () => {
                closeUpcomingEventsModal();
                switchView('eventos-view');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Overlay click outside window closes upcoming modal
        const upcomingModal = document.getElementById('upcoming-events-modal');
        if (upcomingModal) {
            upcomingModal.addEventListener('click', (e) => {
                if (e.target === upcomingModal) {
                    closeUpcomingEventsModal();
                }
            });
        }

        // 2. Home announcement bar click -> opens Upcoming Events modal
        const btnHomeEventsBar = document.getElementById('btn-home-events-bar');
        if (btnHomeEventsBar) {
            btnHomeEventsBar.addEventListener('click', () => {
                openUpcomingEventsModal();
            });
            btnHomeEventsBar.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openUpcomingEventsModal();
                }
            });
        }

        // 3. Lightbox visualizer controls
        const btnCloseLightbox = document.getElementById('btn-close-lightbox');
        if (btnCloseLightbox) {
            btnCloseLightbox.addEventListener('click', closeEventsLightbox);
        }

        const lightboxModal = document.getElementById('events-lightbox-modal');
        if (lightboxModal) {
            lightboxModal.addEventListener('click', (e) => {
                if (e.target === lightboxModal) {
                    closeEventsLightbox();
                }
            });
        }

        const btnLightboxIrEventos = document.getElementById('btn-lightbox-ir-eventos');
        if (btnLightboxIrEventos) {
            btnLightboxIrEventos.addEventListener('click', () => {
                closeEventsLightbox();
                closeUpcomingEventsModal();
                switchView('eventos-view');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // 4. Delegated listener for all poster triggers [data-poster-src]
        document.addEventListener('click', (e) => {
            const posterTrigger = e.target.closest('[data-poster-src]');
            if (posterTrigger) {
                // Ignore if clicking a button or anchor with distinct non-poster action
                if (e.target.closest('a') && !posterTrigger.matches('a')) return;

                const src = posterTrigger.getAttribute('data-poster-src');
                const title = posterTrigger.getAttribute('data-poster-title');
                if (src) {
                    e.preventDefault();
                    e.stopPropagation();
                    openEventsLightbox(src, title);
                }
            }
        });

        // 5. Category Pills filtering in Cartelera (Tattoodo style)
        const categoryPills = document.querySelectorAll('.events-category-bar .btn-event-pill');
        const heroCard = document.querySelector('.tattoodo-hero-card');
        const articleCards = document.querySelectorAll('.tattoodo-article-card');

        categoryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                categoryPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const filter = pill.getAttribute('data-event-filter') || 'all';

                // Hero Card filtering (Expo Tattoo is "convencion")
                if (heroCard) {
                    const heroCat = heroCard.getAttribute('data-event-cat');
                    if (filter === 'all' || heroCat === filter) {
                        heroCard.classList.remove('event-card-hidden');
                    } else {
                        heroCard.classList.add('event-card-hidden');
                    }
                }

                // Grid cards filtering
                articleCards.forEach(card => {
                    const cat = card.getAttribute('data-event-cat');
                    if (filter === 'all' || cat === filter) {
                        card.classList.remove('event-card-hidden');
                    } else {
                        card.classList.add('event-card-hidden');
                    }
                });
            });
        });

        // 6. Global Escape key closes any open events modal or lightbox
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const lb = document.getElementById('events-lightbox-modal');
                if (lb && lb.style.display !== 'none') {
                    closeEventsLightbox();
                    return;
                }
                const upModal = document.getElementById('upcoming-events-modal');
                if (upModal && upModal.style.display !== 'none') {
                    closeUpcomingEventsModal();
                }
            }
        });
    }

    // Initialize Eventos view logic
    initEventosView();

});