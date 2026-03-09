Test Frontend (React CDN)

This is a tiny test frontend that demonstrates embedding the chatbot widget with a single script tag.

Files:
- `index.html` - page that includes the chatbot script snippet and mounts a small React app via CDN
- `app.js` - simple React app (CDN-based) that renders a demo UI

How to run locally (recommended to serve over HTTP):

Using Python 3:

```bash
cd test-frontend
python -m http.server 5000
# Open http://localhost:5000 in your browser
```

Using Node (serve):

```bash
npm install -g serve
cd test-frontend
serve -l 5000
# Open http://localhost:5000 in your browser
```

Notes:
- The page includes the exact chatbot snippet you requested:

```html
<script src="https://your-domain.com/chatbot-widget.min.js" data-auto-init></script>
```

- For local testing with your built widget, replace the `src` with the local path (e.g., `../frontend/dist/chatbot-widget.js`) or host the `dist/chatbot-widget.min.js` on a server and update the URL.
- If the chatbot requires CORS or a backend token, make sure the backend is reachable from the test page's origin and tokens are configured properly.
