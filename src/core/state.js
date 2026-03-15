// Manages the mutable graph and history snapshots
export class FlowState {
  constructor(flowData) {
    this.nodes = JSON.parse(JSON.stringify(flowData.nodes));
    this.meta = flowData.meta;
    this.selectedNodeId = null;
    this.history = [];
    this.historyIndex = -1;
    this.saveSnapshot();
  }

  // locate node by id
  getNode(id) {
    return this.nodes.find((n) => n.id === id);
  }

  // apply shallow updates to a node and snapshot state
  updateNode(id, updates) {
    const node = this.getNode(id);
    if (!node) return;
    Object.assign(node, updates);
    this.saveSnapshot();
  }

  // remove node and purge any incoming references
  deleteNode(id) {
    if (this.getNode(id)?.type === "start") return false;
    this.nodes = this.nodes.filter((n) => n.id !== id);
    this.nodes.forEach((n) => {
      n.options = n.options.filter((o) => o.nextId !== id);
    });
    this.saveSnapshot();
    return true;
  }

  addOption(nodeId, optionLabel = "New Option", nextId = "") {
    const node = this.getNode(nodeId);
    if (node && node.type !== "end") {
      node.options.push({ label: optionLabel, nextId });
      this.saveSnapshot();
    }
  }

  removeOption(nodeId, index) {
    const node = this.getNode(nodeId);
    if (node && node.options[index]) {
      node.options.splice(index, 1);
      this.saveSnapshot();
    }
  }

  updateOption(nodeId, index, updates) {
    const node = this.getNode(nodeId);
    if (node && node.options[index]) {
      Object.assign(node.options[index], updates);
      this.saveSnapshot();
    }
  }

  moveNodePosition(id, x, y) {
    const node = this.getNode(id);
    if (node) {
      node.position = { x, y };
      this.saveSnapshot();
    }
  }

  selectNode(id) {
    this.selectedNodeId = id;
  }

  deselectNode() {
    this.selectedNodeId = null;
  }

  // record current nodes array for undo/redo timeline
  saveSnapshot() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.parse(JSON.stringify(this.nodes)));
    this.historyIndex++;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.nodes = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.nodes = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      return true;
    }
    return false;
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  exportFlow() {
    return {
      meta: this.meta,
      nodes: JSON.parse(JSON.stringify(this.nodes)),
    };
  }
}
