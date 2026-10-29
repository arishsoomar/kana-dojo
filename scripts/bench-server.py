# Collects the flashcard benchmark's results (src/dev/bench.ts): the app in the simulator posts
# JSON lines here, and they're appended to the file named on the command line.
# Run it with `python3 scripts/bench-server.py results.jsonl`.
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

OUT = sys.argv[1]


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        body = self.rfile.read(int(self.headers.get('Content-Length', 0))).decode()
        with open(OUT, 'a') as f:
            f.write(body.rstrip('\n') + '\n')
        self.send_response(204)
        self.end_headers()

    def log_message(self, *args):
        pass


HTTPServer(('127.0.0.1', 8099), Handler).serve_forever()
