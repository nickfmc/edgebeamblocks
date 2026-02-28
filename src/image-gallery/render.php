<?php
/**
 * Image Gallery block — server-side render.
 * Outputs two <canvas> elements driven by a WebGL crossfade engine in view.js.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

$images       = $attributes['images']      ?? [];
$interval_ms  = isset( $attributes['intervalMs'] )  ? (int) $attributes['intervalMs']  : 3000;
$stagger_ms   = isset( $attributes['staggerMs'] )   ? (int) $attributes['staggerMs']   : 1500;
$aspect_ratio = isset( $attributes['aspectRatio'] ) ? sanitize_text_field( $attributes['aspectRatio'] ) : '4/5';
$gap          = isset( $attributes['gap'] )          ? (int) $attributes['gap']          : 24;

// Need at least 2 images to render anything useful.
if ( count( $images ) < 2 ) {
	return;
}

// Sanitise and encode the image list for the JS engine.
$encoded_images = wp_json_encode(
	array_map(
		function ( $img ) {
			return [
				'url' => esc_url_raw( $img['url'] ?? '' ),
				'alt' => sanitize_text_field( $img['alt'] ?? '' ),
			];
		},
		$images
	)
);

$wrapper_attrs = get_block_wrapper_attributes( [
	'class'              => 'image-gallery',
	'data-images'        => $encoded_images,
	'data-interval'      => (string) $interval_ms,
	'data-stagger'       => (string) $stagger_ms,
	'data-aspect-ratio'  => esc_attr( $aspect_ratio ),
	'data-gap'           => (string) $gap,
	'style'              => '--ig-ratio:' . esc_attr( $aspect_ratio ) . ';--ig-gap:' . (int) $gap . 'px',
] );
?>
<div <?php echo $wrapper_attrs; ?>>

	<canvas
		class="image-gallery__slot image-gallery__slot--a"
		role="img"
		aria-label="<?php esc_attr_e( 'Gallery slot A', 'cl-theme-blocks' ); ?>"
	></canvas>

	<canvas
		class="image-gallery__slot image-gallery__slot--b"
		role="img"
		aria-label="<?php esc_attr_e( 'Gallery slot B', 'cl-theme-blocks' ); ?>"
	></canvas>

</div>
