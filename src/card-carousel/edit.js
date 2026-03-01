import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';

const TEMPLATE = [
	[ 'gdt-ng/card-carousel-slide', {} ],
	[ 'gdt-ng/card-carousel-slide', {} ],
	[ 'gdt-ng/card-carousel-slide', {} ],
];

export default function Edit( { attributes, setAttributes } ) {
	const { uniformHeight, cardWidth } = attributes;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'cl-theme-blocks' ) }>
					<RangeControl
						label={ __( 'Card width (px)', 'cl-theme-blocks' ) }
						value={ cardWidth }
						onChange={ ( val ) => setAttributes( { cardWidth: val } ) }
						min={ 200 }
						max={ 800 }
						step={ 10 }
					/>
					<ToggleControl
						label={ __( 'Uniform slide height', 'cl-theme-blocks' ) }
						help={ __( 'Force all slides to match the height of the tallest slide.', 'cl-theme-blocks' ) }
						checked={ uniformHeight }
						onChange={ ( val ) => setAttributes( { uniformHeight: val } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div
				{ ...useBlockProps( { className: 'card-carousel-editor' } ) }
			>
				<InnerBlocks
					template={ TEMPLATE }
					allowedBlocks={ [ 'gdt-ng/card-carousel-slide' ] }
				/>
			</div>
		</>
	);
}
