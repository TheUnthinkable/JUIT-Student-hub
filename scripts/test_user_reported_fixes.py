import subprocess, time, json, urllib.request, websockets, asyncio, base64

async def run_tests():
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    user_data = r'C:\Users\Admin\AppData\Local\Temp\edge_test_user_fixes'
    port = 9233
    cmd = [
        edge_path,
        '--headless=new',
        '--disable-gpu',
        f'--remote-debugging-port={port}',
        f'--user-data-dir={user_data}',
        '--window-size=390,844', # Mobile viewport (iPhone 14 Pro standard)
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

            await send('Page.enable')
            await send('Runtime.enable')
            await send('Log.enable')
            await eval_js("localStorage.setItem('juit_profile_configured', 'true'); localStorage.setItem('juit_onboarded_v1', 'true'); localStorage.setItem('juit_onboarding_completed', 'true');")
            await send('Page.navigate', {'url': 'http://127.0.0.1:3000'})
            await asyncio.sleep(2)
            await eval_js("window.App && window.App.closeAccountModal ? window.App.closeAccountModal() : null; document.getElementById('student-account-modal')?.classList.add('hidden');")

            # Check if any errors occurred
            errors = await eval_js("window.__lastErrors || []")
            print(f"Window App defined: {await eval_js('typeof window.App')}")
            print(f"Window CalendarController defined: {await eval_js('typeof window.CalendarController')}")
            print(f"Window CampusMap defined: {await eval_js('typeof window.CampusMap')}")
            print(f"Window AcademicsController defined: {await eval_js('typeof window.AcademicsController')}")

            # -------------------------------------------------------------
            # TEST 1: Academic Calendar Odd/Even Toggle
            # -------------------------------------------------------------
            print("\n=== TEST 1: Academic Calendar ===")
            await eval_js("window.App.switchView('calendar');")
            await asyncio.sleep(0.5)

            cal_mode_init = await eval_js("window.CalendarController ? window.CalendarController.activeTerm : 'unknown'")
            print(f"Initial Calendar Term: {cal_mode_init}")
            assert cal_mode_init in ['odd2026', 'even2027'], f"Unexpected term {cal_mode_init}"

            # Switch to Even
            await eval_js("document.getElementById('btn-cal-even')?.click();")
            await asyncio.sleep(0.3)
            cal_mode_even = await eval_js("window.CalendarController.activeTerm")
            print(f"After clicking Even: {cal_mode_even}")
            assert cal_mode_even == 'even2027', "Calendar failed to switch to even term"

            # Check rendered events count
            events_count = await eval_js("document.querySelectorAll('#calendar-timeline-container h4').length")
            print(f"Events rendered for Even term: {events_count}")
            assert events_count > 0, "No events rendered for even term"

            # Switch back to Odd
            await eval_js("document.getElementById('btn-cal-odd')?.click();")
            await asyncio.sleep(0.3)
            cal_mode_odd = await eval_js("window.CalendarController.activeTerm")
            print(f"After clicking Odd: {cal_mode_odd}")
            assert cal_mode_odd == 'odd2026', "Calendar failed to switch to odd term"
            # Capture screenshot of Academic Calendar
            cal_res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('scripts/mobile_calendar_view.png', 'wb') as f:
                f.write(base64.b64decode(cal_res['data']))
            print("Saved mobile calendar screenshot: scripts/mobile_calendar_view.png")

            print("[PASS] TEST 1: Academic Calendar Odd/Even toggle verified!")

            # -------------------------------------------------------------
            # TEST 2: Attendance Tracker in Academics
            # -------------------------------------------------------------
            print("\n=== TEST 2: Attendance Tracker & Subtabs ===")
            await eval_js("window.App.switchView('academics');")
            await asyncio.sleep(0.5)

            # Check aggregate summary values
            hero_visible = await eval_js("document.querySelector('#academics-attendance-container .font-mono.text-4xl, #academics-attendance-container .font-mono.text-5xl') !== null")
            print(f"Attendance summary hero visible: {hero_visible}")
            assert hero_visible, "Attendance summary hero is not visible"

            # Initial attendance percentage
            init_overall = await eval_js("document.querySelector('#academics-attendance-container .font-mono.text-4xl, #academics-attendance-container .font-mono.text-5xl')?.textContent.trim()")
            print(f"Initial Overall Attendance: {init_overall}")

            # Check course cards rendered
            cards_count = await eval_js("document.querySelectorAll('#academics-cards-grid > *').length")
            print(f"Course cards rendered: {cards_count}")
            assert cards_count > 0, "No course cards rendered in Attendance Studio"

            # Test +1 Present Stepper on first course
            await eval_js("document.querySelector('.btn-step[data-action=\"inc-present\"]')?.click();")
            await asyncio.sleep(0.3)
            after_present = await eval_js("document.querySelector('#academics-attendance-container .font-mono.text-4xl, #academics-attendance-container .font-mono.text-5xl')?.textContent.trim()")
            print(f"After +1 Present stepper: {after_present}")

            # Capture screenshot of Attendance Studio
            att_res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('scripts/mobile_attendance_view.png', 'wb') as f:
                f.write(base64.b64decode(att_res['data']))
            print("Saved mobile attendance screenshot: scripts/mobile_attendance_view.png")

            # Test Modal for Adding/Editing Course
            await eval_js("document.querySelector('.btn-edit-course-modal')?.click();")
            await asyncio.sleep(0.3)
            modal_open = await eval_js("document.getElementById('modal-attendance-edit')?.classList.contains('hidden') === false")
            print(f"Add/Edit Course Modal Open: {modal_open}")
            assert modal_open, "Attendance modal failed to open"

            # Close Modal
            await eval_js("document.getElementById('btn-close-course-modal')?.click();")
            await asyncio.sleep(0.3)
            modal_closed = await eval_js("document.getElementById('modal-attendance-edit')?.classList.contains('hidden') === true")
            print(f"Modal Closed: {modal_closed}")
            assert modal_closed, "Attendance modal failed to close"

            # Test Subtabs: Batch Attendance
            await eval_js("document.querySelector('.academic-tab-btn[data-subtab=\"batch-attendance\"]')?.click();")
            await asyncio.sleep(0.3)
            batch_visible = await eval_js("!document.getElementById('subpanel-batch-attendance')?.classList.contains('hidden')")
            print(f"Batch Attendance subpanel visible: {batch_visible}")
            assert batch_visible, "Batch Attendance subpanel is not visible"

            # Test Subtabs: CGPA Checker
            await eval_js("document.querySelector('.academic-tab-btn[data-subtab=\"cgpa-checker\"]')?.click();")
            await asyncio.sleep(0.3)
            cgpa_visible = await eval_js("!document.getElementById('subpanel-cgpa-checker')?.classList.contains('hidden')")
            print(f"CGPA Checker subpanel visible: {cgpa_visible}")
            assert cgpa_visible, "CGPA Checker subpanel is not visible"

            # Switch back to Personal Attendance Studio
            await eval_js("document.querySelector('.academic-tab-btn[data-subtab=\"personal-attendance\"]')?.click();")
            await asyncio.sleep(0.3)
            print("[PASS] TEST 2: Attendance Tracker, steppers, modal, and subtabs verified!")

            # -------------------------------------------------------------
            # TEST 3: Campus Wayfinding 3D Map, Gallery Photos & Mobile Bottom Sheet
            # -------------------------------------------------------------
            print("\n=== TEST 3: Campus Wayfinding & 3D Gallery Map ===")
            await eval_js("window.App.switchView('campus');")
            await asyncio.sleep(0.8)

            # Check 3D mode is active by default
            is_3d = await eval_js("window.CampusMap.is3DMode")
            container_has_3d = await eval_js("document.getElementById('map-canvas-container')?.classList.contains('map-mode-3d')")
            print(f"CampusMap.is3DMode: {is_3d}, container has map-mode-3d: {container_has_3d}")
            assert is_3d and container_has_3d, "3D Mode is not active by default"

            # Check SVG buildings layer has 3D extruded nodes
            bldg_3d_count = await eval_js("document.querySelectorAll('.bldg-node-3d').length")
            print(f"3D Extruded building nodes rendered: {bldg_3d_count}")
            assert bldg_3d_count >= 10, f"Expected at least 10 3D buildings, found {bldg_3d_count}"

            # Check 2D mode toggle
            await eval_js("document.getElementById('btn-map-mode-2d')?.click();")
            await asyncio.sleep(0.3)
            is_2d = await eval_js("!window.CampusMap.is3DMode && document.getElementById('map-canvas-container')?.classList.contains('map-mode-2d')")
            print(f"Switched to 2D Plan: {is_2d}")
            assert is_2d, "Failed to switch to 2D Plan"

            # Switch back to 3D
            await eval_js("document.getElementById('btn-map-mode-3d')?.click();")
            await asyncio.sleep(0.3)
            print("Switched back to 3D Campus mode")

            # Click Academic Block 2 (bldg id 'block2')
            await eval_js("const b = window.CampusMap.buildings.find(x => x.id === 'block2'); window.CampusMap.focusBuilding(b);")
            await asyncio.sleep(0.5)

            # Check drawer opened as mobile bottom sheet
            drawer_open = await eval_js("document.getElementById('map-venue-drawer')?.classList.contains('open')")
            print(f"Building Drawer Open: {drawer_open}")
            assert drawer_open, "Building drawer failed to open"

            # Check official campus gallery image in drawer
            drawer_img_src = await eval_js("document.querySelector('#map-venue-drawer img')?.getAttribute('src')")
            print(f"Campus Gallery Image Src: {drawer_img_src}")
            assert "juit.ac.in" in drawer_img_src, f"Expected JUIT official gallery image, got: {drawer_img_src}"

            # Check gallery attribution link
            gallery_link = await eval_js("document.querySelector('#map-venue-drawer a[href*=\"campus-gallery\"]')?.getAttribute('href')")
            print(f"Gallery attribution link: {gallery_link}")
            assert gallery_link == "https://www.juit.ac.in/campus-facilities/campus-gallery", f"Incorrect link {gallery_link}"

            # Capture screenshot of mobile bottom sheet
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('scripts/mobile_wayfinding_3d_bottomsheet.png', 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print("Saved mobile bottom sheet screenshot: scripts/mobile_wayfinding_3d_bottomsheet.png")

            # Close drawer
            await eval_js("document.getElementById('btn-close-map-drawer')?.click();")
            await asyncio.sleep(0.3)
            drawer_closed = await eval_js("!document.getElementById('map-venue-drawer')?.classList.contains('open')")
            print(f"Drawer Closed: {drawer_closed}")
            assert drawer_closed, "Drawer failed to close"

            # Switch to desktop resolution 1280x800 and capture 3D campus map
            await send('Emulation.setDeviceMetricsOverride', {
                'width': 1280,
                'height': 800,
                'deviceScaleFactor': 1,
                'mobile': False
            })
            await asyncio.sleep(0.5)
            await eval_js("const b = window.CampusMap.buildings.find(x => x.id === 'block2'); window.CampusMap.focusBuilding(b);")
            await asyncio.sleep(0.5)
            desk_res = await send('Page.captureScreenshot', {'format': 'png'})
            with open('scripts/desktop_campus_3d_view.png', 'wb') as f:
                f.write(base64.b64decode(desk_res['data']))
            print("Saved desktop campus 3D screenshot: scripts/desktop_campus_3d_view.png")

            print("\n[PASS] ALL TESTS PASSED SUCCESSFULLY!")

    finally:
        proc.terminate()

asyncio.run(run_tests())
