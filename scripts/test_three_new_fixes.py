import subprocess, time, json, urllib.request, websockets, asyncio, base64, os

async def run_tests():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    user_data = r'C:\Users\Admin\AppData\Local\Temp\edge_test_three_fixes'
    port = 9244
    cmd = [
        edge_path,
        '--headless=new',
        '--disable-gpu',
        f'--remote-debugging-port={port}',
        f'--user-data-dir={user_data}',
        '--window-size=1280,900', # Desktop viewport
        'http://127.0.0.1:3000'
    ]
    proc = subprocess.Popen(cmd)
    await asyncio.sleep(2)
    try:
        req = urllib.request.urlopen(f'http://127.0.0.1:{port}/json')
        targets = json.loads(req.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target.get('webSocketDebuggerUrl')
        async with websockets.connect(ws_url, max_size=25*1024*1024) as ws:
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

            async def eval_js(expr):
                r = await send('Runtime.evaluate', {'expression': expr, 'returnByValue': True})
                return r.get('result', {}).get('value')

            async def screenshot(filename):
                r = await send('Page.captureScreenshot', {'format': 'png'})
                data = base64.b64decode(r.get('data', ''))
                with open(filename, 'wb') as f:
                    f.write(data)
                print(f"Captured screenshot: {filename}")

            await send('Page.enable')
            await send('Runtime.enable')
            await eval_js("localStorage.setItem('juit_profile_configured', 'true'); localStorage.setItem('juit_onboarded_v1', 'true'); localStorage.setItem('juit_onboarding_completed', 'true');")
            await send('Page.navigate', {'url': 'http://127.0.0.1:3000'})
            await asyncio.sleep(2)
            await eval_js("window.App && window.App.closeAccountModal ? window.App.closeAccountModal() : null; document.getElementById('student-account-modal')?.classList.add('hidden');")

            # -------------------------------------------------------------
            # TEST 1: RESOURCE VAULT OVERHAUL
            # -------------------------------------------------------------
            print("\n==================================================")
            print("TEST 1: RESOURCE VAULT OVERHAUL")
            print("==================================================")
            await eval_js("window.App.switchView('resources');")
            await asyncio.sleep(0.5)

            # Check course cards
            course_cards_count = await eval_js("document.querySelectorAll('#resource-subject-filters .course-explorer-card').length")
            print(f"Course Explorer Cards rendered: {course_cards_count} (Expected: 6)")
            assert course_cards_count == 6, f"Expected 6 course cards, got {course_cards_count}"

            # Check type filters
            type_filters_count = await eval_js("document.querySelectorAll('#resource-type-filters .category-pill').length")
            print(f"Material Type Pills rendered: {type_filters_count} (Expected: 6)")
            assert type_filters_count == 6, f"Expected 6 type pills, got {type_filters_count}"

            # Check bundle banner in All Subjects / Tutorials
            has_bundles = await eval_js("document.querySelectorAll('#resources-grid-container .btn-preview-resource').length > 0")
            print(f"Resource items and preview buttons rendered: {has_bundles}")
            assert has_bundles, "Expected preview buttons rendered"

            # Click Mathematics course card
            await eval_js("document.querySelector('#resource-subject-filters [data-subject=\"Mathematics\"]')?.click();")
            await asyncio.sleep(0.3)
            math_items = await eval_js("document.querySelectorAll('#resources-grid-container .btn-preview-resource').length")
            active_subj = await eval_js("window.ResourcesController.activeSubject")
            print(f"Switched to: {active_subj}, Total Math items with Preview: {math_items}")
            assert active_subj == 'Mathematics', "Expected active subject to be Mathematics"

            # Test PDF Preview Modal
            await eval_js("document.querySelector('#resources-grid-container .btn-preview-resource')?.click();")
            await asyncio.sleep(0.5)
            modal_visible = await eval_js("!document.getElementById('pdf-preview-modal')?.classList.contains('hidden')")
            modal_title = await eval_js("document.getElementById('preview-modal-title')?.textContent")
            iframe_src = await eval_js("document.getElementById('preview-modal-iframe')?.src")
            print(f"PDF Preview Modal visible: {modal_visible}, Title: '{modal_title}', Iframe src: {iframe_src}")
            assert modal_visible, "Expected modal to be visible"
            assert 'vault/' in iframe_src or '.pdf' in iframe_src, f"Expected vault PDF in iframe, got {iframe_src}"

            # Close Preview Modal
            await eval_js("window.ResourcesController.closePreviewModal();")
            await asyncio.sleep(0.3)
            modal_closed = await eval_js("document.getElementById('pdf-preview-modal')?.classList.contains('hidden')")
            print(f"PDF Preview Modal closed: {modal_closed}")
            assert modal_closed, "Expected modal to be hidden"

            # Reset filters
            await eval_js("window.ResourcesController.resetFilters();")
            await asyncio.sleep(0.3)
            await screenshot('scripts/check_new_resource_vault.png')

            # -------------------------------------------------------------
            # TEST 2: WAYFINDER 3D CAMPUS MAP
            # -------------------------------------------------------------
            print("\n==================================================")
            print("TEST 2: WAYFINDER 3D CAMPUS MAP")
            print("==================================================")
            await eval_js("window.App.switchView('campus');")
            await asyncio.sleep(0.5)

            is_3d_state = await eval_js("window.CampusMap.is3DMode")
            container_has_3d = await eval_js("document.getElementById('map-canvas-container')?.classList.contains('map-mode-3d')")
            svg_transform = await eval_js("window.getComputedStyle(document.getElementById('campus-vector-svg')).transform")
            print(f"CampusMap.is3DMode: {is_3d_state}")
            print(f"Container class 'map-mode-3d': {container_has_3d}")
            print(f"Computed SVG Transform: {svg_transform}")

            assert is_3d_state, "Expected CampusMap.is3DMode to be True"
            assert container_has_3d, "Expected container to have map-mode-3d class"
            assert svg_transform != 'none', "Expected computed transform not to be 'none'"

            # Test 2D Toggle
            await eval_js("window.CampusMap.set3DMode(false);")
            await asyncio.sleep(0.3)
            container_has_2d = await eval_js("document.getElementById('map-canvas-container')?.classList.contains('map-mode-2d')")
            print(f"Switched to 2D -> container has 'map-mode-2d': {container_has_2d}")
            assert container_has_2d, "Expected container to have map-mode-2d"

            # Switch back to 3D
            await eval_js("window.CampusMap.set3DMode(true);")
            await asyncio.sleep(0.3)
            container_back_3d = await eval_js("document.getElementById('map-canvas-container')?.classList.contains('map-mode-3d')")
            print(f"Switched back to 3D -> container has 'map-mode-3d': {container_back_3d}")
            assert container_back_3d, "Expected container to have map-mode-3d"
            await screenshot('scripts/check_new_3d_campus_map.png')

            # -------------------------------------------------------------
            # TEST 3: FOCUS SESSION POMODORO TIMER
            # -------------------------------------------------------------
            print("\n==================================================")
            print("TEST 3: FOCUS SESSION POMODORO TIMER")
            print("==================================================")
            await eval_js("window.App.switchView('utilities');")
            await asyncio.sleep(0.5)

            initial_display = await eval_js("document.getElementById('pomo-time-display')?.textContent")
            print(f"Initial Timer Display: '{initial_display}' (Expected: '25:00')")
            assert initial_display == '25:00', f"Expected '25:00', got {initial_display}"

            # Click Start
            print("Clicking Start Session (#btn-pomo-start-pause)...")
            await eval_js("document.getElementById('btn-pomo-start-pause')?.click();")
            await asyncio.sleep(0.2)
            running_state = await eval_js("window.UtilitiesController.timerState")
            print(f"Timer state after click: {running_state} (Expected: 'running')")
            assert running_state == 'running', f"Expected 'running', got {running_state}"

            # Wait 2.2 seconds for ticks
            await asyncio.sleep(2.2)
            display_after_2s = await eval_js("document.getElementById('pomo-time-display')?.textContent")
            print(f"Timer Display after 2s: '{display_after_2s}' (Expected: '24:58' or '24:57')")
            assert display_after_2s != '25:00', "Expected timer to tick down"

            # Pause timer
            print("Clicking Pause Session (#btn-pomo-start-pause)...")
            await eval_js("document.getElementById('btn-pomo-start-pause')?.click();")
            await asyncio.sleep(0.2)
            paused_state = await eval_js("window.UtilitiesController.timerState")
            print(f"Timer state after pause: {paused_state} (Expected: 'paused')")
            assert paused_state == 'paused', f"Expected 'paused', got {paused_state}"

            # Test Short Break (5m)
            print("Clicking Short Break (5m) (#btn-pomo-short)...")
            await eval_js("document.getElementById('btn-pomo-short')?.click();")
            await asyncio.sleep(0.2)
            short_display = await eval_js("document.getElementById('pomo-time-display')?.textContent")
            print(f"Short break display: '{short_display}' (Expected: '05:00')")
            assert short_display == '05:00', f"Expected '05:00', got {short_display}"

            # Test Long Break (15m)
            print("Clicking Long Break (15m) (#btn-pomo-long)...")
            await eval_js("document.getElementById('btn-pomo-long')?.click();")
            await asyncio.sleep(0.2)
            long_display = await eval_js("document.getElementById('pomo-time-display')?.textContent")
            print(f"Long break display: '{long_display}' (Expected: '15:00')")
            assert long_display == '15:00', f"Expected '15:00', got {long_display}"

            # Test Reset (#btn-pomo-reset)
            print("Clicking Reset (#btn-pomo-reset)...")
            await eval_js("document.getElementById('btn-pomo-reset')?.click();")
            await asyncio.sleep(0.2)
            reset_display = await eval_js("document.getElementById('pomo-time-display')?.textContent")
            print(f"Display after reset: '{reset_display}' (Expected: '15:00')")
            assert reset_display == '15:00', f"Expected '15:00', got {reset_display}"

            # Switch back to Focus (25m) and verify
            await eval_js("document.getElementById('btn-pomo-focus')?.click();")
            await asyncio.sleep(0.2)
            focus_display = await eval_js("document.getElementById('pomo-time-display')?.textContent")
            print(f"Display back to Focus: '{focus_display}' (Expected: '25:00')")
            assert focus_display == '25:00', f"Expected '25:00', got {focus_display}"

            await screenshot('scripts/check_new_utilities_pomodoro.png')

            print("\n==================================================")
            print(">>> ALL THREE USER FIXES VALIDATED PERFECTLY! <<<")
            print("==================================================")

    finally:
        proc.kill()

if __name__ == '__main__':
    asyncio.run(run_tests())
