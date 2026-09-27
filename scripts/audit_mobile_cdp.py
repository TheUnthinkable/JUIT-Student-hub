import subprocess
import time
import json
import urllib.request
import asyncio
import base64
import os

try:
    import websockets
except ImportError:
    print("websockets not available")
    exit(1)

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

            # Enable Page and Runtime
            await send("Page.enable")
            await send("Runtime.enable")
            
            # Emulate mobile 390x844
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await send("Emulation.setTouchEmulationEnabled", {"enabled": True})
            
            # Reload page with mobile metrics
            await send("Page.navigate", {"url": "http://127.0.0.1:8000"})
            await asyncio.sleep(2.5)
            
            # 1. Audit overall viewport and overflowing elements
            audit_script = """
            (() => {
                const docWidth = document.documentElement.clientWidth;
                const scrollWidth = document.documentElement.scrollWidth;
                const bodyScrollWidth = document.body.scrollWidth;
                
                const overflowing = [];
                const all = document.querySelectorAll('*');
                all.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.right > docWidth + 1.5 || rect.left < -1.5) {
                        overflowing.push({
                            tag: el.tagName,
                            id: el.id,
                            className: el.className,
                            left: Math.round(rect.left),
                            right: Math.round(rect.right),
                            width: Math.round(rect.width),
                            text: el.innerText ? el.innerText.slice(0, 40) : ''
                        });
                    }
                });
                
                // Get bottom dock and drawer state
                const dock = document.querySelector('.mobile-hud-dock');
                const dockStyle = dock ? window.getComputedStyle(dock) : null;
                const drawer = document.getElementById('mobile-drawer');
                const drawerStyle = drawer ? window.getComputedStyle(drawer) : null;
                
                return {
                    docWidth,
                    scrollWidth,
                    bodyScrollWidth,
                    hasHorizontalScroll: scrollWidth > docWidth,
                    overflowCount: overflowing.length,
                    overflowing: overflowing.slice(0, 15),
                    dockVisible: dockStyle ? dockStyle.display : 'none',
                    drawerDisplay: drawerStyle ? drawerStyle.display : 'none',
                    drawerTransform: drawerStyle ? drawerStyle.transform : 'none'
                };
            })()
            """
            
            eval_res = await send("Runtime.evaluate", {
                "expression": audit_script,
                "returnByValue": True
            })
            print("AUDIT RESULT:")
            print(json.dumps(eval_res.get("result", {}).get("value", {}), indent=2))
            
            # Capture mobile screenshot of dashboard
            ss_res = await send("Page.captureScreenshot", {"format": "png"})
            if "data" in ss_res:
                with open("mobile_dash_cdp.png", "wb") as f:
                    f.write(base64.b64decode(ss_res["data"]))
                print("Saved mobile_dash_cdp.png successfully!")
                
            # Now test timetable view
            await send("Runtime.evaluate", {"expression": "window.App && window.App.switchView('timetable')"})
            await asyncio.sleep(1)
            
            eval_res_tt = await send("Runtime.evaluate", {
                "expression": audit_script,
                "returnByValue": True
            })
            print("\nTIMETABLE AUDIT RESULT:")
            print(json.dumps(eval_res_tt.get("result", {}).get("value", {}), indent=2))
            
            ss_tt = await send("Page.captureScreenshot", {"format": "png"})
            if "data" in ss_tt:
                with open("mobile_timetable_cdp.png", "wb") as f:
                    f.write(base64.b64decode(ss_tt["data"]))
                print("Saved mobile_timetable_cdp.png successfully!")

    finally:
        proc.kill()

if __name__ == '__main__':
    asyncio.run(cdp_session())
