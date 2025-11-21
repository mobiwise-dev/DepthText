/**
 * DepthText v1.0.1 - TypeScript
 * https://mobiwise.dev | https://github.com/mobiwise-dev/depthtext
 * MIT License | (c) 2025
 *
 * - Compatible SSR (guards around window/document)
 * - Designed to be bundled (tsup / rollup / vite)
 * - Exports: DepthTextInstance, DEPTHTEXT_DEFAULTS, DepthTextify
 */

/* ===========================================================================
   Types & Defaults
   =========================================================================== */

export interface DepthTextOptions {
  depth?: string; // e.g. "1rem", "20px"
  direction?: "both" | "backwards" | "forwards";
  event?: "none" | "pointer" | "scroll" | "scrollX" | "scrollY";
  eventRotation?: string; // e.g. "30deg"
  eventDirection?: "default" | "reverse";
  fade?: boolean | string;
  layers?: number | string;
  perspective?: string;
  engaged?: boolean | string;
  addClass?: string; // New option to add a custom CSS class
}

export const DEPTHTEXT_DEFAULTS: Required<Pick<DepthTextOptions, "depth" | "direction" | "event" | "eventRotation" | "eventDirection" | "fade" | "layers" | "perspective" | "engaged" | "addClass">> = {
  depth: "1rem",
  direction: "both",
  event: "none",
  eventRotation: "30deg",
  eventDirection: "default",
  fade: false,
  layers: 10,
  perspective: "500px",
  engaged: true,
  addClass: "", // By default, no additional class
};

/* ===========================================================================
   Global manager (singleton) - keeps one RAF and one pointer/scroll listener
   =========================================================================== */

type MaybeElement = HTMLElement | Element | null | any;

const DEPTHTEXT_GLOBAL = {
  instances: new Set<DepthTextInstance>(),
  rafId: null as number | null,

  // Target values (where we want to be)
  targetX: 0,
  targetY: 0,

  // Current values (where we are currently)
  currentX: 0,
  currentY: 0,

  // Smoothing factor (0.1 = smooth, 1 = instant)
  lerpFactor: 0.1,

  // State
  isMoving: false,
  hasPointerListener: false,
  hasScrollListener: false,

  requestLoop() {
    if (this.isMoving) return;
    this.isMoving = true;
    this.tick();
  },

  tick() {
    // 1. Interpolate pointer values
    // Simple lerp: current = current + (target - current) * factor
    const dx = this.targetX - this.currentX;
    const dy = this.targetY - this.currentY;

    this.currentX += dx * this.lerpFactor;
    this.currentY += dy * this.lerpFactor;

    // Check if we are "close enough" to stop (optimization)
    const isSettled = Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001;

    // 2. Update all instances
    this.updateAll();

    // 3. Continue loop if not settled, otherwise stop
    if (!isSettled) {
      this.rafId = requestAnimationFrame(() => this.tick());
    } else {
      // Snap to target to finish
      this.currentX = this.targetX;
      this.currentY = this.targetY;
      this.updateAll(); // Final update
      this.isMoving = false;
      this.rafId = null;
    }
  },

  updateAll() {
    this.instances.forEach((inst) => {
      if (!inst.isVisible) return;

      // POINTER: Use the smoothed global values
      if (inst.options.event === "pointer") {
        inst.tilt(this.currentX, this.currentY);
      }

      // SCROLL: Scroll usually doesn't need the same lerp loop unless we want to smooth scroll too.
      // For now, we'll keep scroll direct or we could add separate smoothing for scroll.
      // To fix "trembling" in scroll, we might want to just read values directly.
      if (inst.options.event === "scroll" || inst.options.event === "scrollX" || inst.options.event === "scrollY") {
        inst.handleScrollGlobal();
      }
    });
  },

  attachPointerIfNeeded() {
    if (this.hasPointerListener) return;
    if (typeof window === "undefined") return;

    this._pointerHandler = (e: PointerEvent | TouchEvent) => {
      let cx = 0,
        cy = 0;
      if ("clientX" in e && typeof (e as PointerEvent).clientX === "number") {
        cx = (e as PointerEvent).clientX;
        cy = (e as PointerEvent).clientY;
      } else if ("touches" in e && (e as TouchEvent).touches && (e as TouchEvent).touches.length) {
        cx = (e as TouchEvent).touches[0].clientX;
        cy = (e as TouchEvent).touches[0].clientY;
      }
      // Update TARGET values
      this.targetX = (cx / window.innerWidth - 0.5) * 2;
      this.targetY = (cy / window.innerHeight - 0.5) * 2;

      // Start the loop
      this.requestLoop();
    };

    window.addEventListener("pointermove" as any, this._pointerHandler, { passive: true } as any);
    this.hasPointerListener = true;
  },

  detachPointerIfUnused() {
    const need = [...this.instances].some((i) => i.options.event === "pointer");
    if (!need && this.hasPointerListener && typeof window !== "undefined") {
      window.removeEventListener("pointermove" as any, this._pointerHandler as any);
      this._pointerHandler = undefined;
      this.hasPointerListener = false;
    }
  },

  attachScrollIfNeeded() {
    if (this.hasScrollListener) return;
    if (typeof window === "undefined") return;

    this._scrollHandler = () => {
      // For scroll, we just request a single update (or loop if we wanted scroll smoothing)
      // The original code just requested a tick. Let's just call updateAll directly via RAF to avoid complex scroll-jacking logic for now,
      // or better, reuse the loop if we want to smooth scroll.
      // But scroll is usually controlled by the user's scrollbar which is already "smooth" or "direct".
      // Let's just do a direct update for scroll to ensure responsiveness.
      requestAnimationFrame(() => this.updateAll());
    };

    window.addEventListener("scroll", this._scrollHandler, { passive: true } as any);
    this.hasScrollListener = true;
  },

  detachScrollIfUnused() {
    const need = [...this.instances].some((i) => ["scroll", "scrollX", "scrollY"].includes(i.options.event));
    if (!need && this.hasScrollListener && typeof window !== "undefined") {
      window.removeEventListener("scroll", this._scrollHandler as any);
      this._scrollHandler = undefined;
      this.hasScrollListener = false;
    }
  },

  // internals (set after creation)
  _pointerHandler: undefined as undefined | ((e: any) => void),
  _scrollHandler: undefined as undefined | (() => void),
};

/* expose for debugging in browser, optional */
if (typeof window !== "undefined") {
  (window as any).DEPTHTEXT_GLOBAL = DEPTHTEXT_GLOBAL;
}

/* ===========================================================================
   DepthTextInstance - core class
   - Option C2 typing: DOM types are optional/loose but autocompletion-friendly
   =========================================================================== */

export class DepthTextInstance {
  element: MaybeElement;
  options: Required<DepthTextOptions>;
  wrapper: MaybeElement | null = null;
  layersContainer: MaybeElement | null = null;
  _layerContentTemplate: DocumentFragment | null = null;
  _originalStyles = new Map<string, string>();
  intersectionObserver: any = null;
  resizeObserver: any = null;
  depthValue = 0;
  depthUnit = "rem";
  rotationValue = 0;
  rotationUnit = "deg";
  isVisible = true;

  constructor(element: MaybeElement, options: DepthTextOptions = {}) {
    if (!element) throw new Error("DepthTextInstance: element required");
    this.element = element;
    this.options = this._validateOptions(options);
    // parse and init only if engaged
    if (this.options.engaged === false) return;
    this._parseUnits();
    this._storeOriginalState();
    this._createStructure();
    this._setupObservers();
    this._enableGlobalHooks();
  }

  /* -------------------------
     options validation
  ------------------------- */
  _validateOptions(options: DepthTextOptions): Required<DepthTextOptions> {
    const normalizeAddClass = (v: any): string => {
      if (!v && v !== "") return DEPTHTEXT_DEFAULTS.addClass;
      if (Array.isArray(v)) return v.map(String).join(" ").trim().replace(/\s+/g, " ");
      return String(v).trim().replace(/\s+/g, " ");
    };

    const merged: Required<DepthTextOptions> = {
      ...DEPTHTEXT_DEFAULTS,
      ...options,
      fade: options.fade === true || options.fade === "true" ? true : DEPTHTEXT_DEFAULTS.fade,
      layers: ((): number => {
        const raw = options.layers ?? DEPTHTEXT_DEFAULTS.layers;
        const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
        const clamped: number = isFinite(n) ? Math.min(Math.max(1, n), 40) : Number(DEPTHTEXT_DEFAULTS.layers);
        if (clamped > 25) console.warn(`DepthText: ${clamped} layers may affect performance`);
        return clamped;
      })(),
      engaged: options.engaged === false || options.engaged === "false" ? false : DEPTHTEXT_DEFAULTS.engaged,
      depth: options.depth ?? DEPTHTEXT_DEFAULTS.depth,
      direction: options.direction ?? DEPTHTEXT_DEFAULTS.direction,
      event: options.event ?? DEPTHTEXT_DEFAULTS.event,
      eventRotation: options.eventRotation ?? DEPTHTEXT_DEFAULTS.eventRotation,
      eventDirection: options.eventDirection ?? DEPTHTEXT_DEFAULTS.eventDirection,
      perspective: options.perspective ?? DEPTHTEXT_DEFAULTS.perspective,
      addClass: normalizeAddClass(options.addClass ?? DEPTHTEXT_DEFAULTS.addClass), // Normalized string
    };
    return merged;
  }

  /* -------------------------
     parse numeric units
  ------------------------- */
  _parseUnits() {
    const d = String(this.options.depth);
    const dNum = parseFloat(d);
    this.depthValue = isFinite(dNum) ? dNum : 1;
    this.depthUnit = d.replace(/[0-9.\-\s]/g, "") || "rem";

    const r = String(this.options.eventRotation);
    const rNum = parseFloat(r);
    this.rotationValue = isFinite(rNum) ? rNum : 30;
    this.rotationUnit = r.replace(/[0-9.\-\s]/g, "") || "deg";
  }

  /* -------------------------
     store original content and styles (create a single template clone)
  ------------------------- */
  _storeOriginalState() {
    const styleProps = ["display", "position", "perspective", "webkitPerspective"];
    styleProps.forEach((p) => {
      try {
        this._originalStyles.set(p, this.element?.style?.[p] ?? "");
      } catch {
        this._originalStyles.set(p, "");
      }
    });

    // Pull children into a fragment
    const temp = ((): DocumentFragment => {
      const frag = document.createDocumentFragment();
      try {
        while (this.element && (this.element as any).firstChild) {
          frag.appendChild((this.element as any).firstChild);
        }
      } catch {
        // SSR-safety: if element isn't DOM-like, do nothing
      }
      return frag;
    })();

    // store a clone to use as template for each layer
    this._layerContentTemplate = temp.cloneNode(true) as DocumentFragment;
  }

  /* -------------------------
     create DOM structure
  ------------------------- */
  _createStructure() {
    // Apply basic inline styles to host element (safe: doesn't require window)
    try {
      const elStyle = (this.element as any).style;
      if (elStyle) {
        elStyle.display = elStyle.display || "inline-block";
        elStyle.position = elStyle.position || "relative";
        elStyle.perspective = elStyle.perspective || this.options.perspective;
        elStyle.webkitPerspective = elStyle.webkitPerspective || this.options.perspective;
      }
    } catch {
      /* ignore for non-DOM hosts */
    }

    // wrapper that will receive will-change & transform
    const wrapper = document.createElement ? document.createElement("span") : ({} as any);
    wrapper.className = "depthtext-wrapper";
    try {
      Object.assign(wrapper.style, {
        display: "inline-block",
        transformStyle: "preserve-3d",
        willChange: "transform",
      });
    } catch {
      /* ignore */
    }
    this.wrapper = wrapper;

    // layers container
    const layersContainer = document.createElement ? document.createElement("span") : ({} as any);
    layersContainer.className = "depthtext-layers";
    try {
      Object.assign(layersContainer.style, {
        display: "inline-block",
        transformStyle: "preserve-3d",
      });
      layersContainer.setAttribute("aria-hidden", "true");
    } catch {
      /* ignore */
    }
    this.layersContainer = layersContainer;

    // append
    try {
      (wrapper as any).appendChild(layersContainer);
      (this.element as any).appendChild(wrapper);
    } catch {
      // if element isn't DOM-like, skip append (still usable programmatically)
    }

    // build layers (off DOM)
    this._createLayers();
  }

  _createLayers() {
    const frag = document.createDocumentFragment();
    const layers = Number(this.options.layers);
    const dir = this.options.direction;
    const fade = Boolean(this.options.fade);
    const template = this._layerContentTemplate;

    for (let i = 0; i < layers; i++) {
      const layer = document.createElement ? document.createElement("span") : ({} as any);
      const baseClass = "depthtext-layer";

      // set base class first
      if ((layer as any).classList && (layer as any).classList.add) {
        (layer as any).classList.add(baseClass);
        // Add the custom classes (support multiple classes separated by whitespace)
        if (this.options.addClass) {
          const clsList = String(this.options.addClass)
            .split(/\s+/)
            .map((c) => c.trim())
            .filter(Boolean);
          clsList.forEach((c) => {
            try {
              (layer as any).classList.add(c);
            } catch {
              /* ignore */
            }
          });
        }
      } else {
        // fallback for non-DOM envs
        let layerClass = baseClass;
        if (this.options.addClass) layerClass += " " + this.options.addClass;
        (layer as any).className = layerClass;
      }

      // clone template content for each layer
      if (template && (layer as any).appendChild) {
        layer.appendChild(template.cloneNode(true));
      }

      const pct = i / layers;
      const t = this._calculateTranslation(pct, dir);
      try {
        (layer as any).style.transform = `translateZ(${t}${this.depthUnit})`;
        (layer as any).style.display = "inline-block";
      } catch {
        /* ignore */
      }

      if (i >= 1) {
        try {
          Object.assign((layer as any).style, {
            position: "absolute",
            top: "0",
            left: "0",
            pointerEvents: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          });
          (layer as any).setAttribute("aria-hidden", "true");
          if (fade) (layer as any).style.opacity = String((1 - pct) / 2);
        } catch {
          /* ignore */
        }
      }
      frag.appendChild(layer);
    }

    // append built fragment (best-effort)
    try {
      this.layersContainer?.appendChild(frag);
    } catch {
      /* ignore */
    }
  }

  _calculateTranslation(pct: number, direction: string) {
    switch (direction) {
      case "backwards":
        return -pct * this.depthValue;
      case "forwards":
        return -(pct * this.depthValue) + this.depthValue;
      case "both":
      default:
        return -(pct * this.depthValue) + this.depthValue / 2;
    }
  }

  /* -------------------------
     IntersectionObserver + ResizeObserver
  ------------------------- */
  _setupObservers() {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      // noop for SSR or very old envs
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const entry = entries[0];
        if (!entry) return;
        this.isVisible = entry.isIntersecting;
        if (!this.isVisible) this.tilt(0, 0);
        else DEPTHTEXT_GLOBAL.updateAll();
      },
      { threshold: 0 }
    );

    try {
      this.intersectionObserver.observe(this.element as Element);
    } catch {
      /* ignore */
    }

    if (typeof ResizeObserver !== "undefined") {
      try {
        this.resizeObserver = new ResizeObserver(() => {
          DEPTHTEXT_GLOBAL.updateAll();
        });
        this.resizeObserver.observe(this.element as Element);
      } catch {
        /* ignore */
      }
    }
  }

  /* -------------------------
     Register with global manager & attach global listeners if needed
  ------------------------- */
  _enableGlobalHooks() {
    DEPTHTEXT_GLOBAL.instances.add(this);
    if (this.options.event === "pointer") DEPTHTEXT_GLOBAL.attachPointerIfNeeded();
    if (["scroll", "scrollX", "scrollY"].includes(this.options.event)) DEPTHTEXT_GLOBAL.attachScrollIfNeeded();
  }

  /* -------------------------
     Apply tilt (called by global RAF or pointer handler)
  ------------------------- */
  tilt(xPct = 0, yPct = 0) {
    if (!this.wrapper) return;
    const mul = this.options.eventDirection === "reverse" ? -1 : 1;
    const xTilt = xPct * this.rotationValue * mul;
    const yTilt = -yPct * this.rotationValue * mul;
    try {
      (this.wrapper as any).style.transform = `rotateX(${yTilt}${this.rotationUnit}) rotateY(${xTilt}${this.rotationUnit})`;
    } catch {
      /* ignore for non-DOM targets */
    }
  }

  /* -------------------------
     Recompute tilt from scroll (per-instance logic)
  ------------------------- */
  handleScrollGlobal() {
    if (typeof window === "undefined") return;
    try {
      const rect = (this.element as Element).getBoundingClientRect();
      let xPct = 0,
        yPct = 0;
      if (this.options.event === "scroll" || this.options.event === "scrollX") {
        const centerX = rect.left + rect.width / 2 - window.innerWidth / 2;
        xPct = (centerX / window.innerWidth) * 2;
      }
      if (this.options.event === "scroll" || this.options.event === "scrollY") {
        const centerY = rect.top + rect.height / 2 - window.innerHeight / 2;
        yPct = (centerY / window.innerHeight) * 2;
      }
      this.tilt(xPct, yPct);
    } catch {
      /* ignore in non-DOM contexts */
    }
  }

  /* -------------------------
     Destroy instance (cleanup)
  ------------------------- */
  destroy() {
    try {
      this.intersectionObserver?.disconnect();
    } catch {}
    try {
      this.resizeObserver?.disconnect();
    } catch {}

    // restore original content if template exists
    try {
      if (this.element) {
        (this.element as any).innerHTML = "";
        if (this._layerContentTemplate) {
          (this.element as any).appendChild(this._layerContentTemplate.cloneNode(true));
        }
      }
    } catch {
      /* ignore */
    }

    // restore inline styles
    this._originalStyles.forEach((v, k) => {
      try {
        (this.element as any).style[k] = v || "";
      } catch {}
    });

    DEPTHTEXT_GLOBAL.instances.delete(this);
    DEPTHTEXT_GLOBAL.detachPointerIfUnused();
    DEPTHTEXT_GLOBAL.detachScrollIfUnused();

    try {
      delete (this.element as any)._depthTextInstance;
    } catch {
      (this.element as any)._depthTextInstance = undefined;
    }
  }
}

/* ===========================================================================
   Auto-init + API
   - Auto-initialize elements with data-depth attributes
   - Provide global DepthTextify(selector, options)
   =========================================================================== */

export function DepthTextify(selectorOrOptions?: string | DepthTextOptions, maybeOptions?: DepthTextOptions) {
  // Overloads:
  // DepthTextify() -> init all [data-depth]
  // DepthTextify(selector) -> init selector
  // DepthTextify(selector, options) -> init selector with options
  // DepthTextify(undefined, options) -> init [data-depth] with options
  if (typeof window === "undefined") return [];

  let selector = "[data-depth]";
  let options: DepthTextOptions | undefined = undefined;

  if (typeof selectorOrOptions === "string") {
    selector = selectorOrOptions;
    options = maybeOptions;
  } else if (typeof selectorOrOptions === "object" && selectorOrOptions !== null) {
    // user passed options as first arg
    options = selectorOrOptions as DepthTextOptions;
  }

  const nodes = Array.from(document.querySelectorAll(selector));
  const instances: DepthTextInstance[] = [];
  nodes.forEach((el) => {
    try {
      // read data-depth-* attributes (HTML API)
      const dataOptions: DepthTextOptions = {
        depth: (el as HTMLElement).dataset?.depthDepth ?? (el as HTMLElement).dataset?.depth ?? undefined,
        direction: (el as HTMLElement).dataset?.depthDirection as any,
        event: (el as HTMLElement).dataset?.depthEvent as any,
        eventRotation: (el as HTMLElement).dataset?.depthEventrotation ?? (el as HTMLElement).dataset?.depthEventRotation,
        eventDirection: (el as HTMLElement).dataset?.depthEventdirection as any,
        fade: (el as HTMLElement).dataset?.depthFade as any,
        layers: (el as HTMLElement).dataset?.depthLayers as any,
        perspective: (el as HTMLElement).dataset?.depthPerspective as any,
        engaged: (el as HTMLElement).dataset?.depth as any,
        // Try multiple variants to be tolerant (common HTML attr: data-depth-add-class)
        addClass: (el as HTMLElement).dataset?.depthAddClass ?? (el as HTMLElement).dataset?.depthAddclass ?? (el as HTMLElement).dataset?.depthAdd ?? (el as HTMLElement).dataset?.addClass ?? undefined,
      };

      const mergedOptions = { ...(options || {}), ...(dataOptions || {}) };
      // destroy existing instance if present
      if ((el as any)._depthTextInstance) {
        try {
          (el as any)._depthTextInstance.destroy();
        } catch {}
      }
      const inst = new DepthTextInstance(el as MaybeElement, mergedOptions);
      (el as any)._depthTextInstance = inst;
      instances.push(inst);
    } catch (err) {
      // swallow errors per-element so a broken node doesn't stop others
      // eslint-disable-next-line no-console
      console.error("DepthTextify: failed to initialize element", err);
    }
  });

  return instances.length === 1 ? instances[0] : instances;
}

/* Auto init on DOMContentLoaded */
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    DepthTextify();
  });

  // Mutation observer to auto-init dynamically added elements
  if (typeof MutationObserver !== "undefined") {
    let tid: any = null;
    const mo = new MutationObserver(() => {
      if (tid) clearTimeout(tid);
      tid = setTimeout(() => {
        DepthTextify();
        tid = null;
      }, 50);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // Expose on window for convenience
  try {
    (window as any).DepthTextify = DepthTextify;
  } catch {
    /* ignore */
  }
}

/* Export default names */
export default DepthTextInstance;
