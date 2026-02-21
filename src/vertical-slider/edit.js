import { useBlockProps, InnerBlocks, InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';

const TEMPLATE = [
	[ 'core/group', {} ],
	[ 'core/group', {} ],
	[ 'core/group', {} ],
];

export default function Edit( { attributes, setAttributes } ) {
	const { showArrows, showDots, slideGap, previewPx, alignTop, previewFadeColor } = attributes;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Slider Settings', 'cl-theme-blocks' ) }>
					<ToggleControl
						label={ __( 'Show Navigation Arrows', 'cl-theme-blocks' ) }
						checked={ showArrows }
						onChange={ ( value ) => setAttributes( { showArrows: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show Navigation Dots', 'cl-theme-blocks' ) }
						checked={ showDots }
						onChange={ ( value ) => setAttributes( { showDots: value } ) }
					/>
					<ToggleControl
						label={ __( 'Active Slide at Top', 'cl-theme-blocks' ) }
						help={ __( 'Pin the active slide to the top; only the next slide previews below.', 'cl-theme-blocks' ) }
						checked={ alignTop }
						onChange={ ( value ) => setAttributes( { alignTop: value } ) }
					/>
					<RangeControl
						label={ __( 'Slide Gap (px)', 'cl-theme-blocks' ) }
						help={ __( 'Space between the active slide and the prev/next previews.', 'cl-theme-blocks' ) }
						value={ slideGap }
						onChange={ ( value ) => setAttributes( { slideGap: value } ) }
						min={ 0 }
						max={ 120 }
						step={ 4 }
					/>
					<RangeControl
						label={ __( 'Preview Height (px)', 'cl-theme-blocks' ) }
						help={ __( 'How many px of the previous/next slides to show above and below.', 'cl-theme-blocks' ) }
						value={ previewPx }
						onChange={ ( value ) => setAttributes( { previewPx: value } ) }
						min={ 0 }
						max={ 200 }
						step={ 4 }
					/>
				</PanelBody>
				<PanelColorSettings
					title={ __( 'Preview Fade', 'cl-theme-blocks' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							label: __( 'Fade Color', 'cl-theme-blocks' ),
							value: previewFadeColor,
							onChange: ( value ) => setAttributes( { previewFadeColor: value ?? '' } ),
						},
					] }
				/>
			</InspectorControls>
			<div
				{ ...useBlockProps( { className: 'vertical-slider-editor' } ) }
			>
				<InnerBlocks
					template={ TEMPLATE }
					templateLock={ false }
				/>
			</div>
		</>
	);
}
