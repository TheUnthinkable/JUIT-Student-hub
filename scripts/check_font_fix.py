import asyncio, websockets, json, urllib.request, subprocess

async def check_fix():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    user_data = r'C:\Users\Admin\AppData\Local\Temp\edge_console_test2'
    port = 9231
    cmd = [edge_path, '--headless=new', '--disable-gpu', f'--remote-debugging-port={port}', f'--user-data-dir={user_data}', '--window-size=390,844', 'http://127.0.0.1:8000']
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
            
            # Apply the CSS fix dynamically
            await send('Runtime.evaluate', {
                'expression': """(() => {
                    const style = document.createElement('style');
                    style.innerHTML = `
                        @font-face {
                            font-family: 'Material Symbols Outlined';
                            font-style: normal;
                            font-weight: 100 700;
                            src: url('/css/fonts/MaterialSymbolsOutlined.woff2') format('woff2');
                            font-display: block;
                        }
                        .material-symbols-outlined {
                            font-family: 'Material Symbols Outlined' !important;
                            font-weight: normal !important;
                            font-style: normal !important;
                            font-size: 24px;
                            line-height: 1 !important;
                            letter-spacing: normal !important;
                            text-transform: none !important;
                            display: inline-block !important;
                            white-space: nowrap !important;
                            word-wrap: normal !important;
                            direction: ltr !important;
                            -webkit-font-feature-settings: 'liga' 1 !important;
                            font-feature-settings: 'liga' 1 !important;
                            -webkit-font-smoothing: antialiased !important;
                        }
                    `;
                    document.head.appendChild(style);
                    return 'Style appended';
                })()"""
            })
            await asyncio.sleep(1)
            
            # Check dimensions of an icon
            res = await send('Runtime.evaluate', {
                'expression': """(() => {
                    const icon = document.querySelector('.mobile-hud-item .material-symbols-outlined');
                    return {
                        text: icon.textContent,
                        width: icon.offsetWidth,
                        height: icon.offsetHeight,
                        fontFamily: window.getComputedStyle(icon).fontFamily,
                        liga: window.getComputedStyle(icon).fontFeatureSettings
                    };
                })()"""
            })
            print('Icon measurement with fix:', res.get('result', {}).get('value'))
            
            # Capture screenshot
            import base64
            snap = await send('Page.captureScreenshot', {'format': 'png'})
            with open('debug_fixed_font.png', 'wb') as f:
                f.write(base64.b64decode(snap['data']))
            print('Captured debug_fixed_font.png successfully!')
    finally:
        proc.terminate()

asyncio.run(check_fix())
