import { FlowState } from "./core/state.js";
import { CanvasTransform } from "./core/canvas.js";
import { FlowEngine } from "./core/flow.js";
import { NodeRenderer } from "./ui/renderer.js";
import { ConnectorRenderer } from "./ui/connectors.js";
import { EditPanel } from "./ui/panel.js";
import { PreviewUI } from "./ui/preview.js";
import { CanvasController } from "./controllers/canvasController.js";
import { NodeController } from "./controllers/nodeController.js";
import { PreviewController } from "./controllers/previewController.js";
import { Minimap } from "./ui/minimap.js";

class Application {
  constructor() {
    this.state = null;
    this.transform = null;
    this.flowEngine = null;
    this.nodeRenderer = null;
    this.connectorRenderer = null;
    this.editPanel = null;
    this.previewUI = null;
    this.canvasController = null;
    this.nodeController = null;
    this.previewController = null;
    this.minimap = null;
  }

  // bootstrap state and UI
  async init() {
    const flowData = await this.loadFlowData();
    this.state = new FlowState(flowData);
    this.transform = new CanvasTransform();
    this.flowEngine = new FlowEngine(this.state);

    this.setupUI();
    this.setupControllers();
    this.render();
    this.fitView();

    // This event listener keep connectors and minimap aligned with layout changes
    window.addEventListener("resize", () => {
      this.connectorRenderer.render();
      this.minimap.render();
    });
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
    const previewOverlay = document.getElementById("preview-overlay");
    const minimapCanvas = document.getElementById("minimap-canvas");
    const canvasWrap = document.getElementById("canvas-wrap");

    // renderers own DOM creation for nodes and connectors
    this.nodeRenderer = new NodeRenderer(canvas, this.state);
    this.connectorRenderer = new ConnectorRenderer(
      svgLayer,
      canvas,
      this.state,
      this.transform,
    );

    this.editPanel = new EditPanel(
      editPanelEl,
      this.state,
      () => this.render(),
      () => {
        // handle delete
      },
    );

    // Read DOM geometry to follow the setup
    this.minimap = new Minimap(
      minimapCanvas,
      svgLayer,
      canvasWrap,
      this.state,
      this.transform,
    );

    this.previewUI = new PreviewUI(previewOverlay, this.state, this.flowEngine);
  }

  setupControllers() {
    const canvas = document.getElementById("canvas");
    const canvasWrap = document.getElementById("canvas-wrap");
    const playBtn = document.getElementById("btn-play");

    // controller for pan/zoom and drag behaviors
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
      () => this.onNodeAction(),
    );

    // Toggles overlay and badges
    this.previewController = new PreviewController(
      playBtn,
      this.previewUI,
      this.state,
    );
    this.previewController.setupEventListeners();

    this.setupZoomButtons();
    this.setupKeyboardShortcuts();
  }

  setupZoomButtons() {
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

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          if (this.state.undo()) {
            this.render();
          }
        } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
          e.preventDefault();
          if (this.state.redo()) {
            this.render();
          }
        }
      }

      if (e.key === "Escape") {
        this.state.deselectNode();
        this.editPanel.close();
      }
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
    this.minimap.render();
  }

  render() {
    this.nodeRenderer.render();
    this.attachNodeEventListeners();
    this.connectorRenderer.render();
    this.minimap.render();

    if (this.state.selectedNodeId) {
      this.editPanel.open(this.state.selectedNodeId);
    }
  }

  attachNodeEventListeners() {
    this.state.nodes.forEach((node) => {
      this.nodeController.attachNodeListeners(node.id);
    });
  }

  fitView() {
    this.canvasController.fitView();
  }
}

const app = new Application();
app.init().catch((err) => console.error("Init failed:", err));
