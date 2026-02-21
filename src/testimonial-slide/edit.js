import { useBlockProps, RichText, MediaUpload } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';

export default function Edit( { attributes, setAttributes } ) {
	const { quote, name, jobTitle, avatarId, avatarUrl, avatarAlt } =
		attributes;

	const onSelectAvatar = ( media ) => {
		setAttributes( {
			avatarId: media.id,
			avatarUrl: media.url,
			avatarAlt: media.alt || '',
		} );
	};

	return (
		<div { ...useBlockProps( { className: 'testimonial-slide-editor' } ) }>
			<div className="testimonial-slide-editor__top">
				<MediaUpload
					onSelect={ onSelectAvatar }
					allowedTypes={ [ 'image' ] }
					value={ avatarId }
					render={ ( { open } ) => (
						<Button
							className="testimonial-slide-editor__avatar-btn"
							onClick={ open }
						>
							{ avatarUrl ? (
								<img
									src={ avatarUrl }
									alt={ avatarAlt }
									className="testimonial-slide-editor__avatar-img"
								/>
							) : (
								<span className="testimonial-slide-editor__avatar-placeholder">
									{ __( 'Photo', 'cl-theme-blocks' ) }
								</span>
							) }
						</Button>
					) }
				/>
				<div className="testimonial-slide-editor__person-info">
					<RichText
						tagName="p"
						className="testimonial-slide-editor__name"
						placeholder={ __( 'Name', 'cl-theme-blocks' ) }
						value={ name }
						onChange={ ( val ) => setAttributes( { name: val } ) }
						allowedFormats={ [] }
					/>
					<RichText
						tagName="p"
						className="testimonial-slide-editor__job-title"
						placeholder={ __( 'Job Title', 'cl-theme-blocks' ) }
						value={ jobTitle }
						onChange={ ( val ) =>
							setAttributes( { jobTitle: val } )
						}
						allowedFormats={ [] }
					/>
				</div>
			</div>
			<RichText
				tagName="p"
				className="testimonial-slide-editor__quote"
				placeholder={ __(
					'Write testimonial quote\u2026',
					'cl-theme-blocks'
				) }
				value={ quote }
				onChange={ ( val ) => setAttributes( { quote: val } ) }
				allowedFormats={ [ 'core/bold', 'core/italic' ] }
			/>
		</div>
	);
}
