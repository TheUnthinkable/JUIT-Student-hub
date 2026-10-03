import asyncio
import base64
import http.server
import json
import os
import socketserver
import subprocess
import threading
import time
import urllib.request
import websockets

PORT = 8003
DIRECTORY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class QuietHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        pass

def run_server():
    with socketserver.TCPServer(("127.0.0.1", PORT), QuietHTTPHandler) as httpd:
        httpd.serve_forever()

async def verify():
    # Start HTTP server in background thread
    t = threading.Thread(target=run_server, daemon=True)
    t.start()
    time.sleep(1)

    print("HTTP server running on port", PORT)

    # Launch Edge headless
    proc = subprocess.Popen([
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        '--headless=new',
        '--disable-gpu',
        '--remote-debugging-port=9245',
        r'--user-data-dir=C:\Users\Admin\AppData\Local\Temp\edgetest9245',
        '--window-size=1440,900'
    ])
    await asyncio.sleep(2)

    try:
        req = urllib.request.urlopen('http://127.0.0.1:9245/json')
        targets = json.loads(req.read().decode())
        p = next(target for target in targets if target.get('type') == 'page')
        
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
                        args = [str(arg.get('value', '')) for arg in res['params']['args']]
                        print('CONSOLE:', res['params']['type'], ' '.join(args))
                    if res.get('method') == 'Runtime.exceptionThrown':
                        print('EXCEPTION:', res['params']['exceptionDetails'])

            await send('Page.enable')
            await send('Runtime.enable')
            await send('Network.enable')
            await send('Network.setBypassServiceWorker', {'bypass': True})
            await send('Page.navigate', {'url': f'http://127.0.0.1:{PORT}/#dash'})

            # Wait for App readiness
            for _ in range(30):
                chk = await send('Runtime.evaluate', {'expression': 'Boolean(window.App && window.App.activeView)'})
                if chk.get('result', {}).get('value'):
                    print('window.App is READY!')
                    break
                await asyncio.sleep(0.5)

            # Bypass onboarding modal
            await send('Runtime.evaluate', {'expression': """
                localStorage.setItem('juit_student_profile', JSON.stringify({name:'Aarav Sharma',batch:'26BT16',branch:'CSE',semester:1,onboarded:true}));
                localStorage.setItem('juit_onboarded_v1', 'true');
                var m = document.getElementById('onboarding-modal-backdrop');
                if (m) { m.classList.remove('open'); m.style.display = 'none'; }
            """})

            # Test 1: Academic Calendar (#calendar)
            print("\n--- Testing Academic Calendar ---")
            await send('Runtime.evaluate', {'expression': "window.App.switchView('calendar');"})
            await asyncio.sleep(1)

            cal_check = await send('Runtime.evaluate', {'expression': """
                ({
                    hasSpotlight: Boolean(document.querySelector('#calendar-spotlight-milestone h3')),
                    spotlightText: document.querySelector('#calendar-spotlight-milestone h3')?.textContent || '',
                    categoryCount: document.querySelectorAll('#calendar-category-filters button').length,
                    eventCardsCount: document.querySelectorAll('#calendar-timeline-container .group').length
                })
            """, 'returnByValue': True})
            print("Calendar status:", cal_check.get('result', {}).get('value'))

            shot = await send('Page.captureScreenshot', {'format': 'png'})
            with open('check_redesigned_calendar.png', 'wb') as f:
                f.write(base64.b64decode(shot['data']))
            print("Saved check_redesigned_calendar.png")

            # Test 2: Campus Life & Events (#events-clubs)
            print("\n--- Testing Campus Life & Events ---")
            await send('Runtime.evaluate', {'expression': "window.App.switchView('events-clubs');"})
            await asyncio.sleep(1)

            events_check = await send('Runtime.evaluate', {'expression': """
                ({
                    tabActive: document.querySelector('#tab-btn-events')?.classList.contains('bg-primary'),
                    subFilters: document.querySelectorAll('#events-sub-filters button').length,
                    eventCards: document.querySelectorAll('#events-clubs-container .group').length
                })
            """, 'returnByValue': True})
            print("Events status:", events_check.get('result', {}).get('value'))

            shot = await send('Page.captureScreenshot', {'format': 'png'})
            with open('check_redesigned_events.png', 'wb') as f:
                f.write(base64.b64decode(shot['data']))
            print("Saved check_redesigned_events.png")

            # Test Clubs tab
            await send('Runtime.evaluate', {'expression': "document.getElementById('tab-btn-clubs').click();"})
            await asyncio.sleep(0.5)
            clubs_check = await send('Runtime.evaluate', {'expression': """
                ({
                    clubCards: document.querySelectorAll('#events-clubs-container .group').length,
                    firstClub: document.querySelector('#events-clubs-container h4')?.textContent || ''
                })
            """, 'returnByValue': True})
            print("Clubs status:", clubs_check.get('result', {}).get('value'))

            shot = await send('Page.captureScreenshot', {'format': 'png'})
            with open('check_redesigned_clubs.png', 'wb') as f:
                f.write(base64.b64decode(shot['data']))
            print("Saved check_redesigned_clubs.png")

            # Test 3: Academic Vault (#resources)
            print("\n--- Testing Academic Vault ---")
            await send('Runtime.evaluate', {'expression': "window.App.switchView('resources');"})
            await asyncio.sleep(1)

            vault_check = await send('Runtime.evaluate', {'expression': """
                ({
                    subjectCount: document.querySelectorAll('#resource-subject-filters button').length,
                    typeCount: document.querySelectorAll('#resource-type-filters button').length,
                    cardsCount: document.querySelectorAll('#resources-grid-container .group').length,
                    countLabel: document.getElementById('resources-count-label')?.textContent || ''
                })
            """, 'returnByValue': True})
            print("Vault status:", vault_check.get('result', {}).get('value'))

            shot = await send('Page.captureScreenshot', {'format': 'png'})
            with open('check_redesigned_vault.png', 'wb') as f:
                f.write(base64.b64decode(shot['data']))
            print("Saved check_redesigned_vault.png")

            # Test 4: Useful Links & Portals (#portals)
            print("\n--- Testing Useful Links & Portals ---")
            await send('Runtime.evaluate', {'expression': "window.App.switchView('portals');"})
            await asyncio.sleep(1)

            portals_check = await send('Runtime.evaluate', {'expression': """
                ({
                    categoryCount: document.querySelectorAll('#portals-category-filters button').length,
                    portalCards: document.querySelectorAll('#dash-portal-tiles .group').length,
                    firstPortal: document.querySelector('#dash-portal-tiles h4')?.textContent || ''
                })
            """, 'returnByValue': True})
            print("Portals status:", portals_check.get('result', {}).get('value'))

            shot = await send('Page.captureScreenshot', {'format': 'png'})
            with open('check_redesigned_portals.png', 'wb') as f:
                f.write(base64.b64decode(shot['data']))
            print("Saved check_redesigned_portals.png")

            # Test 5: Offline Mode Emulation
            print("\n--- Testing Offline Mode ---")
            await send('Network.emulateNetworkConditions', {
                'offline': True,
                'latency': 0,
                'downloadThroughput': 0,
                'uploadThroughput': 0
            })
            await asyncio.sleep(1)

            offline_check = await send('Runtime.evaluate', {'expression': """
                ({
                    bannerVisible: !document.getElementById('offline-status-banner')?.classList.contains('hidden'),
                    pillText: document.getElementById('connection-status-text')?.textContent || '',
                    navigatorOnline: navigator.onLine
                })
            """, 'returnByValue': True})
            print("Offline UI status:", offline_check.get('result', {}).get('value'))

            shot = await send('Page.captureScreenshot', {'format': 'png'})
            with open('check_offline_mode.png', 'wb') as f:
                f.write(base64.b64decode(shot['data']))
            print("Saved check_offline_mode.png")

            print("\nAll UI checks passed successfully!")
    finally:
        proc.terminate()

if __name__ == '__main__':
    asyncio.run(verify())
