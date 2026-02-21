<?php
/**
 * Plugin Name: Edgebeam Theme Blocks
 * Description: Custom blocks for Edgebeam.
 * Version: 0.1.0
 * Author: Pan Communications
 * Text Domain: edgebeam-theme-blocks
 * Domain Path: /languages
 * Requires at least: 6.9
 * Requires PHP: 8.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('THEME_BLOCKS_VERSION', '0.1.0');
define('THEME_BLOCKS_PATH', __DIR__ . '/');
define('THEME_BLOCKS_URL', plugin_dir_url(__FILE__));
define('THEME_BLOCKS_DEV_MODE', defined('WP_DEBUG') && WP_DEBUG);

// Include required classes
require_once THEME_BLOCKS_PATH . 'includes/class-block-registry.php';
require_once THEME_BLOCKS_PATH . 'includes/class-admin-settings.php';

/**
 * Main plugin class
 */
class ThemeBlocks {

    private static ?self $instance = null;
    private Theme_Blocks_Registry $block_registry;
    private Theme_Blocks_Admin_Settings $admin_settings;
    private string $version;

    /**
     * Get singleton instance
     */
    public static function get_instance(): self {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->version = THEME_BLOCKS_VERSION;

        // Check for version updates and clear cache if needed
        self::maybe_clear_cache_on_update();

        $this->init();
    }

    /**
     * Initialize plugin
     */
    private function init(): void {
        // Initialize block registry
        $this->block_registry = new Theme_Blocks_Registry();

        // Auto-discover blocks (if enabled)
        $this->auto_discover_blocks();

        // Initialize admin settings
        $this->admin_settings = new Theme_Blocks_Admin_Settings($this->block_registry, $this->version);
    }

    /**
     * Auto-discover blocks from src directory with caching
     */
    private function auto_discover_blocks(): void {
        $cache_key = 'theme_blocks_discovered';

        // Check cache first (unless in dev mode)
        if (!THEME_BLOCKS_DEV_MODE) {
            $cached = get_transient($cache_key);
            // 'blocks' key distinguishes the current cache format from the legacy format
            if ($cached !== false && isset($cached['blocks'])) {
                $this->block_registry->set_available_blocks($cached['blocks']);
                $this->block_registry->set_child_to_parent_map($cached['children'] ?? []);
                return;
            }
        }

        // Discover blocks from filesystem
        $available_blocks     = [];
        $child_to_parent_map  = [];

        $blocks = glob(THEME_BLOCKS_PATH . 'src/*/block.json');

        foreach ($blocks as $block_json) {
            $block_data = json_decode(file_get_contents($block_json), true);
            $slug       = basename(dirname($block_json));

            $available_blocks[$slug] = $block_data['title'] ?? ucwords(str_replace('-', ' ', $slug));

            if (!empty($block_data['parent'])) {
                $child_to_parent_map[$slug] = $block_data['parent'];
            }
        }

        // Cache the results for 1 hour (unless in dev mode)
        if (!THEME_BLOCKS_DEV_MODE && !empty($available_blocks)) {
            set_transient($cache_key, ['blocks' => $available_blocks, 'children' => $child_to_parent_map], HOUR_IN_SECONDS);
        }

        if (!empty($available_blocks)) {
            $this->block_registry->set_available_blocks($available_blocks);
        }
        $this->block_registry->set_child_to_parent_map($child_to_parent_map);
    }

    /**
     * Clear block discovery cache
     */
    public static function clear_blocks_cache(): void {
        delete_transient('theme_blocks_discovered');
    }

    /**
     * Plugin activation hook
     */
    public static function activate(): void {
        // Clear cache on activation
        self::clear_blocks_cache();

        // Auto-discover top-level blocks for default settings (child blocks are excluded
        // since they are managed implicitly through their parent)
        $blocks         = glob(__DIR__ . '/src/*/block.json');
        $default_blocks = [];

        foreach ($blocks as $block_json) {
            $block_data = json_decode(file_get_contents($block_json), true);
            if (!empty($block_data['parent'])) {
                continue;
            }
            $default_blocks[] = basename(dirname($block_json));
        }

        // Only set if option doesn't exist (don't overwrite existing settings)
        if (get_option('theme_blocks_enabled') === false) {
            update_option('theme_blocks_enabled', $default_blocks);
        }
    }

    /**
     * Plugin update hook - clear cache when version changes
     */
    public static function maybe_clear_cache_on_update(): void {
        $saved_version = get_option('theme_blocks_version');

        if ($saved_version !== THEME_BLOCKS_VERSION) {
            self::clear_blocks_cache();
            update_option('theme_blocks_version', THEME_BLOCKS_VERSION);
        }
    }

    /**
     * Get plugin version
     */
    public function get_version(): string {
        return $this->version;
    }

    /**
     * Get block registry
     */
    public function get_block_registry(): Theme_Blocks_Registry {
        return $this->block_registry;
    }
}

// Register activation hook
register_activation_hook(__FILE__, ['ThemeBlocks', 'activate']);

// Initialize plugin
ThemeBlocks::get_instance();
