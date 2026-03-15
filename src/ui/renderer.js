// Handles DOM creation and updates for graph nodes.
export class NodeRenderer {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.state = state;
  }

  // refresh all node elements from current state
  render() {
    this.clearNodes();
    this.state.nodes.forEach((node) => {
      this.renderNode(node);
    });
  }

  // Clear existing DOM nodes before re-render
  clearNodes() {
    this.canvas.querySelectorAll(".node").forEach((el) => el.remove());
  }

  renderNode(node) {
    const el = document.createElement("div");
    const isSelected = node.id === this.state.selectedNodeId;

    el.className = `node type-${node.type}${isSelected ? " selected" : ""}`;
    el.id = `node-${node.id}`;
    el.style.left = node.position.x + "px";
    el.style.top = node.position.y + "px";

    const typeLabel = this.getTypeLabel(node.type);
    const optionsHTML = this.renderOptions(node);

    el.innerHTML = `
      <div class="node-header">
        <div class="node-type-dot"></div>
        <span class="node-type-label">${typeLabel}</span>
        <span class="node-id">#${node.id}</span>
      </div>
      <div class="node-body">
        <div class="node-text">${this.escapeHtml(node.text)}</div>
      </div>
      ${optionsHTML}
    `;

    this.canvas.appendChild(el);
  }

  renderOptions(node) {
    if (!node.options.length) return "";

    const chips = node.options
      .map(
        (o) =>
          `<div class="node-option-chip">${this.escapeHtml(o.label)}</div>`,
      )
      .join("");

    return `<div class="node-options">${chips}</div>`;
  }

  getTypeLabel(type) {
    const labels = {
      start: "Start",
      question: "Question",
      end: "End",
    };
    return labels[type] || type;
  }

  getNodeElement(nodeId) {
    return document.getElementById(`node-${nodeId}`);
  }

  updateNodeText(nodeId, text) {
    const el = this.getNodeElement(nodeId);
    if (el) {
      const textEl = el.querySelector(".node-text");
      if (textEl) textEl.textContent = text;
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
