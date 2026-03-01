import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import './editor.css';

const TEMPLATE = [
	[ 'gdt-ng/card-carousel-slide', {} ],
	[ 'gdt-ng/card-carousel-slide', {} ],
	[ 'gdt-ng/card-carousel-slide', {} ],
];

export default function Edit() {
	return (
		<div
			{ ...useBlockProps( { className: 'card-carousel-editor' } ) }
		>
			<InnerBlocks
				template={ TEMPLATE }
				allowedBlocks={ [ 'gdt-ng/card-carousel-slide' ] }
			/>
		</div>
	);
}
