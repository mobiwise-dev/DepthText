# DepthText

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

---

## 🛠 Installation

### NPM

```bash
npm install depthtext
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
});
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
import { useEffect, useRef } from 'react';
import { DepthTextInstance } from 'depthtext';

export default function DepthComponent() {
  const textRef = useRef(null);

  useEffect(() => {
    if (!textRef.current) return;
    
    const dt = new DepthTextInstance(textRef.current, {
      layers: 10,
      depth: "1rem",
      event: "pointer"
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
import { onMounted, onUnmounted, ref } from 'vue';
import { DepthTextInstance } from 'depthtext';

const textRef = ref(null);
let dt = null;

onMounted(() => {
  if (textRef.value) {
    dt = new DepthTextInstance(textRef.value, {
      layers: 10,
      event: 'pointer'
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
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { DepthTextInstance } from 'depthtext';

@Component({
  selector: 'app-depth-text',
  template: '<h1 #depthText>DepthText in Angular</h1>'
})
export class DepthTextComponent implements AfterViewInit, OnDestroy {
  @ViewChild('depthText') textRef!: ElementRef;
  private dt?: DepthTextInstance;

  ngAfterViewInit() {
    this.dt = new DepthTextInstance(this.textRef.nativeElement, {
      layers: 10,
      event: 'pointer'
    });
  }

  ngOnDestroy() {
    this.dt?.destroy();
  }
}
```

## 🐛 Known Issues & Notes

- DepthText uses CSS transforms; parent elements must not flatten 3D contexts.
- Avoid nested DepthText unless you understand `transform-style: preserve-3d`.

---

## 🧑‍💻 Contributing

Pull requests are welcome!  
If you add a major feature, please include documentation updates.

---

## 📄 License

MIT License — free to use in commercial and open-source projects.

---

## 💬 Author

Created by **MobiWise**.  
A modern reimagining of the classic [ztext.js](https://github.com/bennettfeely/ztext).
