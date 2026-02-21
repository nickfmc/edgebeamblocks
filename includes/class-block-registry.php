<?php
/**
 * Block Registry
 *
 * Handles block registration and management
 */

if (!defined('ABSPATH')) {
    exit;
}

class Theme_Blocks_Registry {

    private array $available_blocks = [];

    /**
     * Maps child block slugs to their declared parent block names.
     * Format: [ 'testimonial-slide' => [ 'gdt-ng/testimonial-carousel' ] ]
     */
    private array $child_to_parent_map = [];

    public function __construct() {
        add_action('init', [$this, 'register_blocks']);
        add_filter('block_categories_all', [$this, 'register_block_category'], 5, 2);
    }

    /**
     * Get all available blocks including child blocks
     */
    public function get_available_blocks(): array {
        return $this->available_blocks;
    }

    /**
     * Get only top-level blocks — child blocks are excluded since they
     * are managed implicitly through their parent
     */
    public function get_manageable_blocks(): array {
        return array_diff_key($this->available_blocks, array_flip($this->get_child_block_slugs()));
    }

    /**
     * Get slugs of all child blocks (those with a parent constraint)
     */
    public function get_child_block_slugs(): array {
        return array_keys($this->child_to_parent_map);
    }

    /**
     * Set available blocks (used by auto-discovery)
     */
    public function set_available_blocks(array $blocks): void {
        $this->available_blocks = $blocks;
    }

    /**
     * Set child-to-parent map (used by auto-discovery)
     * Format: [ 'child-slug' => [ 'namespace/parent-name', ... ] ]
     */
    public function set_child_to_parent_map(array $map): void {
        $this->child_to_parent_map = $map;
    }

    /**
     * Register custom block category
     */
    public function register_block_category(array $categories, $post): array {
        // Add our custom category at the beginning of the array
        array_unshift($categories, [
            'slug'  => 'theme-blocks',
            'title' => __('Theme Blocks', 'cl-theme-blocks'),
            'icon'  => 'layout',
        ]);

        return $categories;
    }

    /**
     * Register blocks based on enabled settings.
     *
     * Top-level blocks are registered only if enabled. Child blocks are
     * registered automatically whenever at least one of their declared
     * parents is enabled — they have no independent enabled/disabled state.
     */
    public function register_blocks(): void {
        $enabled_blocks = get_option('theme_blocks_enabled', array_keys($this->get_manageable_blocks()));
        $child_slugs    = array_keys($this->child_to_parent_map);

        $blocks = glob(dirname(__DIR__) . '/build/*/block.json');

        foreach ($blocks as $block) {
            $block_dir  = dirname($block);
            $block_name = basename($block_dir);

            if (in_array($block_name, $child_slugs)) {
                // Child block — register if any declared parent is enabled
                foreach ($this->child_to_parent_map[$block_name] as $parent_full_name) {
                    $parent_slug = substr($parent_full_name, strrpos($parent_full_name, '/') + 1);
                    if (in_array($parent_slug, $enabled_blocks)) {
                        register_block_type($block_dir);
                        break;
                    }
                }
            } elseif (in_array($block_name, $enabled_blocks)) {
                register_block_type($block_dir);
            }
        }
    }
}
