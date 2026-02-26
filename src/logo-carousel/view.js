/**
 * Logo Carousel — front-end vanilla JS.
 *
 * Handles infinite looping navigation, auto-play, arrow buttons, swipe, and
 * keyboard input. No external library is used.
 *
 * How the infinite loop works
 * ───────────────────────────
 * All slides are `position: absolute` inside `.logo-carousel__track`. Each
 * call to `goTo()` reassigns five positional classes using modular arithmetic
 * so the carousel wraps seamlessly in both directions with no "end" to reach:
 *
 *   is-outer-left   is-adjacent-left   is-active   is-adjacent-right   is-outer-right
 *
 * Slides not in those five positions receive no class and are opacity: 0.
 * The horizontal offsets (--slide-x) and scale (--slide-s via class) are
 * updated every navigation call. Only the five visible slides get --slide-x
 * set; transitioning slides carry their last position until reassigned, which
 * produces a smooth fade rather than a jump.
 *
 * Scale constants — must match edit.js and style.css:
 *   Active:   scale 1,    opacity 1
 *   Adjacent: scale 0.65, opacity 0.55
 *   Outer:    scale 0.42, opacity 0.28
 */
( function () {
	const SCALE_ACTIVE   = 1;
	const SCALE_ADJACENT = 0.65;
	const SCALE_OUTER    = 0.42;

	document.querySelectorAll( '.logo-carousel' ).forEach( ( carousel ) => {
		const track   = carousel.querySelector( '.logo-carousel__track' );
		const prevBtn = carousel.querySelector( '.logo-carousel__arrow--prev' );
		const nextBtn = carousel.querySelector( '.logo-carousel__arrow--next' );

		if ( ! track ) {
			return;
		}

		const slides = Array.from( track.querySelectorAll( '.logo-carousel__slide' ) );
		const total  = slides.length;

		if ( total < 1 ) {
			return;
		}

		// ── Configuration from data attributes ────────────────────────────────

		const autoPlay         = carousel.dataset.autoPlay !== 'false';
		const autoPlayDuration = parseFloat( carousel.dataset.autoPlayDuration || '4' ) * 1000;
		const logoGap          = parseInt( carousel.dataset.logoGap || '40', 10 );

		let current       = 0;
		let autoPlayTimer = null;

		// ── Helpers ───────────────────────────────────────────────────────────

		/**
		 * Read the styled width of a slide's image.
		 * We read `img.style.width` (set by render.php) rather than offsetWidth
		 * so positioning is correct before images fully load.
		 */
		function getSlideW( slide ) {
			const img    = slide.querySelector( 'img' );
			if ( ! img ) {
				return 0;
			}
			const styleW = parseInt( img.style.width, 10 );
			return isNaN( styleW ) ? ( img.offsetWidth || 0 ) : styleW;
		}

		/**
		 * Measure the tallest visible slide image and size the track so that
		 * all absolute slides have a container to sit inside.
		 */
		function updateTrackHeight() {
			let maxH = 0;
			slides.forEach( ( slide ) => {
				const img = slide.querySelector( 'img' );
				if ( img && img.offsetHeight > maxH ) {
					maxH = img.offsetHeight;
				}
			} );
			if ( maxH > 0 ) {
				track.style.height = maxH + 'px';
			}
		}

		// ── Core navigation ───────────────────────────────────────────────────

		/**
		 * Navigate to slide `index`, wrapping infinitely in both directions.
		 *
		 * Smooth infinite loop strategy
		 * ──────────────────────────────
		 * Before clearing classes, track which slides are currently in the five
		 * visible slots. Any slide that is about to enter the viewport for the
		 * first time (i.e. it was NOT previously visible) is pre-positioned at
		 * its correct --slide-x with transitions disabled. A forced reflow
		 * flushes that instant move to the GPU. Transitions are then re-enabled
		 * and classes are assigned normally — so only opacity/scale animate for
		 * entering slides, not position. Previously-visible slides continue to
		 * animate their position naturally because they already had a --slide-x.
		 */
		function goTo( index ) {
			const prevCurrent = current;
			current = ( ( index % total ) + total ) % total;

			// ── Snapshot previously visible slide indices ─────────────────────
			const prevVisible = new Set( [
				prevCurrent,
				( prevCurrent - 1 + total ) % total,
				( prevCurrent - 2 + total ) % total,
				( prevCurrent + 1 )         % total,
				( prevCurrent + 2 )         % total,
			] );

			// ── Resolve the five new slot indices ─────────────────────────────
			const idxAL = ( current - 1 + total ) % total;
			const idxOL = ( current - 2 + total ) % total;
			const idxAR = ( current + 1 )          % total;
			const idxOR = ( current + 2 )          % total;

			// ── Compute new x positions ───────────────────────────────────────
			const aW  = getSlideW( slides[ current ] );
			const alW = getSlideW( slides[ idxAL ] );
			const arW = getSlideW( slides[ idxAR ] );
			const olW = getSlideW( slides[ idxOL ] );
			const orW = getSlideW( slides[ idxOR ] );

			const arX = logoGap + ( aW * SCALE_ACTIVE ) / 2 + ( arW * SCALE_ADJACENT ) / 2;
			const alX = - ( logoGap + ( aW * SCALE_ACTIVE ) / 2 + ( alW * SCALE_ADJACENT ) / 2 );
			const orX = arX + logoGap + ( arW * SCALE_ADJACENT ) / 2 + ( orW * SCALE_OUTER ) / 2;
			const olX = alX - logoGap - ( alW * SCALE_ADJACENT ) / 2 - ( olW * SCALE_OUTER ) / 2;

			const assignments = [
				{ idx: current, cls: 'is-active',         x: 0   },
				{ idx: idxAL,   cls: 'is-adjacent-left',  x: alX },
				{ idx: idxAR,   cls: 'is-adjacent-right', x: arX },
				{ idx: idxOL,   cls: 'is-outer-left',     x: olX },
				{ idx: idxOR,   cls: 'is-outer-right',    x: orX },
			];

			// ── Pre-position entering slides (no transition) ──────────────────
			// A slide that wasn't in the previous visible window has its
			// --slide-x set instantly so that when its class is assigned below,
			// only opacity/scale animate — not a sweep across the carousel.
			const enteringSet  = new Set();
			assignments.forEach( ( { idx, x } ) => {
				if ( ! prevVisible.has( idx ) && ! enteringSet.has( idx ) ) {
					enteringSet.add( idx );
					slides[ idx ].classList.add( 'no-transition' );
					slides[ idx ].style.setProperty( '--slide-x', x + 'px' );
				}
			} );

			// Force the browser to apply the no-transition repositioning before
			// the class changes below trigger new transitions.
			if ( enteringSet.size > 0 ) {
				// eslint-disable-next-line no-unused-expressions
				track.offsetHeight;
			}

			// ── Clear all positional and no-transition classes ────────────────
			slides.forEach( ( slide ) => {
				slide.classList.remove(
					'is-active',
					'is-adjacent-left',
					'is-adjacent-right',
					'is-outer-left',
					'is-outer-right',
					'no-transition'
				);
			} );

			// ── Assign new classes and positions (transitions active) ─────────
			const assigned = new Set();
			assignments.forEach( ( { idx, cls, x } ) => {
				if ( assigned.has( idx ) ) {
					return;
				}
				assigned.add( idx );
				slides[ idx ].classList.add( cls );
				slides[ idx ].style.setProperty( '--slide-x', x + 'px' );
			} );

			updateTrackHeight();
		}

		// ── Auto-play ─────────────────────────────────────────────────────────

		function startAutoPlay() {
			if ( ! autoPlay ) {
				return;
			}
			stopAutoPlay();
			autoPlayTimer = setInterval( () => goTo( current + 1 ), autoPlayDuration );
		}

		function stopAutoPlay() {
			if ( autoPlayTimer ) {
				clearInterval( autoPlayTimer );
				autoPlayTimer = null;
			}
		}

		// ── Initialise ────────────────────────────────────────────────────────

		// Set up CSS custom properties used by style.css transforms.
		carousel.style.setProperty( '--logo-gap', logoGap + 'px' );

		// First goTo positions all five slots immediately (no transition on init).
		goTo( 0 );

		// ── Wait for images before revealing the carousel ─────────────────────
		// Images that are already cached fire load synchronously or are already
		// marked `.complete`; uncached images fire load asynchronously. We track
		// both so that `updateTrackHeight()` always runs with real pixel values.
		// The carousel stays opacity: 0 (`is-ready` not added) until all images
		// have settled, preventing a flash of wrongly-sized content.
		let pendingImages = 0;

		function onImageSettled() {
			pendingImages--;
			updateTrackHeight();
			if ( pendingImages <= 0 ) {
				carousel.classList.add( 'is-ready' );
				startAutoPlay();
			}
		}

		slides.forEach( ( slide ) => {
			const img = slide.querySelector( 'img' );
			if ( ! img ) {
				return;
			}
			// Already loaded (cached) — measure immediately.
			if ( img.complete && img.naturalHeight > 0 ) {
				updateTrackHeight();
				return;
			}
			// Not yet loaded — wait for it.
			pendingImages++;
			img.addEventListener( 'load',  onImageSettled, { once: true } );
			img.addEventListener( 'error', onImageSettled, { once: true } );
		} );

		// If all images were already cached, pendingImages is still 0 — reveal now.
		if ( pendingImages <= 0 ) {
			carousel.classList.add( 'is-ready' );
			startAutoPlay();
		}

		// Fallback: reveal anyway after 2 s in case any image stalls.
		setTimeout( () => {
			if ( ! carousel.classList.contains( 'is-ready' ) ) {
				updateTrackHeight();
				carousel.classList.add( 'is-ready' );
				startAutoPlay();
			}
		}, 2000 );

		// Re-measure on resize (images may reflow at different heights on mobile).
		if ( typeof ResizeObserver !== 'undefined' ) {
			new ResizeObserver( () => updateTrackHeight() ).observe( carousel );
		} else {
			window.addEventListener( 'resize', updateTrackHeight );
		}

		// ── Pause on hover ────────────────────────────────────────────────────

		carousel.addEventListener( 'pointerenter', stopAutoPlay );
		carousel.addEventListener( 'pointerleave', startAutoPlay );

		// ── Arrow navigation ──────────────────────────────────────────────────

		function navigateTo( newIndex ) {
			goTo( newIndex );
			// Reset the auto-play interval so navigation doesn't cause an
			// immediate jump after a manual click.
			stopAutoPlay();
			startAutoPlay();
		}

		if ( prevBtn ) {
			prevBtn.addEventListener( 'click', () => navigateTo( current - 1 ) );
		}
		if ( nextBtn ) {
			nextBtn.addEventListener( 'click', () => navigateTo( current + 1 ) );
		}

		// ── Keyboard navigation ───────────────────────────────────────────────

		if ( ! carousel.hasAttribute( 'tabindex' ) ) {
			carousel.setAttribute( 'tabindex', '0' );
		}

		carousel.addEventListener( 'keydown', ( e ) => {
			if ( e.key === 'ArrowLeft' ) {
				e.preventDefault();
				navigateTo( current - 1 );
			} else if ( e.key === 'ArrowRight' ) {
				e.preventDefault();
				navigateTo( current + 1 );
			}
		} );

		// ── Horizontal swipe (Pointer Events API) ─────────────────────────────

		let swipeStartX = 0;
		let swipeActive = false;

		track.addEventListener( 'pointerdown', ( e ) => {
			swipeStartX = e.clientX;
			swipeActive = true;
		} );

		track.addEventListener( 'pointerup', ( e ) => {
			if ( ! swipeActive ) {
				return;
			}
			swipeActive = false;

			const diff = e.clientX - swipeStartX;

			// Threshold: 50 px horizontal movement.
			if ( Math.abs( diff ) > 50 ) {
				// Swipe right → previous; swipe left → next.
				navigateTo( diff > 0 ? current - 1 : current + 1 );
			}
		} );

		track.addEventListener( 'pointercancel', () => {
			swipeActive = false;
		} );

		// Prevent the browser's default scroll during a horizontal swipe.
		track.addEventListener( 'touchstart', ( e ) => {
			swipeStartX = e.touches[ 0 ].clientX;
		}, { passive: true } );
	} );
} )();
