"""
JUIT Student Hub - Mobile Development & Deployment Server
Features:
1. Multi-threaded static HTTP server with proper MIME types & cache control.
2. Automatic Cloudflare Tunnel integration (free HTTPS URL for mobile access from any network).
3. Terminal ASCII QR code for instant camera scanning.
4. Auto-generated mobile_preview.html with live link, QR code & PWA installation guide.
"""

import http.server
import socket
import socketserver
import os
import sys
import re
import threading
import subprocess
import time
import urllib.request

# Ensure UTF-8 output on Windows terminals
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
CLOUDFLARED_BIN = os.path.join(DIRECTORY, "cloudflared.exe" if sys.platform == "win32" else "cloudflared")


def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip


class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def guess_type(self, path):
        ctype = super().guess_type(path)
        if path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.json'):
            return 'application/json'
        elif path.endswith('.webmanifest') or path.endswith('manifest.json'):
            return 'application/manifest+json'
        elif path.endswith('.woff2'):
            return 'font/woff2'
        elif path.endswith('.woff'):
            return 'font/woff'
        elif path.endswith('.ttf'):
            return 'font/ttf'
        elif path.endswith('.otf'):
            return 'font/otf'
        elif path.endswith('.svg'):
            return 'image/svg+xml'
        return ctype

    def log_message(self, format, *args):
        # Silence routine static asset logs for a clean terminal view
        pass


class ThreadingSimpleServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def generate_preview_html(public_url, local_url):
    qr_img_src = f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data={public_url}"
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JUIT Hub - Mobile Access</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #090d16;
      --card: #111827;
      --border: rgba(255, 255, 255, 0.1);
      --accent: #3b82f6;
      --accent-glow: rgba(59, 130, 246, 0.35);
      --text: #f9fafb;
      --text-muted: #9ca3af;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }}
    .container {{
      max-width: 480px;
      width: 100%;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 32px 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 40px var(--accent-glow);
      text-align: center;
    }}
    .badge {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }}
    .pulse-dot {{
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
    }}
    h1 {{
      font-family: 'Outfit', sans-serif;
      font-size: 1.75rem;
      font-weight: 800;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #ffffff, #93c5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    p.subtitle {{
      color: var(--text-muted);
      font-size: 0.92rem;
      margin-bottom: 24px;
      line-height: 1.4;
    }}
    .qr-card {{
      background: #ffffff;
      padding: 16px;
      border-radius: 16px;
      display: inline-block;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      margin-bottom: 24px;
    }}
    .qr-card img {{
      display: block;
      width: 220px;
      height: 220px;
      border-radius: 8px;
    }}
    .link-box {{
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 20px;
      text-align: left;
    }}
    .link-label {{
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--accent);
      font-weight: 700;
      margin-bottom: 4px;
    }}
    .link-text {{
      font-family: monospace;
      font-size: 0.88rem;
      color: #e5e7eb;
      word-break: break-all;
    }}
    .btn {{
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
    }}
    .btn-primary {{
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: white;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
      margin-bottom: 12px;
    }}
    .btn-primary:hover {{
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.6);
    }}
    .guide-box {{
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      text-align: left;
    }}
    .guide-title {{
      font-size: 0.82rem;
      font-weight: 700;
      color: #93c5fd;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    .guide-item {{
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 6px;
      line-height: 1.4;
    }}
    .guide-item strong {{
      color: #e5e7eb;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">
      <span class="pulse-dot"></span> LIVE HTTPS DEPLOY LINK
    </div>
    <h1>JUIT Student Hub</h1>
    <p class="subtitle">Scan the QR code with your phone camera or tap the button to open directly.</p>

    <div class="qr-card">
      <img src="{qr_img_src}" alt="Scan QR Code to open on Mobile">
    </div>

    <div class="link-box">
      <div class="link-label">Live Mobile Public URL (HTTPS)</div>
      <div class="link-text" id="live-url">{public_url}</div>
    </div>

    <a href="{public_url}" target="_blank" class="btn btn-primary" id="open-btn">
      🚀 Open Hub in Browser
    </a>

    <button onclick="navigator.clipboard.writeText('{public_url}').then(() => alert('Link copied to clipboard!'))" class="btn" style="background: rgba(255,255,255,0.08); color: white;">
      📋 Copy Link to Clipboard
    </button>

    <div class="guide-box">
      <div class="guide-title">📱 Install as App on your Phone</div>
      <div class="guide-item"><strong>iPhone (Safari):</strong> Tap the <em>Share icon</em> (square with arrow) &rarr; Tap <strong>"Add to Home Screen"</strong>.</div>
      <div class="guide-item"><strong>Android (Chrome):</strong> Tap the <em>three dots (&vellip;)</em> &rarr; Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</div>
      <div class="guide-item" style="margin-top: 8px; color: #6ee7b7;">&check; Works completely offline once loaded!</div>
    </div>
  </div>
</body>
</html>"""
    preview_path = os.path.join(DIRECTORY, "mobile_preview.html")
    with open(preview_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    return preview_path


def print_ascii_qr(url):
    try:
        req = urllib.request.Request(f"https://qrenco.de/{url}", headers={"User-Agent": "curl/8.0"})
        with urllib.request.urlopen(req, timeout=4) as response:
            qr_text = response.read().decode("utf-8").strip()
            print("\n  📷 SCAN WITH YOUR MOBILE CAMERA:\n", flush=True)
            for line in qr_text.splitlines():
                print("  " + line, flush=True)
            print("", flush=True)
    except Exception:
        # Fallback if qrenco.de request times out
        pass


def start_tunnel_thread(local_port):
    if not os.path.exists(CLOUDFLARED_BIN):
        print(f"  [!] Note: cloudflared binary not found at {CLOUDFLARED_BIN}")
        print("  [!] Mobile access is still available via Local Wi-Fi.")
        return None

    cmd = [CLOUDFLARED_BIN, "tunnel", "--url", f"http://127.0.0.1:{local_port}", "--no-autoupdate"]
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding='utf-8',
        errors='ignore',
        bufsize=1
    )

    public_url = None
    url_pattern = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")

    start_time = time.time()
    while time.time() - start_time < 20:
        line = process.stdout.readline()
        if not line and process.poll() is not None:
            break
        match = url_pattern.search(line)
        if match:
            public_url = match.group(0)
            break

    return process, public_url


def run_server(port=PORT):
    tunnel_proc = None
    for p in range(port, port + 10):
        try:
            handler = CustomHTTPHandler
            httpd = ThreadingSimpleServer(('0.0.0.0', p), handler)
            local_ip = get_local_ip()
            local_wifi_url = f"http://{local_ip}:{p}"
            local_pc_url = f"http://localhost:{p}"

            print("=" * 68, flush=True)
            print("  🚀 JUIT STUDENT HUB - MOBILE ACCESS SERVER", flush=True)
            print("=" * 68, flush=True)
            print(f"  [1] Local PC Link:       {local_pc_url}", flush=True)
            print(f"  [2] Local Wi-Fi Link:    {local_wifi_url} (Same Wi-Fi)", flush=True)
            print("  [*] Connecting Cloudflare secure HTTPS tunnel for mobile...", flush=True)

            tunnel_proc, public_url = start_tunnel_thread(p)

            if public_url:
                print("=" * 68, flush=True)
                print(f"  🔥 LIVE MOBILE LINK (Anywhere / 4G / 5G / Wi-Fi):", flush=True)
                print(f"     >> {public_url} <<", flush=True)
                print("=" * 68, flush=True)
                generate_preview_html(public_url, local_wifi_url)
                print(f"  [*] Companion preview generated at: mobile_preview.html", flush=True)
                print_ascii_qr(public_url)
            else:
                print("  [!] Cloudflare Tunnel did not return a public URL in time.", flush=True)
                print(f"  [!] Use Local Wi-Fi URL on your phone: {local_wifi_url}", flush=True)
                print_ascii_qr(local_wifi_url)

            print("=" * 68, flush=True)
            print("  Press Ctrl+C in this terminal to stop the server.", flush=True)
            print("=" * 68, flush=True)

            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                pass
            finally:
                if tunnel_proc:
                    tunnel_proc.terminate()
                httpd.server_close()
            break
        except OSError as e:
            if e.errno == 10048 or "Address already in use" in str(e):
                continue
            else:
                raise


if __name__ == '__main__':
    run_server()
