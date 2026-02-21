/**
 * Theme Blocks Settings Page Interactivity
 */
(function($) {
    'use strict';

    $(document).ready(function() {
        const $checkboxes = $('.theme-blocks-checkbox-label input[type="checkbox"]');

        // Initialize checked state classes
        $checkboxes.each(function() {
            const $label = $(this).closest('label');
            if ($(this).is(':checked')) {
                $label.addClass('checked');
            }
        });

        // Toggle checked class on change
        $checkboxes.on('change', function() {
            const $label = $(this).closest('label');
            $label.toggleClass('checked', $(this).is(':checked'));
        });

        // Select All functionality
        $('#select-all-blocks').on('click', function(e) {
            e.preventDefault();
            $checkboxes.prop('checked', true).trigger('change');
        });

        // Deselect All functionality
        $('#deselect-all-blocks').on('click', function(e) {
            e.preventDefault();
            $checkboxes.prop('checked', false).trigger('change');
        });

        // Form submit feedback
        $('form[action="options.php"]').on('submit', function() {
            const $button = $(this).find('.button-primary');
            $button.prop('disabled', true).text('Saving...');
        });
    });
})(jQuery);
