import urllib.request, json, websockets, asyncio, subprocess, time, base64, os

async def verify():
    port = 9255
    proc = subprocess.Popen([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless=new',
        '--disable-gpu',
        f'--remote-debugging-port={port}',
        r'--user-data-dir=C:\Users\Admin\AppData\Local\Temp\edgetest9255',
        '--window-size=1440,960'
    ])
    await asyncio.sleep(2)
    try:
        req = urllib.request.urlopen(f'http://127.0.0.1:{port}/json')
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
            await send('Page.navigate', {'url': 'http://127.0.0.1:3000/#dash'})
            
            # Wait for App to be ready
            for _ in range(30):
                chk = await send('Runtime.evaluate', {'expression': 'Boolean(window.App && window.App.activeView)'})
                if chk.get('result', {}).get('value'):
                    print('App is READY!')
                    break
                await asyncio.sleep(0.5)

            # Bypass onboarding / account modal
            await send('Runtime.evaluate', {'expression': """
                localStorage.setItem('juit_student_profile', JSON.stringify({name:'JUIT Scholar',batch:'26BT10',branch:'CSE',semester:1,onboarded:true}));
                localStorage.setItem('juit_onboarded_v1', 'true');
                localStorage.setItem('juit_selected_batch', '26BT10');
                if (window.App && window.App.closeAccountModal) {
                    window.App.closeAccountModal();
                }
                var accModal = document.getElementById('student-account-modal');
                if (accModal) { 
                    accModal.classList.add('hidden'); 
                    accModal.classList.remove('open', 'active'); 
                    accModal.style.setProperty('display', 'none', 'important'); 
                }
                var m = document.getElementById('onboarding-modal-backdrop');
                if (m) { 
                    m.classList.remove('open'); 
                    m.style.setProperty('display', 'none', 'important'); 
                }
                if (window.TimetableController) {
                    window.TimetableController.activeBatch = '26BT10';
                    window.TimetableController.activeDay = 'MON';
                    window.TimetableController.updateBatchDisplayLabels();
                    window.TimetableController.renderQuickBatchChips();
                    window.TimetableController.renderDayPills();
                    window.TimetableController.renderSchedule();
                }
            """})

            await asyncio.sleep(1)

            # 1. TEST TIMETABLE VIEW
            await send('Runtime.evaluate', {'expression': "window.App.switchView('timetable')"})
            await asyncio.sleep(1)

            # Check batch label text
            label_eval = await send('Runtime.evaluate', {'expression': "document.getElementById('timetable-batch-display-label').textContent"})
            print("Timetable Batch Label in DOM:", label_eval.get('result', {}).get('value'))

            # Capture timetable screenshot
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('final_verified_timetable.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("Captured final_verified_timetable.png")

            # 2. TEST RESOURCE VAULT
            await send('Runtime.evaluate', {'expression': "window.App.switchView('resources')"})
            await asyncio.sleep(1)

            # Check that senior strategy container is NOT in DOM
            strategy_eval = await send('Runtime.evaluate', {'expression': "Boolean(document.getElementById('senior-strategy-container'))"})
            print("Senior Strategy Container exists:", strategy_eval.get('result', {}).get('value'))

            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('final_verified_resources.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("Captured final_verified_resources.png")

            # 3. TEST MESS MENU
            await send('Runtime.evaluate', {'expression': "window.App.switchView('mess')"})
            await asyncio.sleep(1)
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('final_verified_mess.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("Captured final_verified_mess.png")

            # 4. TEST DASHBOARD
            await send('Runtime.evaluate', {'expression': "window.App.switchView('dash')"})
            await asyncio.sleep(1)
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('final_verified_dash.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("Captured final_verified_dash.png")

    finally:
        proc.kill()

if __name__ == '__main__':
    asyncio.run(verify())
