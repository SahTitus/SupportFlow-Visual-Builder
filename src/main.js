import { FlowState } from "./core/state.js";
import { CanvasTransform } from "./core/canvas.js";
import { NodeRenderer } from "./ui/renderer.js";
import { ConnectorRenderer } from "./ui/connectors.js";
import { CanvasController } from "./controllers/canvasController.js";
import { NodeController } from "./controllers/nodeController.js";

class Application {
  constructor() {
    this.state = null;
    this.transform = null;
    this.nodeRenderer = null;
    this.connectorRenderer = null;
    this.canvasController = null;
    this.nodeController = null;
  }

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

  async loadFlowData() {
    const response = await fetch("/data/flow_data.json");
    return response.json();
  }

  setupUI() {
    const canvas = document.getElementById("canvas");
    const svgLayer = document.getElementById("svg-layer");
    this.nodeRenderer = new NodeRenderer(canvas, this.state);
    this.connectorRenderer = new ConnectorRenderer(
      svgLayer,
      canvas,
      this.state,
      this.transform,
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

    this.nodeController = new NodeController(
      canvas,
      this.state,
      this.canvasController,
      () => this.render(),
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