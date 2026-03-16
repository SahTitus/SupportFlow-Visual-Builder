// This encapsulates traversal and validation logic for the node graph
export class FlowEngine {
  constructor(state) {
    this.state = state;
  }

  // return the first designated start node encountered
  getStartNode() {
    return this.state.getNode(
      this.state.nodes.find((n) => n.type === "start")?.id,
    );
  }

  getNextNode(nodeId, selectedOptionId) {
    const currentNode = this.state.getNode(nodeId);
    if (!currentNode) return null;

    const option = currentNode.options[selectedOptionId];
    if (!option) return null;

    return this.state.getNode(option.nextId);
  }

  // simple predicate for end nodes
  isEndNode(nodeId) {
    const node = this.state.getNode(nodeId);
    return node?.type === "end";
  }

  traverse(nodeId, optionIndex) {
    const currentNode = this.state.getNode(nodeId);
    if (!currentNode || optionIndex >= currentNode.options.length) {
      return null;
    }

    const selectedOption = currentNode.options[optionIndex];
    return this.state.getNode(selectedOption.nextId);
  }

  // verify graph for missing targets, dangling references
  validateFlow() {
    const errors = [];
    const visited = new Set();

    const walk = (nodeId, path = []) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = this.state.getNode(nodeId);
      if (!node) {
        errors.push(`Node ${nodeId} not found`);
        return;
      }

      if (node.type === "end") return;

      node.options.forEach((opt, idx) => {
        if (!opt.nextId) {
          errors.push(`Node ${nodeId} option ${idx} has no target`);
        } else if (!this.state.getNode(opt.nextId)) {
          errors.push(
            `Node ${nodeId} option ${idx} references non-existent node ${opt.nextId}`,
          );
        } else {
          walk(opt.nextId, [...path, nodeId]);
        }
      });
    };

    const startNode = this.getStartNode();
    if (startNode) walk(startNode.id);

    return errors;
  }
}
