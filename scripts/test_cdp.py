import subprocess
import time
import json
import urllib.request
import sys
import os

def run():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"C:\Users\Admin\AppData\Local\Temp\edge_debug_user"
    port = 9222
    
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--window-size=390,844",
        "http://127.0.0.1:8000"
    ]
    
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(2)
    
    try:
        # Get list of targets
        req = urllib.request.urlopen(f"http://127.0.0.1:{port}/json")
        targets = json.loads(req.read().decode())
        print("Targets found:", len(targets))
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target.get('webSocketDebuggerUrl')
        print("WebSocket URL:", ws_url)
        return proc, ws_url
    except Exception as e:
        print("Error getting CDP targets:", e)
        proc.kill()
        return None, None

if __name__ == '__main__':
    proc, ws = run()
    if proc:
        proc.kill()
