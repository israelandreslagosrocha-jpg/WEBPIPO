#!/usr/bin/env python3
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

real_artists_cards = [
    ('connaink', 'Connaink'),
    ('nowss', 'nowss.ttt'),
    ('majesus', 'majesus.ink'),
    ('milenkorn', 'milenkorn'),
    ('anima', 'Ánima Artist'),
    ('balentina', 'balentina.ttt'),
    ('dulcedelimon', 'Dulce de Limón Ink'),
    ('pandetinta', 'Pan de Tinta'),
    ('denussa', 'Denussa Tatua')
]

for safe_id, name in real_artists_cards:
    # 1. Update card-image-wrapper
    pattern_cover = rf'(<article class="artist-card"[^>]*data-id="{safe_id}"[^>]*>.*?<div class="card-image-wrapper">).*?(</div>\s*<div class="card-info">)'
    replacement_cover = rf'\g<1>\n                                        <img src="assets/artists_real/{safe_id}/tattoo_1.jpg" alt="Tatuaje de {name}" class="card-tattoo-img" loading="lazy">\n                                    \g<2>'
    html, count1 = re.subn(pattern_cover, replacement_cover, html, flags=re.DOTALL)

    # 2. Update avatar circle
    pattern_avatar = rf'(<article class="artist-card"[^>]*data-id="{safe_id}"[^>]*>.*?<div class="artist-avatar-circle">\s*)<img src="[^"]*" alt="[^"]*">'
    replacement_avatar = rf'\g<1><img src="assets/artists_real/{safe_id}/avatar.jpg" alt="{name} Avatar">'
    html, count2 = re.subn(pattern_avatar, replacement_avatar, html, flags=re.DOTALL)
    print(f"Updated {safe_id}: cover={count1}, avatar={count2}")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("SUCCESS: index.html artist cards updated!")
