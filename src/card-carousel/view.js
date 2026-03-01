/**
 * Card Carousel — front-end vanilla JS.
 *
 * Manages the infinite-wrap carousel with five positional classes:
 *   is-outer-left  is-adjacent-left  is-active  is-adjacent-right  is-outer-right
 *
 * Slides outside those five positions carry no positional class and are
 * opacity: 0. No auto-play — users navigate with arrows, swipe, or keyboard.
 *
 * CSS custom properties set on the carousel root:
 *   --card-width   Width of a single slide (px)
 *   --card-step    Width of one step = card width + gap (px)
 *   --track-height Height of the tallest active slide (px)
 */
( function () {
	const SLIDE_GAP = 24; // px between slide edges

	const ALL_POSITION_CLASSES = [
		'is-active',
		'is-adjacent-left',
		'is-adjacent-right',
		'is-outer-left',
		'is-outer-right',
	];

	document.querySelectorAll( '.card-carousel' ).forEach( ( carousel ) => {
		const track   = carousel.querySelector( '.card-carousel__track' );
		const prevBtn = carousel.querySelector( '.card-carousel__arrow--prev' );
		const nextBtn = carousel.querySelector( '.card-carousel__arrow--next' );

		if ( ! track ) {
			return;
		}

		// Collect direct-child slides (may have wp-block-* wrapper class too).
		const slides = Array.from(
			track.querySelectorAll( '.card-carousel__slide' )
		);
		const total = slides.length;

		if ( total < 1 ) {
			return;
		}

		let current = 0;

		// ── Ensure keyboard focus is possible ────────────────────────────────

		if ( ! carousel.hasAttribute( 'tabindex' ) ) {
			carousel.setAttribute( 'tabindex', '0' );
		}

		// ── Utility ───────────────────────────────────────────────────────────

		/**
		 * Modular wrap — always returns a value in [0, total).
		 */
		function wrap( index ) {
			return ( ( index % total ) + total ) % total;
		}

		/**
		 * Return the signed distance of slide `i` from `fromCurrent`.
		 * Positive = right of center, negative = left of center.
		 */
		function signedDist( i, fromCurrent ) {
			const raw = wrap( i - fromCurrent );
			return raw > Math.floor( total / 2 ) ? raw - total : raw;
		}

		/**
		 * Return the CSS class name for a given signed distance.
		 */
		function classForDist( dist ) {
			if ( dist === 0  ) { return 'is-active';         }
			if ( dist === 1  ) { return 'is-adjacent-right'; }
			if ( dist === -1 ) { return 'is-adjacent-left';  }
			if ( dist >= 2   ) { return 'is-outer-right';    }
			return 'is-outer-left';
		}

		/**
		 * Assign positional classes to all slides based on `current`.
		 * The "signed distance" from center determines which class each slide gets.
		 */
		function updateClasses() {
			slides.forEach( ( slide, i ) => {
				slide.classList.remove( ...ALL_POSITION_CLASSES );
				slide.classList.add( classForDist( signedDist( i, current ) ) );
			} );
		}

		/**
		 * Measure the active slide and update CSS custom properties so the
		 * track has the correct height and step spacing.
		 */
		function updateDimensions() {
			const activeSlide = slides[ current ];
			if ( ! activeSlide ) {
				return;
			}

			// Temporarily lift visibility restrictions to measure natural height.
			const prevPointerEvents = activeSlide.style.pointerEvents;
			const prevPosition      = track.style.height;

			// Read dimensions from the active slide.
			const cardW  = activeSlide.offsetWidth;
			const cardH  = activeSlide.offsetHeight;
			const step   = cardW + SLIDE_GAP;

			// Apply CSS custom properties to the carousel root so CSS can use them.
			carousel.style.setProperty( '--card-width', cardW + 'px' );
			carousel.style.setProperty( '--card-step',  step  + 'px' );
			carousel.style.setProperty( '--track-height', cardH + 'px' );
		}

		// ── Navigation ────────────────────────────────────────────────────────

		/**
		 * Navigate to `index`, wrapping infinitely.
		 *
		 * Warp prevention
		 * ───────────────
		 * When a slide's signed distance changes by more than half the total
		 * (e.g. outer-left → outer-right), a CSS transition would cause it to
		 * visibly fly across the track. We prevent this by:
		 *   1. Adding `no-transition` to those slides before updating classes.
		 *   2. Forcing a reflow so the browser registers the instant move.
		 *   3. Removing `no-transition` so subsequent navigations animate normally.
		 */
		function goTo( index ) {
			const prevCurrent = current;
			current = wrap( index );

			const halfTotal = Math.ceil( total / 2 );

			// Mark slides that would warp (large cross-side jump).
			slides.forEach( ( slide, i ) => {
				const prevDist = signedDist( i, prevCurrent );
				const newDist  = signedDist( i, current );
				if ( Math.abs( newDist - prevDist ) >= halfTotal ) {
					slide.classList.add( 'no-transition' );
				}
			} );

			// Flush to GPU so the instant teleport happens before transitions re-fire.
			if ( slides.some( ( s ) => s.classList.contains( 'no-transition' ) ) ) {
				track.getBoundingClientRect(); // force reflow
			}

			updateClasses();

			// Force another reflow so teleported positions register before
			// transitions are re-enabled on the next frame.
			track.getBoundingClientRect();

			slides.forEach( ( s ) => s.classList.remove( 'no-transition' ) );

			updateDimensions();
		}

		// ── Arrow buttons ─────────────────────────────────────────────────────

		if ( prevBtn ) {
			prevBtn.addEventListener( 'click', () => goTo( current - 1 ) );
		}
		if ( nextBtn ) {
			nextBtn.addEventListener( 'click', () => goTo( current + 1 ) );
		}

		// ── Keyboard ──────────────────────────────────────────────────────────

		carousel.addEventListener( 'keydown', ( e ) => {
			if ( e.key === 'ArrowLeft' ) {
				e.preventDefault();
				goTo( current - 1 );
			} else if ( e.key === 'ArrowRight' ) {
				e.preventDefault();
				goTo( current + 1 );
			}
		} );

		// ── Pointer / swipe ───────────────────────────────────────────────────

		let pointerStartX = null;

		carousel.addEventListener( 'pointerdown', ( e ) => {
			pointerStartX = e.clientX;
		} );

		carousel.addEventListener( 'pointerup', ( e ) => {
			if ( pointerStartX === null ) {
				return;
			}
			const delta = e.clientX - pointerStartX;
			pointerStartX = null;

			if ( Math.abs( delta ) > 50 ) {
				goTo( delta < 0 ? current + 1 : current - 1 );
			}
		} );

		carousel.addEventListener( 'pointercancel', () => {
			pointerStartX = null;
		} );

		// ── ResizeObserver ───────────────────────────────────────────────────

		if ( typeof ResizeObserver !== 'undefined' ) {
			new ResizeObserver( () => updateDimensions() ).observe( carousel );
		} else {
			window.addEventListener( 'resize', () => updateDimensions() );
		}

		// ── Init ─────────────────────────────────────────────────────────────

		// Set initial dimensions once fonts/images may have loaded.
		updateClasses();
		updateDimensions();

		// Re-measure after images finish loading (affects card height).
		const imgs = Array.from( carousel.querySelectorAll( 'img' ) );
		const pendingImgs = imgs.filter( ( img ) => ! img.complete );
		if ( pendingImgs.length > 0 ) {
			let loaded = 0;
			const onLoad = () => {
				loaded++;
				if ( loaded >= pendingImgs.length ) {
					updateDimensions();
				}
			};
			pendingImgs.forEach( ( img ) => {
				img.addEventListener( 'load',  onLoad );
				img.addEventListener( 'error', onLoad );
			} );
		}
	} );
} )();
