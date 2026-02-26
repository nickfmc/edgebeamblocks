import { useState } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	RangeControl,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';

/**
 * Scale and opacity values that mirror the front-end logic in view.js and style.css.
 * Update all three places if these values change.
 */
const SCALE_ACTIVE   = 1;
const SCALE_ADJACENT = 0.65;
const SCALE_OUTER    = 0.42;

function getSlideStyle( distance ) {
	const abs = Math.abs( distance );
	if ( abs === 0 ) {
		return { scale: SCALE_ACTIVE,   opacity: 1    };
	}
	if ( abs === 1 ) {
		return { scale: SCALE_ADJACENT, opacity: 0.55 };
	}
	if ( abs === 2 ) {
		return { scale: SCALE_OUTER,    opacity: 0.28 };
	}
	return { scale: SCALE_OUTER, opacity: 0 };
}

export default function Edit( { attributes, setAttributes } ) {
	const { logos, autoPlay, autoPlayDuration, logoGap } = attributes;
	const [ activeIndex, setActiveIndex ] = useState( 0 );
	const total = logos.length;

	// ── Logo mutation helpers ─────────────────────────────────────────────────

	function addLogos( media ) {
		const additions = Array.isArray( media ) ? media : [ media ];
		setAttributes( {
			logos: [
				...logos,
				...additions.map( ( m ) => ( {
					id:    m.id,
					url:   m.url,
					alt:   m.alt || m.title || '',
					width: 150,
				} ) ),
			],
		} );
	}

	function updateLogo( index, updates ) {
		setAttributes( {
			logos: logos.map( ( logo, i ) =>
				i === index ? { ...logo, ...updates } : logo
			),
		} );
	}

	function removeLogo( index ) {
		const updated = logos.filter( ( _, i ) => i !== index );
		setAttributes( { logos: updated } );
		setActiveIndex( ( prev ) => Math.min( prev, Math.max( 0, updated.length - 1 ) ) );
	}

	// ── Editor canvas preview ─────────────────────────────────────────────────

	const canvasSlides = logos.map( ( logo, i ) => {
		// Signed distance from activeIndex, normalised to -floor(total/2)..+ceil(total/2).
		let dist = ( ( i - activeIndex ) % total + total ) % total;
		if ( dist > Math.floor( total / 2 ) ) {
			dist -= total;
		}
		const { scale, opacity } = getSlideStyle( dist );
		const isVisible = Math.abs( dist ) <= 2 || total <= 5;

		return (
			<button
				key={ i }
				type="button"
				aria-label={ __( 'Make active', 'cl-theme-blocks' ) }
				className={ `logo-carousel-editor__preview-slide ${ i === activeIndex ? 'is-active' : '' }` }
				style={ {
					transform: `scale(${ scale })`,
					opacity,
					visibility: isVisible ? 'visible' : 'hidden',
					transition: 'transform 0.3s ease, opacity 0.3s ease',
					cursor: 'pointer',
					background: 'none',
					border:     'none',
					padding:    0,
					flexShrink: 0,
				} }
				onClick={ () => setActiveIndex( i ) }
			>
				<img
					src={ logo.url }
					alt={ logo.alt }
					style={ {
						width:   `${ logo.width }px`,
						height:  'auto',
						display: 'block',
						filter:  'grayscale(100%)',
					} }
				/>
			</button>
		);
	} );

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<>
			<InspectorControls>

				{ /* ── Carousel settings ── */ }
				<PanelBody title={ __( 'Carousel Settings', 'cl-theme-blocks' ) }>
					<ToggleControl
						label={ __( 'Auto Play', 'cl-theme-blocks' ) }
						checked={ autoPlay }
						onChange={ ( value ) => setAttributes( { autoPlay: value } ) }
					/>
					{ autoPlay && (
						<RangeControl
							label={ __( 'Auto Play Duration (seconds)', 'cl-theme-blocks' ) }
							value={ autoPlayDuration }
							onChange={ ( value ) => setAttributes( { autoPlayDuration: value } ) }
							min={ 1 }
							max={ 10 }
							step={ 1 }
						/>
					) }
					<RangeControl
						label={ __( 'Logo Gap (px)', 'cl-theme-blocks' ) }
						value={ logoGap }
						onChange={ ( value ) => setAttributes( { logoGap: value } ) }
						min={ 8 }
						max={ 120 }
						step={ 4 }
					/>
				</PanelBody>

				{ /* ── Logo management ── */ }
				<PanelBody title={ __( 'Logos', 'cl-theme-blocks' ) } initialOpen={ true }>
					{ logos.map( ( logo, i ) => (
						<div key={ i } className="logo-carousel-editor__logo-item">
							<img
								src={ logo.url }
								alt={ logo.alt }
								className="logo-carousel-editor__logo-thumb"
							/>
							<div className="logo-carousel-editor__logo-controls">
								<RangeControl
									label={ __( 'Width (px)', 'cl-theme-blocks' ) }
									value={ logo.width }
									onChange={ ( val ) => updateLogo( i, { width: val } ) }
									min={ 50 }
									max={ 400 }
									step={ 10 }
								/>
								<div className="logo-carousel-editor__logo-actions">
									<MediaUploadCheck>
										<MediaUpload
											onSelect={ ( media ) =>
												updateLogo( i, {
													id:  media.id,
													url: media.url,
													alt: media.alt || '',
												} )
											}
											allowedTypes={ [ 'image' ] }
											value={ logo.id }
											render={ ( { open } ) => (
												<Button
													variant="secondary"
													onClick={ open }
													size="small"
												>
													{ __( 'Replace', 'cl-theme-blocks' ) }
												</Button>
											) }
										/>
									</MediaUploadCheck>
									<Button
										variant="link"
										isDestructive
										onClick={ () => removeLogo( i ) }
										size="small"
									>
										{ __( 'Remove', 'cl-theme-blocks' ) }
									</Button>
								</div>
							</div>
						</div>
					) ) }

					<MediaUploadCheck>
						<MediaUpload
							onSelect={ addLogos }
							allowedTypes={ [ 'image' ] }
							multiple
							gallery
							render={ ( { open } ) => (
								<Button
									variant="primary"
									onClick={ open }
									className="logo-carousel-editor__add-button"
									icon="plus-alt2"
								>
									{ __( 'Add Logos', 'cl-theme-blocks' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>
				</PanelBody>

			</InspectorControls>

			<div { ...useBlockProps( { className: 'logo-carousel-editor' } ) }>
				{ logos.length === 0 ? (

					<div className="logo-carousel-editor__placeholder">
						<p>{ __( 'Add logos from the sidebar panel, or click below.', 'cl-theme-blocks' ) }</p>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ addLogos }
								allowedTypes={ [ 'image' ] }
								multiple
								gallery
								render={ ( { open } ) => (
									<Button variant="primary" onClick={ open }>
										{ __( 'Add Logos', 'cl-theme-blocks' ) }
									</Button>
								) }
							/>
						</MediaUploadCheck>
					</div>

				) : (
					<>
						<div
							className="logo-carousel-editor__track"
							style={ { gap: `${ logoGap }px` } }
						>
							{ canvasSlides }
						</div>

						{ total > 1 && (
							<div className="logo-carousel-editor__nav">
								<Button
									variant="secondary"
									size="small"
									onClick={ () =>
										setActiveIndex( ( activeIndex - 1 + total ) % total )
									}
								>
									‹
								</Button>
								<span className="logo-carousel-editor__nav-label">
									{ activeIndex + 1 } / { total }
								</span>
								<Button
									variant="secondary"
									size="small"
									onClick={ () =>
										setActiveIndex( ( activeIndex + 1 ) % total )
									}
								>
									›
								</Button>
							</div>
						) }
					</>
				) }
			</div>
		</>
	);
}
