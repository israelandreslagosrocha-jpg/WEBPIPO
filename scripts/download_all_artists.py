#!/usr/bin/env python3
"""
download_all_artists.py
Download authentic Instagram profile pictures and post photos for all 29 artists in La Araucanía.
Strict Zero IA rule: only 100% real photography and authentic avatars.
"""

import subprocess
import json
import re
import os
import sys
import codecs
import time

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(WORKSPACE_DIR, 'assets', 'artists_real')
os.makedirs(OUTPUT_DIR, exist_ok=True)

ARTISTS = [
    ('tattoo_zimple', 'tattoo_zimple', 'Tattoo Zimple', 'Padre Las Casas', [-38.7612, -72.5991], ['Blackwork', 'Black and Gray', 'Fine Line', 'Puntillismo'], '3–5 años'),
    ('sasori', 'sasori.tattoo', 'Sasori Tattoo', 'Temuco', [-38.7312, -72.5854], ['Blackwork', 'Neotribal', 'Cybersigilism', 'Dark Ornamental'], '3–5 años'),
    ('neblink', 'neblink.tattoo', 'Neblink Tattoo', 'Temuco', [-38.7380, -72.5940], ['Blackwork', 'Black and Gray', 'Fine Line', 'Realismo'], '3–5 años'),
    ('danilobravo', 'danilobravotattoo', 'Danilo Bravo Tattoo', 'Temuco', [-38.7350, -72.5900], ['Realismo', 'Black and Gray', 'Color'], 'Más de 10 años'),
    ('wentruart', 'wentruart', 'Wentru Art', 'Temuco', [-38.7385, -72.6010], ['Blackwork', 'Ilustración', 'Fine Line'], '3–5 años'),
    ('aflordepiel', 'aflordepielchile', 'A Flor de Piel Chile', 'Temuco', [-38.7420, -72.5950], ['Fine Line', 'Botánica', 'Color'], '3–5 años'),
    ('andres_black', 'andres_blacktattoostudios', 'Andrés Black Tattoo Studios', 'Temuco', [-38.7370, -72.5920], ['Blackwork', 'Realismo', 'Black and Gray'], 'Más de 5 años'),
    ('rumel', 'rumel_tatuajes', 'Rumel Tatuajes', 'Temuco', [-38.7400, -72.6050], ['Blackwork', 'Neotradicional', 'Puntillismo'], '3–5 años'),
    ('rodrigovilla', 'rodrigovilla_art', 'Rodrigo Villa Art', 'Temuco', [-38.7330, -72.5970], ['Realismo', 'Black and Gray', 'Retrato'], 'Más de 5 años'),
    ('pablog', 'Pablog_tatuajes', 'Pablo Gaete Tatuajes', 'Temuco', [-38.7360, -72.6080], ['Black and Gray', 'Puntillismo', 'Geométrico'], 'Más de 5 años'),
    ('medusa', 'medusatattoochile', 'Medusa Tattoo Chile', 'Temuco', [-38.7390, -72.5930], ['Fine Line', 'Blackwork', 'Lettering'], '3–5 años'),
    ('estudiothelake', 'estudio.thelake', 'Estudio The Lake', 'Pucón', [-39.2760, -71.9780], ['Fine Line', 'Blackwork', 'Color'], '1–3 años'),
    ('tattoopucon', 'tattoopucon', 'Tattoo Pucón', 'Pucón', [-39.2795, -71.9740], ['Blackwork', 'Puntillismo', 'Geométrico'], 'Más de 5 años'),
    ('damiencarrasco', 'damien.carrasco', 'Damien Carrasco', 'Temuco', [-38.7410, -72.6000], ['Blackwork', 'Dark Art', 'Fine Line'], '3–5 años'),
    ('francis_tattoo', 'francis_tattoo_color', 'Francis Tattoo Color', 'Temuco', [-38.7355, -72.5965], ['Color', 'Acuarela', 'Fine Line'], '3–5 años'),
    ('koteknt', 'koteknt', 'Kote KNT', 'Temuco', [-38.7430, -72.5980], ['Blackwork', 'Lettering', 'Chicano'], '3–5 años'),
    ('tattoo_adictos', 'tattoo_adictos_', 'Abner Jacob Tattoo Adictos', 'Temuco', [-38.7380, -72.6030], ['Realismo', 'Black and Gray', 'Color'], 'Más de 5 años'),
    ('gota_piedra', 'gota_piedra_tatoo_victoria', 'Gota de Piedra Tattoo', 'Victoria', [-38.2325, -72.3341], ['Blackwork', 'Tradicional', 'Puntillismo'], '3–5 años'),
    ('puertotinta', 'puertotinta', 'Puerto Tinta', 'Puerto Saavedra', [-38.7890, -73.3980], ['Blackwork', 'Fine Line', 'Ilustración'], '1–3 años'),
    ('tattoo_antu', 'tattoo_antu', 'Tattoo Antü', 'Temuco', [-38.7340, -72.5910], ['Fine Line', 'Puntillismo', 'Floral'], '1–3 años'),
    ('tattooandroses', 'tattooandroses', 'Tattoo and Roses', 'Temuco', [-38.7375, -72.5995], ['Fine Line', 'Realismo', 'Black and Gray'], '3–5 años'),
    ('emilio_sf', 'emili0_sf_t4tt0s_', 'Emilio SF Tattoos', 'Temuco', [-38.7445, -72.6015], ['Blackwork', 'Lettering', 'Cyberpunk'], '1–3 años'),
    ('blasphemy', 'blasphemy_tattoo', 'Blasphemy Tattoo', 'Temuco', [-38.7325, -72.5890], ['Blackwork', 'Dark Art', 'Neotribal'], '3–5 años'),
    ('oskargutierrez', 'oskargutierrez.tattoos', 'Oskar Gutiérrez Tattoos', 'Temuco', [-38.7395, -72.6040], ['Realismo', 'Black and Gray', 'Retrato'], 'Más de 5 años'),
    ('danna_tattoo', 'danna.tattoo_', 'Danna Tattoo', 'Temuco', [-38.7415, -72.5975], ['Fine Line', 'Microrealismo', 'Floral'], '1–3 años'),
    ('tatuajes_araucania', 'tatuajes_araucania', 'Tatuajes Araucanía', 'Temuco', [-38.7365, -72.5945], ['Blackwork', 'Color', 'Tradicional'], 'Más de 5 años'),
    ('yesstattoo', 'yesstattoo._', 'Yess Tattoo', 'Temuco', [-38.7405, -72.5925], ['Fine Line', 'Anime', 'Color'], '1–3 años'),
    ('jacke_tattoos', 'jacke_tattoos', 'Jacke Tattoos', 'Temuco', [-38.7388, -72.5988], ['Blackwork', 'Puntillismo', 'Ornamental'], '3–5 años'),
    ('nelsonvergara', 'nelsonvergaratatuajes', 'Nelson Vergara Tatuajes', 'Temuco', [-38.7345, -72.5955], ['Realismo', 'Black and Gray', 'Fine Line'], 'Más de 5 años')
]

def is_valid_image(filepath):
    if not os.path.exists(filepath) or os.path.getsize(filepath) < 1500:
        return False
    try:
        with open(filepath, 'rb') as f:
            header = f.read(16)
        if header.startswith(b'\xff\xd8\xff'):
            return True
        if header.startswith(b'RIFF') and b'WEBP' in header:
            return True
        if header.startswith(b'\x89PNG\r\n\x1a\n'):
            return True
    except Exception:
        return False
    return False

def download_image(url, target_path):
    try:
        cmd = ['curl', '-s', '-L', '--max-time', '20', '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', url, '-o', target_path]
        subprocess.run(cmd, check=True)
        if is_valid_image(target_path):
            return True
        if os.path.exists(target_path):
            os.remove(target_path)
        return False
    except Exception as e:
        print(f"    Download error: {e}")
        if os.path.exists(target_path):
            os.remove(target_path)
        return False

def clean_url(chunk, start_idx):
    h_start = chunk.find('https:', start_idx)
    if h_start == -1 or h_start > start_idx + 40:
        return None
    q_end = chunk.find('"', h_start)
    if q_end == -1:
        return None
    raw = chunk[h_start:q_end].rstrip(chr(92))
    try:
        clean = codecs.decode(raw, 'unicode_escape')
    except Exception:
        clean = raw
    clean = clean.replace(r'\/', '/').replace(r'\\/', '/').replace(chr(92), '')
    return clean

def extract_caption(chunk):
    idx = chunk.find('edge_media_to_caption')
    if idx == -1:
        return ""
    t_idx = chunk.find('text', idx)
    if t_idx == -1:
        return ""
    colon = chunk.find(':', t_idx)
    if colon == -1:
        return ""
    q1 = chunk.find('"', colon)
    if q1 == -1:
        return ""
    q2 = chunk.find('"', q1 + 1)
    if q2 == -1:
        return ""
    raw_cap = chunk[q1+1:q2]
    try:
        clean = codecs.decode(raw_cap.rstrip(chr(92)), 'unicode_escape')
        clean = re.sub(r'\s+', ' ', clean)
        return clean.strip()
    except Exception:
        return raw_cap.replace('\n', ' ').strip()

def extract_shortcode(chunk):
    idx = chunk.find('shortcode')
    if idx == -1:
        return ""
    colon = chunk.find(':', idx)
    if colon == -1:
        return ""
    q1 = chunk.find('"', colon)
    if q1 == -1:
        return ""
    q2 = chunk.find('"', q1 + 1)
    if q2 == -1:
        return ""
    return chunk[q1+1:q2].strip(chr(92))

def scrape_instagram_embed(safe_id, handle):
    url = f"https://www.instagram.com/{handle}/embed/"
    cmd = ['curl', '-s', '-L', '--max-time', '15', url]
    res = subprocess.run(cmd, capture_output=True, text=True, errors='ignore')
    html_text = res.stdout

    if 'display_url' not in html_text and 'profile_pic_url' not in html_text:
        return None

    av_pos = html_text.find('profile_pic_url')
    avatar_url = clean_url(html_text, av_pos) if av_pos != -1 else None

    chunks = html_text.split('display_url')
    photos = []
    seen = set()
    for c in chunks[1:]:
        p_url = clean_url(c, 0)
        if not p_url or not p_url.startswith('https:') or p_url in seen:
            continue
        seen.add(p_url)
        sc = extract_shortcode(c)
        cap = extract_caption(c)
        photos.append({'url': p_url, 'shortcode': sc, 'caption': cap})

    return {'avatar_url': avatar_url, 'photos': photos}

def scrape_danilobravo():
    print("  [Special Source] Fetching Danilo Bravo from danilobravo.com...")
    photos = [
        ('https://danilobravo.com/wp-content/uploads/2025/03/IMG_20230421_210419_936.webp', 'Tatuaje Realista Brazo Completo'),
        ('https://danilobravo.com/wp-content/uploads/2025/03/IMG_20230421_202736_900.webp', 'Composición Black and Gray Detallada'),
        ('https://danilobravo.com/wp-content/uploads/2025/03/IMG_20220424_211124_592.webp', 'Retrato Realista Sombras y Textura'),
        ('https://danilobravo.com/wp-content/uploads/2025/03/IMG_20220924_171904-scaled.jpg', 'Tatuaje Gran Formato Espalda'),
        ('https://danilobravo.com/wp-content/uploads/2025/03/IMG_20220501_133358_480-1.webp', 'Diseño Realista Escultura'),
        ('https://danilobravo.com/wp-content/uploads/2025/03/IMG_20220424_211024_887.webp', 'Pieza Black and Gray Textura Suave'),
        ('https://danilobravo.com/wp-content/uploads/2025/03/danilo-18-1-scaled.jpg', 'Tatuaje de Autor Danilo Bravo'),
        ('https://danilobravo.com/wp-content/uploads/2025/03/IMG_20230322_143809_647.jpg', 'Composición Artística en Pierna')
    ]
    avatar_url = 'https://danilobravo.com/wp-content/uploads/2025/03/DaniloBRAVO.png'
    return {'avatar_url': avatar_url, 'photos': [{'url': u, 'shortcode': '', 'caption': t} for u, t in photos]}

def scrape_pablogaete():
    print("  [Special Source] Fetching Pablo Gaete from verified profile...")
    avatar_url = "https://scontent.fccp1-1.fna.fbcdn.net/v/t39.30808-1/348312206_1381990345975731_6754138285941793096_n.jpg?stp=dst-jpg_tt6&cstp=mx960x956&ctp=s720x720&_nc_cat=101&ccb=1-7&_nc_sid=3ab345&_nc_ohc=w1G2outzjHoQ7kNvwEZ_QkX&_nc_oc=AdoG6-GgMmgYOJHGO-sEdpMiJABr5v5J5mG5gVekOJKYWJXnWxldN3EF4s9DXKRhTlnmwTR-6Nz77n2erSXol70Z&_nc_zt=24&_nc_ht=scontent.fccp1-1.fna&_nc_gid=If53by-TaP5DsnHoD2vdSw&_nc_ss=7f20f&oh=00_AQIWFSnZnJ5DzzWsqqNr1peEbQ9dy5K02qYo9efo0iV4YA&oe=6AA6B752"
    studio_embed = scrape_instagram_embed('tintaeterna', 'tintaeternatemuco')
    photos = []
    if studio_embed and studio_embed['photos']:
        photos = studio_embed['photos'][:8]
    return {'avatar_url': avatar_url, 'photos': photos}

def process_artist(artist_info):
    safe_id, handle, name, comuna, coords, default_styles, exp = artist_info
    print(f"\n[{safe_id}] Processing @{handle} - {name} ({comuna})")
    
    artist_dir = os.path.join(OUTPUT_DIR, safe_id)
    os.makedirs(artist_dir, exist_ok=True)
    
    data = None
    if safe_id == 'danilobravo':
        data = scrape_danilobravo()
    elif safe_id == 'pablog':
        data = scrape_pablogaete()
    else:
        data = scrape_instagram_embed(safe_id, handle)
        
    if not data:
        print(f"  [-] Failed to obtain data for @{handle}")
        return None
        
    avatar_local = None
    if data.get('avatar_url'):
        avatar_path = os.path.join(artist_dir, 'avatar.jpg')
        if download_image(data['avatar_url'], avatar_path):
            avatar_local = f"assets/artists_real/{safe_id}/avatar.jpg"
            print(f"  [+] Avatar saved: {avatar_local} ({os.path.getsize(avatar_path)} bytes)")
        else:
            print(f"  [-] Avatar download failed")
            
    downloaded_photos = []
    raw_photos = data.get('photos', [])
    for idx, p in enumerate(raw_photos[:8]):
        ext = 'webp' if '.webp' in p['url'] else 'jpg'
        p_path = os.path.join(artist_dir, f"tattoo_{idx+1}.{ext}")
        if download_image(p['url'], p_path):
            rel_path = f"assets/artists_real/{safe_id}/tattoo_{idx+1}.{ext}"
            raw_title = p.get('caption', '')
            title = raw_title[:65].strip() if raw_title else f"Tatuaje por {name}"
            title = re.sub(r'#\w+', '', title).strip(' .,-\n\t')
            if len(title) < 5:
                title = f"Trabajo Real — @{handle}"
            
            style = default_styles[idx % len(default_styles)]
            downloaded_photos.append({
                'src': rel_path,
                'title': title,
                'style': style,
                'shortcode': p.get('shortcode', ''),
                'post_url': f"https://www.instagram.com/p/{p.get('shortcode')}/" if p.get('shortcode') else f"https://www.instagram.com/{handle}/"
            })
            print(f"  [+] Tattoo photo {idx+1} saved: {rel_path} ({os.path.getsize(p_path)} bytes)")

    return {
        'id': safe_id,
        'name': name,
        'handle': f"@{handle}",
        'instagram': f"https://www.instagram.com/{handle}/",
        'location': comuna,
        'coords': coords,
        'experience': exp,
        'price': 'Intermedio',
        'styles': default_styles,
        'avatar': avatar_local or f"assets/artists_real/{safe_id}/avatar.jpg",
        'coverImage': downloaded_photos[0]['src'] if downloaded_photos else '',
        'portfolio': downloaded_photos,
        'bio': f"Tatuador profesional en {comuna}, La Araucanía. Especialista en {', '.join(default_styles[:3])}."
    }

def main():
    results = {}
    print(f"=== Starting extraction for {len(ARTISTS)} artists ===")
    for a in ARTISTS:
        res = process_artist(a)
        if res:
            results[res['id']] = res
        time.sleep(0.4)

    summary_file = os.path.join(OUTPUT_DIR, 'scraped_all_summary.json')
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n=======================================================")
    print(f"SUMMARY: Successfully processed {len(results)} / {len(ARTISTS)} artists.")
    print(f"Saved JSON database to {summary_file}")
    print(f"=======================================================")

if __name__ == '__main__':
    main()
