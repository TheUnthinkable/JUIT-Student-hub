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
    user_data = r"C:\Users\Admin\AppData\Local\Temp\edge_debug_simplified"
    port = 9226
    
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--window-size=1200,900",
        "http://127.0.0.1:3000"
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
            
            # Dismiss any onboarding modals and setup state
            await send("Runtime.evaluate", {
                "expression": """
                (() => {
                    localStorage.setItem('juit_onboarded_v1', 'true');
                    localStorage.setItem('juit_profile_configured', 'true');
                    localStorage.setItem('juit_selected_batch', '26BT10');
                    localStorage.setItem('juit_selected_sem', 'odd_btech_1_sem');
                    
                    if (window.App) {
                        if (window.App.closeAccountModal) window.App.closeAccountModal();
                        if (window.App.switchView) window.App.switchView('timetable');
                    }
                    
                    const modal = document.getElementById('student-account-modal') || document.getElementById('onboarding-modal-backdrop');
                    if (modal) modal.style.display = 'none';

                    // Simulate 10:20 AM so a class is LIVE in progress
                    if (window.TimetableController) {
                        window.TimetableController.activeDay = 'TUE';
                        window.TimetableController.simulatedMinutes = 620; // 10:20 AM
                        window.TimetableController.renderSchedule();
                    }
                })()
                """
            })
            await asyncio.sleep(1.5)
            
            # Take screenshot of timetable desktop
            shot = await send("Page.captureScreenshot", {"format": "png"})
            with open("scripts/simplified_timetable_desktop.png", "wb") as f:
                f.write(base64.b64decode(shot["data"]))
            print("Saved scripts/simplified_timetable_desktop.png")
            
            # Emulate Mobile
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 393,
                "height": 852,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await asyncio.sleep(1)
            
            shot_m = await send("Page.captureScreenshot", {"format": "png"})
            with open("scripts/simplified_timetable_mobile.png", "wb") as f:
                f.write(base64.b64decode(shot_m["data"]))
            print("Saved scripts/simplified_timetable_mobile.png")
            
            # Navigate to Mess Menu
            print("Navigating to mess...")
            await send("Runtime.evaluate", {
                "expression": """
                (() => {
                    if (window.App && window.App.switchView) window.App.switchView('mess');
                })()
                """
            })
            await asyncio.sleep(1.5)
            
            shot_mess_m = await send("Page.captureScreenshot", {"format": "png"})
            with open("scripts/simplified_mess_mobile.png", "wb") as f:
                f.write(base64.b64decode(shot_mess_m["data"]))
            print("Saved scripts/simplified_mess_mobile.png")
            
            # Switch back to desktop for mess screenshot
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 1200,
                "height": 900,
                "deviceScaleFactor": 1,
                "mobile": False
            })
            await asyncio.sleep(1)
            
            shot_mess_d = await send("Page.captureScreenshot", {"format": "png"})
            with open("scripts/simplified_mess_desktop.png", "wb") as f:
                f.write(base64.b64decode(shot_mess_d["data"]))
            print("Saved scripts/simplified_mess_desktop.png")
            
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except:
            proc.kill()

if __name__ == "__main__":
    asyncio.run(run_verification())
