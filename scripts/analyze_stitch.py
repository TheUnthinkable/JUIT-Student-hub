import os, re, json

files = [
    'DESKTOP_JUIT_Student_Hub_-_Desktop_Dashboard.html',
    'DESKTOP_JUIT_Student_Hub_-_Desktop_Timetable.html',
    'DESKTOP_JUIT_Student_Hub_-_Desktop_Campus_Map.html',
    'DESKTOP_JUIT_Student_Hub_-_Desktop_Resource_Hub.html',
    'MOBILE_Antigravity_Hub_-_Dashboard.html',
    'MOBILE_Antigravity_Hub_-_Timetable.html',
    'MOBILE_Antigravity_Hub_-_Resources.html',
    'MOBILE_Antigravity_Hub_-_Campus_Map.html'
]

for f in files:
    p = os.path.join('scripts/stitch_screens', f)
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as fh:
            content = fh.read()
        tw = re.search(r'tailwind\.config\s*=\s*(\{.*?\});', content, re.DOTALL)
        fonts = re.findall(r'fonts\.googleapis\.com/css2\?family=([^"\'&]+)', content)
        print(f"=== {f} ===")
        print(f"  Size: {len(content)}")
        print(f"  Google Fonts: {fonts}")
        if tw:
            print(f"  Tailwind config present (len {len(tw.group(1))})")
