import urllib.request, json, websockets, asyncio, subprocess, tempfile, shutil

async def test_bugs():
    temp_dir = tempfile.mkdtemp()
    proc = subprocess.Popen([r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--remote-debugging-port=9263', f'--user-data-dir={temp_dir}', '--window-size=393,852'])
    await asyncio.sleep(2)
    try:
        req = urllib.request.urlopen('http://127.0.0.1:9263/json')
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
                    if res.get('method') == 'Runtime.consoleAPICalled':
                        args = [arg.get('value') for arg in res['params']['args']]
                        if res['params']['type'] in ['error', 'warning']:
                            print('CONSOLE', res['params']['type'] + ':', args)
                    if res.get('method') == 'Runtime.exceptionThrown':
                        print('EXCEPTION:', json.dumps(res['params']['exceptionDetails']))

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

            # TEST 1: View PDF in Academic Vault
            print("\n=== TEST 1: View PDF ===")
            pdf_res = await send('Runtime.evaluate', {'expression': """
                (() => {
                    window.App.switchView('resources');
                    const btn = document.querySelector('.btn-preview-resource');
                    const modalBefore = document.getElementById('pdf-preview-modal');
                    const isHiddenBefore = modalBefore ? modalBefore.classList.contains('hidden') : null;
                    if (btn) btn.click();
                    const modalAfter = document.getElementById('pdf-preview-modal');
                    const isHiddenAfter = modalAfter ? modalAfter.classList.contains('hidden') : null;
                    const isActiveAfter = modalAfter ? modalAfter.classList.contains('active') : null;
                    const iframeSrc = modalAfter ? modalAfter.querySelector('iframe')?.src : null;
                    const computedDisplay = modalAfter ? window.getComputedStyle(modalAfter).display : null;
                    return {
                        hasBtn: !!btn,
                        hasModal: !!modalAfter,
                        isHiddenAfter,
                        isActiveAfter,
                        computedDisplay,
                        iframeSrc
                    };
                })()
            """, 'returnByValue': True})
            print("PDF Test:", json.dumps(pdf_res.get('result', {}).get('value')))

            # TEST 2: Timetable buttons
            print("\n=== TEST 2: Timetable Buttons ===")
            tt_res = await send('Runtime.evaluate', {'expression': """
                (() => {
                    window.App.switchView('timetable');
                    // 1. Day pills
                    const wedPill = document.querySelector('#timetable-day-pills [data-day="WED"]');
                    const dayBefore = window.TimetableController.activeDay;
                    if (wedPill) wedPill.click();
                    const dayAfter = window.TimetableController.activeDay;

                    // 2. Batch chips
                    const batchBtn = document.querySelector('#quick-batch-container button[data-batch="26BT02"]');
                    const batchBefore = window.TimetableController.activeBatch;
                    if (batchBtn) batchBtn.click();
                    const batchAfter = window.TimetableController.activeBatch;

                    // 3. View mode
                    const weekBtn = document.querySelector('#timetable-view-mode-tabs button[data-mode="week"]');
                    const modeBefore = window.TimetableController.viewMode;
                    if (weekBtn) weekBtn.click();
                    const modeAfter = window.TimetableController.viewMode;
                    const hasMatrix = !!document.querySelector('.week-matrix-table');

                    return {
                        dayBefore, dayAfter,
                        batchBefore, batchAfter,
                        modeBefore, modeAfter,
                        hasMatrix
                    };
                })()
            """, 'returnByValue': True})
            print("Timetable Test:", json.dumps(tt_res.get('result', {}).get('value')))

            # TEST 3: Mess Menu buttons
            print("\n=== TEST 3: Mess Menu Buttons ===")
            mess_res = await send('Runtime.evaluate', {'expression': """
                (() => {
                    window.App.switchView('mess');
                    const dayTabs = Array.from(document.querySelectorAll('.mess-day-btn'));
                    const dayNames = dayTabs.map(b => b.dataset.day);
                    const initialDay = window.MessController.activeDay;

                    // Click Monday
                    const monBtn = document.querySelector('.mess-day-btn[data-day="Monday"]');
                    if (monBtn) monBtn.click();
                    const afterMonDay = window.MessController.activeDay;
                    const monHeader = document.getElementById('mess-current-day-label')?.textContent;

                    // Check tonight's thali
                    const thaliTitle = document.querySelector('#view-mess h4')?.textContent;

                    return {
                        dayTabsCount: dayTabs.length,
                        dayNames,
                        initialDay,
                        afterMonDay,
                        monHeader,
                        thaliTitle
                    };
                })()
            """, 'returnByValue': True})
            print("Mess Test:", json.dumps(mess_res.get('result', {}).get('value')))

            # TEST 4: Campus Map zoom/pan & elements
            print("\n=== TEST 4: Campus Map ===")
            map_res = await send('Runtime.evaluate', {'expression': """
                (() => {
                    window.App.switchView('campus');
                    const btnZoomIn = document.getElementById('btn-map-zoom-in');
                    const initialZoom = window.CampusMap.zoomLevel;
                    if (btnZoomIn) btnZoomIn.click();
                    const afterZoom = window.CampusMap.zoomLevel;
                    
                    const worldLayer = document.getElementById('map-world-layer');
                    const worldTag = worldLayer ? worldLayer.tagName : null;
                    const worldTransform = worldLayer ? worldLayer.style.transform : null;
                    const svgEl = document.getElementById('campus-vector-svg');
                    const bldgNodes = document.querySelectorAll('.bldg-node').length;

                    return {
                        initialZoom,
                        afterZoom,
                        worldTag,
                        worldTransform,
                        hasSvg: !!svgEl,
                        bldgNodes
                    };
                })()
            """, 'returnByValue': True})
            print("Map Test:", json.dumps(map_res.get('result', {}).get('value')))

    finally:
        proc.terminate()
        try: shutil.rmtree(temp_dir)
        except: pass

asyncio.run(test_bugs())
