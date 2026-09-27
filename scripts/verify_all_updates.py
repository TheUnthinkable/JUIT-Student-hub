import subprocess
import time
import json
import urllib.request
import asyncio
import base64
import os
import websockets

async def cdp_verify():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"C:\Users\Admin\AppData\Local\Temp\edge_debug_verify_portals"
    port = 9223
    
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
            
            await send("Page.navigate", {"url": "http://127.0.0.1:8000"})
            await asyncio.sleep(1.5)
            
            # Dismiss onboarding if any
            await send("Runtime.evaluate", {
                "expression": """
                localStorage.setItem('juit_onboarded', 'true');
                const ob = document.getElementById('onboarding-modal-backdrop');
                if (ob) ob.style.display = 'none';
                """
            })
            await asyncio.sleep(0.5)
            
            # 1. TEST USEFUL LINKS (PORTALS)
            await send("Runtime.evaluate", {
                "expression": "App.switchView('portals');"
            })
            await asyncio.sleep(1)
            
            # Scroll to LRC card
            await send("Runtime.evaluate", {
                "expression": """
                const cards = document.querySelectorAll('.portal-service-card');
                if (cards.length > 2) {
                    cards[2].scrollIntoView({ behavior: 'instant', block: 'center' });
                }
                """
            })
            await asyncio.sleep(0.5)
            ss1_lrc = await send("Page.captureScreenshot", {"format": "png"})
            with open("C:/Users/Admin/.gemini/antigravity-ide/brain/2dcded15-3a7f-4da7-8fc0-0d9935b31257/verified_portals_lrc_card.png", "wb") as f:
                f.write(base64.b64decode(ss1_lrc["data"]))
            print("Captured verified_portals_lrc_card.png")
            
            # 2. TEST ACADEMIC CALENDAR & SCROLL TO CARDS
            await send("Runtime.evaluate", {
                "expression": "App.switchView('calendar');"
            })
            await asyncio.sleep(1)
            await send("Runtime.evaluate", {
                "expression": """
                const calCards = document.querySelectorAll('.cal-event-card');
                if (calCards.length > 0) {
                    calCards[0].scrollIntoView({ behavior: 'instant', block: 'start' });
                }
                """
            })
            await asyncio.sleep(0.5)
            ss2_cards = await send("Page.captureScreenshot", {"format": "png"})
            with open("C:/Users/Admin/.gemini/antigravity-ide/brain/2dcded15-3a7f-4da7-8fc0-0d9935b31257/verified_calendar_cards_detail.png", "wb") as f:
                f.write(base64.b64decode(ss2_cards["data"]))
            print("Captured verified_calendar_cards_detail.png")
            
            # 3. TEST CALENDAR SEARCH (e.g. search "T2")
            await send("Runtime.evaluate", {
                "expression": """
                const searchInp = document.getElementById('calendar-search-input');
                if (searchInp) {
                    searchInp.value = 'T2';
                    searchInp.dispatchEvent(new Event('input', { bubbles: true }));
                }
                const cards = document.querySelectorAll('.cal-event-card');
                if (cards.length > 0) {
                    cards[0].scrollIntoView({ behavior: 'instant', block: 'center' });
                }
                """
            })
            await asyncio.sleep(0.5)
            ss3 = await send("Page.captureScreenshot", {"format": "png"})
            with open("C:/Users/Admin/.gemini/antigravity-ide/brain/2dcded15-3a7f-4da7-8fc0-0d9935b31257/verified_calendar_search_t2.png", "wb") as f:
                f.write(base64.b64decode(ss3["data"]))
            print("Captured verified_calendar_search_t2.png")
            
            # 4. TEST RESOURCE VAULT (Basic Electronics)
            await send("Runtime.evaluate", {
                "expression": """
                App.switchView('resources');
                const bePill = document.querySelector('button[data-subject="Basic Electronics"]');
                if (bePill) bePill.click();
                """
            })
            await asyncio.sleep(1)
            ss4 = await send("Page.captureScreenshot", {"format": "png"})
            with open("C:/Users/Admin/.gemini/antigravity-ide/brain/2dcded15-3a7f-4da7-8fc0-0d9935b31257/verified_vault_basic_electronics.png", "wb") as f:
                f.write(base64.b64decode(ss4["data"]))
            print("Captured verified_vault_basic_electronics.png")

    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(cdp_verify())
