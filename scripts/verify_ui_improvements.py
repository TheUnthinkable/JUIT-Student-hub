import subprocess
import time
import json
import urllib.request
import asyncio
import base64
import os
import websockets

async def run_verification():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"C:\Users\Admin\AppData\Local\Temp\edge_debug_improved"
    port = 9230
    
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--window-size=1200,900",
        "http://127.0.0.1:3000/#timetable"
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
            await send("DOM.enable")
            
            # Dismiss any onboarding modals and setup initial timetable state
            await send("Runtime.evaluate", {
                "expression": """
                (() => {
                    localStorage.setItem('juit_onboarded_v1', 'true');
                    localStorage.setItem('juit_profile_configured', 'true');
                    localStorage.setItem('juit_selected_batch', '26BT10');
                    localStorage.setItem('juit_selected_sem', 'odd_btech_1_sem');
                    localStorage.setItem('juit_timetable_density', 'compact');
                    
                    const modal = document.getElementById('student-account-modal') || document.getElementById('onboarding-modal-backdrop');
                    if (modal) {
                        modal.classList.remove('active', 'open');
                        modal.style.display = 'none';
                    }

                    if (window.App && window.App.switchView) {
                        window.App.switchView('timetable');
                    }
                    
                    if (window.TimetableController) {
                        window.TimetableController.activeDay = 'TUE';
                        window.TimetableController.simulatedMinutes = 620; // 10:20 AM (Live class active)
                        window.TimetableController.renderSchedule();
                    }
                })()
                """
            })
            await asyncio.sleep(1.5)
            
            # 1. Capture Desktop Timetable (Compact View)
            shot_tt_d = await send("Page.captureScreenshot", {"format": "png"})
            with open("scripts/improved_timetable_desktop.png", "wb") as f:
                f.write(base64.b64decode(shot_tt_d["data"]))
            print("Saved scripts/improved_timetable_desktop.png")
            
            # 2. Capture Mobile Timetable
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 393,
                "height": 852,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await asyncio.sleep(1)
            shot_tt_m = await send("Page.captureScreenshot", {"format": "png"})
            with open("scripts/improved_timetable_mobile.png", "wb") as f:
                f.write(base64.b64decode(shot_tt_m["data"]))
            print("Saved scripts/improved_timetable_mobile.png")
            
            # 3. Switch to Desktop for NH-5 Bus Transit
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 1200,
                "height": 900,
                "deviceScaleFactor": 1,
                "mobile": False
            })
            await send("Runtime.evaluate", {
                "expression": """
                (() => {
                    if (window.App && window.App.switchView) {
                        window.App.switchView('bus');
                    }
                })()
                """
            })
            await asyncio.sleep(1.5)
            shot_bus_d = await send("Page.captureScreenshot", {"format": "png"})
            with open("scripts/improved_bus_desktop.png", "wb") as f:
                f.write(base64.b64decode(shot_bus_d["data"]))
            print("Saved scripts/improved_bus_desktop.png")

            # 4. Switch to Mobile for NH-5 Bus Transit
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 393,
                "height": 852,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await asyncio.sleep(1)
            shot_bus_m = await send("Page.captureScreenshot", {"format": "png"})
            with open("scripts/improved_bus_mobile.png", "wb") as f:
                f.write(base64.b64decode(shot_bus_m["data"]))
            print("Saved scripts/improved_bus_mobile.png")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except:
            proc.kill()

if __name__ == "__main__":
    asyncio.run(run_verification())
