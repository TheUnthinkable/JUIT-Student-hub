import subprocess

out = subprocess.check_output(['git', 'show', 'ffb60f8:index.html'], encoding='utf-8')
lines = out.splitlines()
print(f"Total lines in old index.html: {len(lines)}")
for i in range(1650, min(1750, len(lines))):
    print(f"{i+1}: {lines[i]}")
