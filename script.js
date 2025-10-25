// Safely initialize animations after DOM is ready and only if the library/elements exist
document.addEventListener('DOMContentLoaded', () => {
  const hasAutoAnimate = typeof window !== 'undefined' && typeof window.autoAnimate === 'function'

  // Animation config using Auto-Animate library (optional)
  const container = document.getElementById('container-animation')
  if (container && hasAutoAnimate) {
    window.autoAnimate(container)
  }

  // Image Mosaic Animation
  const imageMosaic = document.getElementById('image-mosaic')

  // Click behavior for image mosaic tiles
  // Note: In index.html, items use the class "img-mosaic"
  if (imageMosaic) {
    const tiles = imageMosaic.getElementsByClassName('img-mosaic')
    for (let i = 0; i < tiles.length; i++) {
      tiles[i].onclick = function () {
        for (let j = 0; j < tiles.length; j++) {
          if (j === i) {
            tiles[j].classList.add('img-mosaic-full')
            tiles[j].classList.remove('img-mosaic-80')
          } else {
            tiles[j].classList.add('img-mosaic-80')
            tiles[j].classList.remove('img-mosaic-full')
          }
        }
      }
    }
  }

  // Helpful warning if the library wasn't loaded but code runs
  if (!hasAutoAnimate) {
    // eslint-disable-next-line no-console
    console.warn('AutoAnimate library not found. Ensure the CDN is loaded before this script.')
  }
})

// Add animation on scroll to view. Add animated class to elements with attribute animation-onscroll when they enter the viewport
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('[animation-onscroll]')
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  }

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate')
        observer.unobserve(entry.target)
      }
    })
  }, options)

  animatedElements.forEach(element => {
    observer.observe(element)
  })
})
