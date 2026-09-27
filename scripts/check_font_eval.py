import asyncio, websockets, json, urllib.request, subprocess

async def check_console():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    user_data = r'C:\Users\Admin\AppData\Local\Temp\edge_console_test'
    port = 9230
    cmd = [edge_path, '--headless=new', '--disable-gpu', f'--remote-debugging-port={port}', f'--user-data-dir={user_data}', 'http://127.0.0.1:8000']
    proc = subprocess.Popen(cmd)
    await asyncio.sleep(2)
    try:
        req = urllib.request.urlopen(f'http://127.0.0.1:{port}/json')
        targets = json.loads(req.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target.get('webSocketDebuggerUrl')
        async with websockets.connect(ws_url) as ws:
            msg_id = 1
            async def send(method, params=None):
                nonlocal msg_id
                m_id = msg_id
                msg_id += 1
                await ws.send(json.dumps({'id': m_id, 'method': method, 'params': params or {}}))
                while True:
                    r = json.loads(await ws.recv())
                    if r.get('id') == m_id:
                        return r.get('result', {})
            await send('Page.enable')
            await asyncio.sleep(2)
            eval_res = await send('Runtime.evaluate', {
                'expression': """(() => {
                    const fontsStatus = [];
                    for (let f of document.fonts) {
                        fontsStatus.push({ family: f.family, status: f.status });
                    }
                    const el = document.querySelector('.material-symbols-outlined');
                    const comp = el ? window.getComputedStyle(el) : null;
                    return JSON.stringify({
                        fontsCount: document.fonts.size,
                        fonts: fontsStatus,
                        check: document.fonts.check('24px "Material Symbols Outlined"'),
                        fontFamily: comp ? comp.fontFamily : 'none',
                        fontFeatureSettings: comp ? comp.fontFeatureSettings : 'none'
                    });
                })()"""
            })
            print('Font Eval:', eval_res.get('result', {}).get('value'))
    finally:
        proc.terminate()

asyncio.run(check_console())
