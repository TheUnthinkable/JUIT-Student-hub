import os
import subprocess
from PIL import Image

def get_svg_content():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Deep Obsidian / Navy Background -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e172a" />
      <stop offset="45%" stop-color="#0a101f" />
      <stop offset="100%" stop-color="#03060c" />
    </linearGradient>

    <!-- Electric Cyan Glowing Border -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f5ff" stop-opacity="0.95" />
      <stop offset="40%" stop-color="#0284c7" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#1e40af" stop-opacity="0.25" />
    </linearGradient>

    <!-- Master Electric Cyan / Blue Gradient for Monogram -->
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#67e8f9" />
      <stop offset="25%" stop-color="#00e5ff" />
      <stop offset="65%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>

    <!-- Cap Top Highlight -->
    <linearGradient id="capTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="35%" stop-color="#7dd3fc" />
      <stop offset="70%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>

    <!-- Subtle Ambient Glow -->
    <radialGradient id="centerGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.18" />
      <stop offset="50%" stop-color="#0284c7" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <clipPath id="squircleClip">
      <rect x="16" y="16" width="480" height="480" rx="116" ry="116" />
    </clipPath>
  </defs>

  <!-- Squircle Base Canvas with Sharp Edge Clip -->
  <g clip-path="url(#squircleClip)">
    <rect x="16" y="16" width="480" height="480" fill="url(#bgGrad)" />
    <!-- Ambient Radial Light -->
    <rect x="16" y="16" width="480" height="480" fill="url(#centerGlow)" />
    <circle cx="256" cy="460" r="180" fill="#1e40af" opacity="0.15" />

    <!-- 1. ACADEMIC MORTARBOARD (Bold, Solid Geometry for Instant Clarity) -->
    <!-- Cap Rhombus Top Plate -->
    <polygon points="256,66 414,134 256,202 98,134" fill="url(#capTopGrad)" />
    <!-- Cap Under Skullcap Arc Band -->
    <path d="M 158 158 L 158 184 C 158 218 354 218 354 184 L 354 158 Z" fill="url(#brandGrad)" opacity="0.95" />
    <!-- Cap Center Button -->
    <circle cx="256" cy="134" r="8" fill="#ffffff" opacity="0.9" />
    <!-- Tassel Ribbon & Fringes -->
    <path d="M 256 134 Q 380 120 414 146 Q 434 176 428 206" fill="none" stroke="#00f5ff" stroke-width="7" stroke-linecap="round" />
    <rect x="420" y="206" width="16" height="24" rx="4" fill="#00f5ff" />

    <!-- 2. THE BOLD "J" MONOGRAM (Balanced, Confident, Modern) -->
    <path d="
      M 206 236
      H 356
      V 290
      H 326
      V 342
      C 326 392 292 428 244 428
      C 196 428 162 392 162 342
      H 226
      C 226 364 234 374 244 374
      C 256 374 266 364 266 342
      V 290
      H 206
      Z"
      fill="url(#brandGrad)"
    />

    <!-- Modern Glass Sheen across the J's Top Bar -->
    <polygon points="206,236 356,236 356,258 206,270" fill="#ffffff" opacity="0.3" />
  </g>

  <!-- Crisp Squircle Border -->
  <rect x="16" y="16" width="480" height="480" rx="116" ry="116" fill="none" stroke="url(#borderGrad)" stroke-width="12" />
</svg>'''

def build_all():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 1. Write favicon.svg to root
    svg_path = os.path.join(root_dir, 'favicon.svg')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(get_svg_content())
    print(f"Written: {svg_path}")

    # 2. Render high-res PNG via Edge
    render_html = os.path.join(root_dir, 'scripts', 'prod_render.html')
    with open(render_html, 'w', encoding='utf-8') as f:
        f.write('<!DOCTYPE html><html><head><meta charset="utf-8"/><style>'
                'html,body{margin:0;padding:0;width:512px;height:512px;background:transparent;overflow:hidden;}'
                'img{width:512px;height:512px;display:block;border:none;}'
                '</style></head><body><img src="../favicon.svg"/></body></html>')

    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    png_512 = os.path.join(root_dir, 'icon-512.png')
    
    subprocess.run([
        edge_path, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--window-size=512,512", f"--screenshot={png_512}", f"file:///{render_html}"
    ], check=True)
    print(f"Generated: {png_512}")

    # 3. Generate all derivatives using Pillow
    im = Image.open(png_512).convert("RGBA")

    # icon-192.png
    im_192 = im.resize((192, 192), Image.Resampling.LANCZOS)
    im_192.save(os.path.join(root_dir, 'icon-192.png'), 'PNG')
    print("Generated: icon-192.png")

    # apple-touch-icon.png (180x180)
    im_180 = im.resize((180, 180), Image.Resampling.LANCZOS)
    im_180.save(os.path.join(root_dir, 'apple-touch-icon.png'), 'PNG')
    print("Generated: apple-touch-icon.png")

    # favicon-32x32.png
    im_32 = im.resize((32, 32), Image.Resampling.LANCZOS)
    im_32.save(os.path.join(root_dir, 'favicon-32x32.png'), 'PNG')
    print("Generated: favicon-32x32.png")

    # favicon-16x16.png
    im_16 = im.resize((16, 16), Image.Resampling.LANCZOS)
    im_16.save(os.path.join(root_dir, 'favicon-16x16.png'), 'PNG')
    print("Generated: favicon-16x16.png")

    # favicon.ico (multi-resolution ICO file)
    ico_path = os.path.join(root_dir, 'favicon.ico')
    im.resize((64, 64), Image.Resampling.LANCZOS).save(
        ico_path,
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )
    print(f"Generated: {ico_path}")

if __name__ == '__main__':
    build_all()
