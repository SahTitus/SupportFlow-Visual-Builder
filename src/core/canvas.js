// Provides conversion between screen and world coordinates
export class CanvasTransform {
  constructor() {
    this.scale = 1;
    this.panX = 60;
    this.panY = 40;
  }

  // clamp scale within practical bounds
  setScale(newScale) {
    this.scale = Math.max(0.2, Math.min(2.5, newScale));
  }

  setPan(x, y) {
    this.panX = x;
    this.panY = y;
  }

  zoomIn() {
    this.setScale(this.scale * 1.2);
  }

  zoomOut() {
    this.setScale(this.scale / 1.2);
  }

  // adjust transform so all nodes fit inside the viewport
  zoomToFit(nodes, containerW, containerH) {
    if (!nodes.length) return;

    const NODE_W = 220;
    const NODE_H = 140;
    const xs = nodes.map((n) => n.position.x);
    const ys = nodes.map((n) => n.position.y);
    const minX = Math.min(...xs) - 40;
    const minY = Math.min(...ys) - 40;
    const maxX = Math.max(...xs) + NODE_W + 40;
    const maxY = Math.max(...ys) + NODE_H + 40;
    const width = maxX - minX;
    const height = maxY - minY;

    const scaleX = containerW / width;
    const scaleY = containerH / height;
    this.scale = Math.min(scaleX, scaleY, 1.2);

    this.panX = (containerW - width * this.scale) / 2 - minX * this.scale;
    this.panY = (containerH - height * this.scale) / 2 - minY * this.scale;
  }

  screenToWorld(screenX, screenY, containerRect) {
    return {
      x: (screenX - containerRect.left - this.panX) / this.scale,
      y: (screenY - containerRect.top - this.panY) / this.scale,
    };
  }

  zoomAtPoint(scrollDelta, screenX, screenY, containerRect) {
    const delta = scrollDelta > 0 ? 0.9 : 1.11;
    const newScale = this.scale * delta;
    this.setScale(newScale);

    const rect = containerRect;
    const mx = screenX - rect.left;
    const my = screenY - rect.top;

    this.panX = mx - (mx - this.panX) * (newScale / this.scale);
    this.panY = my - (my - this.panY) * (newScale / this.scale);
  }

  getTransformCSS() {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
  }

  getZoomPercent() {
    return Math.round(this.scale * 100);
  }
}
