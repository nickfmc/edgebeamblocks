<?php
/**
 * Vertical Slider — dynamic render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    InnerBlocks rendered HTML.
 * @var WP_Block $block      Block instance.
 */

$show_arrows        = isset( $attributes['showArrows'] ) ? $attributes['showArrows'] : true;
$show_dots          = isset( $attributes['showDots'] ) ? $attributes['showDots'] : true;
$slide_gap          = isset( $attributes['slideGap'] ) ? (int) $attributes['slideGap'] : 30;
$preview_px         = isset( $attributes['previewPx'] ) ? (int) $attributes['previewPx'] : 60;
$align_top          = isset( $attributes['alignTop'] ) ? $attributes['alignTop'] : false;
$preview_fade_color = isset( $attributes['previewFadeColor'] ) ? sanitize_text_field( $attributes['previewFadeColor'] ) : '';

// Count slides (direct children of content).
$slide_count = 0;
if ( trim( $content ) ) {
	$doc = new DOMDocument();
	libxml_use_internal_errors( true );
	$doc->loadHTML(
		'<html><head><meta charset="UTF-8"></head><body>' . $content . '</body></html>',
		LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
	);
	libxml_clear_errors();
	$xpath = new DOMXPath( $doc );
	
	// Count direct children of body (which represents the InnerBlocks container).
	$body = $doc->getElementsByTagName( 'body' )->item( 0 );
	if ( $body ) {
		$children = $body->childNodes;
		foreach ( $children as $child ) {
			if ( $child->nodeType === XML_ELEMENT_NODE ) {
				$slide_count++;
			}
		}
	}
}

$wrapper_attributes = get_block_wrapper_attributes( array(
	'data-show-arrows' => $show_arrows ? 'true' : 'false',
	'data-show-dots'   => $show_dots ? 'true' : 'false',
	'data-slide-gap'   => $slide_gap,
	'data-preview-px'  => $preview_px,
	'data-align-top'   => $align_top ? 'true' : 'false',
	'class'            => 'vertical-slider',
) );
?>
<div <?php echo $wrapper_attributes; ?>>
	<?php if ( $show_arrows ) : ?>
		<button class="vertical-slider__arrow vertical-slider__arrow--prev" aria-label="<?php esc_attr_e( 'Previous slide', 'cl-theme-blocks' ); ?>">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="18 15 12 9 6 15"></polyline>
			</svg>
		</button>
	<?php endif; ?>

	<div class="vertical-slider__slides-container">
		<?php echo $content; ?>
		<?php if ( ! empty( $preview_fade_color ) ) : ?>
			<div class="vertical-slider__fade-top" style="background: linear-gradient(to bottom, <?php echo esc_attr( $preview_fade_color ); ?>, transparent);"></div>
			<div class="vertical-slider__fade-bottom" style="background: linear-gradient(to top, <?php echo esc_attr( $preview_fade_color ); ?>, transparent);"></div>
		<?php endif; ?>
	</div>

	<?php if ( $show_arrows ) : ?>
		<button class="vertical-slider__arrow vertical-slider__arrow--next" aria-label="<?php esc_attr_e( 'Next slide', 'cl-theme-blocks' ); ?>">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		</button>
	<?php endif; ?>

	<?php if ( $show_dots && $slide_count > 0 ) : ?>
		<div class="vertical-slider__dots">
			<?php for ( $i = 0; $i < $slide_count; $i++ ) : ?>
				<button 
					class="vertical-slider__dot<?php echo $i === 0 ? ' is-active' : ''; ?>" 
					data-slide="<?php echo $i; ?>"
					aria-label="<?php echo esc_attr( sprintf( __( 'Go to slide %d', 'cl-theme-blocks' ), $i + 1 ) ); ?>"
				></button>
			<?php endfor; ?>
		</div>
	<?php endif; ?>
</div>
