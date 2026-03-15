// Draws the curved lines between nodes using
export class ConnectorRenderer {
  constructor(svgLayer, canvas, state, transform) {
    this.svgLayer = svgLayer;
    this.canvas = canvas;
    this.state = state;
    this.transform = transform;
  }

  // re-create all connectors
  render() {
    this.svgLayer.innerHTML = "";
    this.defineArrowMarker();

    this.state.nodes.forEach((node) => {
      node.options.forEach((opt) => {
        const fromEl = document.getElementById(`node-${node.id}`);
        const toEl = document.getElementById(`node-${opt.nextId}`);

        if (!fromEl || !toEl) return;

        const from = this.getElementCenterBottom(fromEl);
        const to = this.getElementCenterTop(toEl);

        this.drawBezierCurve(from, to);
      });
    });
  }

  defineArrowMarker() {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker",
    );

    marker.setAttribute("id", "connector-arrow");
    marker.setAttribute("markerWidth", "8");
    marker.setAttribute("markerHeight", "8");
    marker.setAttribute("refX", "6");
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto");

    const poly = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );
    poly.setAttribute("points", "0 0, 7 3, 0 6");
    poly.setAttribute("class", "connector-arrow");

    marker.appendChild(poly);
    defs.appendChild(marker);
    this.svgLayer.appendChild(defs);
  }

  // draw one cubic bezier between two points with arrowhead
  drawBezierCurve(from, to) {
    const cpOffset = Math.abs(to.y - from.y) * 0.5;
    const cp1 = { x: from.x, y: from.y + cpOffset };
    const cp2 = { x: to.x, y: to.y - cpOffset };

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "connector-path");
    path.setAttribute("marker-end", "url(#connector-arrow)");
    path.setAttribute(
      "d",
      `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`,
    );

    this.svgLayer.appendChild(path);
  }

  getElementCenterBottom(el) {
    const rect = el.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    return {
      x: (rect.left + rect.width / 2 - canvasRect.left) / this.transform.scale,
      y: (rect.bottom - canvasRect.top) / this.transform.scale,
    };
  }

  getElementCenterTop(el) {
    const rect = el.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    return {
      x: (rect.left + rect.width / 2 - canvasRect.left) / this.transform.scale,
      y: (rect.top - canvasRect.top) / this.transform.scale,
    };
  }
}
