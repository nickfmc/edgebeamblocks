<?php
/**
 * Testimonial Carousel — dynamic render.
 *
 * Replaces __INDEX__ placeholders with actual indices, then uses DOMDocument
 * to split child output into quotes and person-info for the carousel layout.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    InnerBlocks rendered HTML.
 * @var WP_Block $block      Block instance.
 */

// 1. Replace __INDEX__ placeholders with actual 0-based indices.
$index = 0;
$content = preg_replace_callback(
	'/data-slide="__INDEX__"/',
	function () use ( &$index ) {
		// Each child outputs 2 elements with __INDEX__, so integer-divide by 2.
		$current = intdiv( $index, 2 );
		$index++;
		return 'data-slide="' . $current . '"';
	},
	$content
);

// 2. Parse with DOMDocument to split into quotes and persons.
$quotes_html  = '';
$persons_html = '';

if ( trim( $content ) ) {
	$doc = new DOMDocument();
	// Suppress warnings for HTML5 tags; wrap in UTF-8 container.
	libxml_use_internal_errors( true );
	$doc->loadHTML(
		'<html><head><meta charset="UTF-8"></head><body>' . $content . '</body></html>',
		LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
	);
	libxml_clear_errors();
	$xpath = new DOMXPath( $doc );

	// Extract quote wrappers (whole-word class match to avoid partial hits).
	$quote_nodes = $xpath->query( "//div[contains(concat(' ',normalize-space(@class),' '),' testimonial-slide__quote-wrapper ')]" );
	foreach ( $quote_nodes as $node ) {
		$quotes_html .= $doc->saveHTML( $node );
	}

	// Extract person blocks (exact class, not person-info).
	$person_nodes = $xpath->query( "//div[contains(concat(' ',normalize-space(@class),' '),' testimonial-slide__person ')]" );
	foreach ( $person_nodes as $node ) {
		$persons_html .= $doc->saveHTML( $node );
	}
}

// 3. SVG arrows.
$chevron_left = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$chevron_right = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

$wrapper_attrs = get_block_wrapper_attributes( array(
	'class' => 'testimonial-carousel',
) );
?>
<section <?php echo $wrapper_attrs; ?>>
	<div class="testimonial-carousel__inner">
		<div class="testimonial-carousel__top-bar" aria-hidden="true"></div>
		<div class="testimonial-carousel__quote-row">
			<button class="testimonial-carousel__arrow testimonial-carousel__arrow--prev" aria-label="<?php esc_attr_e( 'Previous testimonial', 'cl-theme-blocks' ); ?>"><?php echo $chevron_left; ?></button>
			<div class="testimonial-carousel__quotes" aria-live="polite">
				<?php echo $quotes_html; ?>
			</div>
			<button class="testimonial-carousel__arrow testimonial-carousel__arrow--next" aria-label="<?php esc_attr_e( 'Next testimonial', 'cl-theme-blocks' ); ?>"><?php echo $chevron_right; ?></button>
		</div>
		<div class="testimonial-carousel__progress-bar" aria-hidden="true">
			<div class="testimonial-carousel__progress-bar-fill"></div>
		</div>
		<div class="testimonial-carousel__people-row">
			<?php echo $persons_html; ?>
		</div>
	</div>
</section>
