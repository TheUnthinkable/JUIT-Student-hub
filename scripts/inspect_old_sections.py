import subprocess, re

out = subprocess.check_output(['git', 'show', 'ffb60f8:index.html'], encoding='utf-8')

# Find all <section ... id="view-...">
views = re.findall(r'(<section[^>]*id=[\"\']view-([a-z\-]+)[\"\'][^>]*>.*?</section>)', out, re.DOTALL)
print(f"Total views in old: {len(views)}")
for v_full, v_name in views:
    print(f" - view-{v_name}: {len(v_full)} chars")

# Find modals at end of body
modals = re.findall(r'(<!-- ===+ MODALS.*?)(?=<script src=|$)', out, re.DOTALL)
if modals:
    print("Modals block length:", len(modals[0]))
