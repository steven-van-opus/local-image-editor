'use strict';

const byId = (id) => document.getElementById(id);
const canvas = byId('canvas');
const stage = byId('drop-zone');
const frame = byId('frame');
const frameInput = (name) => frame.querySelector(`[name="${name}"]`);
const tools = byId('tools');
const coordinates = byId('coordinates');
const coordinate = (name) => coordinates.elements.namedItem(name);
const preview = byId('preview');
const selection = byId('selection');
const imageCanvas = document.createElement('canvas');
const imageContext = imageCanvas.getContext('2d', { willReadFrequently: true });
const output = canvas.getContext('2d');
const help = {
  crop: 'Drag a box to keep only that part of the image.',
  blur: 'Drag over details you want to soften.',
  redact: 'Drag over private details to cover them with a solid box.',
};

let original;
let edits = [];
let crop;
let activePointer;
let loadNumber = 0;

function setStatus(message) {
  byId('status').textContent = message;
}

function tool() {
  return tools.querySelector('input:checked').value;
}

function rectBetween(start, end) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

function intersect(first, second) {
  const x = Math.max(first.x, second.x);
  const y = Math.max(first.y, second.y);
  return {
    x,
    y,
    width: Math.max(0, Math.min(first.x + first.width, second.x + second.width) - x),
    height: Math.max(0, Math.min(first.y + first.height, second.y + second.height) - y),
  };
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(value, high));
}

function boxPass(source, target, lines, pixels, lineStep, pixelStep, radius) {
  const width = radius * 2 + 1;
  for (let line = 0; line < lines; line += 1) {
    const base = line * lineStep;
    for (let channel = 0; channel < 4; channel += 1) {
      const offset = base + channel;
      let sum = 0;
      for (let sample = -radius; sample <= radius; sample += 1) {
        sum += source[offset + clamp(sample, 0, pixels - 1) * pixelStep];
      }
      for (let pixel = 0; pixel < pixels; pixel += 1) {
        target[offset + pixel * pixelStep] = sum / width;
        const entering = clamp(pixel + radius + 1, 0, pixels - 1);
        const leaving = clamp(pixel - radius, 0, pixels - 1);
        sum += source[offset + entering * pixelStep] - source[offset + leaving * pixelStep];
      }
    }
  }
}

function blurRect({ x, y, width, height }) {
  const pixels = imageContext.getImageData(x, y, width, height);
  const data = pixels.data;
  const intermediate = new Uint8ClampedArray(data.length);
  const radius = 10;
  // Average premultiplied colors so transparent input keeps clean edges.
  for (let offset = 0; offset < data.length; offset += 4) {
    const opacity = data[offset + 3] / 255;
    for (let channel = 0; channel < 3; channel += 1) data[offset + channel] *= opacity;
  }
  boxPass(data, intermediate, height, width, width * 4, 4, radius);
  boxPass(intermediate, data, width, height, 4, width * 4, radius);
  for (let offset = 0; offset < data.length; offset += 4) {
    const opacity = data[offset + 3] / 255;
    if (opacity === 0) continue;
    for (let channel = 0; channel < 3; channel += 1) data[offset + channel] /= opacity;
  }
  imageContext.putImageData(pixels, x, y);
}

function renderImage() {
  const fullImage = { x: 0, y: 0, width: original.naturalWidth, height: original.naturalHeight };
  crop = edits.findLast((edit) => edit.tool === 'crop')?.rect ?? fullImage;
  imageCanvas.width = crop.width;
  imageCanvas.height = crop.height;
  imageContext.drawImage(original, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

  // Blackout boxes go on top so another effect can't soften their edges.
  for (const effect of ['blur', 'redact']) {
    for (const edit of edits) {
      if (edit.tool !== effect) continue;
      const clipped = intersect(crop, edit.rect);
      if (!clipped.width || !clipped.height) continue;
      clipped.x -= crop.x;
      clipped.y -= crop.y;
      if (effect === 'blur') {
        blurRect(clipped);
      } else {
        imageContext.fillStyle = '#131a22';
        imageContext.fillRect(clipped.x, clipped.y, clipped.width, clipped.height);
      }
    }
  }

  coordinate('left').max = crop.width - 1;
  coordinate('top').max = crop.height - 1;
  coordinate('width').max = crop.width;
  coordinate('height').max = crop.height;
  coordinate('left').value = 0;
  coordinate('top').value = 0;
  coordinate('width').value = crop.width;
  coordinate('height').value = crop.height;
  byId('undo').disabled = edits.length === 0;
  renderFrame();
}

function padding() {
  return frameInput('enabled').checked ? Number(frameInput('padding').value) : 0;
}

function renderFrame() {
  const framed = frameInput('enabled').checked;
  const inset = padding();
  const radius = Number(frameInput('radius').value);
  const color = frameInput('color').value;
  byId('frame-fields').disabled = !framed;
  byId('padding-value').value = `${frameInput('padding').value} px`;
  byId('radius-value').value = `${radius} px`;
  if (!crop) return;

  canvas.width = crop.width + inset * 2;
  canvas.height = crop.height + inset * 2;
  byId('dimensions').textContent = `${canvas.width} × ${canvas.height} px`;
  if (framed) {
    output.fillStyle = color;
    output.fillRect(0, 0, canvas.width, canvas.height);
    output.save();
    output.beginPath();
    output.roundRect(inset, inset, crop.width, crop.height, radius);
    if (frameInput('shadow').checked) {
      output.shadowColor = '#172e42a6';
      output.shadowBlur = 26;
      output.shadowOffsetY = 10;
      output.fill();
      output.shadowColor = 'transparent';
    }
    output.clip();
  }
  output.drawImage(imageCanvas, inset, inset);
  if (framed) output.restore();
}

async function loadImage(url, label) {
  const requested = ++loadNumber;
  const source = new Image();
  source.src = url;
  try {
    await source.decode();
    if (requested !== loadNumber) return;
    if (!source.naturalWidth || !source.naturalHeight) throw new Error('Empty image');
    // Keep both working canvases within mobile browser canvas limits, including frame padding.
    if (source.naturalWidth + 320 > 16384 || source.naturalHeight + 320 > 16384 ||
        (source.naturalWidth + 320) * (source.naturalHeight + 320) > 16_777_216) {
      setStatus('This image is too large to edit. Open a smaller image.');
      return;
    }
    original = source;
    edits = [];
    preview.hidden = false;
    byId('empty').hidden = true;
    tools.disabled = false;
    frame.disabled = false;
    byId('export').disabled = false;
    byId('replace-sample').hidden = false;
    renderImage();
    setStatus(`${label} opened.`);
  } catch {
    if (requested === loadNumber) setStatus('Could not open this image. Try a PNG, JPEG or WebP.');
  }
}

async function openFile(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    await loadImage(url, file.name || 'Image');
  } finally {
    URL.revokeObjectURL(url);
  }
}

function openSample() {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(workshopSample)}`;
  void loadImage(url, 'Workshop sample');
}

function applyEdit(rect) {
  const clipped = intersect(crop, rect);
  if (!clipped.width || !clipped.height) {
    setStatus('Select an area inside the image.');
    return;
  }
  const name = tool();
  edits.push({ tool: name, rect: clipped });
  renderImage();
  setStatus({ crop: 'Crop applied.', blur: 'Blur applied.', redact: 'Redaction applied.' }[name]);
}

function imagePoint(event) {
  const rect = canvas.getBoundingClientRect();
  const inset = padding();
  return {
    x: crop.x + clamp(Math.round((event.clientX - rect.left) / rect.width * canvas.width) - inset, 0, crop.width),
    y: crop.y + clamp(Math.round((event.clientY - rect.top) / rect.height * canvas.height) - inset, 0, crop.height),
  };
}

function dragSelection(event) {
  const rect = rectBetween(activePointer.start, imagePoint(event));
  const inset = padding();
  selection.style.left = `${100 * (rect.x - crop.x + inset) / canvas.width}%`;
  selection.style.top = `${100 * (rect.y - crop.y + inset) / canvas.height}%`;
  selection.style.width = `${100 * rect.width / canvas.width}%`;
  selection.style.height = `${100 * rect.height / canvas.height}%`;
}

function endSelection() {
  activePointer = undefined;
  selection.hidden = true;
}

const fileInput = byId('file');
byId('open').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  void openFile(fileInput.files[0]);
  fileInput.value = '';
});
byId('sample').addEventListener('click', openSample);
byId('replace-sample').addEventListener('click', openSample);

document.addEventListener('paste', (event) => {
  const item = [...(event.clipboardData?.items ?? [])].find((entry) => entry.type.startsWith('image/'));
  if (!item) return;
  event.preventDefault();
  void openFile(item.getAsFile());
});

stage.addEventListener('dragover', (event) => {
  if (!event.dataTransfer.types.includes('Files')) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
  stage.classList.add('is-dragging');
});
stage.addEventListener('dragleave', (event) => {
  if (!stage.contains(event.relatedTarget)) stage.classList.remove('is-dragging');
});
stage.addEventListener('drop', (event) => {
  if (!event.dataTransfer.types.includes('Files')) return;
  event.preventDefault();
  stage.classList.remove('is-dragging');
  void openFile(event.dataTransfer.files[0]);
});

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || activePointer) return;
  activePointer = { id: event.pointerId, start: imagePoint(event) };
  canvas.setPointerCapture(event.pointerId);
  dragSelection(event);
  selection.hidden = false;
});

canvas.addEventListener('pointermove', (event) => {
  if (activePointer?.id === event.pointerId) dragSelection(event);
});

canvas.addEventListener('pointerup', (event) => {
  if (activePointer?.id !== event.pointerId) return;
  const rect = rectBetween(activePointer.start, imagePoint(event));
  endSelection();
  if (rect.width && rect.height) applyEdit(rect);
});

canvas.addEventListener('lostpointercapture', (event) => {
  if (activePointer?.id === event.pointerId) endSelection();
});

tools.addEventListener('change', (event) => {
  if (event.target.name === 'tool') byId('tool-help').textContent = help[tool()];
});

coordinates.addEventListener('submit', (event) => {
  event.preventDefault();
  applyEdit({
    x: crop.x + coordinate('left').valueAsNumber,
    y: crop.y + coordinate('top').valueAsNumber,
    width: coordinate('width').valueAsNumber,
    height: coordinate('height').valueAsNumber,
  });
});

frame.addEventListener('input', renderFrame);
byId('undo').addEventListener('click', () => {
  edits.pop();
  renderImage();
  setStatus('Last image edit undone.');
});

byId('export').addEventListener('click', () => {
  canvas.toBlob((blob) => {
    if (!blob) {
      setStatus('Could not export this image.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edited-image.png';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    setStatus('PNG exported.');
  }, 'image/png');
});
