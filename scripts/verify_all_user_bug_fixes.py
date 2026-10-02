import urllib.request, json, websockets, asyncio, subprocess, tempfile, shutil

async def run_verification():
    temp_dir = tempfile.mkdtemp()
    proc = subprocess.Popen([r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--remote-debugging-port=9264', f'--user-data-dir={temp_dir}', '--window-size=393,852'])
    await asyncio.sleep(2)
    try:
        req = urllib.request.urlopen('http://127.0.0.1:9264/json')
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
                    if res.get('id') == mid: return res
                    if res.get('method') == 'Runtime.consoleAPICalled':
                        args = [arg.get('value') for arg in res['params']['args']]
                        if res['params']['type'] in ['error']:
                            print('CONSOLE ERROR:', args)

            def get_val(r):
                if 'result' in r and 'result' in r['result']:
                    return r['result']['result'].get('value')
                return r

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

            print("==================================================")
            print("AUTOMATED VERIFICATION OF USER-REPORTED BUG FIXES")
            print("==================================================")

            # 1. TEST PDF PREVIEW IN ACADEMIC VAULT
            print("\n1. Testing 'View PDF' in Academic Vault...")
            pdf_test = await send('Runtime.evaluate', {'expression': """
                (() => {
                    window.App.switchView('resources');
                    const btn = document.querySelector('.btn-preview-resource');
                    if (!btn) return { error: 'No preview button found' };
                    btn.click();
                    const modal = document.getElementById('pdf-preview-modal');
                    const title = document.getElementById('preview-modal-title')?.textContent;
                    const iframeSrc = document.getElementById('preview-modal-iframe')?.src;
                    const displayAfterOpen = modal ? window.getComputedStyle(modal).display : 'none';
                    const hasOpenClass = modal?.classList.contains('open');
                    
                    // Test Close Button
                    const closeBtn = document.getElementById('preview-modal-close');
                    if (closeBtn) closeBtn.click();
                    const displayAfterClose = modal ? window.getComputedStyle(modal).display : 'block';

                    return {
                        success: displayAfterOpen === 'flex' && displayAfterClose === 'none' && !!iframeSrc,
                        displayAfterOpen,
                        displayAfterClose,
                        hasOpenClass,
                        title,
                        iframeSrc: iframeSrc?.substring(0, 40)
                    };
                })()
            """, 'returnByValue': True})
            print("PDF Result:", json.dumps(get_val(pdf_test), indent=2))

            # 2. TEST TIMETABLE UI BUTTONS & INSPECTOR
            print("\n2. Testing Timetable UI Buttons & Class Inspection...")
            tt_test = await send('Runtime.evaluate', {'expression': """
                (() => {
                    window.App.switchView('timetable');
                    
                    // A. Day Pills
                    const wedPill = document.querySelector('#timetable-day-pills [data-day="WED"]');
                    if (wedPill) wedPill.click();
                    const activeDayAfterWed = window.TimetableController.activeDay;

                    // B. Quick Batch
                    const batchBtn = document.querySelector('#quick-batch-container button[data-batch="26BT02"]');
                    if (batchBtn) batchBtn.click();
                    const activeBatchAfter = window.TimetableController.activeBatch;

                    // C. View Mode (Week -> Day -> Today)
                    const weekBtn = document.querySelector('#timetable-view-mode-tabs button[data-mode="week"]');
                    if (weekBtn) weekBtn.click();
                    const weekMode = window.TimetableController.viewMode;
                    const hasMatrix = !!document.querySelector('.week-matrix-table');

                    const todayBtn = document.querySelector('#timetable-view-mode-tabs button[data-mode="today"]');
                    if (todayBtn) todayBtn.click();
                    const todayMode = window.TimetableController.viewMode;

                    // D. Class Card Click & Universal Modal on WED (has active classes)
                    const wedPill2 = document.querySelector('#timetable-day-pills [data-day="WED"]');
                    if (wedPill2) wedPill2.click();
                    const card = document.querySelector('.class-schedule-card');
                    if (card) card.click();
                    const uniModal = document.getElementById('universal-modal');
                    const modalDisplay = uniModal ? window.getComputedStyle(uniModal).display : 'none';
                    const modalContent = document.getElementById('universal-modal-content')?.textContent;
                    
                    // Close modal
                    const closeBtn = uniModal?.querySelector('.btn-close-drawer');
                    if (closeBtn) closeBtn.click();
                    const modalDisplayAfterClose = uniModal ? window.getComputedStyle(uniModal).display : 'flex';

                    return {
                        success: activeDayAfterWed === 'WED' && activeBatchAfter === '26BT02' && weekMode === 'week' && hasMatrix && todayMode === 'today' && modalDisplay === 'flex' && modalDisplayAfterClose === 'none',
                        activeDayAfterWed,
                        activeBatchAfter,
                        weekMode,
                        hasMatrix,
                        todayMode,
                        modalDisplay,
                        modalDisplayAfterClose,
                        hasModalContent: !!modalContent
                    };
                })()
            """, 'returnByValue': True})
            print("Timetable Result:", json.dumps(get_val(tt_test), indent=2))

            # 3. TEST MESS MENU BUTTONS & DYNAMIC DAY SWITCHING
            print("\n3. Testing Mess Menu Day Tabs & Dynamic Meal Cards...")
            mess_test = await send('Runtime.evaluate', {'expression': """
                (() => {
                    window.App.switchView('mess');

                    // Click Monday
                    const monBtn = document.querySelector('.mess-day-btn[data-day="Monday"]');
                    if (monBtn) monBtn.click();
                    const monActive = document.querySelector('.mess-day-btn[data-day="Monday"]')?.classList.contains('active');
                    const monTitle = document.getElementById('mess-featured-title')?.textContent;
                    const monDish1 = document.getElementById('mess-dish-1-name')?.textContent;
                    const monMealCards = document.querySelectorAll('#mess-meals-container .meal-card').length;

                    // Click Friday
                    const friBtn = document.querySelector('.mess-day-btn[data-day="Friday"]');
                    if (friBtn) friBtn.click();
                    const friActive = document.querySelector('.mess-day-btn[data-day="Friday"]')?.classList.contains('active');
                    const friTitle = document.getElementById('mess-featured-title')?.textContent;
                    const friDish1 = document.getElementById('mess-dish-1-name')?.textContent;
                    const friMealCards = document.querySelectorAll('#mess-meals-container .meal-card').length;

                    // Click Sunday
                    const sunBtn = document.querySelector('.mess-day-btn[data-day="Sunday"]');
                    if (sunBtn) sunBtn.click();
                    const sunActive = document.querySelector('.mess-day-btn[data-day="Sunday"]')?.classList.contains('active');
                    const sunTitle = document.getElementById('mess-featured-title')?.textContent;
                    const sunDish1 = document.getElementById('mess-dish-1-name')?.textContent;

                    return {
                        success: !!monActive && !!friActive && !!sunActive && monTitle.includes('Monday') && friTitle.includes('Friday') && sunTitle.includes('Sunday') && monDish1 !== friDish1,
                        monActive,
                        friActive,
                        sunActive,
                        monTitle,
                        monDish1,
                        monMealCards,
                        friTitle,
                        friDish1,
                        friMealCards,
                        sunTitle,
                        sunDish1
                    };
                })()
            """, 'returnByValue': True})
            print("Mess Result:", json.dumps(get_val(mess_test), indent=2))

            # 4. TEST CAMPUS MAP NO-GLITCH & ZOOM CONTROLS
            print("\n4. Testing Campus Map Architecture & Controls...")
            map_test = await send('Runtime.evaluate', {'expression': """
                (() => {
                    window.App.switchView('campus');

                    // Verify map-world-layer is an SVG <g>, not outer div
                    const worldEl = document.querySelector('#campus-vector-svg #map-world-layer');
                    const worldTag = worldEl ? worldEl.tagName : null;
                    const outerContainer = document.getElementById('map-canvas-container');
                    const outerTouchAction = outerContainer ? window.getComputedStyle(outerContainer).touchAction : null;

                    // Zoom in
                    const btnIn = document.getElementById('btn-map-zoom-in');
                    const zoomBefore = window.CampusMap.zoomLevel;
                    if (btnIn) btnIn.click();
                    const zoomAfter = window.CampusMap.zoomLevel;
                    const transformAfter = worldEl?.style.transform;

                    // Click Quick Building (AB2)
                    const ab2Btn = document.querySelector('.quick-bldg-btn[data-bldg-id="block2"]');
                    if (ab2Btn) ab2Btn.click();
                    const drawer = document.getElementById('map-venue-drawer');
                    const isDrawerOpen = drawer?.classList.contains('open');

                    // Close Drawer
                    const closeDrawerBtn = document.getElementById('btn-close-map-drawer');
                    if (closeDrawerBtn) closeDrawerBtn.click();
                    const isDrawerClosed = !drawer?.classList.contains('open');

                    return {
                        success: worldTag === 'g' && zoomAfter > zoomBefore && transformAfter.includes('scale(') && isDrawerOpen && isDrawerClosed,
                        worldTag,
                        outerTouchAction,
                        zoomBefore,
                        zoomAfter,
                        transformAfter,
                        isDrawerOpen,
                        isDrawerClosed
                    };
                })()
            """, 'returnByValue': True})
            print("Map Result:", json.dumps(get_val(map_test), indent=2))

    finally:
        proc.terminate()
        try: shutil.rmtree(temp_dir)
        except: pass

asyncio.run(run_verification())
