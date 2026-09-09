#!/usr/bin/env python3
"""
Scrape authentic Instagram profile pictures and post photos from public embed endpoints.
Zero IA. Only authentic photography and verified handles from La Araucanía artists.
"""

import subprocess
import json
import re
import os
import sys
import codecs

ARTISTS = [
    ('connaink', 'connaink', 'Temuco'),
    ('nowss', 'nowss.ttt', 'Temuco'),
    ('tatto_zimple', 'tatto_zimple', 'Padre Las Casas'),
    ('majesus', 'majesus.ink', 'Villarrica'),
    ('sasori', 'sasori.tattoo.cl', 'Temuco'),
    ('milenkorn', 'milenkorn', 'Pucón'),
    ('neblink', 'nebl.ink', 'Temuco'),
    ('anima', 'anima.artist', 'Angol'),
    ('balentina', 'balentina.ttt', 'Temuco'),
    ('dulcedelimon', 'dulcedelimon.ink', 'Villarrica'),
    ('pandetinta', 'pan.detinta', 'Temuco'),
    ('denussa', 'denussatatua', 'Temuco')
]

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'artists_real')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def is_valid_image(filepath):
    if not os.path.exists(filepath) or os.path.getsize(filepath) < 1000:
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
        cmd = ['curl', '-s', '-L', '--max-time', '15', url, '-o', target_path]
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
    if h_start == -1 or h_start > start_idx + 35:
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
        # Clean up consecutive newlines and extra spaces
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

def scrape_artist(safe_id, handle, comuna):
    print(f"\n=======================================================")
    print(f"Scraping @{handle} ({safe_id}) - {comuna}")
    print(f"=======================================================")

    artist_dir = os.path.join(OUTPUT_DIR, safe_id)
    os.makedirs(artist_dir, exist_ok=True)

    url = f"https://www.instagram.com/{handle}/embed/"
    cmd = ['curl', '-s', '-L', '--max-time', '15', url]
    res = subprocess.run(cmd, capture_output=True, text=True, errors='ignore')
    html = res.stdout

    if 'display_url' not in html and 'profile_pic_url' not in html:
        print(f"  [-] No public embed grid available for @{handle} (Login/Restricted required)")
        return {
            'safe_id': safe_id,
            'handle': handle,
            'avatar': None,
            'photos': [],
            'photos_count': 0,
            'status': 'restricted'
        }

    # 1. Extract and download avatar
    av_pos = html.find('profile_pic_url')
    avatar_url = clean_url(html, av_pos) if av_pos != -1 else None
    local_avatar = None
    if avatar_url:
        avatar_file = os.path.join(artist_dir, 'avatar.jpg')
        if download_image(avatar_url, avatar_file):
            local_avatar = f"assets/artists_real/{safe_id}/avatar.jpg"
            print(f"  [+] Saved authentic avatar: {local_avatar} ({os.path.getsize(avatar_file)} bytes)")
        else:
            print(f"  [-] Failed to download avatar from {avatar_url[:60]}")
    else:
        print("  [-] Avatar URL not found in HTML")

    # 2. Extract photos, shortcodes, and captions
    chunks = html.split('display_url')
    unique_photos = []
    seen_urls = set()

    for c in chunks[1:]:
        p_url = clean_url(c, 0)
        if not p_url or not p_url.startswith('https:') or p_url in seen_urls:
            continue
        seen_urls.add(p_url)
        sc = extract_shortcode(c)
        cap = extract_caption(c)
        unique_photos.append({
            'url': p_url,
            'shortcode': sc,
            'caption': cap
        })

    # Download up to 8 real tattoo photos
    downloaded_photos = []
    for idx, item in enumerate(unique_photos[:8]):
        photo_file = os.path.join(artist_dir, f"tattoo_{idx + 1}.jpg")
        if download_image(item['url'], photo_file):
            rel_path = f"assets/artists_real/{safe_id}/tattoo_{idx + 1}.jpg"
            title = item['caption'][:60] if item['caption'] else f"Trabajo Real — @{handle}"
            post_link = f"https://www.instagram.com/p/{item['shortcode']}/" if item['shortcode'] and item['shortcode'] != '__typename' else f"https://www.instagram.com/{handle}/"
            downloaded_photos.append({
                'src': rel_path,
                'title': title,
                'style': "Tatuaje",
                'shortcode': item['shortcode'],
                'post_url': post_link
            })
            print(f"  [+] Saved photo {idx + 1}: {rel_path} ({os.path.getsize(photo_file)} bytes)")

    return {
        'safe_id': safe_id,
        'handle': handle,
        'avatar': local_avatar,
        'photos': downloaded_photos,
        'photos_count': len(downloaded_photos),
        'status': 'success' if downloaded_photos or local_avatar else 'no_media'
    }

def main():
    all_data = {}
    for safe_id, handle, comuna in ARTISTS:
        res = scrape_artist(safe_id, handle, comuna)
        all_data[safe_id] = res

    # Save summary JSON
    summary_path = os.path.join(OUTPUT_DIR, 'scraped_artists_summary.json')
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)

    print(f"\n=======================================================")
    print("FINISHED SCRAPING SUMMARY:")
    print(f"=======================================================")
    total_photos = 0
    total_avatars = 0
    for safe_id, data in all_data.items():
        has_av = 'YES' if data['avatar'] else 'NO'
        if data['avatar']:
            total_avatars += 1
        total_photos += data['photos_count']
        print(f"  @{data['handle']} ({safe_id}): Status={data['status']} | Avatar={has_av} | Photos={data['photos_count']}")
    print(f"\nTotal authentic avatars saved: {total_avatars}/12")
    print(f"Total authentic tattoo photos saved: {total_photos}")

if __name__ == '__main__':
    main()
