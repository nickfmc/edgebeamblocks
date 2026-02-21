<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */
?>
<div <?php echo get_block_wrapper_attributes(); ?>>
	<?php echo esc_html( 'Hello World – hello from a dynamic block!' ); ?>
	<div class="internal-element">
		<?php echo esc_html( 'Internal element with functional CSS class' ); ?>
	</div>
</div>
