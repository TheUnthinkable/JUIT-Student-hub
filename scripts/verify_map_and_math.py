import subprocess
import time
import json
import urllib.request
import asyncio
import base64
import os
import sys

async def run_verification():
    server_proc = subprocess.Popen([sys.executable, "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)

    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"C:\Users\Admin\AppData\Local\Temp\edge_verify_test3"
    port = 9227

    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--window-size=1280,820",
        "http://127.0.0.1:8000"
    ]

    edge_proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    await asyncio.sleep(2.5)

    import websockets
    try:
        req = urllib.request.urlopen(f"http://127.0.0.1:{port}/json")
        targets = json.loads(req.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target.get('webSocketDebuggerUrl')

        async with websockets.connect(ws_url, max_size=25*1024*1024) as ws:
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

            # Navigate to campus view
            await send("Page.navigate", {"url": "http://127.0.0.1:8000/#campus"})
            await asyncio.sleep(2)

            # Close onboarding permanently
            await send("Runtime.evaluate", {"expression": """
                localStorage.setItem('juit_onboarded_v1', 'true');
                const m = document.getElementById('onboarding-modal-backdrop');
                if (m) m.remove();
                window.App.switchView('campus');
            """})
            await asyncio.sleep(1)

            # Test 1: Desktop Campus Map (Master Plan)
            res = await send("Page.captureScreenshot", {"format": "png"})
            with open("verify_campus_desktop.png", "wb") as f:
                f.write(base64.b64decode(res["data"]))
            print("Saved verify_campus_desktop.png")

            # Test 2: Focus venue LT1 (Lecture Theatre 1 in AB2)
            await send("Runtime.evaluate", {"expression": "window.CampusMap.focusVenue('LT1');"})
            await asyncio.sleep(1.5)
            res = await send("Page.captureScreenshot", {"format": "png"})
            with open("verify_campus_route_lt1.png", "wb") as f:
                f.write(base64.b64decode(res["data"]))
            print("Saved verify_campus_route_lt1.png")

            # Test 3: Switch to Night Ambient Mode
            await send("Runtime.evaluate", {"expression": """
                const btnNight = document.querySelector('.map-mode-pill[data-mode="night"]');
                if (btnNight) btnNight.click();
            """})
            await asyncio.sleep(1)
            res = await send("Page.captureScreenshot", {"format": "png"})
            with open("verify_campus_night.png", "wb") as f:
                f.write(base64.b64decode(res["data"]))
            print("Saved verify_campus_night.png")

            # Test 4: Navigate to Timetable Sem 1 (Mathematics I)
            await send("Runtime.evaluate", {"expression": """
                window.App.switchView('timetable');
                window.TimetableController.activeSemesterId = 'odd_btech_1_sem';
                window.TimetableController.activeBatch = 'ALL';
                window.TimetableController.renderSchedule();
            """})
            await asyncio.sleep(1.5)
            res = await send("Page.captureScreenshot", {"format": "png"})
            with open("verify_timetable_math.png", "wb") as f:
                f.write(base64.b64decode(res["data"]))
            print("Saved verify_timetable_math.png")

            # Test 5: Mobile Device View of Campus Map
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await send("Runtime.evaluate", {"expression": """
                window.App.switchView('campus');
                window.CampusMap.resetMapView();
            """})
            await asyncio.sleep(1.5)
            res = await send("Page.captureScreenshot", {"format": "png"})
            with open("verify_campus_mobile.png", "wb") as f:
                f.write(base64.b64decode(res["data"]))
            print("Saved verify_campus_mobile.png")

    finally:
        edge_proc.terminate()
        server_proc.terminate()

if __name__ == "__main__":
    asyncio.run(run_verification())
