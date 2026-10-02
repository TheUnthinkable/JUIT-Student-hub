import urllib.request, json, websockets, asyncio, subprocess, tempfile, shutil, base64, os

async def verify():
    temp_dir = tempfile.mkdtemp()
    proc = subprocess.Popen([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless=new',
        '--remote-debugging-port=9288',
        f'--user-data-dir={temp_dir}',
        '--window-size=1440,900'
    ])
    await asyncio.sleep(2)
    try:
        req = urllib.request.urlopen('http://127.0.0.1:9288/json')
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
            
            # Start on desktop
            await send('Page.navigate', {'url': 'http://127.0.0.1:8000/#dash'})
            await asyncio.sleep(2)

            print("=== CHECK 1: Desktop Dashboard Elements ===")
            dash_check = await send('Runtime.evaluate', {'expression': """
                (() => {
                    const hero = document.getElementById('dash-next-class-hero');
                    const timeline = document.getElementById('dash-upcoming-classes-preview');
                    const mess = document.getElementById('dash-next-meal-preview');
                    const messDishes = document.getElementById('dash-mess-dishes');
                    const mealTabs = document.querySelectorAll('.btn-dash-meal-tab');
                    const greeting = document.getElementById('dash-live-greeting')?.textContent;
                    const quickBatch = document.getElementById('dash-telemetry-batch')?.textContent;
                    const announcements = document.getElementById('dash-announcements-preview');

                    return {
                        hasHero: !!hero,
                        hasTimeline: !!timeline,
                        hasMess: !!mess && !mess.classList.contains('hidden'),
                        messDishesCount: messDishes ? messDishes.children.length : 0,
                        mealTabsCount: mealTabs.length,
                        greeting: greeting ? greeting.trim() : null,
                        quickBatch: quickBatch ? quickBatch.trim() : null,
                        announcementsCount: announcements ? announcements.children.length : 0
                    };
                })()
            """, 'returnByValue': True})
            print("Dashboard check:", json.dumps(dash_check.get('result', {}).get('value'), indent=2))

            # Test Mess Switcher tabs
            print("\n=== CHECK 2: Interactive Mess Snapshot Tabs ===")
            mess_tabs_test = await send('Runtime.evaluate', {'expression': """
                (() => {
                    const dinnerBtn = document.querySelector('.btn-dash-meal-tab[data-meal="dinner"]');
                    if (dinnerBtn) dinnerBtn.click();
                    const activePill = document.querySelector('.btn-dash-meal-tab.bg-primary');
                    const mealName = document.getElementById('dash-mess-meal-name')?.textContent;
                    const dishesText = document.getElementById('dash-mess-dishes')?.innerText;
                    return {
                        clickedDinner: !!dinnerBtn,
                        activePillText: activePill ? activePill.textContent.trim() : null,
                        mealName: mealName ? mealName.trim() : null,
                        dishesCount: document.getElementById('dash-mess-dishes')?.children.length || 0,
                        dishesSample: dishesText ? dishesText.replace(/\\n+/g, ', ').slice(0, 80) : ''
                    };
                })()
            """, 'returnByValue': True})
            print("Mess tabs switch to Dinner:", json.dumps(mess_tabs_test.get('result', {}).get('value'), indent=2))

            # Capture Desktop Dashboard Screenshot
            shot1 = await send('Page.captureScreenshot', {'format': 'png'})
            with open('scripts/desktop_dashboard.png', 'wb') as f:
                f.write(base64.b64decode(shot1['data']))
            print("Desktop dashboard screenshot saved: scripts/desktop_dashboard.png")

            # Test Account Modal Open & Edit
            print("\n=== CHECK 3: Student Account Modal Open & Edit ===")
            open_modal_test = await send('Runtime.evaluate', {'expression': """
                (() => {
                    const btn = document.getElementById('btn-open-profile-settings');
                    if (btn) btn.click();
                    const modal = document.getElementById('student-account-modal');
                    const isVisible = modal && !modal.classList.contains('hidden') && modal.classList.contains('open');
                    const nameInput = document.getElementById('account-name-input');
                    const rollInput = document.getElementById('account-roll-input');
                    const batchInput = document.getElementById('account-batch-select');
                    
                    if (nameInput) {
                        nameInput.value = 'Devendra Singh';
                        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    if (rollInput) {
                        rollInput.value = '23103001';
                        rollInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    if (batchInput) {
                        batchInput.value = 'B2';
                        batchInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    const passName = document.getElementById('account-display-name')?.textContent;
                    const passRoll = document.getElementById('account-display-roll')?.textContent;
                    const passAcademic = document.getElementById('account-display-academic')?.textContent;

                    return {
                        modalOpened: isVisible,
                        passName,
                        passRoll,
                        passAcademic
                    };
                })()
            """, 'returnByValue': True})
            print("Modal open and live pass update:", json.dumps(open_modal_test.get('result', {}).get('value'), indent=2))

            # Capture Account Modal Screenshot
            await asyncio.sleep(0.5)
            shot_modal = await send('Page.captureScreenshot', {'format': 'png'})
            with open('scripts/account_modal.png', 'wb') as f:
                f.write(base64.b64decode(shot_modal['data']))
            print("Account modal screenshot saved: scripts/account_modal.png")

            # Save Profile
            print("\n=== CHECK 4: Save Profile and Verify UI Updates ===")
            submit_res = await send('Runtime.evaluate', {'expression': """
                (() => {
                    const form = document.getElementById('student-account-form');
                    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    return true;
                })()
            """, 'returnByValue': True})
            
            # Wait for modal feedback toast & closing animation
            await asyncio.sleep(1.2)

            verify_save = await send('Runtime.evaluate', {'expression': """
                (() => {
                    const savedProfile = JSON.parse(localStorage.getItem('juit_student_profile') || '{}');
                    const greeting = document.getElementById('dash-live-greeting')?.textContent;
                    const quickBatch = document.getElementById('dash-telemetry-batch')?.textContent;
                    const sidebarName = document.getElementById('sidebar-user-name')?.textContent;
                    const sidebarBatch = document.getElementById('sidebar-user-batch-label')?.textContent;
                    const modal = document.getElementById('student-account-modal');
                    const isClosed = modal ? (modal.classList.contains('hidden') && !modal.classList.contains('open')) : false;

                    return {
                        savedName: savedProfile.name,
                        savedBatch: savedProfile.batch,
                        savedRoll: savedProfile.rollNo,
                        greeting: greeting ? greeting.trim() : null,
                        quickBatch: quickBatch ? quickBatch.trim() : null,
                        sidebarName: sidebarName ? sidebarName.trim() : null,
                        sidebarBatch: sidebarBatch ? sidebarBatch.trim() : null,
                        modalClosed: isClosed
                    };
                })()
            """, 'returnByValue': True})
            print("Profile save result:", json.dumps(verify_save.get('result', {}).get('value'), indent=2))

            # Check Mobile view
            print("\n=== CHECK 5: Mobile Viewport Dashboard ===")
            await send('Emulation.setDeviceMetricsOverride', {'width': 393, 'height': 852, 'deviceScaleFactor': 2, 'mobile': True})
            await asyncio.sleep(1)
            
            mobile_scroll_test = await send('Runtime.evaluate', {'expression': """
                (() => {
                    const container = document.getElementById('main-content-scroll');
                    const hero = document.getElementById('dash-next-class-hero');
                    const mess = document.getElementById('dash-next-meal-preview');
                    const bodyScroll = document.body.scrollHeight > window.innerHeight;
                    const containerScroll = container ? (container.scrollHeight > container.clientHeight) : false;
                    return {
                        hasHero: !!hero,
                        hasMess: !!mess,
                        bodyScroll,
                        containerScroll,
                        containerScrollHeight: container?.scrollHeight,
                        containerClientHeight: container?.clientHeight
                    };
                })()
            """, 'returnByValue': True})
            print("Mobile scroll check:", json.dumps(mobile_scroll_test.get('result', {}).get('value'), indent=2))

            shot_mobile = await send('Page.captureScreenshot', {'format': 'png'})
            with open('scripts/mobile_dashboard.png', 'wb') as f:
                f.write(base64.b64decode(shot_mobile['data']))
            print("Mobile dashboard screenshot saved: scripts/mobile_dashboard.png")

            # Check Settings View
            print("\n=== CHECK 6: Settings & Preferences View ===")
            settings_test = await send('Runtime.evaluate', {'expression': """
                (() => {
                    window.App.switchView('settings');
                    const passName = document.getElementById('settings-display-name')?.textContent;
                    const passRoll = document.getElementById('settings-display-roll')?.textContent;
                    const passBatch = document.getElementById('settings-display-academic-pill')?.textContent;
                    const nameInput = document.getElementById('settings-name-input')?.value;
                    const batchInput = document.getElementById('settings-batch-select')?.value;
                    
                    // Test notes
                    const notesArea = document.getElementById('scholar-notes-textarea');
                    if (notesArea) {
                        notesArea.value = 'Review CS201 Midterm formulas\\nVerify Mess hall 2 timing';
                        notesArea.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    return {
                        passName: passName ? passName.trim() : null,
                        passRoll: passRoll ? passRoll.trim() : null,
                        passBatch: passBatch ? passBatch.trim() : null,
                        nameInput,
                        batchInput,
                        hasNotesArea: !!notesArea
                    };
                })()
            """, 'returnByValue': True})
            print("Settings view check:", json.dumps(settings_test.get('result', {}).get('value'), indent=2))

            # Wait 800ms for notes autosave
            await asyncio.sleep(0.8)
            saved_notes = await send('Runtime.evaluate', {'expression': "localStorage.getItem('juit_scholar_notes')", 'returnByValue': True})
            print("Autosaved notes in localStorage:", saved_notes.get('result', {}).get('value'))

            shot_settings = await send('Page.captureScreenshot', {'format': 'png'})
            with open('scripts/desktop_settings.png', 'wb') as f:
                f.write(base64.b64decode(shot_settings['data']))
            print("Settings view screenshot saved: scripts/desktop_settings.png")

    finally:
        proc.terminate()
        shutil.rmtree(temp_dir, ignore_errors=True)

asyncio.run(verify())
