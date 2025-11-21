# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-01-21

### Added

- **New `addClass` option**: Add custom CSS classes to all depth layers for advanced styling control
  - Supports single or multiple classes (space-separated)
  - Available via JavaScript API: `addClass: "my-class"`
  - Available via HTML attribute: `data-depth-add-class="my-class"`
  - Enables gradient effects, animations, and custom styling per instance
- Improved class normalization to handle arrays and multiple whitespace formats

### Changed

- Enhanced options validation to support the new `addClass` parameter
- Updated layer creation logic to apply custom classes while maintaining base `depthtext-layer` class

### Technical

- Added `normalizeAddClass()` helper function for robust class string handling
- Extended `DepthTextOptions` interface with `addClass` property
- Updated `DEPTHTEXT_DEFAULTS` to include `addClass: ""`

## [1.0.0] - 2025-11-19

### Added

- Initial release of **DepthText**
- High-performance 3D layered text rendering
- Interactive depth effects with pointer and scroll events
- Configurable depth, layers, direction, and rotation
- Automatic initialization via `data-depth` attributes
- TypeScript support with full type definitions
- ESM, CJS, and IIFE (Global) build artifacts
- Motion smoothing (lerp) for fluid pointer interaction
- Accessibility features (`aria-hidden` layers)
