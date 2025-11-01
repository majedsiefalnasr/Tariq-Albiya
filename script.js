// Global configuration (can be reused across features)
window.APP_CONFIG = Object.assign(
  {
    whatsappPhone: '20000000000', // International format without '+'
  },
  window.APP_CONFIG || {}
)

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

// Accessibility: focus the modal heading when opened
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('serviceModal')
  if (!modal) return
  modal.addEventListener('shown.bs.modal', () => {
    const heading = modal.querySelector('#serviceModalLabel')
    if (heading) {
      heading.setAttribute('tabindex', '-1')
      heading.focus()
    }
  })
})

// Header: open WhatsApp when clicking "تواصل معنا"
document.addEventListener('DOMContentLoaded', () => {
  const contactBtn = document.getElementById('contact-whatsapp')
  if (!contactBtn) return
  contactBtn.addEventListener('click', e => {
    e.preventDefault()
    const phone = (window.APP_CONFIG && window.APP_CONFIG.whatsappPhone) || ''
    if (!phone) return
    const message = 'مرحباً، أود التواصل معكم.'
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  })
})

// Load services from JSON and render them in the modal
document.addEventListener('DOMContentLoaded', () => {
  const servicesContainer = document.getElementById('services-container')
  const servicesListView = document.getElementById('services-list-view')
  const serviceDetailView = document.getElementById('service-detail-view')
  const serviceDetailTitle = document.getElementById('service-detail-title')
  const serviceDetailDescription = document.getElementById('service-detail-description')
  const requestBtn = document.getElementById('request-service')
  const backButton = document.getElementById('back-to-services')
  const modalTitle = document.getElementById('serviceModalLabel')

  if (!servicesContainer) return

  let servicesData = null
  let selectedServiceName = ''
  let selectedCategoryName = ''

  // Fetch services data
  fetch('./services.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load services')
      }
      return response.json()
    })
    .then(data => {
      servicesData = data.services
      renderServices(servicesData)
    })
    .catch(error => {
      console.error('Error loading services:', error)
      servicesContainer.innerHTML = `
        <div class="alert alert-warning" role="alert">
          عذراً، حدث خطأ أثناء تحميل الخدمات. يرجى المحاولة مرة أخرى.
        </div>
      `
    })

  function renderServices(services) {
    let html = ''

    services.forEach(category => {
      html += `
        <div class="category mb-4">
          <h3 class="h3 fw-semibold">${category.category}</h3>
          <p class="text-700" style="max-width: 800px">
            ${category.description}
          </p>
          <div class="d-flex flex-wrap gap-3 mt-3 services-list">
      `

      category.items.forEach(service => {
        html += `
            <div class="service-chip bg-soft rounded-pill p-3" data-service-name="${service.name}" data-category="${category.category}" role="button" tabindex="0">
              ${service.name}
            </div>
        `
      })

      html += `
          </div>
        </div>
      `
    })

    servicesContainer.innerHTML = html

    // Add click handlers to service chips
    const serviceChips = servicesContainer.querySelectorAll('.service-chip')
    serviceChips.forEach(chip => {
      chip.addEventListener('click', handleServiceClick)
      chip.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleServiceClick(e)
        }
      })
    })
  }

  function handleServiceClick(event) {
    const serviceName = event.currentTarget.getAttribute('data-service-name')

    // Find the service data
    let serviceData = null
    for (const category of servicesData) {
      const service = category.items.find(s => s.name === serviceName)
      if (service) {
        serviceData = service
        selectedServiceName = service.name
        selectedCategoryName = category.category
        break
      }
    }

    if (serviceData) {
      showServiceDetail(serviceData)
    }
  }

  function showServiceDetail(service) {
    // Hide modal title when viewing details
    if (modalTitle) {
      modalTitle.style.display = 'none'
    }

    // Update service detail content
    if (serviceDetailTitle) {
      serviceDetailTitle.textContent = service.name
    }

    if (serviceDetailDescription) {
      // Split description by double line breaks and create paragraphs
      const paragraphs = service.description
        .split('\n\n')
        .map(para => `<p class="fs-5 lh-base text-700">${para}</p>`)
        .join('')
      serviceDetailDescription.innerHTML = paragraphs
    }

    // Hide list view, show detail view
    if (servicesListView) {
      servicesListView.style.display = 'none'
    }
    if (serviceDetailView) {
      serviceDetailView.style.display = 'block'
    }

    // Wire request button to send WhatsApp message directly
    if (requestBtn) {
      requestBtn.onclick = function () {
        sendWhatsAppMessage(selectedServiceName, selectedCategoryName)
      }
    }
  }

  function sendWhatsAppMessage(serviceName, categoryName) {
    // Build WhatsApp message
    const message = `مرحباً، أود الاستفسار عن خدمة:

📋 الخدمة: ${serviceName}
🏷️ التصنيف: ${categoryName}

أرجو التواصل معي لمزيد من التفاصيل.`

    // WhatsApp API link
    const phone = (window.APP_CONFIG && window.APP_CONFIG.whatsappPhone) || ''
    if (!phone) return
    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank')

    // Close the modal
    const modal = document.getElementById('serviceModal')
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal)
      if (bsModal) {
        bsModal.hide()
      }
    }
  }

  function showServicesList() {
    // Show modal title when viewing list
    if (modalTitle) {
      modalTitle.style.display = 'block'
      modalTitle.textContent = 'خدماتنا'
    }

    // Show list view, hide detail view
    if (servicesListView) {
      servicesListView.style.display = 'block'
    }
    if (serviceDetailView) {
      serviceDetailView.style.display = 'none'
    }
  }

  // Back button handler
  if (backButton) {
    backButton.addEventListener('click', showServicesList)
  }

  // Reset view when modal is closed
  const modal = document.getElementById('serviceModal')
  if (modal) {
    modal.addEventListener('hidden.bs.modal', showServicesList)
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

// Toggle header scrolled state to increase opacity/shadow for readability
document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header') || document.querySelector('.sticky-header')
  if (!header) return

  const toggle = () => {
    const scrolled = window.scrollY > 0
    if (scrolled) header.classList.add('scrolled')
    else header.classList.remove('scrolled')
  }

  // run once to set initial state
  toggle()

  // passive listener for better performance
  window.addEventListener('scroll', toggle, {passive: true})
})
