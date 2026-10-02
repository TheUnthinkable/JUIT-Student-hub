import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Collect all IDs in index.html
html_ids = set(re.findall(r'\bid=[\"\']([a-zA-Z0-9_\-]+)[\"\']', html))

import glob
js_ids = set()
for js_file in glob.glob('js/*.js'):
    with open(js_file, 'r', encoding='utf-8') as f:
        c = f.read()
    for m in re.finditer(r"getElementById\(['\"]([^'\"]+)['\"]\)", c):
        js_ids.add(m.group(1))

missing = js_ids - html_ids
print(f"Total HTML IDs: {len(html_ids)}")
print(f"Total JS required IDs: {len(js_ids)}")
print(f"Missing IDs count: {len(missing)}")
if missing:
    print("Missing IDs:", sorted(list(missing)))
