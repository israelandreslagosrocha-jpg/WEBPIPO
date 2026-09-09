import json
import re

with open('assets/artists_real/scraped_all_summary.json', 'r', encoding='utf-8') as f:
    scraped = json.load(f)

# Sanitize all titles in scraped
for aid, art in scraped.items():
    art_name = art.get('name', aid)
    for p in art.get('portfolio', []):
        t = p.get('title', '')
        t = t.replace('\n', ' ').replace('\r', ' ').replace('\\', '').replace('"', '').strip()
        if not t or len(t) < 3 or t.startswith('__'):
            t = f"Tatuaje por {art_name}"
        p['title'] = t

with open('assets/artists_real/scraped_all_summary.json', 'w', encoding='utf-8') as f:
    json.dump(scraped, f, indent=2, ensure_ascii=False)

existing = {
    "pipo": {
        "id": "pipo",
        "name": "Studio tatto pipo",
        "location": "Teodoro Schmidt",
        "bio": "Tatuador profesional en Teodoro Schmidt, La Araucanía. Especialista en Fine Line, Blackwork, Puntillismo, Botanica, Geometrico.",
        "instagram": "https://www.instagram.com/pipo.tattooo/",
        "handle": "@pipo.tattooo",
        "avatar": "https://res.cloudinary.com/dhgifjpkh/image/upload/v1784086795/compressed_Logo_rojo_idv5bn.webp",
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
    },
    "connaink": {
        "id": "connaink",
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
        "id": "nowss",
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
    "majesus": {
        "id": "majesus",
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
    "milenkorn": {
        "id": "milenkorn",
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
    "anima": {
        "id": "anima",
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
        "id": "balentina",
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
        "id": "dulcedelimon",
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
        "id": "pandetinta",
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
        "id": "denussa",
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
}

order = [
    "pipo", "connaink", "nowss", "majesus", "milenkorn", "anima", "balentina", "dulcedelimon", "pandetinta", "denussa",
    "tattoo_zimple", "sasori", "neblink", "danilobravo", "wentruart", "aflordepiel", "andres_black", "rumel",
    "rodrigovilla", "pablog", "medusa", "estudiothelake", "tattoopucon", "damiencarrasco", "francis_tattoo",
    "koteknt", "tattoo_adictos", "gota_piedra", "puertotinta", "tattoo_antu", "tattooandroses", "emilio_sf",
    "blasphemy", "oskargutierrez", "danna_tattoo", "tatuajes_araucania", "yesstattoo", "jacke_tattoos", "nelsonvergara"
]

all_artists = {}
for aid in order:
    if aid in existing:
        all_artists[aid] = existing[aid]
    elif aid in scraped:
        entry = dict(scraped[aid])
        entry["inks"] = "Dynamic, Solid Ink, Kwadron"
        entry["needles"] = "Kwadron, Cheyenne"
        all_artists[aid] = entry

all_artists["tatto_zimple"] = dict(all_artists["tattoo_zimple"])
all_artists["tatto_zimple"]["id"] = "tatto_zimple"

# 1. Update app.js
with open('app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# Build artistsData
artists_data_list = []
for aid in order:
    art = all_artists[aid]
    artists_data_list.append({
        "id": art["id"],
        "name": art["name"],
        "location": art["location"],
        "plan": "Premium",
        "status": "Verificado"
    })
artists_data_list.append({
    "id": "tatto_zimple",
    "name": all_artists["tattoo_zimple"]["name"],
    "location": all_artists["tattoo_zimple"]["location"],
    "plan": "Premium",
    "status": "Verificado"
})

artists_data_str = "artistsData: " + json.dumps(artists_data_list, indent=12, ensure_ascii=False)
app_js = re.sub(r'artistsData:\s*\[[\s\S]*?\](?=,\s*\n\s*// Tatuador dashboard)', lambda m: artists_data_str, app_js)

# Build artistsDetails
artists_details_str = "let artistsDetails = " + json.dumps(all_artists, indent=8, ensure_ascii=False) + ";\n    window.artistsDetails = artistsDetails;"
app_js = re.sub(r'let artistsDetails = \{[\s\S]*?\};\s*window\.artistsDetails = artistsDetails;', lambda m: artists_details_str, app_js)

# Build artistCoordinates
coords_dict = {k: v["coords"] for k, v in all_artists.items()}
coords_str = "let artistCoordinates = " + json.dumps(coords_dict, indent=8, ensure_ascii=False) + ";\n    window.artistCoordinates = artistCoordinates;"
app_js = re.sub(r'let artistCoordinates = \{[\s\S]*?\};\s*window\.artistCoordinates = artistCoordinates;', lambda m: coords_str, app_js)

# Remove is-brand-badge in updateQuickFicha and loadArtistProfile
app_js = re.sub(
    r"const isBrandBadge = !details\.portfolio \|\| details\.portfolio\.length === 0 \|\|[\s\S]*?avatarImg\.classList\.remove\('is-brand-badge'\);\s*\}",
    lambda m: "avatarImg.classList.remove('is-brand-badge');",
    app_js
)

app_js = re.sub(
    r"const isBrandBadge = !details\.portfolio \|\| details\.portfolio\.length === 0 \|\|[\s\S]*?profAvatar\.classList\.remove\('is-brand-badge'\);\s*\}",
    lambda m: "profAvatar.classList.remove('is-brand-badge');",
    app_js
)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("app.js updated successfully.")

# 2. Update index.html
def exp_to_num(exp_str):
    if "Menos" in exp_str or "<" in exp_str: return 1
    if "1–3" in exp_str or "1-3" in exp_str: return 2
    if "3–5" in exp_str or "3-5" in exp_str: return 4
    if "Más" in exp_str or ">" in exp_str or "5 años" in exp_str: return 5
    return 3

cards_html = []
for aid in order:
    art = all_artists[aid]
    name = art["name"]
    loc = art["location"]
    styles = art["styles"]
    exp_str = art.get("experience", "3–5 años")
    exp_num = exp_to_num(exp_str)
    price = art.get("price", "Intermedio")
    cover = art["coverImage"]
    avatar = art["avatar"]
    handle = art.get("handle") or ("@" + aid)
    
    if len(styles) <= 2:
        tags_html = "\n".join([f'                                            <span class="tag">{s}</span>' for s in styles])
    else:
        tags_html = "\n".join([f'                                            <span class="tag">{s}</span>' for s in styles[:2]])
        tags_html += f'\n                                            <span class="tag tag-count">+{len(styles) - 2}</span>'
    
    active_class = " active" if aid == "pipo" else ""
    styles_json_attr = str(styles).replace("'", '"')
    exp_display = f"{exp_str} tatuando" if not exp_str.endswith("tatuando") else exp_str
    
    card_snippet = f'''                                <!-- {name} -->
                                <article class="artist-card{active_class}" data-id="{aid}" data-location="{loc}" data-styles='{styles_json_attr}' data-exp="{exp_num}" data-price="{price}">
                                    <div class="card-image-wrapper">
                                        <img src="{cover}" alt="Tatuaje de {name}" class="card-tattoo-img" loading="lazy">
                                    </div>
                                    <div class="card-info">
                                        <div class="artist-brand-row">
                                            <div class="artist-avatar-circle">
                                                <img src="{avatar}" alt="{name} Avatar">
                                            </div>
                                            <div class="artist-brand-text">
                                                <h3 class="artist-name">{name}</h3>
                                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                                    <span class="artist-loc"><i data-lucide="map-pin"></i> {loc}</span>
                                                    <span class="artist-insta"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> {handle}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="artist-tags">
{tags_html}
                                        </div>
                                        <div class="artist-meta">
                                            <span class="meta-exp">{exp_display}</span>
                                            <button type="button" class="btn-explorar-tag" style="background-color: #FFC82C; border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; color: #000000; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; text-transform: uppercase; cursor: pointer;">Explorar <i data-lucide="arrow-right" style="width: 12px; height: 12px;"></i></button>
                                        </div>
                                    </div>
                                </article>'''
    cards_html.append(card_snippet)

all_cards_block = "\n\n".join(cards_html)

with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Replace inner content of #artist-grid using lambda
grid_pattern = re.compile(r'(<div class="artist-grid" id="artist-grid">)[\s\S]*?(</div>\s*<!-- View all link -->)', re.MULTILINE)
html_content = grid_pattern.sub(lambda m: m.group(1) + "\n" + all_cards_block + "\n                            " + m.group(2), html_content)

# Bump cache buster v=55 -> v=56
html_content = html_content.replace('styles.css?v=55', 'styles.css?v=56')
html_content = html_content.replace('app.js?v=55', 'app.js?v=56')
html_content = html_content.replace('styles.css?v=54', 'styles.css?v=56')
html_content = html_content.replace('app.js?v=54', 'app.js?v=56')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("index.html updated successfully.")
