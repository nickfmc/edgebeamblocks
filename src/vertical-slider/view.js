/**
 * Vertical Slider — front-end vanilla JS.
 *
 * Handles slide navigation via arrows, dots, keyboard, and vertical swipe.
 * Container height is computed dynamically from the active slide's rendered
 * height plus configurable preview and gap amounts read from data attributes.
 */
( function () {
	const sliders = document.querySelectorAll( '.vertical-slider' );

	sliders.forEach( ( slider ) => {
		const container = slider.querySelector(
			'.vertical-slider__slides-container'
		);

		if ( ! container ) {
			return;
		}

		// Get direct children as slides, excluding fade overlay divs.
		const slides = Array.from( container.children ).filter(
			( el ) =>
				! el.classList.contains( 'vertical-slider__fade-top' ) &&
				! el.classList.contains( 'vertical-slider__fade-bottom' )
		);
		const total = slides.length;

		if ( ! total ) {
			return;
		}

		// Read configurable values from data attributes (set by render.php).
		const slideGap  = parseInt( slider.dataset.slideGap  ?? '30', 10 );
		const previewPx = parseInt( slider.dataset.previewPx ?? '60', 10 );
		const alignTop  = slider.dataset.alignTop === 'true';

		const dots    = slider.querySelectorAll( '.vertical-slider__dot' );
		const prevBtn = slider.querySelector( '.vertical-slider__arrow--prev' );
		const nextBtn = slider.querySelector( '.vertical-slider__arrow--next' );

		let current = 0;

		/**
		 * Measure the current active slide and resize the container so that:
		 *   containerHeight = slideHeight + 2 × previewPx + 2 × slideGap
		 *
		 * The CSS custom properties drive the prev/next transforms so that
		 * exactly `previewPx` of each neighbouring slide is visible at the
		 * top and bottom edges of the container.
		 */
		function updateDimensions() {
			const activeSlide = slides[ current ];
			if ( ! activeSlide ) {
				return;
			}

			// Temporarily make active slide non-absolute so it reports height.
			const prevPosition = activeSlide.style.position;
			activeSlide.style.position = 'relative';
			activeSlide.style.transform = 'none';
			const slideHeight = activeSlide.offsetHeight;
			activeSlide.style.position = prevPosition;
			activeSlide.style.transform = '';

			// In top-align mode only the bottom preview is shown.
			const totalHeight = alignTop
				? slideHeight + previewPx + slideGap
				: slideHeight + 2 * previewPx + 2 * slideGap;

			// Set CSS custom properties for the transforms defined in style.css.
			container.style.setProperty( '--slide-height', slideHeight + 'px' );
			container.style.setProperty( '--slide-gap',    slideGap    + 'px' );
			container.style.setProperty( '--preview-px',   previewPx   + 'px' );

			// Set the explicit container height.
			container.style.height = totalHeight + 'px';
		}

		/**
		 * Navigate to a specific slide index.
		 */
		function goTo( index ) {
			// Wrap around: -1 → last, total → 0.
			current = ( ( index % total ) + total ) % total;

			// Update slide classes.
			slides.forEach( ( slide, i ) => {
				slide.classList.remove( 'is-active', 'is-prev', 'is-next' );

				if ( i === current ) {
					slide.classList.add( 'is-active' );
				} else if ( i === ( current - 1 + total ) % total ) {
					slide.classList.add( 'is-prev' );
				} else if ( i === ( current + 1 ) % total ) {
					slide.classList.add( 'is-next' );
				}
			} );

			// Update active dot.
			dots.forEach( ( dot, i ) => {
				dot.classList.toggle( 'is-active', i === current );
			} );

			// Recalculate height after the active slide may have changed.
			updateDimensions();
		}

		// Initialize first slide.
		goTo( 0 );

		// Re-measure on window resize (responsive height tracking).
		if ( typeof ResizeObserver !== 'undefined' ) {
			const ro = new ResizeObserver( () => updateDimensions() );
			ro.observe( slider );
		} else {
			window.addEventListener( 'resize', updateDimensions );
		}

		// Arrow navigation.
		if ( prevBtn ) {
			prevBtn.addEventListener( 'click', () => goTo( current - 1 ) );
		}
		if ( nextBtn ) {
			nextBtn.addEventListener( 'click', () => goTo( current + 1 ) );
		}

		// Dot navigation.
		dots.forEach( ( dot ) => {
			const slideIndex = parseInt( dot.getAttribute( 'data-slide' ), 10 );
			dot.addEventListener( 'click', () => goTo( slideIndex ) );
		} );

		// Keyboard navigation (arrow keys).
		slider.addEventListener( 'keydown', ( e ) => {
			if ( e.key === 'ArrowUp' ) {
				e.preventDefault();
				goTo( current - 1 );
			} else if ( e.key === 'ArrowDown' ) {
				e.preventDefault();
				goTo( current + 1 );
			}
		} );

		// Make slider focusable for keyboard nav.
		if ( ! slider.hasAttribute( 'tabindex' ) ) {
			slider.setAttribute( 'tabindex', '0' );
		}

		// Vertical swipe support via Pointer Events.
		let pointerStartY = 0;
		let pointerActive = false;

		container.addEventListener( 'pointerdown', ( e ) => {
			pointerStartY = e.clientY;
			pointerActive = true;
		} );

		container.addEventListener( 'pointerup', ( e ) => {
			if ( ! pointerActive ) {
				return;
			}
			pointerActive = false;

			const diff = e.clientY - pointerStartY;

			// Swipe threshold: 50px vertical movement.
			if ( Math.abs( diff ) > 50 ) {
				// Swipe down (positive diff) → go to previous slide.
				// Swipe up (negative diff) → go to next slide.
				goTo( diff > 0 ? current - 1 : current + 1 );
			}
		} );

		container.addEventListener( 'pointercancel', () => {
			pointerActive = false;
		} );

		// Prevent default touch actions to avoid scrolling during swipe.
		container.addEventListener( 'touchstart', ( e ) => {
			// Only prevent if we're actively swiping.
			pointerStartY = e.touches[ 0 ].clientY;
		}, { passive: true } );
	} );
} )();

