import { useState } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	Button,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import './editor.css';

const ASPECT_OPTIONS = [
	{ label: '4:5  (portrait, recommended)', value: '4/5' },
	{ label: '3:4  (portrait)',               value: '3/4' },
	{ label: '1:1  (square)',                 value: '1/1' },
	{ label: '9:16 (tall portrait)',          value: '9/16' },
	{ label: '16:9 (landscape)',              value: '16/9' },
];

export default function Edit( { attributes, setAttributes } ) {
	const { images, intervalMs, staggerMs, aspectRatio, gap, borderRadius } = attributes;
	const [ hoveredIndex, setHoveredIndex ] = useState( null );

	/* ── Image management ─────────────────────────────────────────── */

	function addImages( media ) {
		const additions = Array.isArray( media ) ? media : [ media ];
		setAttributes( {
			images: [
				...images,
				...additions.map( ( m ) => ( {
					id:     m.id,
					url:    m.url,
					alt:    m.alt || m.title || '',
					width:  m.width  || 0,
					height: m.height || 0,
				} ) ),
			],
		} );
	}

	function replaceImage( index, media ) {
		setAttributes( {
			images: images.map( ( img, i ) =>
				i === index
					? { id: media.id, url: media.url, alt: media.alt || '', width: media.width || 0, height: media.height || 0 }
					: img
			),
		} );
	}

	function removeImage( index ) {
		setAttributes( { images: images.filter( ( _, i ) => i !== index ) } );
	}

	/* ── Preview slots ─────────────────────────────────────────────── */

	const slotStyle = {
		aspectRatio,
		flex: '1 1 0',
		minWidth: 0,
		background: '#1a1a2e',
		borderRadius: `${ borderRadius }px`,
		overflow: 'hidden',
		position: 'relative',
	};

	const imgA = images[0];
	const imgB = images[1];

	/* ── Render ────────────────────────────────────────────────────── */

	return (
		<>
			{/* ── Inspector ──────────────────────────────────────────── */}
			<InspectorControls>
				<PanelBody title={ __( 'Images', 'cl-theme-blocks' ) } initialOpen={ true }>
					{ images.length > 0 && (
						<div className="image-gallery-editor__thumbs">
							{ images.map( ( img, i ) => (
								<div
									key={ img.id ?? i }
									className={ `image-gallery-editor__thumb ${ hoveredIndex === i ? 'is-hovered' : '' }` }
									onMouseEnter={ () => setHoveredIndex( i ) }
									onMouseLeave={ () => setHoveredIndex( null ) }
								>
									<img src={ img.url } alt={ img.alt } />
									<div className="image-gallery-editor__thumb-actions">
										<MediaUploadCheck>
											<MediaUpload
												onSelect={ ( m ) => replaceImage( i, m ) }
												allowedTypes={ [ 'image' ] }
												value={ img.id }
												render={ ( { open } ) => (
													<Button variant="secondary" size="small" onClick={ open }>
														{ __( 'Replace', 'cl-theme-blocks' ) }
													</Button>
												) }
											/>
										</MediaUploadCheck>
										<Button variant="link" isDestructive size="small" onClick={ () => removeImage( i ) }>
											{ __( 'Remove', 'cl-theme-blocks' ) }
										</Button>
									</div>
								</div>
							) ) }
						</div>
					) }

					<MediaUploadCheck>
						<MediaUpload
							onSelect={ addImages }
							allowedTypes={ [ 'image' ] }
							multiple
							gallery
							render={ ( { open } ) => (
								<Button
									variant="primary"
									onClick={ open }
									icon="plus-alt2"
									className="image-gallery-editor__add-btn"
								>
									{ images.length === 0
										? __( 'Add Images', 'cl-theme-blocks' )
										: __( 'Add More Images', 'cl-theme-blocks' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>

					{ images.length > 0 && (
						<p className="image-gallery-editor__count">
							{ images.length === 1
								? __( '1 image — add at least one more.', 'cl-theme-blocks' )
								: /* translators: %d: number of images */
								  sprintf( __( '%d images', 'cl-theme-blocks' ), images.length ) }
						</p>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Settings', 'cl-theme-blocks' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Aspect Ratio', 'cl-theme-blocks' ) }
						value={ aspectRatio }
						options={ ASPECT_OPTIONS }
						onChange={ ( value ) => setAttributes( { aspectRatio: value } ) }
					/>
					<RangeControl
						label={ __( 'Interval (seconds)', 'cl-theme-blocks' ) }
						help={ __( 'How long each image displays before the next crossfade.', 'cl-theme-blocks' ) }
						value={ intervalMs / 1000 }
						onChange={ ( value ) => setAttributes( { intervalMs: value * 1000 } ) }
						min={ 1 } max={ 10 } step={ 0.5 }
					/>
					<RangeControl
						label={ __( 'Stagger Delay (seconds)', 'cl-theme-blocks' ) }
						help={ __( 'Delay between the left slot fading and the right slot fading.', 'cl-theme-blocks' ) }
						value={ staggerMs / 1000 }
						onChange={ ( value ) => setAttributes( { staggerMs: value * 1000 } ) }
						min={ 0 } max={ 5 } step={ 0.25 }
					/>
					<RangeControl
						label={ __( 'Gap (px)', 'cl-theme-blocks' ) }
						value={ gap }
						onChange={ ( value ) => setAttributes( { gap: value } ) }
						min={ 0 } max={ 80 } step={ 4 }
					/>
					<RangeControl
						label={ __( 'Border Radius (px)', 'cl-theme-blocks' ) }
						value={ borderRadius }
						onChange={ ( value ) => setAttributes( { borderRadius: value } ) }
						min={ 0 } max={ 80 } step={ 2 }
					/>
				</PanelBody>
			</InspectorControls>

			{/* ── Canvas preview ─────────────────────────────────────── */}
			<div { ...useBlockProps( { className: 'image-gallery-editor' } ) }>
				{ images.length === 0 ? (
					<div className="image-gallery-editor__empty">
						<p>{ __( 'Add images from the sidebar to get started.', 'cl-theme-blocks' ) }</p>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ addImages }
								allowedTypes={ [ 'image' ] }
								multiple
								gallery
								render={ ( { open } ) => (
									<Button variant="primary" onClick={ open }>
										{ __( 'Add Images', 'cl-theme-blocks' ) }
									</Button>
								) }
							/>
						</MediaUploadCheck>
					</div>
				) : (
					<div
						className="image-gallery-editor__preview"
						style={ { gap: `${ gap }px` } }
					>
						{ /* Slot A */ }
						<div className="image-gallery-editor__slot" style={ slotStyle }>
							{ imgA ? (
								<img src={ imgA.url } alt={ imgA.alt } />
							) : (
								<span className="image-gallery-editor__slot-label">{ __( 'Slot A', 'cl-theme-blocks' ) }</span>
							) }
						</div>

						{ /* Slot B */ }
						<div className="image-gallery-editor__slot image-gallery-editor__slot--b" style={ slotStyle }>
							{ imgB ? (
								<img src={ imgB.url } alt={ imgB.alt } />
							) : (
								<span className="image-gallery-editor__slot-label">{ __( 'Slot B', 'cl-theme-blocks' ) }</span>
							) }
						</div>
					</div>
				) }
			</div>
		</>
	);
}

