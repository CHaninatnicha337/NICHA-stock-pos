import http.server
import socketserver
import webbrowser
import os
import sys
import socket
import json

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(DIRECTORY, "data.json")

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class CentralSyncHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS for local cross-origin/mobile requests
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # API: Get synchronized database
        if self.path == "/api/data":
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, "r", encoding="utf-8") as f:
                        content = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(content.encode("utf-8"))
                    return
                except Exception as e:
                    self.send_response(500)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                    return
            else:
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "empty"}).encode("utf-8"))
                return

        super().do_GET()

    def do_POST(self):
        # API: Sync full state from any device
        if self.path == "/api/sync":
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                post_body = self.rfile.read(content_len).decode("utf-8")
                data = json.loads(post_body)
                
                with open(DATA_FILE, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "ok", "message": "Synced to central database"}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))
                return

        if self.path == "/api/reset":
            try:
                if os.path.exists(DATA_FILE):
                    os.remove(DATA_FILE)
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "reset"}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))
                return

        super().do_POST()

def run():
    os.chdir(DIRECTORY)
    local_ip = get_local_ip()
    local_url = f"http://localhost:{PORT}/index.html"
    mobile_url = f"http://{local_ip}:{PORT}/index.html"

    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CentralSyncHandler) as httpd:
        print("="*65)
        print(" 7-Eleven Style Cloud Architecture: Front Store & Back Office")
        print(" Single Central Database Synced (PC + Mobile / Tablet)")
        print("="*65)
        print(f" [1] ลิงก์เปิดในคอมพิวเตอร์:   {local_url}")
        print(f" [2] ลิงก์เปิดในโทรศัพท์มือถือ: {mobile_url}")
        print("="*65)
        print(" *วิธีเปิดในมือถือ: ให้โทรศัพท์ต่อ Wi-Fi เดียวกันกับคอมพิวเตอร์")
        print(" แล้วเปิดเบราว์เซอร์ในมือถือพิมพ์ลิงก์ที่ [2] หรือสแกน QR Code บนหน้าเว็บ")
        print(" ข้อมูลสต็อกจะซิงค์ร่วมกันอัตโนมัติแบบเรียลไทม์")
        print(" กด Ctrl+C เพื่อหยุดการทำงาน")
        print("="*65)
        
        webbrowser.open(local_url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nปิดเซิร์ฟเวอร์เรียบร้อยแล้ว")
            sys.exit(0)

if __name__ == "__main__":
    run()
