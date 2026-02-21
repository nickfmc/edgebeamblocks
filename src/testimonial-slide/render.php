<?php
/**
 * Testimonial Slide — dynamic render.
 *
 * Outputs two sibling divs (quote wrapper + person info) that the parent
 * carousel's render.php splits into separate layout regions.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner block content (unused).
 * @var WP_Block $block      Block instance.
 */

$quote     = $attributes['quote'] ?? '';
$name      = $attributes['name'] ?? '';
$job_title = $attributes['jobTitle'] ?? '';
$avatar_url = $attributes['avatarUrl'] ?? '';
$avatar_alt = $attributes['avatarAlt'] ?? '';

// Fallback avatar
$avatar_html = $avatar_url
	? sprintf(
		'<img class="testimonial-slide__avatar" src="%s" alt="%s" width="56" height="56" loading="lazy" />',
		esc_url( $avatar_url ),
		esc_attr( $avatar_alt )
	)
	: '<span class="testimonial-slide__avatar testimonial-slide__avatar--empty" aria-hidden="true"></span>';
?>
<div class="testimonial-slide__quote-wrapper" data-slide="__INDEX__">
	<p class="testimonial-slide__quote-text"><?php echo wp_kses_post( $quote ); ?></p>
</div>
<div class="testimonial-slide__person" data-slide="__INDEX__" role="button" tabindex="0">
	<?php echo $avatar_html; ?>
	<div class="testimonial-slide__person-info">
		<p class="testimonial-slide__name"><?php echo esc_html( $name ); ?></p>
		<p class="testimonial-slide__job-title"><?php echo esc_html( $job_title ); ?></p>
	</div>
</div>
