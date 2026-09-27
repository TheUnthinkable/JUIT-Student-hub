import subprocess
import time
import json
import urllib.request
import asyncio
import websockets

async def check_fonts():
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
        
        async with websockets.connect(ws_url) as ws:
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

            await send("Network.enable")
            await send("Console.enable")
            
            check_script = """
            (() => {
                const loaded = [];
                for (let font of document.fonts) {
                    loaded.push({ family: font.family, status: font.status, weight: font.weight });
                }
                const testSpan = document.querySelector('.material-symbols-outlined');
                const computed = testSpan ? window.getComputedStyle(testSpan) : null;
                return {
                    fonts: loaded,
                    materialSymbolsChecked: document.fonts.check('24px "Material Symbols Outlined"'),
                    testSpanFontFamily: computed ? computed.fontFamily : null
                };
            })()
            """
            
            res = await send("Runtime.evaluate", {"expression": check_script, "returnByValue": True})
            print("FONTS INFO:")
            print(json.dumps(res.get("result", {}).get("value", {}), indent=2))
            
    finally:
        proc.kill()

if __name__ == '__main__':
    asyncio.run(check_fonts())
