export class PreviewController {
  constructor(playBtn, previewUI, state) {
    this.playBtn = playBtn;
    this.previewUI = previewUI;
    this.state = state;
    this.isActive = false;
  }

  setupEventListeners() {
    this.playBtn.addEventListener("click", () => this.toggle());
    this.previewUI.closeBtn.addEventListener("click", () => this.stop());
  }

  toggle() {
    this.isActive ? this.stop() : this.start();
  }

  start() {
    this.isActive = true;
    this.updateUI();
    this.previewUI.activate();
  }

  stop() {
    this.isActive = false;
    this.updateUI();
    this.previewUI.deactivate();
  }

  updateUI() {
    const editorBadge = document.getElementById("mode-badge-editor");
    const previewBadge = document.getElementById("mode-badge-preview");

    // swap badges and icon depending on mode
    if (this.isActive) {
      editorBadge.style.display = "none";
      previewBadge.style.display = "inline-flex";
      this.playBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        Editor
      `;
    } else {
      editorBadge.style.display = "inline-flex";
      previewBadge.style.display = "none";
      this.playBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Preview
      `;
    }
  }
}
