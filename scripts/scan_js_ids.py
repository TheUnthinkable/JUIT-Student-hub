import glob, re

ids = set()
data_attrs = set()

for js_file in glob.glob('js/*.js'):
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find getElementById
    for m in re.finditer(r"getElementById\(['\"]([^'\"]+)['\"]\)", content):
        ids.add(m.group(1))
    # Find querySelector('#...')
    for m in re.finditer(r"querySelector(?:All)?\(['\"]#([a-zA-Z0-9_\-]+)['\"]\)", content):
        ids.add(m.group(1))
    # Find data-*
    for m in re.finditer(r"\[data-([a-zA-Z0-9_\-]+)[=\]]", content):
        data_attrs.add('data-' + m.group(1))

print(f"Total IDs referenced in JS: {len(ids)}")
print("IDs:", sorted(list(ids)))
print(f"Total data attributes: {len(data_attrs)}")
print("Data attributes:", sorted(list(data_attrs)))
