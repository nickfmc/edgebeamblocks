<?php
/**
 * Card Carousel — dynamic render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    InnerBlocks rendered HTML (the card slide divs).
 * @var WP_Block $block      Block instance.
 */

// Square arrow icons.
$arrow_right = '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none"><rect x="1" y="1" width="32.9321" height="32.9321" stroke="white" stroke-width="2"/><path d="M18.0039 9.00537L26.4648 17.4662L18.0039 25.9271" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M26.4648 17.4663L8.46484 17.4663" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>';
$arrow_left  = '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none" style="transform:scaleX(-1)"><rect x="1" y="1" width="32.9321" height="32.9321" stroke="white" stroke-width="2"/><path d="M18.0039 9.00537L26.4648 17.4662L18.0039 25.9271" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M26.4648 17.4663L8.46484 17.4663" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>';

$uniform_height = ! empty( $attributes['uniformHeight'] ) ? 'true' : 'false';
$card_width     = isset( $attributes['cardWidth'] ) ? (int) $attributes['cardWidth'] : 360;

$wrapper_attrs = get_block_wrapper_attributes( array(
	'class'               => 'card-carousel',
	'data-uniform-height' => $uniform_height,
	'data-card-width'     => (string) $card_width,
) );
?>
<div <?php echo $wrapper_attrs; ?>>
	<div class="card-carousel__controls">
		<button
			class="card-carousel__arrow card-carousel__arrow--prev"
			aria-label="<?php esc_attr_e( 'Previous card', 'cl-theme-blocks' ); ?>"
		>
			<?php echo $arrow_left; ?>
		</button>
		<button
			class="card-carousel__arrow card-carousel__arrow--next"
			aria-label="<?php esc_attr_e( 'Next card', 'cl-theme-blocks' ); ?>"
		>
			<?php echo $arrow_right; ?>
		</button>
	</div>
	<div class="card-carousel__track" aria-live="polite">
		<?php echo $content; ?>
	</div>
</div>
