![Animation](./demo.png)

# DepthText

[![npm version](https://img.shields.io/npm/v/depthtext.svg?style=flat-square)](https://www.npmjs.com/package/depthtext) [![npm downloads](https://img.shields.io/npm/dm/depthtext.svg?style=flat-square)](https://www.npmjs.com/package/depthtext) [![bundle size](https://img.shields.io/bundlephobia/minzip/depthtext?style=flat-square)](https://bundlephobia.com/package/depthtext) [![jsdelivr hits](https://img.shields.io/jsdelivr/npm/hm/depthtext?style=flat-square)](https://www.jsdelivr.com/package/npm/depthtext) [![GitHub license](https://img.shields.io/github/license/MobiWise-dev/DepthText?style=flat-square)](https://github.com/MobiWise-dev/DepthText/blob/main/LICENSE) [![GitHub stars](https://img.shields.io/github/stars/MobiWise-dev/DepthText?style=flat-square)](https://github.com/MobiWise-dev/DepthText/stargazers)

DepthText is a lightweight, dependency-free JavaScript library that creates smooth multi-layer 3D text with depth, parallax, and interactive rotation.  
Designed for high performance, accessibility, and modern UX motion guidelines.

It is the spiritual successor of ztext.js, but rewritten from scratch with a cleaner API, better performance, and a modern ES module architecture.

---

## ✨ Features

- 🌀 **True 3D layered depth** using CSS `transform-style: preserve-3d`
- 🖱️ **Interactive rotation** (auto, pointer, scroll…)
- 🎚️ **Configurable number of layers**
- 🎨 Optional **fade effect** across layers
- ⚡ **GPU-optimized** and jank-free
- 🦾 **Accessibility-friendly** (`aria-hidden`, reduced-motion support)
- 🔥 **No dependencies**, only 4–6 KB minified
- 📦 Works with bundlers, ES modules, and browsers
- 🖼️ **Supports images, SVGs, and emojis** within text content
- 🎭 **Custom CSS classes** for advanced styling control

---

## 🛠 Installation

### NPM

```bash
npm install depthtext
```

### CDN

#### jsDelivr (Recommended)

```html
<!-- ESM -->
<script type="module">
  import { DepthTextify } from "https://cdn.jsdelivr.net/npm/depthtext@latest/dist/depthtext.mjs";
  DepthTextify();
</script>

<!-- Global/IIFE (classic script tag) -->
<script src="https://cdn.jsdelivr.net/npm/depthtext@latest/dist/depthtext.global.js"></script>
<script>
  DepthText.DepthTextify();
</script>
```

#### unpkg

```html
<!-- ESM -->
<script type="module">
  import { DepthTextify } from "https://unpkg.com/depthtext@latest/dist/depthtext.mjs";
  DepthTextify();
</script>

<!-- Global/IIFE -->
<script src="https://unpkg.com/depthtext@latest/dist/depthtext.global.js"></script>
<script>
  DepthText.DepthTextify();
</script>
```

### Import (ES module)

```js
import { DepthTextify } from "depthtext";
```

---

## 🚀 Quick Start

### HTML

```html
<h1 class="depthtext" data-depth="4" data-depth-event="pointer">DepthText Rocks</h1>
```

### JavaScript

```js
import { DepthTextify } from "depthtext";

DepthTextify(); // Enhances all .depthtext elements
```

---

## 🧩 Options

DepthText can be configured using either:

- **HTML data attributes**
- or **JavaScript options**

---

### HTML Attributes

| Attribute                   | Type    | Default | Description                                           |
| --------------------------- | ------- | ------- | ----------------------------------------------------- |
| `data-depth`                | number  | `8`     | Number of 3D layers                                   |
| `data-depth-depth`          | number  | `20`    | Z distance between layers                             |
| `data-depth-event`          | string  | `none`  | Interaction type: `none`, `pointer`, `scroll`, `auto` |
| `data-depth-direction`      | number  | `1`     | Reverse or invert orientation                         |
| `data-depth-fade`           | boolean | `false` | Fade layers as depth increases                        |
| `data-depth-eventdirection` | number  | `1`     | Invert pointer/scroll direction                       |
| `data-depth-eventrotation`  | number  | `20`    | Max rotation angle on interaction                     |
| `data-depth-add-class`      | string  | `""`    | Custom CSS class(es) to add to each layer             |

---

### JavaScript API

```js
import { DepthTextInstance } from "depthtext";

const instance = new DepthTextInstance(element, {
  layers: 8,
  depth: 20,
  fade: false,
  event: "pointer",
  eventRotation: 20,
  addClass: "my-custom-class", // New option for custom styling
});
```

---

## 🎨 Custom Styling with `addClass`

The new `addClass` option allows you to apply custom CSS classes to all depth layers for advanced styling control.

### Basic Usage

```html
<h1 class="depthtext" data-depth="10" data-depth-event="pointer" data-depth-add-class="gradient-text">Stylized Text</h1>
```

```css
.gradient-text {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Multiple Classes

You can add multiple classes separated by spaces:

```js
new DepthTextInstance(element, {
  addClass: "gradient-text shadow-effect animated",
});
```

Or via HTML:

```html
<div data-depth="5" data-depth-add-class="class1 class2 class3">Multi-styled text</div>
```

### Advanced Styling Examples

```css
/* Neon glow effect */
.neon-glow {
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
}

/* Metallic gradient */
.metallic {
  background: linear-gradient(90deg, #c0c0c0, #e8e8e8, #c0c0c0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Rainbow animation */
@keyframes rainbow {
  0%,
  100% {
    color: #ff0000;
  }
  16% {
    color: #ff7f00;
  }
  33% {
    color: #ffff00;
  }
  50% {
    color: #00ff00;
  }
  66% {
    color: #0000ff;
  }
  83% {
    color: #8b00ff;
  }
}

.rainbow-text {
  animation: rainbow 3s linear infinite;
}
```

---

## 🌐 Automatic Initialization

If you want DepthText to automatically enhance all matching elements:

```js
import { DepthTextify } from "depthtext";

DepthTextify({
  selector: ".depthtext",
});
```

---

## 🧼 Accessibility

DepthText is designed to remain invisible to assistive technologies:

- Wrappers are automatically marked with `aria-hidden="true"`
- Motion reacts to `prefers-reduced-motion: reduce`
- Original text remains intact and readable in source

---

## 🎛 Custom Styling

Each generated depth layer receives:

```html
<span class="depthtext-layer"></span>
```

You can style them globally:

```css
.depthtext-layer {
  color: #d0d0d0;
}
.depthtext-layer:first-child {
  color: #000;
}
```

With the `addClass` option, you can target specific instances:

```css
.depthtext-layer.my-style {
  color: #ff6b6b;
  font-weight: bold;
}
```

---

## 📦 Browser Usage (no bundler)

```html
<script src="dist/depthtext.global.js"></script>
<script>
  // DepthText is available globally
  DepthText.DepthTextify();
</script>
```

---

## ⚛️ Framework Integration

DepthText is framework-agnostic. You can use it with React, Vue, Angular, Svelte, etc., by instantiating `DepthTextInstance` on a mounted DOM element.

### React / Next.js

```jsx
import { useEffect, useRef } from "react";
import { DepthTextInstance } from "depthtext";

export default function DepthComponent() {
  const textRef = useRef(null);

  useEffect(() => {
    if (!textRef.current) return;

    const dt = new DepthTextInstance(textRef.current, {
      layers: 10,
      depth: "1rem",
      event: "pointer",
      addClass: "gradient-effect", // Custom styling
    });

    // Cleanup on unmount
    return () => dt.destroy();
  }, []);

  return <h1 ref={textRef}>DepthText in React</h1>;
}
```

### Vue 3

```html
<script setup>
  import { onMounted, onUnmounted, ref } from "vue";
  import { DepthTextInstance } from "depthtext";

  const textRef = ref(null);
  let dt = null;

  onMounted(() => {
    if (textRef.value) {
      dt = new DepthTextInstance(textRef.value, {
        layers: 10,
        event: "pointer",
        addClass: "custom-style",
      });
    }
  });

  onUnmounted(() => {
    if (dt) dt.destroy();
  });
</script>

<template>
  <h1 ref="textRef">DepthText in Vue</h1>
</template>
```

### Angular

```ts
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from "@angular/core";
import { DepthTextInstance } from "depthtext";

@Component({
  selector: "app-depth-text",
  template: "<h1 #depthText>DepthText in Angular</h1>",
})
export class DepthTextComponent implements AfterViewInit, OnDestroy {
  @ViewChild("depthText") textRef!: ElementRef;
  private dt?: DepthTextInstance;

  ngAfterViewInit() {
    this.dt = new DepthTextInstance(this.textRef.nativeElement, {
      layers: 10,
      event: "pointer",
      addClass: "angular-depth-style",
    });
  }

  ngOnDestroy() {
    this.dt?.destroy();
  }
}
```

## 🎭 Supported Content

DepthText works with various content types:

### ✅ Fully Supported

- **Text content** (including unicode, special characters)
- **Emojis** (😊, 🚀, ❤️, etc.)
- **Inline SVG** (`<svg>...</svg>`)
- **Images** (`<img src="...">`)
- **Mixed content** (text + images + SVGs together)

### Example with mixed content:

```html
<h1 class="depthtext" data-depth="5" data-depth-event="pointer" data-depth-add-class="colorful">
  Hello World! 🚀
  <svg width="30" height="30"><circle cx="15" cy="15" r="10" fill="blue" /></svg>
  <img src="logo.png" width="40" alt="Logo" />
</h1>
```

### ⚠️ Notes

Images should be loaded before initialization for best results.
Very large images may impact performance.
External SVGs (<img src="icon.svg">) work like regular images.

## 🛠 Known Issues & Notes

- DepthText uses CSS transforms; parent elements must not flatten 3D contexts.
- Avoid nested DepthText unless you understand `transform-style: preserve-3d`.
- **Images**: For complex layouts, consider using `background-image` on wrapper elements.
- **Performance**: Very high layer counts (>25) with large images may impact performance.

---

## 🧑‍💻 Contributing

Pull requests are welcome!  
If you add a major feature, please include documentation updates.

---

## 📄 License

MIT License – free to use in commercial and open-source projects.

---

## 💬 Author

Created by **MobiWise**.  
A modern reimagining of the classic [ztext.js](https://github.com/bennettfeely/ztext).
