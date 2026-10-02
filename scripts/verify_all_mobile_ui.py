import urllib.request, json, websockets, asyncio, subprocess, tempfile, shutil, base64, os

async def verify_mobile():
    temp_dir = tempfile.mkdtemp()
    proc = subprocess.Popen([r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--remote-debugging-port=9261', f'--user-data-dir={temp_dir}', '--window-size=393,852'])
    await asyncio.sleep(2)
    os.makedirs('screenshots_audit', exist_ok=True)
    try:
        req = urllib.request.urlopen('http://127.0.0.1:9261/json')
        p = next(t for t in json.loads(req.read().decode()) if t.get('type')=='page')
        async with websockets.connect(p['webSocketDebuggerUrl']) as ws:
            msg_id = 1
            async def send(m, params=None):
                nonlocal msg_id
                mid = msg_id
                msg_id += 1
                await ws.send(json.dumps({'id': mid, 'method': m, 'params': params or {}}))
                while True:
                    res = json.loads(await ws.recv())
                    if res.get('id') == mid: return res.get('result', {})

            await send('Page.enable')
            await send('Runtime.enable')
            await send('Network.enable')
            await send('Network.setBypassServiceWorker', {'bypass': True})
            await send('Emulation.setDeviceMetricsOverride', {'width': 393, 'height': 852, 'deviceScaleFactor': 2, 'mobile': True})
            await send('Page.addScriptToEvaluateOnNewDocument', {
                'source': """
                    localStorage.setItem('juit_student_profile', JSON.stringify({name:'Aarav Sharma',batch:'26BT10',branch:'CSE',semester:1,onboarded:true}));
                    localStorage.setItem('juit_onboarded_v1', 'true');
                """
            })

            await send('Page.navigate', {'url': 'http://127.0.0.1:8000/#dash'})
            await asyncio.sleep(2)
            await send('Runtime.evaluate', {'expression': 'document.fonts.ready', 'awaitPromise': True})
            await asyncio.sleep(0.5)

            # Shot 1: Home Dashboard
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('screenshots_audit/final_01_home.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("1. Home Dashboard captured.")

            # Shot 2: Timetable / Classes
            await send('Runtime.evaluate', {'expression': """
                document.querySelector('.mobile-hud-dock a[data-view="timetable"]').click();
                if (window.TimetableController) {
                    window.TimetableController.activeDay = 'TUE';
                    window.TimetableController.renderSchedule();
                }
            """})
            await asyncio.sleep(0.8)
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('screenshots_audit/final_02_timetable.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("2. Timetable captured.")

            # Shot 3: Mess Menu
            await send('Runtime.evaluate', {'expression': """
                document.querySelector('.mobile-hud-dock a[data-view="mess"]').click();
            """})
            await asyncio.sleep(0.8)
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('screenshots_audit/final_03_mess.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("3. Mess Menu captured.")

            # Shot 4: Academic Vault
            await send('Runtime.evaluate', {'expression': """
                document.querySelector('.mobile-hud-dock a[data-view="resources"]').click();
            """})
            await asyncio.sleep(0.8)
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('screenshots_audit/final_04_vault.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("4. Academic Vault captured.")

            # Shot 5: More Bottom Sheet (clicking 'More' at bottom right)
            await send('Runtime.evaluate', {'expression': """
                document.getElementById('btn-mobile-hud-more').click();
            """})
            await asyncio.sleep(0.6)
            sheet_check = await send('Runtime.evaluate', {'expression': """
                (() => {
                    const sheet = document.getElementById('mobile-more-sheet');
                    const backdrop = document.getElementById('mobile-more-backdrop');
                    return {
                        sheetActive: sheet?.classList.contains('active'),
                        backdropActive: backdrop?.classList.contains('active'),
                        rect: sheet?.getBoundingClientRect()
                    };
                })()
            """, 'returnByValue': True})
            print("More Sheet Check:", json.dumps(sheet_check.get('result', {}).get('value')))
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('screenshots_audit/final_05_more_sheet.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("5. More Bottom Sheet captured.")

            # Shot 6: Navigating to Transit from More Sheet
            await send('Runtime.evaluate', {'expression': """
                const transitLink = document.querySelector('#mobile-more-sheet a[data-view="bus"]');
                if (transitLink) transitLink.click();
            """})
            await asyncio.sleep(0.8)
            more_closed = await send('Runtime.evaluate', {'expression': """
                !document.getElementById('mobile-more-sheet')?.classList.contains('active')
            """})
            print("More sheet closed after click:", more_closed.get('result', {}).get('value'))
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('screenshots_audit/final_06_bus_transit.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("6. Bus Transit captured.")

            # Shot 7: Top-Left Hamburger Drawer
            await send('Runtime.evaluate', {'expression': """
                document.getElementById('btn-mobile-menu-toggle').click();
            """})
            await asyncio.sleep(0.6)
            drawer_check = await send('Runtime.evaluate', {'expression': """
                (() => {
                    const drawer = document.getElementById('mobile-drawer');
                    const backdrop = document.getElementById('mobile-drawer-backdrop');
                    return {
                        drawerActive: drawer?.classList.contains('active'),
                        backdropActive: backdrop?.classList.contains('active'),
                        rect: drawer?.getBoundingClientRect()
                    };
                })()
            """, 'returnByValue': True})
            print("Left Drawer Check:", json.dumps(drawer_check.get('result', {}).get('value')))
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('screenshots_audit/final_07_left_drawer.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("7. Left Drawer captured.")

    finally:
        proc.terminate()
        try:
            shutil.rmtree(temp_dir)
        except Exception:
            pass

asyncio.run(verify_mobile())
