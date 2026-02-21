import { registerBlockType } from '@wordpress/blocks';
import './style.css';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import { verticalSliderIcon } from '../icons';

registerBlockType( metadata.name, {
	icon: verticalSliderIcon,
	edit: Edit,
	save,
} );
