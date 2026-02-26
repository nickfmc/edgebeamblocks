<?php
/**
 * Logo Carousel — dynamic PHP renderer.
 *
 * Configuration is passed to view.js via data-* attributes on the wrapper.
 * The first slide receives the `is-active` class so the correct logo is
 * visible on the initial paint before JavaScript initialises.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Unused (dynamic block, no InnerBlocks).
 * @param WP_Block $block      Block instance.
 */

$logos              = $attributes['logos']            ?? [];
$auto_play          = $attributes['autoPlay']         ?? true;
$auto_play_duration = $attributes['autoPlayDuration'] ?? 4;
$logo_gap           = $attributes['logoGap']          ?? 40;

if ( empty( $logos ) ) {
	return;
}

$wrapper_attrs = get_block_wrapper_attributes( [
	'class'                   => 'logo-carousel',
	'data-auto-play'          => $auto_play ? 'true' : 'false',
	'data-auto-play-duration' => esc_attr( (string) $auto_play_duration ),
	'data-logo-gap'           => esc_attr( (string) $logo_gap ),
] );
?>
<div <?php echo $wrapper_attrs; ?>>

	<button
		class="logo-carousel__arrow logo-carousel__arrow--prev"
		aria-label="<?php esc_attr_e( 'Previous logo', 'cl-theme-blocks' ); ?>"
	>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
			<polyline
				points="15 18 9 12 15 6"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	<div class="logo-carousel__track">
		<?php foreach ( $logos as $index => $logo ) :
			$is_active = ( 0 === $index ) ? ' is-active' : '';
			$img_width = isset( $logo['width'] ) ? (int) $logo['width'] : 150;
			$img_url   = esc_url( $logo['url'] ?? '' );
			$img_alt   = esc_attr( $logo['alt'] ?? '' );
		?>
			<div
				class="logo-carousel__slide<?php echo esc_attr( $is_active ); ?>"
				data-slide="<?php echo esc_attr( (string) $index ); ?>"
			>
				<img
					src="<?php echo $img_url; ?>"
					alt="<?php echo $img_alt; ?>"
					style="width: <?php echo $img_width; ?>px; height: auto; display: block;"
					loading="lazy"
					draggable="false"
				/>
			</div>
		<?php endforeach; ?>
	</div>

	<button
		class="logo-carousel__arrow logo-carousel__arrow--next"
		aria-label="<?php esc_attr_e( 'Next logo', 'cl-theme-blocks' ); ?>"
	>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
			<polyline
				points="9 18 15 12 9 6"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

</div>
