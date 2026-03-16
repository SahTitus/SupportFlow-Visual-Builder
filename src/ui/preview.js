export class PreviewUI {
   // Inject root elements and dependencies for testing
  constructor(overlayEl, state, flowEngine) {
    this.overlayEl = overlayEl;
    this.state = state;
    this.flowEngine = flowEngine;
    this.messagesContainer = overlayEl.querySelector(".chat-messages");
    this.bottomContainer = overlayEl.querySelector("#chat-bottom");
    this.closeBtn = overlayEl.querySelector("#btn-close-preview");
    this.isActive = false;
  }

  // show the overlay and reset previous conversation
  activate() {
    this.isActive = true;
    this.overlayEl.classList.add("active");
    this.messagesContainer.innerHTML = "";
    this.bottomContainer.innerHTML = "";

    const startNode = this.flowEngine.getStartNode();
    if (startNode) {
      this.showNode(startNode.id);
    }
  }

  // hide the overlay without altering state
  deactivate() {
    this.isActive = false;
    this.overlayEl.classList.remove("active");
  }

  // render a single node
  showNode(nodeId) {
    const node = this.state.getNode(nodeId);
    if (!node) return;

    this.bottomContainer.innerHTML = "";
    this.addBotMessage(node.text);

    if (this.flowEngine.isEndNode(nodeId)) {
      // slightly delay transition
      setTimeout(() => this.renderEndState(), 400);
      return;
    }

    if (node.options.length) {
      setTimeout(() => this.renderOptions(node), 350);
    }
  }

  // create buttons for node options and wire transitions
  renderOptions(node) {
    const optWrap = document.createElement("div");
    optWrap.className = "chat-options";

    node.options.forEach((opt, index) => {
      const btn = document.createElement("button");
      btn.className = "chat-option-btn";
      btn.textContent = opt.label;

      btn.addEventListener("click", () => {
        this.addUserMessage(opt.label);
        optWrap.remove();
        setTimeout(() => {
          const nextNode = this.flowEngine.traverse(node.id, index);
          if (nextNode) this.showNode(nextNode.id);
        }, 500);
      });

      optWrap.appendChild(btn);
    });

    this.bottomContainer.appendChild(optWrap);
  }

  // show final state with restart button
  renderEndState() {
    const endEl = document.createElement("div");
    endEl.className = "chat-end-state";
    endEl.innerHTML = `
      <div class="end-label">Conversation ended</div>
      <button class="btn btn-ghost" id="btn-restart" style="font-size:12px;padding:7px 16px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.37"/></svg>
        Restart
      </button>
    `;

    this.bottomContainer.appendChild(endEl);

    document.getElementById("btn-restart").addEventListener("click", () => {
      this.messagesContainer.innerHTML = "";
      this.bottomContainer.innerHTML = "";
      const startNode = this.flowEngine.getStartNode();
      if (startNode) this.showNode(startNode.id);
    });
  }

  // append a message from the bot and scroll into view
  addBotMessage(text) {
    const wrap = document.createElement("div");
    wrap.className = "msg msg-bot";
    wrap.innerHTML = `
      <div class="msg-label">SupportFlow Bot</div>
      <div class="msg-bubble">${this.escapeHtml(text)}</div>
    `;
    this.messagesContainer.appendChild(wrap);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  // addBotMessage for the user
  addUserMessage(text) {
    const wrap = document.createElement("div");
    wrap.className = "msg msg-user";
    wrap.innerHTML = `
      <div class="msg-label">You</div>
      <div class="msg-bubble">${this.escapeHtml(text)}</div>
    `;
    this.messagesContainer.appendChild(wrap);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  // utility to avoid XSS by letting the browser escape text
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
