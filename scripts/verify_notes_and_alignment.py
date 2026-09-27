import subprocess
import time
import json
import urllib.request
import asyncio
import base64
import os
import websockets

async def run_verification():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"C:\Users\Admin\AppData\Local\Temp\edge_debug_verify"
    port = 9223
    
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--window-size=390,844",
        "http://127.0.0.1:8000"
    ]
    
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    await asyncio.sleep(2)
    
    try:
        req = urllib.request.urlopen(f"http://127.0.0.1:{port}/json")
        targets = json.loads(req.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target.get('webSocketDebuggerUrl')
        
        async with websockets.connect(ws_url, max_size=20*1024*1024) as ws:
            msg_id = 1
            async def send(method, params=None):
                nonlocal msg_id
                m_id = msg_id
                msg_id += 1
                await ws.send(json.dumps({"id": m_id, "method": method, "params": params or {}}))
                while True:
                    res = json.loads(await ws.recv())
                    if res.get("id") == m_id:
                        return res.get("result", {})

            await send("Page.enable")
            await send("Runtime.enable")
            await send("DOM.enable")
            
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            
            # Navigate to local server
            await send("Page.navigate", {"url": "http://127.0.0.1:8000"})
            
            # Wait for data to load
            for _ in range(20):
                await asyncio.sleep(0.5)
                check = await send("Runtime.evaluate", {
                    "expression": "Boolean(window.TimetableController && window.TimetableController.data && Object.keys(window.TimetableController.data).length > 0)"
                })
                if check.get('result', {}).get('value'):
                    print("Timetable data ready!")
                    break
                    
            # Dismiss any onboarding and switch to Timetable view
            await send("Runtime.evaluate", {
                "expression": """
                (() => {
                    localStorage.setItem('juit_onboarded_v1', 'true');
                    localStorage.setItem('juit_onboarded_v2', 'true');
                    const modal = document.getElementById('onboarding-modal-backdrop');
                    if (modal) {
                        modal.classList.remove('open');
                        modal.style.display = 'none';
                    }
                    if (window.App) {
                        window.App.switchView('timetable');
                    }
                })()
                """
            })
            await asyncio.sleep(1)
            
            # Inspect timetable cards across Monday to Friday
            audit_result = await send("Runtime.evaluate", {
                "expression": """
                (() => {
                    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
                    const report = [];
                    
                    for (const day of days) {
                        window.TimetableController.activeDay = day;
                        window.TimetableController.renderSchedule();
                        
                        const cards = Array.from(document.querySelectorAll('#timetable-classes-list .class-card'));
                        for (const c of cards) {
                            const name = c.querySelector('.class-course-name')?.textContent?.trim() || '';
                            const code = c.querySelector('.class-code-tag')?.textContent?.trim() || '';
                            const downloadBanner = c.querySelector('.btn-class-download-banner');
                            const downloadHref = downloadBanner ? downloadBanner.getAttribute('href') : null;
                            const downloadText = downloadBanner ? downloadBanner.textContent.trim().replace(/\\s+/g, ' ') : null;
                            
                            const primaryRow = c.querySelector('.card-action-primary-row');
                            const rowChildren = primaryRow ? primaryRow.children.length : 0;
                            
                            report.push({
                                day,
                                name,
                                code,
                                hasNotes: !!downloadBanner,
                                downloadHref,
                                downloadText,
                                primaryRowChildren: rowChildren
                            });
                        }
                    }
                    return JSON.stringify(report);
                })()
                """
            })
            
            report_data = json.loads(audit_result.get('result', {}).get('value', '[]'))
            print(f"Total class cards inspected: {len(report_data)}")
            
            errors = []
            notes_found = 0
            empty_notes_count = 0
            
            for item in report_data:
                name = item['name']
                code = item['code']
                has_notes = item['hasNotes']
                href = item['downloadHref'] or ''
                
                # Check SDF
                if 'SDF' in name or 'CI112' in code or 'CI172' in code:
                    if not has_notes:
                        errors.append(f"SDF card '{name}' ({code}) on {item['day']} should have SDF notes, but has none!")
                    elif 'Physics' in href:
                        errors.append(f"CRITICAL BUG: SDF card '{name}' ({code}) has Physics notes: {href}")
                    elif 'SDF' in href:
                        notes_found += 1
                
                # Check Physics
                elif 'Physics' in name or 'PH111' in code or 'PH171' in code:
                    if not has_notes:
                        errors.append(f"Physics card '{name}' ({code}) on {item['day']} should have Physics notes, but has none!")
                    elif 'Physics' in href:
                        notes_found += 1
                
                # Check English
                elif 'English' in name or 'HS111' in code or 'HS171' in code:
                    if not has_notes:
                        errors.append(f"English card '{name}' ({code}) on {item['day']} should have English notes, but has none!")
                    elif 'English' in href:
                        notes_found += 1
                        
                # Check Mathematics / Other
                elif 'Mathematics' in name or 'MA111' in code or 'MA112' in code or 'MA113' in code:
                    if has_notes:
                        errors.append(f"BUG: Math card '{name}' ({code}) has notes ({href}) but notes should be empty!")
                    else:
                        empty_notes_count += 1
                        
                # Check primary row children (Must always be 3: attendance + venue + inspect)
                if item['primaryRowChildren'] != 3:
                    errors.append(f"Misaligned primary row on '{name}' ({code}): has {item['primaryRowChildren']} items, expected 3!")

            print(f"Notes found correctly: {notes_found}")
            print(f"Subjects correctly kept empty: {empty_notes_count}")
            print(f"Errors detected: {len(errors)}")
            for err in errors:
                print(" - " + err)
                
            # Sample first few for user confidence
            print("\nSample Card Audits:")
            for item in report_data[:8]:
                print(f"[{item['day']}] {item['name']} ({item['code']}): hasNotes={item['hasNotes']}, download={item['downloadText']}, primaryItems={item['primaryRowChildren']}")

            # Switch back to Monday, scroll down to cards, and capture Dark mode timetable screenshot
            await send("Runtime.evaluate", {
                "expression": """
                (() => {
                    document.documentElement.setAttribute('data-theme', 'slate-navy');
                    window.TimetableController.activeDay = 'MON';
                    window.TimetableController.renderSchedule();
                    const list = document.getElementById('timetable-classes-list');
                    if (list && list.lastElementChild) {
                        list.lastElementChild.scrollIntoView({ behavior: 'instant', block: 'end' });
                    }
                })()
                """
            })
            await asyncio.sleep(0.6)
            scr = await send("Page.captureScreenshot", {"format": "png"})
            with open("C:/Users/Admin/.gemini/antigravity-ide/brain/2dcded15-3a7f-4da7-8fc0-0d9935b31257/mobile_timetable_dark_math_empty.png", "wb") as f:
                f.write(base64.b64decode(scr['data']))
            print("\nSaved mobile_timetable_dark_math_empty.png")

            # Capture Light mode timetable screenshot at bottom
            await send("Runtime.evaluate", {
                "expression": """
                (() => {
                    document.documentElement.setAttribute('data-theme', 'light');
                    window.TimetableController.renderSchedule();
                    const list = document.getElementById('timetable-classes-list');
                    if (list && list.lastElementChild) {
                        list.lastElementChild.scrollIntoView({ behavior: 'instant', block: 'end' });
                    }
                })()
                """
            })
            await asyncio.sleep(0.6)
            scr_light = await send("Page.captureScreenshot", {"format": "png"})
            with open("C:/Users/Admin/.gemini/antigravity-ide/brain/2dcded15-3a7f-4da7-8fc0-0d9935b31257/mobile_timetable_light_math_empty.png", "wb") as f:
                f.write(base64.b64decode(scr_light['data']))
            print("Saved mobile_timetable_light_math_empty.png")

            # Capture Desktop view
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 1280,
                "height": 800,
                "deviceScaleFactor": 1,
                "mobile": False
            })
            await send("Runtime.evaluate", {
                "expression": """
                (() => {
                    document.documentElement.setAttribute('data-theme', 'slate-navy');
                    window.TimetableController.activeDay = 'MON';
                    window.TimetableController.renderSchedule();
                })()
                """
            })
            await asyncio.sleep(0.6)
            scr_desk = await send("Page.captureScreenshot", {"format": "png"})
            with open("C:/Users/Admin/.gemini/antigravity-ide/brain/2dcded15-3a7f-4da7-8fc0-0d9935b31257/desktop_timetable_slate_navy.png", "wb") as f:
                f.write(base64.b64decode(scr_desk['data']))
            print("Saved desktop_timetable_slate_navy.png")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except:
            proc.kill()

if __name__ == "__main__":
    asyncio.run(run_verification())
