import urllib.request, json, websockets, asyncio, subprocess, time, base64

async def test_batch_switch():
    port = 9260
    proc = subprocess.Popen([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless=new',
        '--disable-gpu',
        f'--remote-debugging-port={port}',
        r'--user-data-dir=C:\Users\Admin\AppData\Local\Temp\edgetest9260',
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

            await send('Page.enable')
            await send('Runtime.enable')
            await send('Page.navigate', {'url': 'http://127.0.0.1:3000/#timetable'})
            
            # Wait for App to be ready
            for _ in range(30):
                chk = await send('Runtime.evaluate', {'expression': 'Boolean(window.App && window.App.activeView)'})
                if chk.get('result', {}).get('value'):
                    break
                await asyncio.sleep(0.5)

            # Close onboarding
            await send('Runtime.evaluate', {'expression': """
                localStorage.setItem('juit_student_profile', JSON.stringify({name:'JUIT Scholar',batch:'26BT10',branch:'CSE',semester:1,onboarded:true}));
                localStorage.setItem('juit_onboarded_v1', 'true');
                if (window.App && window.App.closeAccountModal) { window.App.closeAccountModal(); }
                var m = document.getElementById('student-account-modal');
                if (m) { m.style.display = 'none'; m.classList.add('hidden'); }
            """})
            await asyncio.sleep(0.5)

            # Check initial label
            l1 = await send('Runtime.evaluate', {'expression': "document.getElementById('timetable-batch-display-label').textContent"})
            print("Initial batch label:", l1.get('result', {}).get('value'))

            # Simulate clicking quick batch chip '26BT03'
            await send('Runtime.evaluate', {'expression': """
                const btn = document.querySelector('#quick-batch-container button[data-batch="26BT03"]');
                if (btn) btn.click();
            """})
            await asyncio.sleep(0.5)

            l2 = await send('Runtime.evaluate', {'expression': "document.getElementById('timetable-batch-display-label').textContent"})
            print("After clicking 26BT03 chip:", l2.get('result', {}).get('value'))

            # Simulate selecting 'ALL' in batch dropdown
            await send('Runtime.evaluate', {'expression': """
                const sel = document.getElementById('timetable-batch-select');
                if (sel) {
                    sel.value = 'ALL';
                    sel.dispatchEvent(new Event('change'));
                }
            """})
            await asyncio.sleep(0.5)

            l3 = await send('Runtime.evaluate', {'expression': "document.getElementById('timetable-batch-display-label').textContent"})
            print("After selecting ALL in dropdown:", l3.get('result', {}).get('value'))

            # Switch back to 26BT10
            click_res = await send('Runtime.evaluate', {'expression': """
                (() => {
                    const btns = Array.from(document.querySelectorAll('#quick-batch-container button[data-batch]')).map(b => b.dataset.batch);
                    const btn = document.querySelector('#quick-batch-container button[data-batch="26BT10"]');
                    if (btn) {
                        btn.click();
                        return 'CLICKED_26BT10, available: ' + btns.join(',');
                    }
                    return 'NOT_FOUND, available: ' + btns.join(',');
                })()
            """})
            print("Step 4 click result:", click_res.get('result', {}).get('value'))
            await asyncio.sleep(0.5)

            l4 = await send('Runtime.evaluate', {'expression': "document.getElementById('timetable-batch-display-label').textContent"})
            print("After clicking 26BT10 chip again:", l4.get('result', {}).get('value'))

    finally:
        proc.kill()

if __name__ == '__main__':
    asyncio.run(test_batch_switch())
