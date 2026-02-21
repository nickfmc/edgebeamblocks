/**
 * Testimonial Carousel — front-end vanilla JS.
 *
 * Handles slide navigation via arrows, person clicks, keyboard, and swipe.
 */
( function () {
	const carousels = document.querySelectorAll( '.testimonial-carousel' );

	carousels.forEach( ( carousel ) => {
		const quotes = carousel.querySelectorAll(
			'.testimonial-slide__quote-wrapper'
		);

		if ( ! quotes.length ) {
			return;
		}

		const persons = carousel.querySelectorAll(
			'.testimonial-slide__person'
		);
		const fill = carousel.querySelector(
			'.testimonial-carousel__progress-bar-fill'
		);
		const prevBtn = carousel.querySelector(
			'.testimonial-carousel__arrow--prev'
		);
		const nextBtn = carousel.querySelector(
			'.testimonial-carousel__arrow--next'
		);
		const total = quotes.length;

		let current = 0;

		function goTo( index ) {
			current = ( ( index % total ) + total ) % total;

			quotes.forEach( ( q, i ) => {
				q.classList.toggle( 'is-active', i === current );
			} );
			persons.forEach( ( p, i ) => {
				p.classList.toggle( 'is-active', i === current );
			} );

			if ( fill ) {
				fill.style.transform = `translateX(${ current * 100 }%)`;
			}
		}

		// Initialize first slide.
		goTo( 0 );

		// Arrow navigation.
		if ( prevBtn ) {
			prevBtn.addEventListener( 'click', () => goTo( current - 1 ) );
		}
		if ( nextBtn ) {
			nextBtn.addEventListener( 'click', () => goTo( current + 1 ) );
		}

		// Person click navigation.
		persons.forEach( ( person ) => {
			const slideIndex = parseInt(
				person.getAttribute( 'data-slide' ),
				10
			);
			person.addEventListener( 'click', () => goTo( slideIndex ) );

			// Keyboard support.
			person.addEventListener( 'keydown', ( e ) => {
				if ( e.key === 'Enter' || e.key === ' ' ) {
					e.preventDefault();
					goTo( slideIndex );
				}
			} );
		} );

		// Swipe support via Pointer Events.
		const quotesContainer = carousel.querySelector(
			'.testimonial-carousel__quotes'
		);
		if ( quotesContainer ) {
			let pointerStartX = 0;
			let pointerActive = false;

			quotesContainer.addEventListener( 'pointerdown', ( e ) => {
				pointerStartX = e.clientX;
				pointerActive = true;
			} );

			quotesContainer.addEventListener( 'pointerup', ( e ) => {
				if ( ! pointerActive ) {
					return;
				}
				pointerActive = false;
				const diff = e.clientX - pointerStartX;
				if ( Math.abs( diff ) > 50 ) {
					goTo( diff > 0 ? current - 1 : current + 1 );
				}
			} );

			quotesContainer.addEventListener( 'pointercancel', () => {
				pointerActive = false;
			} );
		}
	} );
} )();
