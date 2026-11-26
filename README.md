# Shironix Smart Living

A responsive, single-page college project concept for space-saving furniture. The site includes a product catalogue, a browser-only room-planning demo, custom furniture and contact forms, and optional English/Hindi voice input.

## Project files

```text
shironix-smart-living/
├── index.html    # Page structure and content
├── styles.css    # Responsive layout, theme and interactions
├── script.js     # Navigation, image preview, demo recommendations and forms
└── README.md     # Project and deployment instructions
```

There is no build step, framework, package manager or backend. Keep the three website files in the same folder; `index.html` loads `styles.css` and `script.js` using relative paths.

## Run locally

1. Open this folder in Visual Studio Code.
2. For the best browser API support, serve the folder from localhost. For example, install the **Live Server** extension, right-click `index.html`, and select **Open with Live Server**.
3. Open the local URL shown by Live Server (usually `http://127.0.0.1:5500`).

Opening `index.html` directly also allows basic browsing, but camera and microphone access generally require `localhost` or HTTPS.

## Demo behavior and privacy

- The Space Designer previews an image locally in the browser. It does not upload or save the room photo.
- Recommendations are JavaScript rule-based estimates using the dimensions and furniture type entered. The photo is **not** analyzed. An AI vision API is not connected.
- Suggested furniture dimensions are illustrative planning estimates, not verified product specifications or fit guarantees.
- The contact and custom furniture request forms validate in the browser; they do not send or store submissions. Connect a trusted backend or form service if you want to receive submissions.
- Voice input uses the browser Web Speech API when available. Recognition support, microphone permission, language quality and any speech-service network requirements depend on the browser and device. Typing remains available when voice input is unsupported or permission is denied.
- Product and room photography and the DM Sans/Manrope fonts are loaded from Unsplash and Google Fonts. An internet connection is needed for those external visuals and fonts. The app code itself has no external API keys.

## Publish with GitHub Pages

This is a static website, so GitHub Pages can publish it directly from the repository root; no GitHub Actions workflow or build command is required.

1. Create a GitHub repository named `shironix-smart-living`.
2. Upload or push `index.html`, `styles.css`, `script.js` and `README.md` to the repository's `main` branch, keeping them together at the repository root.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**, then click **Save**.
6. Wait for the Pages deployment to finish. GitHub will display the published URL in **Settings → Pages**. For this repository name it is usually `https://<your-github-username>.github.io/shironix-smart-living/`.

The stylesheet and script references are relative (`styles.css` and `script.js`), and page navigation uses in-page anchors, so they work from the GitHub Pages project subpath. External Unsplash and Google Fonts URLs remain absolute HTTPS links.

## Before pushing

- Confirm the repository contains no passwords, API keys, private tokens, or private room photos.
- Do not add credentials to client-side JavaScript; anything published in a static site is public.
- Check the deployed site on phone, tablet and desktop sizes and test camera/microphone permissions over the HTTPS Pages URL.
