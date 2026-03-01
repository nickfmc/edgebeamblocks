<?php
/**
 * Card Carousel — dynamic render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    InnerBlocks rendered HTML (the card slide divs).
 * @var WP_Block $block      Block instance.
 */

// Chevron arrows — same style as testimonial-carousel for consistency.
$chevron_left  = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$chevron_right = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

$wrapper_attrs = get_block_wrapper_attributes( array(
	'class' => 'card-carousel',
) );
?>
<div <?php echo $wrapper_attrs; ?>>
	<div class="card-carousel__track" aria-live="polite">
		<?php echo $content; ?>
	</div>
	<div class="card-carousel__controls">
		<button
			class="card-carousel__arrow card-carousel__arrow--prev"
			aria-label="<?php esc_attr_e( 'Previous card', 'cl-theme-blocks' ); ?>"
		>
			<?php echo $chevron_left; ?>
		</button>
		<button
			class="card-carousel__arrow card-carousel__arrow--next"
			aria-label="<?php esc_attr_e( 'Next card', 'cl-theme-blocks' ); ?>"
		>
			<?php echo $chevron_right; ?>
		</button>
	</div>
</div>
