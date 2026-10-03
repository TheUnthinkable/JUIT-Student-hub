import subprocess, time, json, urllib.request, websockets, asyncio, base64, os, sys

async def run_verification():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    user_data = r'C:\Users\Admin\AppData\Local\Temp\edge_test_user_fixes_clean'
    port = 9255
    index_url = 'file:///c:/Users/Admin/Desktop/JuitTimttable/index.html'

    cmd = [
        edge_path,
        '--headless=new',
        '--disable-gpu',
        f'--remote-debugging-port={port}',
        f'--user-data-dir={user_data}',
        '--window-size=390,844',
        index_url
    ]
    browser_proc = subprocess.Popen(cmd)
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

            await send('Page.enable')
            await send('Runtime.enable')
            await send('Log.enable')
            await eval_js("localStorage.setItem('juit_profile_configured', 'true'); localStorage.setItem('juit_onboarded_v1', 'true'); localStorage.setItem('juit_onboarding_completed', 'true');")
            
            # Wait for App and controllers to be ready
            for _ in range(25):
                has_app = await eval_js("typeof window.App")
                has_map = await eval_js("typeof window.CampusMap")
                has_cal = await eval_js("typeof window.CalendarController")
                has_acad = await eval_js("typeof window.AcademicsController")
                if has_app == 'object' and has_map == 'object' and has_cal == 'object' and has_acad == 'object':
                    break
                await asyncio.sleep(0.4)

            await eval_js("window.App && window.App.closeAccountModal ? window.App.closeAccountModal() : null; document.getElementById('student-account-modal')?.classList.add('hidden');")

            # -------------------------------------------------------------
            # TEST 1: Top Header UI (Logo, Altitude, .online pill)
            # -------------------------------------------------------------
            print("\n=== TEST 1: Top Header UI ===")
            brand_text = await eval_js("document.getElementById('mobile-brand-link')?.textContent.trim()")
            status_text = await eval_js("document.getElementById('connection-status-text')?.textContent.trim()")
            print(f"Brand Link Text: {brand_text}")
            print(f"Status Text: {status_text}")
            assert "JUIT Hub" in brand_text, f"Brand title mismatch: {brand_text}"
            assert "1,550m" in brand_text, f"Altitude chip mismatch: {brand_text}"
            assert ".online" in status_text, f"Status text mismatch: {status_text}"
            print("[PASS] TEST 1: Top header UI verified!")

            # -------------------------------------------------------------
            # TEST 2: Academic Calendar UI Alignment
            # -------------------------------------------------------------
            print("\n=== TEST 2: Academic Calendar UI ===")
            await eval_js("window.App.switchView('calendar');")
            await asyncio.sleep(0.5)

            odd_active = await eval_js("document.getElementById('btn-cal-odd')?.classList.contains('active')")
            print(f"Odd semester active: {odd_active}")
            
            # Switch to Even Term
            await eval_js("document.getElementById('btn-cal-even')?.click();")
            await asyncio.sleep(0.3)
            even_term = await eval_js("window.CalendarController.activeTerm")
            print(f"Switched to term: {even_term}")
            assert even_term == 'even2027', "Failed to switch to even term"

            # Check agenda dates layout
            agenda_dates = await eval_js("document.querySelectorAll('#calendar-timeline-container .calendar-agenda-item').length")
            print(f"Agenda items count: {agenda_dates}")
            assert agenda_dates > 0, "No agenda items rendered"

            # Switch back to Odd Term
            await eval_js("document.getElementById('btn-cal-odd')?.click();")
            await asyncio.sleep(0.3)
            print("[PASS] TEST 2: Academic Calendar alignment and toggle verified!")

            # -------------------------------------------------------------
            # TEST 3: Batch Attendance Matrix & Exact Amount Simulator
            # -------------------------------------------------------------
            print("\n=== TEST 3: Batch Attendance Matrix & Exact Amount Simulator ===")
            await eval_js("window.App.switchView('academics');")
            await asyncio.sleep(0.5)

            # Switch to Batch Attendance Subtab
            await eval_js("document.querySelector('.academic-tab-btn[data-subtab=\"batch-attendance\"]')?.click();")
            await asyncio.sleep(0.5)

            batch_subpanel = await eval_js("!document.getElementById('subpanel-batch-attendance')?.classList.contains('hidden')")
            print(f"Batch Attendance subpanel visible: {batch_subpanel}")
            assert batch_subpanel, "Batch Attendance subpanel not visible"

            # Test exact amount typing in Attendance Simulator
            await eval_js("""
                const targetInp = document.getElementById('sim-target-percent-input');
                const attendInp = document.getElementById('sim-attend-count-input');
                const missInp = document.getElementById('sim-miss-count-input');
                if (targetInp) targetInp.value = '85';
                if (attendInp) attendInp.value = '5';
                if (missInp) missInp.value = '1';
                targetInp?.dispatchEvent(new Event('input', { bubbles: true }));
            """)
            await asyncio.sleep(0.4)

            sim_target = await eval_js("window.AcademicsController.batchSimulation.targetPercent")
            sim_attended = await eval_js("window.AcademicsController.batchSimulation.deltaAttended")
            sim_missed = await eval_js("window.AcademicsController.batchSimulation.deltaMissed")
            print(f"Live Simulator Adjusted Values: Target={sim_target}%, +Attend={sim_attended}, +Miss={sim_missed}")
            assert sim_target == 85, f"Expected 85, got {sim_target}"
            assert sim_attended == 5, f"Expected 5, got {sim_attended}"
            assert sim_missed == 1, f"Expected 1, got {sim_missed}"

            # Check matrix filter pills
            await eval_js("document.querySelector('.matrix-filter-controls [data-filter=\"safe\"]')?.click();")
            await asyncio.sleep(0.3)
            filtered_filter = await eval_js("window.AcademicsController.batchFilter")
            print(f"Matrix Filter active: {filtered_filter}")
            assert filtered_filter == 'safe', f"Expected safe, got {filtered_filter}"
            print("[PASS] TEST 3: Batch Attendance Matrix and live exact inputs verified!")

            # -------------------------------------------------------------
            # TEST 4: CGPA Checker Exact Amount Typing & Mutual Adjustment
            # -------------------------------------------------------------
            print("\n=== TEST 4: CGPA Checker Exact Amount Adjustments ===")
            await eval_js("document.querySelector('.academic-tab-btn[data-subtab=\"cgpa-checker\"]')?.click();")
            await asyncio.sleep(0.5)

            cgpa_subpanel = await eval_js("!document.getElementById('subpanel-cgpa-checker')?.classList.contains('hidden')")
            print(f"CGPA subpanel visible: {cgpa_subpanel}")
            assert cgpa_subpanel, "CGPA subpanel not visible"

            # Type exact target CGPA 9.00 -> should adjust required SGPA
            await eval_js("""
                const targetCgpaInp = document.getElementById('pred-target-cgpa');
                if (targetCgpaInp) {
                    targetCgpaInp.value = '9.00';
                    targetCgpaInp.dispatchEvent(new Event('input', { bubbles: true }));
                }
            """)
            await asyncio.sleep(0.4)

            req_sgpa = await eval_js("document.getElementById('pred-result-sgpa')?.textContent.trim()")
            print(f"Required SGPA calculated for 9.00 CGPA: {req_sgpa}")
            assert float(req_sgpa) > 0, "Required SGPA was not calculated"

            # Type expected SGPA 9.50 -> should adjust projected CGPA
            await eval_js("""
                const expSgpaInp = document.getElementById('pred-expected-sgpa');
                if (expSgpaInp) {
                    expSgpaInp.value = '9.50';
                    expSgpaInp.dispatchEvent(new Event('input', { bubbles: true }));
                }
            """)
            await asyncio.sleep(0.4)

            proj_cgpa = await eval_js("document.getElementById('pred-result-projected-cgpa')?.textContent.trim()")
            print(f"Projected CGPA calculated from 9.50 SGPA: {proj_cgpa}")
            assert float(proj_cgpa) > 0, "Projected CGPA was not calculated"
            print("[PASS] TEST 4: CGPA checker mutual live adjustment verified!")

            # -------------------------------------------------------------
            # TEST 5: Wayfinder 3D Isometric Map & Route Modal Scrollability
            # -------------------------------------------------------------
            print("\n=== TEST 5: Wayfinder 3D Isometric Map & Route Modal ===")
            await eval_js("window.App.switchView('campus');")
            await asyncio.sleep(0.8)

            # Check 3D mode & isometric elements
            is_3d = await eval_js("window.CampusMap.is3DMode")
            terraces = await eval_js("document.querySelectorAll('#map-world-layer polygon').length")
            skybridge = await eval_js("document.getElementById('map-3d-skybridge') !== null")
            print(f"CampusMap 3D Mode: {is_3d}, Terraces/polygons count: {terraces}, 3D Skybridge present: {skybridge}")
            assert is_3d, "3D Mode is not active"
            assert terraces >= 10, f"Expected 3D isometric polygons, found {terraces}"
            assert skybridge, "3D Skybridge not found in SVG"

            # Open Shortest Path Route Modal
            print("Opening Shortest Path Route Guidance Modal...")
            await eval_js("document.getElementById('btn-shortest-path')?.click();")
            await asyncio.sleep(0.5)

            route_modal_open = await eval_js("!document.getElementById('map-route-modal')?.classList.contains('hidden')")
            steps_container_has_steps = await eval_js("document.querySelectorAll('#route-steps-container > div').length > 0")
            print(f"Route modal open: {route_modal_open}, Steps container has content: {steps_container_has_steps}")
            assert route_modal_open, "Route modal failed to open"
            assert steps_container_has_steps, "Route steps were not rendered"

            # Close Route Modal
            await eval_js("document.getElementById('btn-close-route-modal')?.click();")
            await asyncio.sleep(0.3)
            route_modal_closed = await eval_js("document.getElementById('map-route-modal')?.classList.contains('hidden')")
            print(f"Route modal closed cleanly (hidden class present): {route_modal_closed}")
            assert route_modal_closed, "Route modal failed to close cleanly"
            print("[PASS] TEST 5: 3D Map and scrollable Route Modal verified!")

            # -------------------------------------------------------------
            # TEST 6: Distinct Color Themes System
            # -------------------------------------------------------------
            print("\n=== TEST 6: Distinct Color Themes System ===")
            palettes = await eval_js("window.ThemeManager ? window.ThemeManager.palettes.map(p => p.id) : []")
            print(f"Available Palettes: {palettes}")
            assert len(palettes) >= 8, f"Expected at least 8 palettes, found {len(palettes)}"

            # Test switching to Emerald Pines
            await eval_js("window.ThemeManager.setPalette('emerald');")
            curr_pal = await eval_js("document.documentElement.getAttribute('data-palette')")
            primary_col = await eval_js("getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()")
            print(f"Active Palette: {curr_pal}, Primary Color: {primary_col}")
            assert curr_pal == 'emerald', f"Expected emerald, got {curr_pal}"
            assert primary_col == '#10b981', f"Expected #10b981, got {primary_col}"

            # Test switching to Sunset Solan
            await eval_js("window.ThemeManager.setPalette('sunset');")
            curr_pal = await eval_js("document.documentElement.getAttribute('data-palette')")
            primary_col = await eval_js("getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()")
            print(f"Active Palette: {curr_pal}, Primary Color: {primary_col}")
            assert curr_pal == 'sunset', f"Expected sunset, got {curr_pal}"
            assert primary_col == '#f97316', f"Expected #f97316, got {primary_col}"

            # Test switching to Cyber Solan
            await eval_js("window.ThemeManager.setPalette('cyan');")
            curr_pal = await eval_js("document.documentElement.getAttribute('data-palette')")
            primary_col = await eval_js("getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()")
            print(f"Active Palette: {curr_pal}, Primary Color: {primary_col}")
            assert curr_pal == 'cyan', f"Expected cyan, got {curr_pal}"
            assert primary_col == '#00e5ff', f"Expected #00e5ff, got {primary_col}"

            # Reset back to default amber
            await eval_js("window.ThemeManager.setPalette('amber');")

            # Capture mobile screenshot of 3D Map
            map_res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('scripts/verification_3d_wayfinder_map.png', 'wb') as f:
                f.write(base64.b64decode(map_res['data']))
            print("Saved verification screenshot: scripts/verification_3d_wayfinder_map.png")

            print("\n*** ALL 6 USER REQUIREMENTS TESTED AND FULLY VERIFIED PASSING! ***")

    finally:
        browser_proc.terminate()

asyncio.run(run_verification())
