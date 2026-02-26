import { registerBlockType } from '@wordpress/blocks';
import './style.css';
import Edit from './edit';
import metadata from './block.json';
import { logoCarouselIcon } from '../icons';

registerBlockType( metadata.name, {
	icon: logoCarouselIcon,
	edit: Edit,
	// Fully dynamic — PHP render.php generates all markup.
	save: () => null,
} );
