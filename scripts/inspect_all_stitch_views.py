import urllib.request, json, websockets, asyncio, subprocess, time, base64, os, tempfile, shutil

async def run_audit():
    temp_dir = tempfile.mkdtemp(prefix='edge_stitch_')
    proc = subprocess.Popen([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless=new',
        '--disable-gpu',
        '--remote-debugging-port=9245',
        f'--user-data-dir={temp_dir}',
        '--window-size=1440,900'
    ])
    await asyncio.sleep(2)
    os.makedirs('screenshots_audit', exist_ok=True)
    try:
        req = urllib.request.urlopen('http://127.0.0.1:9245/json')
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
                    if res.get('method') == 'Runtime.consoleAPICalled':
                        print('CONSOLE:', res['params']['type'], [arg.get('value') for arg in res['params']['args']])
                    if res.get('method') == 'Runtime.exceptionThrown':
                        print('EXCEPTION:', res['params']['exceptionDetails'])

            await send('Page.enable')
            await send('Runtime.enable')
            await send('Network.enable')
            await send('Network.clearBrowserCache')
            await send('Page.addScriptToEvaluateOnNewDocument', {
                'source': """
                    localStorage.setItem('juit_student_profile', JSON.stringify({name:'Aarav Sharma',batch:'26BT16',branch:'CSE',semester:5,onboarded:true}));
                    localStorage.setItem('juit_onboarded_v1', 'true');
                """
            })
            await send('Page.navigate', {'url': 'http://127.0.0.1:8000/#dash'})
            
            # Wait for App to be initialized
            for _ in range(30):
                chk = await send('Runtime.evaluate', {'expression': 'Boolean(window.App && window.App.activeView)'})
                if chk.get('result', {}).get('value'):
                    print('window.App is READY!')
                    break
                await asyncio.sleep(0.5)

            # Bypass onboarding modal and refresh dashboard
            await send('Runtime.evaluate', {'expression': """
                localStorage.setItem('juit_student_profile', JSON.stringify({name:'Aarav Sharma',batch:'26BT16',branch:'CSE',semester:5,onboarded:true}));
                localStorage.setItem('juit_onboarded_v1', 'true');
                var m = document.getElementById('onboarding-modal-backdrop');
                if (m) { m.classList.remove('open'); m.style.display = 'none'; }
                if (window.App && window.App.refreshDashboard) window.App.refreshDashboard();
            """})
            # Wait for document fonts
            await send('Runtime.evaluate', {'expression': 'document.fonts.ready', 'awaitPromise': True})
            await asyncio.sleep(0.5)

            views = [
                ('dash', 'desktop_01_dash.png'),
                ('timetable', 'desktop_02_timetable.png'),
                ('mess', 'desktop_03_mess.png'),
                ('campus', 'desktop_04_campus_transit.png'),
                ('resources', 'desktop_05_vault.png'),
                ('utilities', 'desktop_06_utilities.png'),
                ('announcements', 'desktop_07_notices.png'),
                ('events', 'desktop_08_events.png'),
            ]

            print("=== CAPTURING DESKTOP SCREENS (1440x900) ===")
            for vname, fname in views:
                await send('Runtime.evaluate', {'expression': f'window.App.switchView("{vname}")'})
                await asyncio.sleep(0.8)
                res = await send('Page.captureScreenshot', {'format': 'png'})
                path = os.path.join('screenshots_audit', fname)
                with open(path, 'wb') as f:
                    f.write(base64.b64decode(res['data']))
                print(f'Captured {fname}')

            print("=== RESIZING TO MOBILE (393x852) ===")
            await send('Emulation.setDeviceMetricsOverride', {
                'width': 393,
                'height': 852,
                'deviceScaleFactor': 2,
                'mobile': True
            })
            await asyncio.sleep(0.5)

            for vname, fname in views:
                mob_fname = fname.replace('desktop_', 'mobile_')
                await send('Runtime.evaluate', {'expression': f'window.App.switchView("{vname}")'})
                await asyncio.sleep(0.8)
                res = await send('Page.captureScreenshot', {'format': 'png'})
                path = os.path.join('screenshots_audit', mob_fname)
                with open(path, 'wb') as f:
                    f.write(base64.b64decode(res['data']))
                print(f'Captured {mob_fname}')

            # Test mobile drawer via clicking the menu toggle button
            await send('Runtime.evaluate', {'expression': 'document.getElementById("btn-mobile-menu-toggle").click()'})
            await asyncio.sleep(0.6)
            res = await send('Page.captureScreenshot', {'format': 'png'})
            path = os.path.join('screenshots_audit', 'mobile_drawer.png')
            with open(path, 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print('Captured mobile_drawer.png')

    finally:
        proc.terminate()
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass

asyncio.run(run_audit())
