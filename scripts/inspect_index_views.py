import re

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if '<section' in l and 'view-' in l:
        print(f"Line {i+1}: {l.strip()[:100]}")
    elif '<aside' in l or '<header' in l or '<nav' in l:
        print(f"Line {i+1}: {l.strip()[:100]}")
