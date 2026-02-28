# Polinomok – Műveletek gyakorlása (CSP-barát)

Két futtatható mód:

## 1) Egyszerű, fájlból (nincs szerver)
- Csomag kibontása
- Nyisd meg duplakattal az **index.html**-t a böngészőben
- Kész ✅

Ez a változat **CSP-barát** (nincs inline script/stílus). Ha portálra töltöd, engedélyezd a saját hostot a CSP-ben:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'self'
```

## 2) Nonce‑os inline script (bemutató szerverrel)
Futtatás Node.js-sel:
```bash
npm install
npm run start:nonce
# majd böngésző: http://localhost:3000
```
A szerver minden kérésnél **új nonce**-ot generál, a CSP fejlécbe és a `<script nonce="…">` attribútumba is beírja.

---

## Fájlok
- `index.html` – külső JS/CSS, offline is fut
- `style.css` – stílusok
- `app.js` – JavaScript logika
- `index_nonce_template.html` – sablon inline JS-sel, `{{NONCE}}` placeholderrel
- `server.js` – Express szerver, CSP + nonce
- `package.json` – Node projektfájl (csak a nonce-os módhoz kell)

## Tipp
- Tizedesvessző (`2,5`) is elfogadott a bevitelnél.
- Szigorú portál esetén érdemes az 1) változatot használni és a fájlokat **azonos domainről** kiszolgálni.
