import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save() {
	return (
		<div
			{ ...useBlockProps.save( { className: 'card-carousel__slide' } ) }
		>
			<InnerBlocks.Content />
		</div>
	);
}
