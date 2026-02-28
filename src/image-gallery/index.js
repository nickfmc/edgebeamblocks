import { registerBlockType } from '@wordpress/blocks';
import './style.css';
import Edit from './edit';
import metadata from './block.json';
import { imageGalleryIcon } from '../icons';

registerBlockType( metadata.name, {
	icon: imageGalleryIcon,
	edit: Edit,
	save: () => null,
} );
