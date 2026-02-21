# Theme Blocks

Custom WordPress blocks plugin built with wp-scripts.

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development with hot reloading:
```bash
npm run start
```

3. Build for production:
```bash
npm run build
```

## Available Scripts

- `npm run build` - Build the blocks for production
- `npm run start` - Start development mode with hot reloading
- `npm run format` - Format code with Prettier
- `npm run lint:js` - Lint JavaScript files
- `npm run lint:css` - Lint CSS/SCSS files

## Blocks

- **Hello World** (`gdt-ng/hello-world`) - Example block scaffolded with Create Block tool

## Features

### Auto-Discovery
Blocks are automatically discovered from the `src/` directory. Just create a new block folder with a `block.json` file and it will appear in the settings.

### Performance Caching
Block discovery is cached for 1 hour to eliminate filesystem overhead. Cache automatically clears on:
- Plugin activation
- Version updates
- Manual clear in settings

**Dev Mode**: When `WP_DEBUG` is enabled, caching is disabled for instant block updates.

### Admin Settings
Manage blocks via **Settings > Theme Blocks**:
- Enable/disable individual blocks
- View block information
- Clear block cache
- See plugin statistics

## Structure

```
theme-blocks/
├── src/              # Block source files
├── build/            # Compiled blocks (generated)
├── includes/         # PHP classes
│   ├── class-block-registry.php
│   └── class-admin-settings.php
├── admin/            # Admin assets
│   └── css/
│       └── settings.css
├── _docs/            # Documentation
├── theme-blocks.php  # Main plugin file
└── package.json      # npm configuration
```

## Documentation

See `_docs/` folder for detailed documentation:
- `planning-questions.md` - Strategic planning guide
- `caching-system.md` - How caching works
