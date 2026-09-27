import subprocess
import time
import json
import urllib.request
import asyncio
import os
import base64
import websockets

async def snap_views():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"C:\Users\Admin\AppData\Local\Temp\edge_inspect_current"
    port = 9225
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--window-size=1200,900",
        "http://127.0.0.1:8000"
    ]
    proc = subprocess.Popen(cmd)
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
            await send("Runtime.evaluate", {
                "expression": "localStorage.setItem('juit_onboarded_v1', 'true'); location.reload();"
            })
            await asyncio.sleep(2)

            for view_id in ['resources', 'campus', 'academics']:
                await send("Runtime.evaluate", {"expression": f"window.App.switchView('{view_id}'); window.scrollTo(0,0);"})
                await asyncio.sleep(1)
                if view_id == 'resources':
                    await send("Runtime.evaluate", {"expression": "ResourcesController.activeSubject = 'Basic Electronics'; ResourcesController.renderSubjectFilters(); ResourcesController.renderResources();"})
                    await asyncio.sleep(0.5)
                if view_id == 'campus':
                    chk = await send("Runtime.evaluate", {"expression": """
                        (() => {
                            const found = [];
                            document.querySelectorAll('*').forEach(el => {
                                const s = window.getComputedStyle(el);
                                if (el.scrollWidth > el.clientWidth && (s.overflowX === 'scroll' || s.overflowX === 'auto')) {
                                    found.push({ tag: el.tagName, id: el.id, class: el.className, scrollW: el.scrollWidth, clientW: el.clientWidth });
                                }
                            });
                            return JSON.stringify(found);
                        })()
                    """})
                    print("CAMPUS SCROLLABLES:", chk.get("result", {}).get("value"))
                res = await send("Page.captureScreenshot", {"format": "png"})
                filename = f"debug_{view_id}.png"
                with open(filename, "wb") as f:
                    f.write(base64.b64decode(res["data"]))
                print(f"Captured {filename}")
    finally:
        proc.kill()

if __name__ == '__main__':
    asyncio.run(snap_views())
