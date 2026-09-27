import subprocess
import sys
import time
import json
import urllib.request
import asyncio
import os
import base64
import websockets

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

async def check():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"C:\Users\Admin\AppData\Local\Temp\edge_inspect_mobile_test"
    port = 9226
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--window-size=390,844",
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
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await send("Runtime.evaluate", {
                "expression": "localStorage.setItem('juit_onboarded_v1', 'true'); location.reload();"
            })
            await asyncio.sleep(2)

            # Check overflowing elements on mobile
            overflows = await send("Runtime.evaluate", {
                "expression": """(() => {
                    const docWidth = document.documentElement.clientWidth;
                    const items = [];
                    document.querySelectorAll('*').forEach(el => {
                        const r = el.getBoundingClientRect();
                        if (r.width > 0 && r.right > docWidth + 1) {
                            items.push({
                                tag: el.tagName,
                                id: el.id,
                                cls: (el.className || '').toString().slice(0, 50),
                                width: Math.round(r.width),
                                right: Math.round(r.right),
                                docWidth: docWidth,
                                text: (el.innerText || '').slice(0, 40).replace(/\\s+/g, ' ').trim()
                            });
                        }
                    });
                    return JSON.stringify(items);
                })()"""
            })
            val = overflows.get("result", {}).get("value", "[]")
            with open("mobile_overflows.json", "w", encoding="utf-8") as f:
                f.write(val)
            items = json.loads(val)
            print(f"FOUND {len(items)} OVERFLOWING ELEMENTS ON MOBILE DASHBOARD")

            # Take screenshot of Dashboard on 390x844
            res = await send("Page.captureScreenshot", {"format": "png"})
            with open("mobile_view_dash.png", "wb") as f:
                f.write(base64.b64decode(res["data"]))
            print("Captured mobile_view_dash.png")

            for v in ['timetable', 'mess', 'campus', 'resources', 'academics']:
                await send("Runtime.evaluate", {"expression": f"window.App.switchView('{v}');"})
                await asyncio.sleep(0.8)
                res = await send("Runtime.evaluate", {"expression": """(() => {
                    const docWidth = document.documentElement.clientWidth;
                    const items = [];
                    document.querySelectorAll('*').forEach(el => {
                        const r = el.getBoundingClientRect();
                        if (r.width > 0 && r.right > docWidth + 2) {
                            items.push(el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : '') + ' (w=' + Math.round(r.width) + ', r=' + Math.round(r.right) + ')');
                        }
                    });
                    return Array.from(new Set(items)).slice(0, 15);
                })()"""})
                print(f"{v.upper()} OVERFLOWS:", res.get("result", {}).get("value"))
    finally:
        proc.kill()

if __name__ == '__main__':
    asyncio.run(check())
