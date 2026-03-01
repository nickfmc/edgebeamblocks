import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import './editor.css';

export default function Edit() {
	return (
		<div
			{ ...useBlockProps( { className: 'card-carousel-slide-editor' } ) }
		>
			<InnerBlocks />
		</div>
	);
}
