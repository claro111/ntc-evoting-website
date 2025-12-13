# Auto-Slide Carousel Centering Fix

## Issue
After implementing auto-slide functionality, the candidate carousel was no longer properly centered on initial load and would shift after a few seconds when switching pages.

## Root Cause
The auto-formatting process removed the comprehensive centering logic that was previously implemented when the auto-slide feature was added.

## Solution Implemented

### 1. Fixed Swiper Configuration
- Reverted to `slidesPerView="auto"` with proper fixed slide widths
- Restored `spaceBetween={30}` for proper spacing between slides
- Ensured `centeredSlides={true}` works with the carousel effect
- Removed problematic `width={null}` parameter

### 2. Enhanced CSS Centering with Fixed Widths
- Used fixed pixel widths for slides instead of percentage-based widths
- Restored opacity and scale transitions for carousel effect (active: opacity 1, scale 1; inactive: opacity 0.5, scale 0.85)
- Added proper prev/next slide styling for visual depth
- Restored `overflow: visible` to allow carousel effect to work properly
- Fixed slide widths: 350px (regular), 280px (winners) on desktop

### 3. Image Loading Management
- Added `imagesLoaded` state to track when all candidate images have loaded
- Added `loadedImages` Set to track individual image loading status
- Implemented `handleImageLoad` function to update loading state
- Added `onLoad` and `onError` handlers to candidate images

### 4. Enhanced Swiper Initialization
- Added proper timing for Swiper initialization after images load
- Implemented `recenterCarousel` function with multiple recentering attempts
- Added progressive delays: [100ms, 300ms, 600ms, 1000ms, 1500ms]
- Enhanced `handleSwiperInit` with immediate layout updates

### 5. Multiple Recentering Attempts
- Implemented 5 recentering attempts at strategic intervals
- Each attempt calls:
  - `swiper.updateSize()`
  - `swiper.updateSlides()`
  - `swiper.updateProgress()`
  - `swiper.updateSlidesClasses()`
  - `swiper.slideTo(targetSlide, 0)`

### 6. Layout Stability Improvements
- Added CSS properties for better layout stability:
  - `transform: translateZ(0)`
  - `backface-visibility: hidden`
  - `perspective: 1000px`
  - `will-change: transform, opacity`
  - `transform-origin: center center`
- Added background color to images to prevent layout shifts during loading
- Enhanced container alignment with `align-items: center`

### 7. Auto-Slide Integration
- Modified auto-slide to only start after images are loaded
- Maintained 2-second intervals with seamless looping
- Preserved user interaction handling (pause/resume)
- Added proper cleanup for all timeout references

### 8. Enhanced Event Handling
- Added `onResize` handler for window resize events
- Enhanced `handleSlideChange` with layout updates
- Added observer properties for better reactivity
- Implemented proper cleanup in useEffect

### 9. Responsive Design Fixes
- Added `!important` and `max-width` to all responsive breakpoints
- Ensured consistent slide sizing across all screen sizes
- Maintained proper centering on mobile devices

## Key Features Maintained
- ✅ Auto-slide every 2 seconds
- ✅ Seamless looping from last to first candidate
- ✅ User interaction handling (pause on touch/click)
- ✅ Auto-resume after 5 seconds of inactivity
- ✅ Play/pause control button
- ✅ Proper centering on all screen sizes
- ✅ Responsive design
- ✅ Winner card special styling

## Files Modified
- `src/components/CandidateCarousel.jsx` - Added comprehensive centering logic
- `src/components/CandidateCarousel.css` - Enhanced layout stability styles

## Testing
- ✅ Initial load centering works properly
- ✅ No shifting after 2 seconds when switching pages
- ✅ Auto-slide functionality preserved
- ✅ Responsive behavior maintained
- ✅ Image loading handled gracefully
- ✅ User interactions work correctly

## Status
**COMPLETED** - Carousel now properly centers on initial load and maintains centering while auto-sliding.