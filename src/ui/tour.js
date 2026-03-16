export class Tour {
  constructor(overlayEl, steps, { storageKey = "supportflow_tour_seen" } = {}) {
    this.overlayEl = overlayEl;
    this.steps = steps || [];
    this.storageKey = storageKey;
    this.index = 0;
    this.isActive = false;

    if (!overlayEl) return;

    this.backdropEl = overlayEl.querySelector(".tour-backdrop");
    this.highlightEl = overlayEl.querySelector(".tour-highlight");
    this.tooltipEl = overlayEl.querySelector(".tour-tooltip");
    this.titleEl = overlayEl.querySelector(".tour-title");
    this.bodyEl = overlayEl.querySelector(".tour-body");
    this.stepEl = overlayEl.querySelector(".tour-step");
    this.nextBtn = overlayEl.querySelector("#tour-next");
    this.skipBtn = overlayEl.querySelector("#tour-skip");

    this.nextBtn?.addEventListener("click", () => this.next());
    this.skipBtn?.addEventListener("click", () => this.stop(true));

    this.onResize = () => this.positionStep();
    this.onKeyDown = (e) => {
      if (e.key === "Escape") this.stop(true);
    };
  }

  startIfFirstVisit() {
    if (!this.overlayEl) return;
    if (localStorage.getItem(this.storageKey)) return;
    this.start();
  }

  start() {
    if (!this.overlayEl || !this.steps.length) return;
    this.isActive = true;
    this.index = 0;
    this.overlayEl.classList.add("active");
    this.renderStep();
    window.addEventListener("resize", this.onResize);
    document.addEventListener("keydown", this.onKeyDown);
  }

  stop(markSeen = false) {
    if (!this.overlayEl) return;
    this.isActive = false;
    this.overlayEl.classList.remove("active");
    this.highlightEl.style.opacity = "0";
    if (markSeen) localStorage.setItem(this.storageKey, "1");
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("keydown", this.onKeyDown);
  }

  next() {
    if (!this.isActive) return;
    if (this.index >= this.steps.length - 1) {
      this.stop(true);
      return;
    }
    this.index += 1;
    this.renderStep();
  }

  renderStep() {
    const step = this.steps[this.index];
    if (!step) {
      this.stop(true);
      return;
    }

    const target = step.selector ? document.querySelector(step.selector) : null;

    if (step.selector && (!target || !this.isVisible(target))) {
      this.index += 1;
      this.renderStep();
      return;
    }

    this.titleEl.textContent = step.title;
    this.bodyEl.textContent = step.body;
    this.stepEl.textContent = `${this.index + 1} / ${this.steps.length}`;
    this.nextBtn.textContent =
      this.index === this.steps.length - 1 ? "Done" : "Next";

    requestAnimationFrame(() => this.positionStep(target));
  }

  positionStep(target) {
    if (!this.isActive || !this.tooltipEl) return;

    if (!target) {
      this.highlightEl.style.opacity = "0";
      const rect = this.tooltipEl.getBoundingClientRect();
      this.tooltipEl.style.left = `${(window.innerWidth - rect.width) / 2}px`;
      this.tooltipEl.style.top = `${(window.innerHeight - rect.height) / 2}px`;
      return;
    }

    const pad = 8;
    const rect = target.getBoundingClientRect();

    this.highlightEl.style.opacity = "1";
    this.highlightEl.style.left = `${rect.left - pad}px`;
    this.highlightEl.style.top = `${rect.top - pad}px`;
    this.highlightEl.style.width = `${rect.width + pad * 2}px`;
    this.highlightEl.style.height = `${rect.height + pad * 2}px`;

    const tooltipRect = this.tooltipEl.getBoundingClientRect();
    let top = rect.bottom + 12;
    if (top + tooltipRect.height > window.innerHeight - 12) {
      top = rect.top - tooltipRect.height - 12;
    }

    let left = rect.left;
    if (left + tooltipRect.width > window.innerWidth - 12) {
      left = window.innerWidth - tooltipRect.width - 12;
    }
    if (left < 12) left = 12;
    if (top < 12) top = 12;

    this.tooltipEl.style.left = `${left}px`;
    this.tooltipEl.style.top = `${top}px`;
  }

  isVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
}
