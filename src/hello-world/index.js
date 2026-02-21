/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Allow webpack to process CSS files referenced in JavaScript files.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts
 */
import './style.css';

/**
 * Internal dependencies
 */
import Edit from './edit';
import metadata from './block.json';
import { customBlock } from '../icons';

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType( metadata.name, {
	/**
	 * Use the imported custom icon
	 */
	icon: customBlock,
	
	/**
	 * @see ./edit.js
	 */
	edit: Edit,
} );
