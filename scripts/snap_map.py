import subprocess, time, json, urllib.request, websockets, asyncio, base64

async def test_map():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    user_data = r'C:\Users\Admin\AppData\Local\Temp\edge_inspect_map'
    port = 9228
    cmd = [edge_path, '--headless=new', '--disable-gpu', f'--remote-debugging-port={port}', f'--user-data-dir={user_data}', '--window-size=390,844', 'http://127.0.0.1:8000']
    proc = subprocess.Popen(cmd)
    await asyncio.sleep(2)
    try:
        req = urllib.request.urlopen(f'http://127.0.0.1:{port}/json')
        targets = json.loads(req.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target.get('webSocketDebuggerUrl')
        async with websockets.connect(ws_url, max_size=20*1024*1024) as ws:
            msg_id = 1
            async def send(method, params=None):
                nonlocal msg_id
                m_id = msg_id
                msg_id += 1
                await ws.send(json.dumps({'id': m_id, 'method': method, 'params': params or {}}))
                while True:
                    res = json.loads(await ws.recv())
                    if res.get('id') == m_id:
                        return res.get('result', {})
            await send('Page.enable')
            await send('Runtime.evaluate', {'expression': "localStorage.setItem('juit_onboarded_v1', 'true');"})
            await send('Page.navigate', {'url': 'http://127.0.0.1:8000/#campus'})
            await asyncio.sleep(2)
            await send('Runtime.evaluate', {'expression': "window.App.switchView('campus');"})
            await asyncio.sleep(1)
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('debug_campus_mobile_now.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print('Captured debug_campus_mobile_now.png successfully!')
    finally:
        proc.terminate()

asyncio.run(test_map())
