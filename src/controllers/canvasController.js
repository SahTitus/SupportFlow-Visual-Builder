export class CanvasController {
  constructor(canvasWrap, canvas, state, transform, onUpdate) {
    this.canvasWrap = canvasWrap;
    this.canvas = canvas;
    this.state = state;
    this.transform = transform;
    this.onUpdate = onUpdate;

    // mouse-driven state for pan and drag
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.draggingNodeId = null;
    this.dragOffset = { x: 0, y: 0 };

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.canvasWrap.addEventListener("mousedown", (e) =>
      this.handleCanvasMouseDown(e),
    );
    document.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    document.addEventListener("mouseup", () => this.handleMouseUp());
    this.canvasWrap.addEventListener("wheel", (e) => this.handleWheel(e), {
      passive: false,
    });
    this.canvasWrap.addEventListener("click", (e) => this.handleCanvasClick(e));
  }

  handleCanvasMouseDown(e) {
    if (e.button === 1 || (e.button === 0 && !e.target.closest(".node"))) {
      // middle click or empty space initiates panning
      this.isPanning = true;
      this.panStart = {
        x: e.clientX - this.transform.panX,
        y: e.clientY - this.transform.panY,
      };
      this.canvasWrap.classList.add("grabbing");
    }
  }

  handleMouseMove(e) {
    if (this.draggingNodeId) {
      this.moveNode(e);
      return;
    }

    if (!this.isPanning) return;

    // apply pan in screen space, then update transform
    this.transform.panX = e.clientX - this.panStart.x;
    this.transform.panY = e.clientY - this.panStart.y;
    this.applyTransform();
  }

  handleMouseUp() {
    if (this.draggingNodeId) {
      const el = document.getElementById(`node-${this.draggingNodeId}`);
      el?.classList.remove("dragging");
      this.draggingNodeId = null;
    }
    this.isPanning = false;
    this.canvasWrap.classList.remove("grabbing");
  }

  handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY;
    const oldScale = this.transform.scale;

    // zoom around pointer for natural navigation
    const newScale = Math.max(
      0.2,
      Math.min(2.5, oldScale * (delta > 0 ? 0.9 : 1.11)),
    );

    const rect = this.canvasWrap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    this.transform.panX =
      mx - (mx - this.transform.panX) * (newScale / oldScale);
    this.transform.panY =
      my - (my - this.transform.panY) * (newScale / oldScale);
    this.transform.scale = newScale;

    this.applyTransform();
  }

  handleCanvasClick(e) {
    if (!e.target.closest(".node")) {
      this.state.deselectNode();
      this.onUpdate();
    }
  }

  moveNode(e) {
    const node = this.state.getNode(this.draggingNodeId);
    if (!node) return;

    // convert pointer position from screen to world coordinates
    const canvasRect = this.canvasWrap.getBoundingClientRect();
    const x =
      (e.clientX - canvasRect.left - this.transform.panX) /
        this.transform.scale -
      this.dragOffset.x;
    const y =
      (e.clientY - canvasRect.top - this.transform.panY) /
        this.transform.scale -
      this.dragOffset.y;

    node.position.x = x;
    node.position.y = y;

    const el = document.getElementById(`node-${this.draggingNodeId}`);
    if (el) {
      el.style.left = x + "px";
      el.style.top = y + "px";
    }

    this.onUpdate();
  }

  startNodeDrag(nodeId, e) {
    this.draggingNodeId = nodeId;
    const el = document.getElementById(`node-${nodeId}`);
    const rect = el.getBoundingClientRect();

    // track offset so the node doesn't jump under the cursor
    this.dragOffset = {
      x: (e.clientX - rect.left) / this.transform.scale,
      y: (e.clientY - rect.top) / this.transform.scale,
    };

    el.classList.add("dragging");
  }

  applyTransform() {
    // keep DOM transform as the single source of truth
    this.canvas.style.transform = this.transform.getTransformCSS();
    this.onUpdate();
  }

  zoomIn() {
    this.transform.zoomIn();
    this.applyTransform();
  }

  zoomOut() {
    this.transform.zoomOut();
    this.applyTransform();
  }

  fitView() {
    const rect = this.canvasWrap.getBoundingClientRect();
    this.transform.zoomToFit(this.state.nodes, rect.width, rect.height);
    this.applyTransform();
  }

  getZoomPercent() {
    return this.transform.getZoomPercent();
  }
}
