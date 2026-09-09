#!/usr/bin/env python3
import re
import subprocess

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_artists = '''        "connaink": {
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
        }'''

# Replace from '"connaink": {' up to the closing of 'denussa'
pattern = r'(\s+"connaink":\s+\{.*?"denussa":\s+\{.*?"portfolio":\s+\[\]\s+\})'
match = re.search(pattern, content, re.DOTALL)
if not match:
    print("ERROR: could not find target pattern in app.js")
    exit(1)

new_content = content[:match.start()] + new_artists + content[match.end():]
with open('app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("SUCCESS: app.js updated!")
