<?php
/**
 * Admin Settings
 *
 * Handles plugin settings and admin UI
 */

if (!defined('ABSPATH')) {
    exit;
}

class Theme_Blocks_Admin_Settings {

    private Theme_Blocks_Registry $block_registry;
    private string $version;

    public function __construct(Theme_Blocks_Registry $block_registry, string $version) {
        $this->block_registry = $block_registry;
        $this->version = $version;

        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'admin_init']);
        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts']);
        add_action('admin_notices', [$this, 'admin_notices']);
    }

    /**
     * Add admin menu page
     */
    public function add_admin_menu(): void {
        add_options_page(
            __('Theme Blocks Settings', 'cl-theme-blocks'),
            __('Theme Blocks', 'cl-theme-blocks'),
            'manage_options',
            'theme-blocks-settings',
            [$this, 'admin_page']
        );
    }

    /**
     * Register settings
     */
    public function admin_init(): void {
        // Handle cache clear action
        if (isset($_POST['theme_blocks_clear_cache']) && current_user_can('manage_options') && check_admin_referer('theme_blocks_clear_cache')) {
            ThemeBlocks::clear_blocks_cache();
            set_transient('theme_blocks_cache_cleared', true, 30);
            wp_redirect(admin_url('options-general.php?page=theme-blocks-settings'));
            exit;
        }

        register_setting('theme_blocks_settings', 'theme_blocks_enabled', [
            'sanitize_callback' => [$this, 'sanitize_enabled_blocks']
        ]);

        add_settings_section(
            'theme_blocks_section',
            '',
            [$this, 'settings_section_callback'],
            'theme_blocks_settings'
        );

        add_settings_field(
            'theme_blocks_enabled',
            '',
            [$this, 'enabled_blocks_callback'],
            'theme_blocks_settings',
            'theme_blocks_section'
        );
    }

    /**
     * Display admin notices
     */
    public function admin_notices(): void {
        if (get_transient('theme_blocks_cache_cleared')) {
            delete_transient('theme_blocks_cache_cleared');
            echo '<div class="notice notice-success is-dismissible"><p>';
            esc_html_e('Block cache cleared successfully!', 'cl-theme-blocks');
            echo '</p></div>';
        }
    }

    /**
     * Settings section description
     */
    public function settings_section_callback(): void {
        // Description is now handled in the card layout
    }

    /**
     * Sanitize enabled blocks input
     */
    public function sanitize_enabled_blocks(mixed $input): array {
        // If input is not an array, return empty array
        if (!is_array($input)) {
            return [];
        }

        // Only allow valid top-level block keys (child blocks are not managed here)
        $valid_blocks = array_keys($this->block_registry->get_manageable_blocks());
        $sanitized = [];

        foreach ($input as $block) {
            if (in_array($block, $valid_blocks, true)) {
                $sanitized[] = sanitize_text_field($block);
            }
        }

        return $sanitized;
    }

    /**
     * Render enabled blocks checkboxes
     */
    public function enabled_blocks_callback(): void {
        $available_blocks = $this->block_registry->get_manageable_blocks();
        $enabled_blocks = get_option('theme_blocks_enabled', array_keys($available_blocks));

        echo '<div class="block-management-inner">';

        // Description
        echo '<p class="section-description">' . esc_html__('Select which blocks should be available in the block editor. Changes take effect immediately.', 'cl-theme-blocks') . '</p>';

        // Checkbox section with header
        echo '<div class="checkbox-section">';
        echo '<div class="checkbox-header">';
        echo '<span class="section-label">' . esc_html__('Enabled Blocks', 'cl-theme-blocks') . '</span>';
        echo '<div class="checkbox-actions">';
        echo '<a href="#" id="select-all-blocks">' . esc_html__('Select All', 'cl-theme-blocks') . '</a>';
        echo '<span class="separator">|</span>';
        echo '<a href="#" id="deselect-all-blocks">' . esc_html__('Deselect All', 'cl-theme-blocks') . '</a>';
        echo '</div>';
        echo '</div>';

        echo '<fieldset class="checkbox-grid">';
        foreach ($available_blocks as $block_key => $block_title) {
            $checked = in_array($block_key, $enabled_blocks) ? 'checked' : '';
            $checked_class = $checked ? ' checked' : '';
            echo '<label class="theme-blocks-checkbox-label' . $checked_class . '">';
            echo '<input type="checkbox" name="theme_blocks_enabled[]" value="' . esc_attr($block_key) . '" ' . $checked . '> ';
            echo '<span class="checkbox-title">' . esc_html($block_title) . '</span>';
            echo '</label>';
        }
        echo '</fieldset>';
        echo '</div>';

        echo '</div>';
    }

    /**
     * Render admin page
     */
    public function admin_page(): void {
        $available_blocks = $this->block_registry->get_manageable_blocks();
        ?>
        <div class="wrap theme-blocks-admin">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <div class="notice notice-info">
                <p><strong><?php _e('Note:', 'cl-theme-blocks'); ?></strong> <?php _e('Changes will take effect immediately. You may need to refresh the block editor to see updates.', 'cl-theme-blocks'); ?></p>
            </div>

            <div class="theme-blocks-card theme-blocks-primary">
                <h2>
                    <span class="dashicons dashicons-admin-settings"></span>
                    <?php _e('Block Management', 'cl-theme-blocks'); ?>
                </h2>
                <form action="options.php" method="post">
                    <?php
                    settings_fields('theme_blocks_settings');
                    do_settings_sections('theme_blocks_settings');
                    submit_button(__('Save Settings', 'cl-theme-blocks'));
                    ?>
                </form>
            </div>

            <div class="theme-blocks-card">
                <h2>
                    <span class="dashicons dashicons-list-view"></span>
                    <?php _e('Available Blocks', 'cl-theme-blocks'); ?>
                </h2>
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th><?php _e('Block Name', 'cl-theme-blocks'); ?></th>
                            <th><?php _e('Status', 'cl-theme-blocks'); ?></th>
                            <th><?php _e('Description', 'cl-theme-blocks'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $enabled_blocks = get_option('theme_blocks_enabled', array_keys($available_blocks));
                        foreach ($available_blocks as $block_key => $block_title) {
                            $is_enabled = in_array($block_key, $enabled_blocks);
                            $status = $is_enabled ?
                                '<span class="status-enabled"><span class="dashicons dashicons-yes-alt"></span> ' . esc_html__('Enabled', 'cl-theme-blocks') . '</span>' :
                                '<span class="status-disabled"><span class="dashicons dashicons-dismiss"></span> ' . esc_html__('Disabled', 'cl-theme-blocks') . '</span>';

                            // Get block description from block.json if available
                            $block_json_path = dirname(__DIR__) . '/src/' . $block_key . '/block.json';
                            $description = __('Custom block', 'cl-theme-blocks');
                            if (file_exists($block_json_path)) {
                                $block_data = json_decode(file_get_contents($block_json_path), true);
                                if (!empty($block_data['description'])) {
                                    $description = $block_data['description'];
                                }
                            }

                            echo '<tr>';
                            echo '<td><strong>' . esc_html($block_title) . '</strong></td>';
                            echo '<td>' . wp_kses($status, ['span' => ['class' => []]]) . '</td>';
                            echo '<td>' . esc_html($description) . '</td>';
                            echo '</tr>';
                        }
                        ?>
                    </tbody>
                </table>
            </div>

            <div class="theme-blocks-grid">
                <div class="theme-blocks-card theme-blocks-info">
                    <h2>
                        <span class="dashicons dashicons-info-outline"></span>
                        <?php _e('Plugin Information', 'cl-theme-blocks'); ?>
                    </h2>
                <div class="plugin-info">
                    <div class="plugin-info-item">
                        <strong><?php _e('Version', 'cl-theme-blocks'); ?></strong>
                        <span><?php echo esc_html($this->version); ?></span>
                    </div>
                    <div class="plugin-info-item">
                        <strong><?php _e('Total Blocks', 'cl-theme-blocks'); ?></strong>
                        <span><?php echo count($available_blocks); ?></span>
                    </div>
                    <div class="plugin-info-item">
                        <strong><?php _e('Enabled Blocks', 'cl-theme-blocks'); ?></strong>
                        <span><?php echo count(array_intersect($enabled_blocks, array_keys($available_blocks))); ?></span>
                    </div>
                </div>
            </div>

                <div class="theme-blocks-card theme-blocks-tools">
                    <h2>
                        <span class="dashicons dashicons-admin-tools"></span>
                        <?php _e('Cache Tools', 'cl-theme-blocks'); ?>
                    </h2>
                <p><?php _e('Clear the block discovery cache to force a rescan of available blocks.', 'cl-theme-blocks'); ?></p>
                <?php if (THEME_BLOCKS_DEV_MODE): ?>
                    <div class="notice notice-warning inline" style="margin: 10px 0;">
                        <p><strong><?php _e('Dev Mode:', 'cl-theme-blocks'); ?></strong> <?php _e('Caching is disabled because WP_DEBUG is enabled.', 'cl-theme-blocks'); ?></p>
                    </div>
                <?php endif; ?>
                <form method="post" action="">
                    <?php wp_nonce_field('theme_blocks_clear_cache'); ?>
                    <input type="hidden" name="theme_blocks_clear_cache" value="1">
                    <?php submit_button(__('Clear Block Cache', 'cl-theme-blocks'), 'secondary', 'submit', false); ?>
                </form>
            </div>
            </div>
        </div>
        <?php
    }

    /**
     * Enqueue admin styles and scripts
     */
    public function admin_enqueue_scripts(string $hook): void {
        if ($hook !== 'settings_page_theme-blocks-settings') {
            return;
        }

        wp_enqueue_style(
            'theme-blocks-admin',
            THEME_BLOCKS_URL . 'admin/css/settings.css',
            [],
            THEME_BLOCKS_VERSION
        );

        wp_enqueue_script(
            'theme-blocks-admin',
            THEME_BLOCKS_URL . 'admin/js/settings.js',
            ['jquery'],
            THEME_BLOCKS_VERSION,
            true
        );
    }
}
