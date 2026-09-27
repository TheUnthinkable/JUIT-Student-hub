import subprocess
import time
import json
import urllib.request
import asyncio
import base64
import os
import websockets

async def cdp_session():
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
            
            # Set onboarded to true so modal doesn't pop up
            await send("Page.navigate", {"url": "http://127.0.0.1:8000"})
            await asyncio.sleep(1)
            await send("Runtime.evaluate", {
                "expression": "localStorage.setItem('juit_onboarded_v1', 'true'); location.reload();"
            })
            await asyncio.sleep(2)
            
            # Helper to take screenshot
            async def snap(filename):
                res = await send("Page.captureScreenshot", {"format": "png"})
                if "data" in res:
                    with open(filename, "wb") as f:
                        f.write(base64.b64decode(res["data"]))
                    print(f"Captured {filename}")

            # 1. Dashboard (Dark Mode)
            await snap("mobile_1_dash_dark.png")
            
            # 2. Toggle Theme to Light Mode via header button
            await send("Runtime.evaluate", {"expression": "document.getElementById('btn-quick-theme-toggle').click();"})
            await asyncio.sleep(0.8)
            await snap("mobile_1_dash_light.png")

            # 3. Timetable in Light Mode
            await send("Runtime.evaluate", {"expression": "window.App.switchView('timetable'); window.scrollTo(0, 0);"})
            await asyncio.sleep(0.8)
            await snap("mobile_2_timetable_light.png")

            # 4. Toggle Theme back to Dark Mode
            await send("Runtime.evaluate", {"expression": "document.getElementById('btn-quick-theme-toggle').click();"})
            await asyncio.sleep(0.8)
            await snap("mobile_2_timetable_dark.png")

            # 5. Scroll Timetable to see classes
            await send("Runtime.evaluate", {"expression": "window.scrollTo(0, 360);"})
            await asyncio.sleep(0.5)
            await snap("mobile_2_timetable_classes.png")

            # 6. Mess
            await send("Runtime.evaluate", {"expression": "window.App.switchView('mess'); window.scrollTo(0, 0);"})
            await asyncio.sleep(0.8)
            await snap("mobile_3_mess.png")
            
            # 7. Drawer
            await send("Runtime.evaluate", {"expression": "document.getElementById('btn-mobile-hud-more').click()"})
            await asyncio.sleep(0.5)
            await snap("mobile_5_drawer.png")

    finally:
        proc.kill()

if __name__ == '__main__':
    asyncio.run(cdp_session())
