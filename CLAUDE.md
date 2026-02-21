# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # Production build
npm run start        # Development mode with hot reloading
npm run lint:js      # Lint JavaScript
npm run lint:css     # Lint CSS
npm run format       # Format code with Prettier
```

No testing infrastructure is currently configured.

## Architecture

This is a WordPress Gutenberg block plugin. The key design pattern is **auto-discovery**: PHP scans `src/*/block.json` files to find and register blocks, so adding a new block only requires creating a directory under `src/` with the proper files.

### Plugin Lifecycle

`theme-blocks.php` → `ThemeBlocks` singleton → initializes `Theme_Blocks_Registry` + `Theme_Blocks_Admin_Settings`

### Block Registration Flow

`Theme_Blocks_Registry` (in `includes/`) discovers blocks by globbing `src/*/block.json`, caches results as a WordPress transient (1 hour, disabled when `WP_DEBUG` is true), then registers only enabled blocks from the `build/` directory (the compiled output of `npm run build`/`start`).

The admin settings page (Settings > Theme Blocks) controls which blocks are active and provides cache clearing.

### Adding a New Block

Copy `src/hello-world/` as a starting point — it serves as the boilerplate for new blocks. Rename the directory and update `block.json`, then modify the copied files as needed.

At minimum, a block directory needs:
- `block.json` — block metadata; use `"category": "theme-blocks"`
- `index.js` — register block with `registerBlockType`
- `edit.js` — React editor component
- `render.php` — dynamic PHP renderer (if dynamic)
- `style.css` / `editor.css` — styles

The block will be auto-discovered after running `npm run build`.

**InnerBlocks pattern** — parent blocks must have a `save.js` returning `<InnerBlocks.Content />` AND a `render.php` using `echo $content`. Child blocks (designed to live inside a parent) use `render.php` only — no `save.js`.

### Key Files

| File | Purpose |
|------|---------|
| `theme-blocks.php` | Plugin entry point, constants, singleton init |
| `includes/class-block-registry.php` | Auto-discovery, caching, block registration |
| `includes/class-admin-settings.php` | Admin UI, enable/disable blocks |
| `src/icons/index.js` | Shared icon library for all blocks |

### Requirements

- PHP 8.3+, WordPress 6.9+
- Plugin text domain: `cl-theme-blocks`
- Block namespace: `gdt-ng/`
- `build/` is gitignored and must be compiled locally
