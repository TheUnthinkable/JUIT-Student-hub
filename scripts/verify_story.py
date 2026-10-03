import subprocess
import time
import json
import urllib.request
import asyncio
import base64
import os
import websockets

async def capture_story():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = r"C:\Users\Admin\AppData\Local\Temp\edge_story_test"
    port = 9245
    
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--window-size=440,900",
        "http://127.0.0.1:3000/story.html"
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
            
            # Wait for typewriter to type for 3 seconds
            await asyncio.sleep(3)
            
            # Capture Slide 0 in middle of typing
            shot_slide0 = await send("Page.captureScreenshot", {"format": "png"})
            with open("scripts/story_slide_0.png", "wb") as f:
                f.write(base64.b64decode(shot_slide0["data"]))
            print("Captured scripts/story_slide_0.png")
            
            # Switch to slide 1 (Timetable)
            await send("Runtime.evaluate", {
                "expression": "showSlide(1);"
            })
            await asyncio.sleep(3)
            shot_slide1 = await send("Page.captureScreenshot", {"format": "png"})
            with open("scripts/story_slide_1_timetable.png", "wb") as f:
                f.write(base64.b64decode(shot_slide1["data"]))
            print("Captured scripts/story_slide_1_timetable.png")

            # Switch to slide 2 (Bus)
            await send("Runtime.evaluate", {
                "expression": "showSlide(2);"
            })
            await asyncio.sleep(3)
            shot_slide2 = await send("Page.captureScreenshot", {"format": "png"})
            with open("scripts/story_slide_2_bus.png", "wb") as f:
                f.write(base64.b64decode(shot_slide2["data"]))
            print("Captured scripts/story_slide_2_bus.png")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except:
            proc.kill()

if __name__ == "__main__":
    asyncio.run(capture_story())
