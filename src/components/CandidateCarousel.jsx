import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './CandidateCarousel.css';

const CandidateCarousel = ({ candidates, onSeeMore }) => {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const autoSlideIntervalRef = useRef(null);
  const pauseTimeoutRef = useRef(null);

  if (!candidates || candidates.length === 0) {
    return (
      <div className="carousel-empty">
        <p>No candidates available for this position</p>
      </div>
    );
  }

  // Calculate initial slide - if winners (has isWinner flag), start at 1 (where top 1 is), otherwise center
  const isWinnersCarousel = candidates.some(c => c.isWinner);
  const initialSlide = isWinnersCarousel ? 1 : Math.floor(candidates.length / 2);
  
  // Create a unique key based on candidates and carousel type to force Swiper to reinitialize
  const swiperKey = `${isWinnersCarousel ? 'winners' : 'regular'}-${candidates.map(c => c.id).join('-')}`;

  // Auto-slide functionality
  const startAutoSlide = () => {
    if (!swiperInstance || candidates.length <= 1 || autoSlideIntervalRef.current) return;
    
    autoSlideIntervalRef.current = setInterval(() => {
      if (swiperInstance) {
        const currentIndex = swiperInstance.activeIndex;
        const nextIndex = currentIndex + 1;
        
        // If we're at the last slide, go to the first slide
        if (nextIndex >= candidates.length) {
          swiperInstance.slideTo(0);
        } else {
          swiperInstance.slideNext();
        }
      }
    }, 2000); // 2 seconds interval
  };

  const stopAutoSlide = () => {
    if (autoSlideIntervalRef.current) {
      clearInterval(autoSlideIntervalRef.current);
      autoSlideIntervalRef.current = null;
    }
  };

  const pauseAutoSlide = () => {
    setIsAutoSliding(false);
    stopAutoSlide();
    
    // Clear any existing pause timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    
    // Resume after 4 seconds
    pauseTimeoutRef.current = setTimeout(() => {
      setIsAutoSliding(true);
    }, 4000);
  };

  // Effect to handle auto-sliding
  useEffect(() => {
    // Always stop any existing interval first
    stopAutoSlide();
    
    if (swiperInstance && isAutoSliding && candidates.length > 1) {
      startAutoSlide();
    }

    return () => {
      stopAutoSlide();
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [swiperInstance, isAutoSliding, candidates.length]);

  // Effect to handle pagination clicks
  useEffect(() => {
    if (swiperInstance) {
      const handlePaginationClick = () => {
        pauseAutoSlide();
      };

      // Add event listener to pagination bullets
      const paginationEl = swiperInstance.pagination?.el;
      if (paginationEl) {
        paginationEl.addEventListener('click', handlePaginationClick);
        
        return () => {
          paginationEl.removeEventListener('click', handlePaginationClick);
        };
      }
    }
  }, [swiperInstance]);

  const handleCardClick = (index, e) => {
    // Check if click is on the button or its children
    if (e.target.closest('.see-more-button')) {
      return;
    }
    
    // Pause auto-slide when user clicks on a card
    pauseAutoSlide();
    
    if (swiperInstance && swiperInstance.activeIndex !== index) {
      swiperInstance.slideTo(index);
    }
  };

  const handleSeeMoreClick = (candidate, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Pause auto-slide when user clicks see more
    pauseAutoSlide();
    
    onSeeMore(candidate);
  };

  return (
    <div className="candidate-carousel-container">
      <Swiper
        key={swiperKey}
        modules={[Pagination, Navigation]}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        spaceBetween={30}
        initialSlide={initialSlide}
        onSwiper={setSwiperInstance}
        onSlideChange={() => {
          // Don't pause auto-slide for programmatic changes (auto-slide itself)
          // Only pause for user interactions
        }}
        onTouchStart={() => {
          // Pause auto-slide when user starts touching/swiping
          pauseAutoSlide();
        }}
        onSliderMove={() => {
          // Pause auto-slide when user is actively swiping
          pauseAutoSlide();
        }}
        navigation={false}
        pagination={{ 
          clickable: true,
          el: '.swiper-pagination',
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active'
        }}
        watchSlidesProgress={true}
        allowTouchMove={true}
        className="candidate-swiper"
      >
        {candidates.map((candidate, index) => (
          <SwiperSlide key={candidate.id}>
            <div 
              className={`carousel-candidate-card ${
                candidate.isWinner ? 'winner-card' : ''
              }`}
              data-rank={candidate.rank || ''}
              onClick={(e) => handleCardClick(index, e)}
            >
              <div className="candidate-photo-container">
                {candidate.photoUrl ? (
                  <img
                    src={candidate.photoUrl}
                    alt={candidate.name}
                    className="candidate-photo"
                  />
                ) : (
                  <div className="candidate-photo-placeholder">
                    <span className="candidate-initials">
                      {candidate.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
              {candidate.isWinner && candidate.position && (
                <div className="candidate-position-label">
                  {candidate.position}
                </div>
              )}
              <h3 className="candidate-name">{candidate.name}</h3>
              <button
                className="see-more-button"
                onClick={(e) => handleSeeMoreClick(candidate, e)}
              >
                <svg
                  className="eye-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                SEE MORE
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CandidateCarousel;
