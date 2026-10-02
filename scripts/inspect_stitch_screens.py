import os, re

files = {
    'home': 'scripts/stitch_active/JUIT_Hub_-_Human_Home_99d092a1dca443fcab8c0dfc37409fa1.html',
    'schedule': 'scripts/stitch_active/JUIT_Hub_-_Calm_Schedule_b0af19a8709c41ffabc1975f7a81678f.html',
    'mess': 'scripts/stitch_active/JUIT_Hub_-_Annapurna_Mess_f5ccfa0da10740b38b793dda1ff10e11.html',
    'campus': 'scripts/stitch_active/JUIT_Hub_-_Campus_and_Transit_781b4f2206074c279c5cdf901ab64769.html',
    'vault': 'scripts/stitch_active/JUIT_Hub_-_Academic_Vault_0376ddc5a86e4422b11e7147045332c3.html',
    'utilities': 'scripts/stitch_active/JUIT_Hub_-_Student_Utilities_12d568d83803419c90afd82d23f46e18.html',
    'notices': 'scripts/stitch_active/JUIT_Hub_-_Campus_Notices_4ff8955c0d9c42d5be82e75fbe3f91d3.html',
    'events': 'scripts/stitch_active/JUIT_Hub_-_Campus_Life_and_Events_a3dfae8cfa534f46a3421c3b6bd30324.html'
}

for name, fpath in files.items():
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
    main_match = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
    if main_match:
        content = main_match.group(1).strip()
        print(f"=== {name} ===")
        print("Total length:", len(content))
        # Print headings
        headings = re.findall(r'<h[1-4][^>]*>(.*?)</h[1-4]>', content, re.DOTALL)
        clean_headings = [re.sub(r'<[^>]+>', '', h).strip() for h in headings]
        print("Headings:", clean_headings)
