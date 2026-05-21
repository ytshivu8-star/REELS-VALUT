import express from "express";
import path from "path";
import app from "./api/index";

const PORT = 3000;

// Setup Vite or Static File Serving
async function setupFrontend() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// In standard environments (Node), we call setup and listen
// In serverless environments (Vercel, Netlify, AWS Lambda), we do not bind a listener port
const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT;

if (!isServerless) {
  setupFrontend().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Local development/production server running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("Frontend setup failed:", err);
  });
}

export { app };
