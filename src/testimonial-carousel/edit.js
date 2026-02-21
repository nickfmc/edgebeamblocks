import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import './editor.css';

const TEMPLATE = [
	[ 'gdt-ng/testimonial-slide', {} ],
	[ 'gdt-ng/testimonial-slide', {} ],
	[ 'gdt-ng/testimonial-slide', {} ],
];

export default function Edit() {
	return (
		<div
			{ ...useBlockProps( { className: 'testimonial-carousel-editor' } ) }
		>
			<InnerBlocks
				template={ TEMPLATE }
				templateLock="all"
				allowedBlocks={ [ 'gdt-ng/testimonial-slide' ] }
			/>
		</div>
	);
}
