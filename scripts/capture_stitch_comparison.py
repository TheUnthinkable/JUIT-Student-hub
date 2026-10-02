import subprocess, time, json, urllib.request, websockets, asyncio, base64

async def capture(url, out_path, width=1440, height=900, evaluate_js=None):
    edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    user_data = r'C:\Users\Admin\AppData\Local\Temp\edge_inspect_stitch_' + str(int(time.time()*1000))[-6:]
    port = 9230
    cmd = [edge_path, '--headless=new', '--disable-gpu', f'--remote-debugging-port={port}', f'--user-data-dir={user_data}', f'--window-size={width},{height}']
    proc = subprocess.Popen(cmd)
    await asyncio.sleep(2)
    try:
        req = urllib.request.urlopen(f'http://127.0.0.1:{port}/json')
        targets = json.loads(req.read().decode())
        page_target = next(t for t in targets if t.get('type') == 'page')
        ws_url = page_target.get('webSocketDebuggerUrl')
        async with websockets.connect(ws_url, max_size=20*1024*1024) as ws:
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
            await send('Page.enable')
            await send('Runtime.enable')
            if evaluate_js:
                await send('Page.addScriptToEvaluateOnNewDocument', {'source': evaluate_js})
            await send('Page.navigate', {'url': url})
            await asyncio.sleep(2.5)
            if evaluate_js:
                res_eval = await send('Runtime.evaluate', {'expression': evaluate_js})
                if 'exceptionDetails' in res_eval:
                    print('Eval error:', res_eval['exceptionDetails'])
                await asyncio.sleep(1.0)
            res = await send('Page.captureScreenshot', {'format': 'png'})
            with open(out_path, 'wb') as f:
                f.write(base64.b64decode(res['data']))
            print(f'Captured {out_path}')
    finally:
        proc.terminate()

async def main():
    stitch_dash_url = 'file:///c:/Users/Admin/Desktop/JuitTimttable/scripts/stitch_screens/DESKTOP_JUIT_Student_Hub_-_Desktop_Dashboard.html'
    stitch_tt_url = 'file:///c:/Users/Admin/Desktop/JuitTimttable/scripts/stitch_screens/DESKTOP_JUIT_Student_Hub_-_Desktop_Timetable.html'
    stitch_campus_url = 'file:///c:/Users/Admin/Desktop/JuitTimttable/scripts/stitch_screens/DESKTOP_JUIT_Student_Hub_-_Desktop_Campus_Map.html'
    stitch_resources_url = 'file:///c:/Users/Admin/Desktop/JuitTimttable/scripts/stitch_screens/DESKTOP_JUIT_Student_Hub_-_Desktop_Resource_Hub.html'
    
    curr_dash_url = 'http://127.0.0.1:8000/#dash'
    curr_tt_url = 'http://127.0.0.1:8000/#timetable'
    curr_campus_url = 'http://127.0.0.1:8000/#campus'
    curr_resources_url = 'http://127.0.0.1:8000/#resources'
    
    def get_view_js(view_name):
        return f"""
        (function() {{
            try {{
                localStorage.setItem('juit_student_profile', JSON.stringify({{name:'JUIT Scholar',batch:'26BT16',branch:'CSE',semester:1,onboarded:true}}));
                localStorage.setItem('juit_onboarded_v1', 'true');
                var m = document.getElementById('onboarding-modal-backdrop');
                if (m) {{ m.classList.remove('open'); m.style.display = 'none'; }}
                if (window.App && typeof window.App.switchView === 'function') {{
                    window.App.switchView('{view_name}');
                }}
            }} catch(e) {{
                console.error('Bypass error:', e);
            }}
        }})();
        """

    await capture(curr_dash_url, 'current_desktop_dash.png', evaluate_js=get_view_js('dash'))
    await capture(curr_tt_url, 'current_desktop_timetable.png', evaluate_js=get_view_js('timetable'))
    await capture(curr_campus_url, 'current_desktop_campus.png', evaluate_js=get_view_js('campus'))
    await capture(curr_resources_url, 'current_desktop_resources.png', evaluate_js=get_view_js('resources'))

asyncio.run(main())
