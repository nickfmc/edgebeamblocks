import { registerBlockType } from '@wordpress/blocks';
import './style.css';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import { cardCarouselIcon } from '../icons';

registerBlockType( metadata.name, {
	icon: cardCarouselIcon,
	edit: Edit,
	save,
} );
