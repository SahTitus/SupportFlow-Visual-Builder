import { FlowState } from "./core/state.js";
import { CanvasTransform } from "./core/canvas.js";
import { NodeRenderer } from "./ui/renderer.js";
import { ConnectorRenderer } from "./ui/connectors.js";
import { EditPanel } from "./ui/panel.js";
import { CanvasController } from "./controllers/canvasController.js";
import { NodeController } from "./controllers/nodeController.js";

class Application {
  constructor() {
    this.state = null;
    this.transform = null;
    this.nodeRenderer = null;
    this.connectorRenderer = null;
    this.editPanel = null;
    this.canvasController = null;
    this.nodeController = null;
  }

  // bootstrap state and UI
  async init() {
    const flowData = await this.loadFlowData();
    this.state = new FlowState(flowData);
    this.transform = new CanvasTransform();
    this.setupUI();
    this.setupControllers();
    this.render();
    this.fitView();
    window.addEventListener("resize", () => this.connectorRenderer.render());
  }

  // Load flow data
  async loadFlowData() {
    const response = await fetch("/data/flow_data.json");
    return response.json();
  }

  setupUI() {
    const canvas = document.getElementById("canvas");
    const svgLayer = document.getElementById("svg-layer");
    const editPanelEl = document.getElementById("edit-panel");

    // renderers DOM creation for nodes and connectors
    this.nodeRenderer = new NodeRenderer(canvas, this.state);
    this.connectorRenderer = new ConnectorRenderer(
      svgLayer,
      canvas,
      this.state,
      this.transform,
    );
    this.editPanel = new EditPanel(editPanelEl, this.state, () =>
      this.render(),
    );
  }

  setupControllers() {
    const canvas = document.getElementById("canvas");
    const canvasWrap = document.getElementById("canvas-wrap");

    this.canvasController = new CanvasController(
      canvasWrap,
      canvas,
      this.state,
      this.transform,
      () => this.updateCanvasDisplay(),
    );

    // controller for pan/zoom and drag behaviors
    this.nodeController = new NodeController(
      canvas,
      this.state,
      this.canvasController,
      () => this.onNodeAction(),
    );

    document.getElementById("btn-zoom-in").addEventListener("click", () => {
      this.canvasController.zoomIn();
    });
    document.getElementById("btn-zoom-out").addEventListener("click", () => {
      this.canvasController.zoomOut();
    });
    document.getElementById("btn-fit").addEventListener("click", () => {
      this.canvasController.fitView();
    });
  }

  onNodeAction() {
    const selectedId = this.state.selectedNodeId;
    if (selectedId) {
      this.editPanel.open(selectedId);
    }
  }

  updateCanvasDisplay() {
    document.getElementById("zoom-label").textContent =
      this.canvasController.getZoomPercent() + "%";
    this.connectorRenderer.render();
  }

  render() {
    this.nodeRenderer.render();
    this.state.nodes.forEach((node) => {
      this.nodeController.attachNodeListeners(node.id);
    });
    this.connectorRenderer.render();
  }

  fitView() {
    this.canvasController.fitView();
  }
}

const app = new Application();
app.init().catch((err) => console.error("Init failed:", err));
