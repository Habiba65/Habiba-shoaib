# Habiba Shoaib — Personal Portfolio

A modern, premium, fully responsive portfolio website built with **HTML5, CSS3 and vanilla
JavaScript** only. No React, Bootstrap, Tailwind, jQuery or any external JS framework.

```
Habiba/
├── index.html    ← structure & content (semantic HTML)
├── style.css     ← all visual design, theming, animation & responsive rules
├── script.js     ← all interactions (particles, typing, nav, modal, validation)
└── README.md
```

---

## Running the site locally

The site is 100% static, so **no build step, no package install and no server are required**.

### Option 1 — Double-click (fastest)
Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
Everything works, including the canvas particles, the typing effect and the contact form.

> If you use `file://`, the Google Fonts link still loads as long as you are online.
> Offline it silently falls back to system fonts — the layout is unaffected.

### Option 2 — Local web server (recommended, matches production behaviour)

**Python** (already installed on most systems):

```bash
cd Habiba
python -m http.server 8000
```

Then visit <http://localhost:8000>

**VS Code** → install the *Live Server* extension → right-click `index.html` → **Open with Live Server**.

**Node.js**:

```bash
npx serve .
```

Press `Ctrl + C` in the terminal to stop the server.

---

## Customising it

### 1. Personal details & social links
Everything you are likely to change lives in the **`CONFIG`** block at the top of `script.js`:

```js
const CONFIG = {
  email: "habibashoaib460@gmail.com",
  location: "Islamabad, Pakistan",
  linkedin: "",   // paste your real URL, e.g. "https://www.linkedin.com/in/your-profile/"
  github: "",     // paste your real URL, e.g. "https://github.com/your-username"
  roles: [ /* the hero typing animation phrases */ ]
};
```

While `linkedin` / `github` are empty, those buttons show a friendly "link coming soon" toast
instead of pointing nowhere. As soon as you paste a URL they become real links that open in a
new tab.

### 2. Profile photo
The hero portrait is currently an **SVG monogram placeholder** (no external file needed).
To use a real photo, drop your image in an `assets/` folder and change the `src` of the
`.profile__img` element in `index.html`:

```html
<img class="profile__img" src="assets/habiba-profile.jpg" alt="Habiba Shoaib" width="600" height="600" />
```

The glowing circular border, gradient ring and floating animation stay exactly as they are.

### 3. Content
Text lives directly in `index.html` in clearly commented sections:
`Hero → About → Skills → Projects → Experience → Education → Contact → Footer`.

### 4. Colours
All theme colours are CSS custom properties at the top of `style.css` (`--purple`, `--cyan`,
`--grad-primary`, …). Change them there and the whole site updates, including the light theme.

---

## Notes on honesty & placeholders

This portfolio deliberately does **not** invent anything that does not exist yet:

* **Project links** — the "Live demo" and "Source code" buttons in the project modal are
  explicitly disabled and labelled *not published*. Add real URLs there when the projects go live.
* **Contact form** — there is **no backend**. Submitting the form validates the input and then
  opens the visitor's own email client with the message pre-filled (`mailto:`). The UI states
  this plainly, so nothing is ever falsely claimed to be "sent".
* **Skill indicators** — the segmented bars show a *focus level* (Core / Working / Learning),
  **not** a proficiency percentage. Power BI and Python are honestly marked as *Learning / Basic*.

---

## Accessibility & performance

* Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`), one `h1`, ordered headings.
* Full keyboard support, visible focus rings, skip-to-content link, ARIA labels on icon buttons.
* `prefers-reduced-motion` is respected: floating, typing and background motion are switched off.
* Canvas particles use pre-rendered sprites, a capped particle count, `devicePixelRatio`
  clamping and pause when the tab is hidden — so the page stays light.
* Print stylesheet included.

---

© Habiba Shoaib
