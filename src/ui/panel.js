// The EditPanel controls the sidebar used for editing a single node
export class EditPanel {
  constructor(panelEl, state, onApply, onDelete) {
    this.panelEl = panelEl;
    this.panelBody = panelEl.querySelector(".panel-body");
    this.panelTitle = panelEl.querySelector(".panel-title");
    this.panelClose = panelEl.querySelector(".panel-close");
    this.state = state;
    this.onApply = onApply;
    this.onDelete = onDelete;
    this.currentNodeId = null;

    this.panelClose.addEventListener("click", () => this.close());
  }

  // open panel and populate fields for given node
  open(nodeId) {
    const node = this.state.getNode(nodeId);
    if (!node) return;

    this.currentNodeId = nodeId;
    this.panelTitle.textContent = `Edit Node #${node.id}`;
    this.render(node);
    this.panelEl.classList.add("open");
  }

  close() {
    this.panelEl.classList.remove("open");
    this.currentNodeId = null;
  }

  isOpen() {
    return this.panelEl.classList.contains("open");
  }

  render(node) {
    const typeLabel = this.getTypeLabel(node.type);
    const typeColor = this.getTypeColor(node.type);

    let optionsHTML = "";
    if (node.type !== "end") {
      optionsHTML = this.renderOptionsSection(node);
    }

    this.panelBody.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="node-type-badge" style="color:${typeColor};background:${typeColor}1a;border:1px solid ${typeColor}44;">
          ${typeLabel} Node
        </span>
      </div>

      <div class="field-group">
        <label class="field-label">Question / Message Text</label>
        <textarea class="field-textarea" id="edit-text">${this.escapeHtml(node.text)}</textarea>
      </div>

      ${optionsHTML}

      <div style="display:flex;gap:8px;margin-top:4px;">
        <button class="btn btn-primary" id="btn-apply" style="flex:1;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Apply
        </button>
        <button class="btn btn-danger" id="btn-delete-node">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div>
    `;

    this.attachEventListeners(node);
  }

  renderOptionsSection(node) {
    const optionsRows = node.options
      .map(
        (o, i) => `
      <div class="option-row" data-index="${i}">
        <input class="field-input option-label-input" value="${this.escapeHtml(o.label)}" placeholder="Option label" data-index="${i}" />
        <button class="btn-icon danger remove-option" data-index="${i}" title="Remove">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `,
      )
      .join("");

    return `
      <div class="field-group">
        <label class="field-label">Options</label>
        <div class="options-list" id="options-list">
          ${optionsRows}
        </div>
        <button class="btn-add-option" id="btn-add-option">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Option
        </button>
      </div>
    `;
  }

  // wire up buttons and inputs inside the panel
  attachEventListeners(node) {
    const applyBtn = document.getElementById("btn-apply");
    const deleteBtn = document.getElementById("btn-delete-node");
    const addOptBtn = document.getElementById("btn-add-option");

    if (applyBtn) {
      applyBtn.addEventListener("click", () => this.handleApply(node));
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => this.handleDelete(node.id));
    }

    if (addOptBtn) {
      addOptBtn.addEventListener("click", () => {
        this.state.addOption(node.id);
        this.open(node.id);
        this.onApply?.();
      });
    }

    document.querySelectorAll(".remove-option").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        this.state.removeOption(node.id, idx);
        this.open(node.id);
        this.onApply?.();
      });
    });

    const textArea = document.getElementById("edit-text");
    if (textArea) {
      textArea.addEventListener("input", (e) => {
        node.text = e.target.value;
      });
    }
  }

  // commit edits from panel back to state
  handleApply(node) {
    const textArea = document.getElementById("edit-text");
    if (textArea) {
      node.text = textArea.value;
    }

    const optInputs = document.querySelectorAll(".option-label-input");
    optInputs.forEach((inp) => {
      const idx = parseInt(inp.dataset.index);
      if (node.options[idx]) {
        node.options[idx].label = inp.value;
      }
    });

    this.state.saveSnapshot();
    this.onApply?.();
  }

  handleDelete(nodeId) {
    if (this.state.deleteNode(nodeId)) {
      this.close();
      this.onApply?.();
    }
  }

  getTypeLabel(type) {
    const labels = { start: "Start", question: "Question", end: "End" };
    return labels[type] || type;
  }

  getTypeColor(type) {
    const colors = {
      start: "var(--node-start)",
      question: "var(--node-q)",
      end: "var(--node-end)",
    };
    return colors[type] || "#a78bfa";
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
