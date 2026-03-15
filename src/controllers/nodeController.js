export class NodeController {
  constructor(canvas, state, canvasController, onUpdate) {
    this.canvas = canvas;
    this.state = state;
    this.canvasController = canvasController;
    this.onUpdate = onUpdate;
  }

  attachNodeListeners(nodeId) {
    const el = document.getElementById(`node-${nodeId}`);
    if (!el) return;

    // click selects, mousedown begins drag
    el.addEventListener("click", (e) => this.handleNodeClick(e, nodeId));
    el.addEventListener("mousedown", (e) =>
      this.handleNodeMouseDown(e, nodeId),
    );
  }

  handleNodeClick(e, nodeId) {
    if (this.canvasController.draggingNodeId) return;

    e.stopPropagation();
    // only select on click when not dragging
    this.selectNode(nodeId);
  }

  handleNodeMouseDown(e, nodeId) {
    if (e.button !== 0) return;

    e.stopPropagation();
    this.canvasController.startNodeDrag(nodeId, e);
  }

  selectNode(nodeId) {
    this.state.selectNode(nodeId);
    this.onUpdate();
  }

  deselectNode() {
    this.state.deselectNode();
    this.onUpdate();
  }
}
