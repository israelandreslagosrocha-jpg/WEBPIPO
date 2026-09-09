#!/usr/bin/env python3
"""
Instagram Profile Scraper - ChocoData Integration
Repository: https://github.com/ChocoData-com/instagram-profile-scraper

Usage:
  python3 scripts/chocodata_instagram_scraper.py --key YOUR_CHOCODATA_KEY
  python3 scripts/chocodata_instagram_scraper.py --try-free
"""

import os
import sys
import json
import re
import argparse
import requests

ARTISTS = [
    ('connaink', 'connaink'),
    ('nowss', 'nowss.ttt'),
    ('tatto_zimple', 'tatto_zimple'),
    ('majesus', 'majesus.ink'),
    ('sasori', 'sasori.tattoo.cl'),
    ('milenkorn', 'milenkorn'),
    ('neblink', 'nebl.ink'),
    ('anima', 'anima.artist'),
    ('balentina', 'balentina.ttt'),
    ('dulcedelimon', 'dulcedelimon.ink'),
    ('pandetinta', 'pan.detinta'),
    ('denussa', 'denussatatua')
]

ENDPOINT = "https://api.chocodata.com/api/v1/instagram/profile"

HEADERS = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

def fetch_chocodata_api(username, api_key):
    try:
        r = requests.get(ENDPOINT, params={"api_key": api_key, "username": username}, timeout=90)
        if r.status_code == 200:
            return r.json()
        elif r.status_code == 401:
            print("  [!] Error 401: Invalid or expired ChocoData API key.")
            return None
        elif r.status_code == 402:
            print("  [!] Error 402: Insufficient credits on ChocoData account.")
            return None
        else:
            print(f"  [!] HTTP {r.status_code}: {r.text[:120]}")
            return None
    except Exception as e:
        print(f"  [!] API Request failed: {e}")
        return None

def fetch_free_scraper(username):
    url = f"https://www.instagram.com/{username}/"
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        if r.status_code != 200:
            return None
        # Try og:image for profile pic
        og_img = re.search(r'<meta[^>]+property=[\"\']og:image[\"\'][^>]*content=[\"\']([^\"\']*)[\"\']', r.text)
        og_desc = re.search(r'<meta[^>]+property=[\"\']og:description[\"\'][^>]*content=[\"\']([^\"\']*)[\"\']', r.text)
        
        avatar = og_img.group(1) if og_img else None
        desc = og_desc.group(1) if og_desc else None
        
        if avatar:
            return {
                "username": username,
                "profile_pic_url": avatar,
                "og_description": desc,
                "source": "free_scraper"
            }
        return None
    except Exception as e:
        return None

def main():
    parser = argparse.ArgumentParser(description="ChocoData Instagram Profile Scraper")
    parser.add_argument("--key", default=os.environ.get("CHOCODATA_API_KEY", ""), help="ChocoData API key")
    parser.add_argument("--try-free", action="store_true", help="Try free unauthenticated scrape method from repo")
    args = parser.parse_args()

    print("===================================================================")
    print(" ChocoData Instagram Profile Scraper (Tinta Conectada)")
    print(" https://github.com/ChocoData-com/instagram-profile-scraper")
    print("===================================================================")

    if not args.key and not args.try_free:
        print("\n[!] No API key provided.")
        print("    1. You can get a free key (1,000 requests) at https://chocodata.com")
        print("    2. Run with: python3 scripts/chocodata_instagram_scraper.py --key YOUR_KEY")
        print("    3. Or test the repo's free method: python3 scripts/chocodata_instagram_scraper.py --try-free")
        sys.exit(0)

    for safe_id, handle in ARTISTS:
        print(f"\nProcessing @{handle} ({safe_id})...")
        data = None
        if args.key:
            data = fetch_chocodata_api(handle, args.key)
        
        if not data and args.try_free:
            print("  Attempting free scraper method from repo...")
            data = fetch_free_scraper(handle)

        if data:
            print(f"  [+] Success! Profile fetched for @{handle}:")
            print(f"      Full Name: {data.get('full_name')}")
            print(f"      Followers: {data.get('follower_count')}")
            print(f"      Avatar URL: {data.get('profile_pic_url', '')[:60]}...")
        else:
            print(f"  [-] No data returned for @{handle}.")

if __name__ == "__main__":
    main()
