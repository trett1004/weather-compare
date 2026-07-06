import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");

app.use(express.static(distDir));

app.get("/impressum", (_request, response) => {
  response.sendFile(path.join(distDir, "impressum.html"));
});

app.get("/datenschutz", (_request, response) => {
  response.sendFile(path.join(distDir, "datenschutz.html"));
});

app.get("*", (_request, response) => {
  response.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Weather app running at http://localhost:${PORT}`);
});
