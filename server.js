// Egyszerű Express szerver, ami nonce-ot generál és CSP-t állít be.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import express from 'express';

const app = express();
const __dirname = path.resolve();
const tplPath = path.join(__dirname, 'index_nonce_template.html');
const stylePath = path.join(__dirname, 'style.css');

app.get('/style.css', (req, res) => {
  res.sendFile(stylePath);
});

app.get('/', (req, res) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self'",
    "img-src 'self' data:",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'self'"
  ].join('; ');
  res.setHeader('Content-Security-Policy', csp);
  let html = fs.readFileSync(tplPath, 'utf8');
  html = html.replace(/\{\{NONCE\}\}/g, nonce);
  res.type('html').send(html);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Nonce-os verzió fut: http://localhost:${port}`));
