import subprocess, re

out = subprocess.check_output(['git', 'show', 'ffb60f8:index.html'], encoding='utf-8')
ids_old = set(re.findall(r'\bid=[\"\']([a-zA-Z0-9_\-]+)[\"\']', out))

with open('index.html', 'r', encoding='utf-8') as f:
    curr = f.read()
ids_curr = set(re.findall(r'\bid=[\"\']([a-zA-Z0-9_\-]+)[\"\']', curr))

missing_from_old = ids_old - ids_curr
print(f"Old total IDs: {len(ids_old)}")
print(f"Current total IDs: {len(ids_curr)}")
print(f"Difference (in old but not in current): {len(missing_from_old)}")
print("Missing:", sorted(list(missing_from_old)))
