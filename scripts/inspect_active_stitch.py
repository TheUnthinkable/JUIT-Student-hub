import os
import re

files = os.listdir('scripts/stitch_active')
for f in files:
    if not f.endswith('.html'):
        continue
    p = os.path.join('scripts/stitch_active', f)
    with open(p, 'r', encoding='utf-8') as fh:
        c = fh.read()
    print('=' * 60)
    print(f)
    print('Title:', re.findall(r'<title>(.*?)</title>', c, re.I))
    fonts = re.findall(r'fonts\.googleapis\.com/css2\?family=([^"\'&]+)', c)
    print('Fonts:', fonts)
    tw = re.search(r'tailwind\.config\s*=\s*(\{.*?\});', c, re.DOTALL)
    if tw:
        print('Tailwind Config present:', tw.group(1)[:150].replace('\n', ' '), '...')
    body = re.search(r'<body([^>]*)>', c)
    if body:
        print('Body attrs:', body.group(1))
    navs = re.findall(r'<nav[^>]*class="([^"]*)"', c)
    print('Nav classes:', navs[:2])
    # Print key sections
    sections = re.findall(r'<(?:header|main|section|aside|footer)[^>]*class="([^"]*)"', c)
    print('Major landmarks:', sections[:4])
