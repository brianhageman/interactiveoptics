# Optics Studio

Static HTML/CSS/JS website for AP Physics 1 optics. It is designed for student
Chromebooks and runs entirely in the browser.

## Topics included
- Reflection
- Refraction and different media
- Curved mirrors
- Lenses
- Interference and diffraction
- Polarization

Each module includes:
- content explanations
- an interactive simulation
- randomized checkpoint questions
- locked progression until the checkpoint is answered correctly

The site also includes a final graded capstone page with:
- randomized question and answer order
- automatic percentage and letter-grade scoring
- best-score tracking stored in the browser
- unlimited retakes

## Files
- [index.html](/Users/bhageman/Documents/Arduino/LINAC_Control_LDR_Short_Pause/index.html)
- [styles.css](/Users/bhageman/Documents/Arduino/LINAC_Control_LDR_Short_Pause/styles.css)
- [script.js](/Users/bhageman/Documents/Arduino/LINAC_Control_LDR_Short_Pause/script.js)

## Run locally

The site can be opened directly in a browser, or served locally with any simple
static server.

```bash
cd /Users/bhageman/Documents/Arduino/LINAC_Control_LDR_Short_Pause
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

## Deployment

Because the site is static, it can be hosted on:
- GitHub Pages
- Netlify
- Vercel static hosting
- a school web server

No build step or backend is required.
