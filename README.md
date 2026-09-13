# Princess Polpetta 💕

A playful, romantic date invitation built with plain HTML, CSS, and JavaScript. It has no backend, database, build step, or runtime configuration, so it can be hosted directly on GitHub Pages.

## Project structure

```text
polpetta/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Deploy with GitHub Pages

1. Create a new GitHub repository.
2. Upload or push these files to the repository.
3. Open **Settings → Pages**.
4. Set the source to deploy from the `main` branch.
5. Select the repository root folder (`/ (root)`).
6. Click **Save**.

The resulting URL will generally look like `https://your-username.github.io/repository-name/`. For a repository named `your-username.github.io`, it will generally be `https://your-username.github.io/`.

## Interaction notes

On desktop, the NO button stays still until the mouse moves inside the invitation card. When the mouse moves nearby, it smoothly flees in the opposite direction; faster cursor movement makes the response more energetic. It checks that the button stays separated from YES and clamps its transform to the card. The same Pointer Events handler responds to touch and stylus input, moving the button on `pointerdown` and preventing the accidental click.

Each attempt increments `noAttempts`. The NO button gradually scales down to `0.65`, while YES grows only to `1.30`.

Everything runs locally in the browser. The project requires no backend and works entirely as a static GitHub Pages site.