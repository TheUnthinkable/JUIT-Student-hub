import urllib.request, json, websockets, asyncio, subprocess, time, base64

async def test():
    proc = subprocess.Popen([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless=new',
        '--disable-gpu',
        '--remote-debugging-port=9243',
        r'--user-data-dir=C:\Users\Admin\AppData\Local\Temp\edgetest9243',
        '--window-size=390,844'
    ])
    await asyncio.sleep(2)
    try:
        req = urllib.request.urlopen('http://127.0.0.1:9243/json')
        targets = json.loads(req.read().decode())
        p = next(t for t in targets if t.get('type')=='page')
        async with websockets.connect(p['webSocketDebuggerUrl']) as ws:
            msg_id = 1
            async def send(m, params=None):
                nonlocal msg_id
                mid = msg_id
                msg_id += 1
                await ws.send(json.dumps({'id': mid, 'method': m, 'params': params or {}}))
                while True:
                    res = json.loads(await ws.recv())
                    if res.get('id') == mid:
                        return res.get('result', {})

            await send('Page.enable')
            await send('Runtime.enable')
            await send('Page.navigate', {'url': 'http://127.0.0.1:8000/#dash'})
            
            # Wait for App to be initialized
            for _ in range(30):
                chk = await send('Runtime.evaluate', {'expression': 'Boolean(window.App && window.App.activeView)'})
                if chk.get('result', {}).get('value'):
                    print('window.App is READY!')
                    break
                await asyncio.sleep(0.5)

            # Bypass onboarding modal
            await send('Runtime.evaluate', {'expression': """
                localStorage.setItem('juit_student_profile', JSON.stringify({name:'JUIT Scholar',batch:'26BT16',branch:'CSE',semester:1,onboarded:true}));
                localStorage.setItem('juit_onboarded_v1', 'true');
                var m = document.getElementById('onboarding-modal-backdrop');
                if (m) { m.classList.remove('open'); m.style.display = 'none'; }
            """})

            # Dashboard Mobile
            await send('Runtime.evaluate', {'expression': 'window.App.switchView("dash")'})
            await asyncio.sleep(1.0)
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('mobile_dash.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print('Saved mobile_dash.png')

            # Timetable Mobile
            await send('Runtime.evaluate', {'expression': 'window.App.switchView("timetable")'})
            await asyncio.sleep(1.0)
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('mobile_timetable.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print('Saved mobile_timetable.png')

            # Test mobile menu toggle
            await send('Runtime.evaluate', {'expression': """
                var btn = document.getElementById('btn-mobile-menu-toggle');
                if (btn) btn.click();
            """})
            await asyncio.sleep(0.5)
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('mobile_drawer_open.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print('Saved mobile_drawer_open.png')
    finally:
        proc.terminate()

asyncio.run(test())
