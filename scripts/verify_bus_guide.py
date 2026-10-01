import subprocess
import time
import json
import urllib.request
import asyncio
import base64
import os
import websockets

async def capture_bus_guide_full():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"C:\Users\Admin\AppData\Local\Temp\edge_debug_verify_bus_full"
    port = 9226
    
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--window-size=390,844",
        "http://127.0.0.1:8000/#bus"
    ]
    
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    await asyncio.sleep(2)
    
    try:
        req = urllib.request.urlopen(f"http://127.0.0.1:{port}/json")
        targets = json.loads(req.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target.get('webSocketDebuggerUrl')
        
        async with websockets.connect(ws_url, max_size=20*1024*1024) as ws:
            msg_id = 1
            async def send(method, params=None):
                nonlocal msg_id
                m_id = msg_id
                msg_id += 1
                await ws.send(json.dumps({"id": m_id, "method": method, "params": params or {}}))
                while True:
                    res = json.loads(await ws.recv())
                    if res.get("id") == m_id:
                        return res.get("result", {})

            await send("Page.enable")
            await send("Runtime.enable")
            
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await send("Emulation.setTouchEmulationEnabled", {"enabled": True})
            
            # Pre-set onboarded key in localStorage
            await send("Page.navigate", {"url": "http://127.0.0.1:8000/#bus"})
            await asyncio.sleep(2)
            
            await send("Runtime.evaluate", {
                "expression": """
                localStorage.setItem('juit_onboarded_v1', 'true');
                const ob = document.getElementById('onboarding-modal-backdrop');
                if (ob) ob.style.display = 'none';
                App.switchView('bus');
                """
            })
            await asyncio.sleep(1)
            
            art_dir = r"C:\Users\Admin\.gemini\antigravity-ide\brain\70b9658d-0bd5-4ebe-b82c-caf013b347bd"
            
            # Snap 1: Hero & Highway Direction visualizer
            shot1 = await send("Page.captureScreenshot", {"format": "png"})
            with open(os.path.join(art_dir, "bus_guide_view_top.png"), "wb") as f:
                f.write(base64.b64decode(shot1["data"]))
            print("Captured bus_guide_view_top.png")
            
            # Scroll to cards
            await send("Runtime.evaluate", {
                "expression": """
                document.getElementById('bus-destinations-grid')?.scrollIntoView({ behavior: 'instant', block: 'start' });
                """
            })
            await asyncio.sleep(0.5)
            shot2 = await send("Page.captureScreenshot", {"format": "png"})
            with open(os.path.join(art_dir, "bus_guide_view_cards.png"), "wb") as f:
                f.write(base64.b64decode(shot2["data"]))
            print("Captured bus_guide_view_cards.png")
            
            # Scroll to checklist & glossary
            await send("Runtime.evaluate", {
                "expression": """
                document.querySelector('.bus-bottom-guide-section')?.scrollIntoView({ behavior: 'instant', block: 'start' });
                """
            })
            await asyncio.sleep(0.5)
            shot3 = await send("Page.captureScreenshot", {"format": "png"})
            with open(os.path.join(art_dir, "bus_guide_view_checklist.png"), "wb") as f:
                f.write(base64.b64decode(shot3["data"]))
            print("Captured bus_guide_view_checklist.png")

    finally:
        proc.kill()

if __name__ == '__main__':
    asyncio.run(capture_bus_guide_full())
