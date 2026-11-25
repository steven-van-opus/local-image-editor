# Local Image Editor

A small screenshot editor that runs in the browser. Open an image, paste one
from your clipboard, or drop a file onto the canvas. Crop to the area you want,
blur details or cover them with solid redaction boxes, then add padding, a
background color, rounded corners, or a shadow. Export the result as a PNG.

## Run it

Open `index.html` directly in a modern browser. To serve it locally, run
`npx serve .` in the project directory and open the local URL it prints.
The editor itself needs no dependencies or build step.

1. Use **Open image**, paste an image, or drop an image file on the canvas.
   **Use sample** opens the fictional workshop dashboard in `examples/`.
2. Select **Crop**, **Blur**, or **Redact**, then drag a box on the image.
   **Enter coordinates** offers the same controls with pixel positions measured
   from the current image's top-left corner. Use **Undo** to reverse an image edit.
3. Turn on **Add a frame**, adjust the background and inset, and export the PNG.
   Choose **Redact** for private text. Blur is a visual effect.

## Privacy

The code runs locally, requires no account, and sends no uploads or tracking
requests. Edits stay in memory until you close or reload the page. PNG export
flattens the crop, effects, and frame into the saved pixels.

[inspired by edit.here by @leodev](https://github.com/opencoredev/edit.here)

MIT licensed. See [LICENSE](LICENSE).
