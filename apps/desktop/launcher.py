#!/usr/bin/env python3
"""
WebBuilder Desktop - Native desktop app launcher
Wraps the Next.js web app in a native desktop window
"""

import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def start_web_server():
    """Start the Next.js web server in background"""
    web_app_dir = Path(__file__).parent.parent / 'apps' / 'web'
    
    # Check if already running
    import urllib.request
    try:
        urllib.request.urlopen('http://localhost:3001', timeout=1)
        print("Web server already running on port 3001")
        return None
    except:
        pass
    
    # Start the server
    proc = subprocess.Popen(
        ['npx', 'next', 'dev', '-p', '3001'],
        cwd=str(web_app_dir),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
    )
    
    # Wait for server to start
    for i in range(30):
        try:
            urllib.request.urlopen('http://localhost:3001', timeout=1)
            print(f"Web server started on port 3001 (PID: {proc.pid})")
            return proc
        except:
            time.sleep(0.5)
    
    print("Warning: Web server may not have started properly")
    return proc

def main():
    """Main entry point"""
    import webview
    
    # Start web server
    server_proc = start_web_server()
    
    # Create API bridge
    class API:
        def get_system_info(self):
            import platform
            return {
                'platform': platform.system(),
                'arch': platform.machine(),
                'version': platform.version(),
                'python': platform.python_version(),
                'home': str(Path.home())
            }
        
        def get_app_version(self):
            return '1.0.0'
    
    # Create and show window
    window = webview.create_window(
        'WebBuilder',
        url='http://localhost:3001',
        js_api=API(),
        width=1600,
        height=1000,
        min_size=(1200, 700),
        resizable=True,
        fullscreen=False,
        text_select=True,
        confirm_close=True,
        shadow=True,
        background_color='#0f172a'
    )
    
    try:
        webview.start(debug=False, gui='edgechromium')
    finally:
        if server_proc:
            server_proc.terminate()

if __name__ == '__main__':
    main()
