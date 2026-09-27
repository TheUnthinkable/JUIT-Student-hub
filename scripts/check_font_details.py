import asyncio, websockets, json, urllib.request, subprocess

async def test():
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
            async def send(expr):
                nonlocal msg_id
                m = msg_id
                msg_id += 1
                await ws.send(json.dumps({'id': m, 'method': 'Runtime.evaluate', 'params': {'expression': expr, 'returnByValue': True}}))
                while True:
                    r = json.loads(await ws.recv())
                    if r.get('id') == m:
                        return r.get('result', {}).get('value')
            
            expr = """
            (() => {
                try {
                    const f = [];
                    for (let font of document.fonts) {
                        if (font.family.includes('Material')) {
                            f.push({ family: font.family, status: font.status });
                        }
                    }
                    const btn = document.querySelector('.btn-mobile-menu span');
                    const comp = btn ? window.getComputedStyle(btn) : null;
                    return {
                        fonts: f,
                        check: document.fonts.check('20px "Material Symbols Outlined"'),
                        btnFontFamily: comp ? comp.fontFamily : null,
                        btnWidth: btn ? btn.offsetWidth : null,
                        btnHeight: btn ? btn.offsetHeight : null
                    };
                } catch(e) {
                    return { error: e.toString() };
                }
            })()
            """
            info = await send(expr)
            print(json.dumps(info, indent=2))
    finally:
        proc.kill()

if __name__ == '__main__':
    asyncio.run(test())
