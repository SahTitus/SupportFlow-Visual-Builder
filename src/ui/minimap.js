// Minimap renders a scaled overview of the entire panel
export class Minimap {
  constructor(canvas, svgLayer, canvasWrap, state, transform) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.svgLayer = svgLayer;
    this.canvasWrap = canvasWrap;
    this.state = state;
    this.transform = transform;
    this.viewport = document.getElementById("minimap-viewport");
  }

  // redraw minimap contents
  render() {
    const W = this.canvas.width;
    const H = this.canvas.height;

    this.ctx.clearRect(0, 0, W, H);

    if (!this.state.nodes.length) return;

    const bounds = this.calculateBounds();
    const scale = this.calculateScale(bounds, W, H);
    const offset = this.calculateOffset(bounds, scale, W, H);

    this.drawConnectors(bounds, scale, offset);
    this.drawNodes(bounds, scale, offset);
    this.drawViewport(bounds, scale, offset, W, H);
  }

  calculateBounds() {
    const NODE_W = 220;
    const NODE_H = 120;
    const xs = this.state.nodes.map((n) => n.position.x);
    const ys = this.state.nodes.map((n) => n.position.y);

    return {
      minX: Math.min(...xs) - 30,
      minY: Math.min(...ys) - 30,
      maxX: Math.max(...xs) + NODE_W + 30,
      maxY: Math.max(...ys) + NODE_H + 30,
    };
  }

  calculateScale(bounds, W, H) {
    const totalW = bounds.maxX - bounds.minX;
    const totalH = bounds.maxY - bounds.minY;
    const scaleX = W / totalW;
    const scaleY = H / totalH;
    return Math.min(scaleX, scaleY) * 0.88;
  }

  calculateOffset(bounds, scale, W, H) {
    const totalW = bounds.maxX - bounds.minX;
    const totalH = bounds.maxY - bounds.minY;

    return {
      x: (W - totalW * scale) / 2 - bounds.minX * scale,
      y: (H - totalH * scale) / 2 - bounds.minY * scale,
    };
  }

  drawConnectors(bounds, scale, offset) {
    const NODE_H = 120;
    this.ctx.strokeStyle = "rgba(90,97,128,.5)";
    this.ctx.lineWidth = 1;

    this.state.nodes.forEach((node) => {
      node.options.forEach((opt) => {
        const toNode = this.state.getNode(opt.nextId);
        if (!toNode) return;

        const fx = node.position.x * scale + 110 * scale + offset.x;
        const fy = node.position.y * scale + NODE_H * scale + offset.y;
        const tx = toNode.position.x * scale + 110 * scale + offset.x;
        const ty = toNode.position.y * scale + offset.y;

        this.ctx.beginPath();
        this.ctx.moveTo(fx, fy);
        this.ctx.bezierCurveTo(fx, fy + 20, tx, ty - 20, tx, ty);
        this.ctx.stroke();
      });
    });
  }

  drawNodes(bounds, scale, offset) {
    const NODE_W = 220;
    const NODE_H = 120;
    const nodeHeight = NODE_H * scale * 0.6;

    this.state.nodes.forEach((node) => {
      const x = node.position.x * scale + offset.x;
      const y = node.position.y * scale + offset.y;
      const w = NODE_W * scale;

      const color = this.getNodeColor(node.type);
      const isSelected = node.id === this.state.selectedNodeId;

      this.ctx.fillStyle = isSelected ? color + "44" : "rgba(24,28,36,.8)";
      this.ctx.strokeStyle = isSelected ? color : "rgba(58,66,88,.8)";
      this.ctx.lineWidth = isSelected ? 1.5 : 1;

      this.roundRect(x, y, w, nodeHeight, 3);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = color;
      this.ctx.fillRect(x + 2, y + 2, 4, nodeHeight - 4);
    });
  }

  drawViewport(bounds, scale, offset, W, H) {
    const wrapRect = this.canvasWrap.getBoundingClientRect();
    const vpX =
      (-this.transform.panX / this.transform.scale) * scale + offset.x;
    const vpY =
      (-this.transform.panY / this.transform.scale) * scale + offset.y;
    const vpW = (wrapRect.width / this.transform.scale) * scale;
    const vpH = (wrapRect.height / this.transform.scale) * scale;

    this.viewport.style.left = Math.max(0, vpX) + "px";
    this.viewport.style.top = Math.max(0, vpY) + "px";
    this.viewport.style.width = Math.min(W, vpW) + "px";
    this.viewport.style.height = Math.min(H, vpH) + "px";
  }

  roundRect(x, y, w, h, r) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  getNodeColor(type) {
    const colors = { start: "#0ff", question: "#a78bfa", end: "#34d399" };
    return colors[type] || "#a78bfa";
  }
}
