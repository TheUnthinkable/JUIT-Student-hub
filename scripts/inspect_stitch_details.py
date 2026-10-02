import os, re

files = {
    'DESKTOP_Dashboard': 'scripts/stitch_screens/DESKTOP_JUIT_Student_Hub_-_Desktop_Dashboard.html',
    'DESKTOP_Timetable': 'scripts/stitch_screens/DESKTOP_JUIT_Student_Hub_-_Desktop_Timetable.html',
    'DESKTOP_Map': 'scripts/stitch_screens/DESKTOP_JUIT_Student_Hub_-_Desktop_Campus_Map.html',
    'DESKTOP_Resources': 'scripts/stitch_screens/DESKTOP_JUIT_Student_Hub_-_Desktop_Resource_Hub.html',
    'MOBILE_Dashboard': 'scripts/stitch_screens/MOBILE_Antigravity_Hub_-_Dashboard.html',
    'MOBILE_Timetable': 'scripts/stitch_screens/MOBILE_Antigravity_Hub_-_Timetable.html',
    'MOBILE_Resources': 'scripts/stitch_screens/MOBILE_Antigravity_Hub_-_Resources.html',
    'MOBILE_Map': 'scripts/stitch_screens/MOBILE_Antigravity_Hub_-_Campus_Map.html'
}

for name, fpath in files.items():
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
    print("=" * 60)
    print(f"SCREEN: {name}")
    # Extract body tag attributes
    body_match = re.search(r'<body([^>]*)>', html)
    if body_match:
        print("Body attrs:", body_match.group(1))
    
    # Extract aside / nav / header / main sections
    asides = re.findall(r'<aside[^>]*class="([^"]*)"', html)
    headers = re.findall(r'<header[^>]*class="([^"]*)"', html)
    mains = re.findall(r'<main[^>]*class="([^"]*)"', html)
    navs = re.findall(r'<nav[^>]*class="([^"]*)"', html)
    print("Asides:", len(asides), asides[:1])
    print("Headers:", len(headers), headers[:1])
    print("Mains:", len(mains), mains[:1])
    print("Navs:", len(navs))
    
    # Find h1, h2, h3 texts
    h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    h2s = re.findall(r'<h2[^>]*>(.*?)</h2>', html, re.DOTALL)
    def clean(txt):
        return re.sub(r'<[^>]+>', '', txt).strip().encode('ascii', errors='replace').decode('ascii')
    print("H1s:", [clean(h) for h in h1s])
    print("H2s:", [clean(h) for h in h2s][:5])
