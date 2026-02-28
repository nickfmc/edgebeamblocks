/**
 * Image Gallery — WebGL displacement crossfade engine.
 *
 * Two canvas slots cycle through a shared image list with a staggered
 * ripple-displacement crossfade. All transitions are driven by a
 * requestAnimationFrame loop and a pair of WebGL programs, one per canvas.
 *
 * Slots share the same image list but advance their indices independently,
 * offset by `staggerMs` so they never fire at exactly the same time:
 *
 *   t = 0              : Slot A begins transition
 *   t = staggerMs      : Slot B begins transition
 *   t = intervalMs     : Slot A begins next transition
 *   t = intervalMs + staggerMs : Slot B begins next transition
 *   …
 */
( function () {
	'use strict';

	/* ── Constants ───────────────────────────────────────────────────────── */

	const TRANSITION_DURATION = 900; // ms — length of the displacement animation

	/* ── Vertex shader ───────────────────────────────────────────────────── */

	const VERT_SRC = `
		attribute vec2 a_position;
		varying   vec2 v_uv;
		void main() {
			v_uv = a_position * 0.5 + 0.5;
			v_uv.y = 1.0 - v_uv.y; /* flip Y so images render right-side up */
			gl_Position = vec4( a_position, 0.0, 1.0 );
		}
	`;

	/* ── Fragment shader — displacement crossfade ────────────────────────── */

	const FRAG_SRC = `
		precision mediump float;
		varying   vec2      v_uv;
		uniform   sampler2D u_texA;
		uniform   sampler2D u_texB;
		uniform   float     u_progress; /* 0 → 1                              */
		uniform   float     u_time;     /* seconds, for animated displacement  */
		uniform   float     u_seed;     /* per-slot offset so slots vary       */

		void main() {
			/* Strength peaks at mid-transition (progress = 0.5) */
			float str = u_progress * ( 1.0 - u_progress ) * 4.0;

			/* Two overlapping sine waves create an organic ripple */
			float d1 = sin( v_uv.x * 9.0 + u_time * 2.1 + u_seed )
			         * cos( v_uv.y * 7.0 + u_time * 1.7 );
			float d2 = sin( v_uv.y * 12.0 - u_time * 1.3 + u_seed * 0.6 ) * 0.5;
			float d  = d1 + d2;

			vec2 uvA = clamp( v_uv + vec2( d * str * 0.10,  d * str * 0.07 ), 0.0, 1.0 );
			vec2 uvB = clamp( v_uv - vec2( d * str * 0.10,  d * str * 0.07 ), 0.0, 1.0 );

			vec4 colA = texture2D( u_texA, uvA );
			vec4 colB = texture2D( u_texB, uvB );

			gl_FragColor = mix( colA, colB, smoothstep( 0.0, 1.0, u_progress ) );
		}
	`;

	/* ── Utility helpers ─────────────────────────────────────────────────── */

	/**
	 * Parse an aspect-ratio string like "4/5" or "16/9" into { w, h }.
	 */
	function parseAspect( str ) {
		const parts = ( str || '4/5' ).split( '/' );
		return { w: parseFloat( parts[0] ) || 4, h: parseFloat( parts[1] ) || 5 };
	}

	/**
	 * Draw an image into an offscreen canvas sized { tw × th } with cover-crop.
	 */
	function coverCanvas( img, tw, th ) {
		const oc  = document.createElement( 'canvas' );
		oc.width  = tw;
		oc.height = th;
		const ctx = oc.getContext( '2d' );
		const iw  = img.naturalWidth  || img.width  || tw;
		const ih  = img.naturalHeight || img.height || th;
		const s   = Math.max( tw / iw, th / ih );
		const sw  = iw * s;
		const sh  = ih * s;
		ctx.drawImage( img, ( tw - sw ) / 2, ( th - sh ) / 2, sw, sh );
		return oc;
	}

	/**
	 * Upload a canvas as a WebGL RGBA texture with linear filtering.
	 */
	function uploadTexture( gl, source ) {
		const tex = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, tex );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source );
		return tex;
	}

	/**
	 * Compile a single shader, logging errors. Returns null on failure.
	 */
	function compileShader( gl, type, src ) {
		const sh = gl.createShader( type );
		gl.shaderSource( sh, src );
		gl.compileShader( sh );
		if ( ! gl.getShaderParameter( sh, gl.COMPILE_STATUS ) ) {
			// eslint-disable-next-line no-console
			console.error( '[image-gallery] shader error:', gl.getShaderInfoLog( sh ) );
			gl.deleteShader( sh );
			return null;
		}
		return sh;
	}

	/**
	 * Link a GL program from vert/frag sources. Returns null on failure.
	 */
	function buildProgram( gl, vertSrc, fragSrc ) {
		const v = compileShader( gl, gl.VERTEX_SHADER,   vertSrc );
		const f = compileShader( gl, gl.FRAGMENT_SHADER, fragSrc );
		if ( ! v || ! f ) return null;
		const p = gl.createProgram();
		gl.attachShader( p, v );
		gl.attachShader( p, f );
		gl.linkProgram( p );
		if ( ! gl.getProgramParameter( p, gl.LINK_STATUS ) ) {
			// eslint-disable-next-line no-console
			console.error( '[image-gallery] link error:', gl.getProgramInfoLog( p ) );
			return null;
		}
		return p;
	}

	/** Ease-in-out cubic. */
	function easeInOut( t ) {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow( -2 * t + 2, 3 ) / 2;
	}

	/* ── Per-block initialisation ────────────────────────────────────────── */

	document.querySelectorAll( '.image-gallery' ).forEach( ( block ) => {
		const canvasA = block.querySelector( '.image-gallery__slot--a' );
		const canvasB = block.querySelector( '.image-gallery__slot--b' );
		if ( ! canvasA || ! canvasB ) return;

		/* Parse data attributes */
		let imageData;
		try { imageData = JSON.parse( block.dataset.images || '[]' ); }
		catch ( e ) { return; }
		if ( imageData.length < 2 ) return;

		const intervalMs  = parseInt( block.dataset.interval || '3000', 10 );
		const staggerMs   = parseInt( block.dataset.stagger  || '1500', 10 );
		const aspectStr   = block.dataset.aspectRatio || '4/5';

		/* Respect OS reduced-motion preference */
		const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

		/* Internal canvas resolution (portrait-safe base) */
		const BASE = 600;
		const { w: arW, h: arH } = parseAspect( aspectStr );
		const TEX_W = BASE;
		const TEX_H = Math.round( BASE * arH / arW );

		/* WebGL context acquisition */
		const ctxOpts = { alpha: false, antialias: false, depth: false };
		const glA = canvasA.getContext( 'webgl', ctxOpts )
		         || canvasA.getContext( 'experimental-webgl', ctxOpts );
		const glB = canvasB.getContext( 'webgl', ctxOpts )
		         || canvasB.getContext( 'experimental-webgl', ctxOpts );

		/* ── CSS fallback when WebGL is unavailable ──────────────────────── */
		if ( ! glA || ! glB ) {
			block.classList.add( 'image-gallery--no-webgl' );
			let idxA = 0, idxB = 1 % imageData.length;

			function applyBg( el, idx ) {
				const img = imageData[ idx ];
				el.style.backgroundImage = `url('${ img.url }')`;
				el.setAttribute( 'aria-label', img.alt || '' );
			}

			applyBg( canvasA, idxA );
			applyBg( canvasB, idxB );
			block.classList.add( 'is-ready' );

			setInterval( () => { idxA = ( idxA + 1 ) % imageData.length; applyBg( canvasA, idxA ); }, intervalMs );
			setTimeout( () => {
				setInterval( () => { idxB = ( idxB + 1 ) % imageData.length; applyBg( canvasB, idxB ); }, intervalMs );
			}, staggerMs );
			return;
		}

		/* Set canvas internal resolution */
		[ canvasA, canvasB ].forEach( ( c ) => { c.width = TEX_W; c.height = TEX_H; } );

		/* Build GL programs */
		const progA = buildProgram( glA, VERT_SRC, FRAG_SRC );
		const progB = buildProgram( glB, VERT_SRC, FRAG_SRC );
		if ( ! progA || ! progB ) return;

		/* Create fullscreen quad geometry (two triangles) */
		const QUAD_VERTS = new Float32Array( [ -1,-1, 1,-1, -1,1,  -1,1, 1,-1, 1,1 ] );

		function initQuad( gl, prog ) {
			const buf = gl.createBuffer();
			gl.bindBuffer( gl.ARRAY_BUFFER, buf );
			gl.bufferData( gl.ARRAY_BUFFER, QUAD_VERTS, gl.STATIC_DRAW );
			return { buf, loc: gl.getAttribLocation( prog, 'a_position' ) };
		}

		function cacheUniforms( gl, prog ) {
			return {
				texA:     gl.getUniformLocation( prog, 'u_texA' ),
				texB:     gl.getUniformLocation( prog, 'u_texB' ),
				progress: gl.getUniformLocation( prog, 'u_progress' ),
				time:     gl.getUniformLocation( prog, 'u_time' ),
				seed:     gl.getUniformLocation( prog, 'u_seed' ),
			};
		}

		const quadA = initQuad( glA, progA );
		const quadB = initQuad( glB, progB );
		const uniA  = cacheUniforms( glA, progA );
		const uniB  = cacheUniforms( glB, progB );

		/* ── Image loading ───────────────────────────────────────────────── */

		let loadedCount     = 0;
		let glReady         = false;
		let startTime       = null;
		let rafHandle       = null;
		let slotA = null, slotB = null;

		const htmlImages = imageData.map( ( data ) => {
			const img       = new window.Image();
			img.crossOrigin = 'anonymous';
			img.addEventListener( 'load',  onLoad, { once: true } );
			img.addEventListener( 'error', onLoad, { once: true } );
			img.src = data.url; // set after listeners
			return img;
		} );

		/* Safety: start after 3 s even if some images fail to load */
		const safetyTimer = setTimeout( () => { if ( ! glReady ) initWebGL(); }, 3000 );

		function onLoad() {
			loadedCount++;
			if ( loadedCount >= imageData.length ) initWebGL();
		}

		/* ── WebGL initialisation (runs once all images are loaded) ──────── */

		function makeTextures( gl ) {
			return htmlImages.map( ( img ) => uploadTexture( gl, coverCanvas( img, TEX_W, TEX_H ) ) );
		}

		function makeSlot( gl, prog, quad, uni, seed, startIdx, textures ) {
			return { gl, prog, quad, uni, seed, textures, startIdx,
				currentIdx:    startIdx % textures.length,
				nextIdx:       ( startIdx + 1 ) % textures.length,
				transitioning: false,
				transitionStart: 0,
			};
		}

		function initWebGL() {
			if ( glReady ) return;
			glReady = true;
			clearTimeout( safetyTimer );

			const texA = makeTextures( glA );
			const texB = makeTextures( glB );

			/* Slot A starts at image 0, Slot B starts at image 1 */
			slotA = makeSlot( glA, progA, quadA, uniA, 0.0, 0, texA );
			slotB = makeSlot( glB, progB, quadB, uniB, 3.7, 1, texB );

			/* Render first static frame for each slot */
			drawSlot( slotA, 0, 0 );
			drawSlot( slotB, 0, 0 );

			block.classList.add( 'is-ready' );

			startTime = performance.now();

			/* Stagger the first transitions */
			setTimeout( () => beginTransition( slotA, canvasA ), intervalMs );
			setTimeout( () => beginTransition( slotB, canvasB ), intervalMs + staggerMs );

			rafHandle = requestAnimationFrame( onFrame );
		}

		/* ── Per-slot transition trigger ─────────────────────────────────── */

		function beginTransition( slot, canvas ) {
			slot.nextIdx         = ( slot.currentIdx + 1 ) % slot.textures.length;
			slot.transitionStart = performance.now();
			slot.transitioning   = true;

			/* Update accessible label to incoming image */
			const next = imageData[ slot.nextIdx ];
			if ( next && next.alt ) canvas.setAttribute( 'aria-label', next.alt );
		}

		/* ── Render a single slot ────────────────────────────────────────── */

		function drawSlot( slot, progress, timeSec ) {
			const { gl, prog, quad, uni, seed, textures, currentIdx, nextIdx } = slot;

			gl.useProgram( prog );
			gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

			gl.activeTexture( gl.TEXTURE0 );
			gl.bindTexture( gl.TEXTURE_2D, textures[ currentIdx ] );
			gl.uniform1i( uni.texA, 0 );

			gl.activeTexture( gl.TEXTURE1 );
			gl.bindTexture( gl.TEXTURE_2D, textures[ nextIdx ] );
			gl.uniform1i( uni.texB, 1 );

			gl.uniform1f( uni.progress, progress );
			gl.uniform1f( uni.time,     timeSec );
			gl.uniform1f( uni.seed,     seed );

			gl.bindBuffer( gl.ARRAY_BUFFER, quad.buf );
			gl.enableVertexAttribArray( quad.loc );
			gl.vertexAttribPointer( quad.loc, 2, gl.FLOAT, false, 0, 0 );
			gl.drawArrays( gl.TRIANGLES, 0, 6 );
		}

		/* ── RAF loop ────────────────────────────────────────────────────── */

		function onFrame() {
			rafHandle = requestAnimationFrame( onFrame );
			if ( ! slotA || ! slotB ) return;

			const now     = performance.now();
			const timeSec = ( now - startTime ) / 1000;

			[ [ slotA, canvasA ], [ slotB, canvasB ] ].forEach( ( [ slot, canvas ] ) => {
				let progress = 0;

				if ( slot.transitioning ) {
					const elapsed   = now - slot.transitionStart;
					const duration  = reducedMotion ? 0 : TRANSITION_DURATION;
					const t         = duration > 0 ? Math.min( elapsed / duration, 1 ) : 1;
					progress        = easeInOut( t );

					if ( t >= 1 ) {
						/* Advance: new current image, schedule the next transition */
						slot.currentIdx    = slot.nextIdx;
						slot.nextIdx       = ( slot.currentIdx + 1 ) % slot.textures.length;
						slot.transitioning = false;
						progress           = 0;
						setTimeout( () => beginTransition( slot, canvas ), intervalMs );
					}
				}

				drawSlot( slot, progress, timeSec );
			} );
		}

		/* ── Pause RAF when block scrolls out of viewport ────────────────── */

		if ( 'IntersectionObserver' in window ) {
			const io = new IntersectionObserver(
				( entries ) => {
					entries.forEach( ( { isIntersecting } ) => {
						if ( isIntersecting ) {
							if ( ! rafHandle ) rafHandle = requestAnimationFrame( onFrame );
						} else {
							if ( rafHandle ) { cancelAnimationFrame( rafHandle ); rafHandle = null; }
						}
					} );
				},
				{ threshold: 0.1 }
			);
			io.observe( block );
		}
	} );
} )();
