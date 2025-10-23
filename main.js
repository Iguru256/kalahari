// Mobile nav toggle and simple form handling
document.addEventListener('DOMContentLoaded', function(){
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  let lastActiveElement = null;
  function setScrollLock(enabled){
    document.documentElement.classList.toggle('scroll-lock', enabled);
  }
  if(toggle && mobileNav){
    toggle.addEventListener('click', ()=>{
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      const willOpen = !expanded;
      toggle.setAttribute('aria-expanded', String(willOpen));
      mobileNav.classList.toggle('open', willOpen);
      mobileNav.setAttribute('aria-hidden', String(!willOpen));
      setScrollLock(willOpen);
    });
    // Close mobile nav when a link inside it is clicked
    mobileNav.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        toggle.setAttribute('aria-expanded','false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden','true');
        setScrollLock(false);
      });
    });
    // Close on Escape key
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){
        toggle.setAttribute('aria-expanded','false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden','true');
        setScrollLock(false);
      }
    });
  }

  // Form handling (progressive enhancement)
  const form = document.getElementById('contactForm');
  const msgEl = document.getElementById('formMessage');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const honeypot = form['_hp'].value;
      if(honeypot){
        // silent spam trap
        return;
      }
      if(!name || !email || !phone){
        msgEl.textContent = 'Please fill in name, email, and phone.';
        msgEl.className = 'form-message error';
        return;
      }
      // Submit to Formspree (user can replace with their endpoint)
      fetch(form.action, {method:'POST',body:new FormData(form)}).then(res=>{
        if(res.ok){
          msgEl.textContent = `Thanks, ${name}! We received your message and will respond soon.`;
          msgEl.className = 'form-message success';
          form.reset();
        } else {
          msgEl.textContent = 'Submission failed — please try again.';
          msgEl.className = 'form-message error';
        }
      }).catch(()=>{
        msgEl.textContent = 'Submission failed — please try again.';
        msgEl.className = 'form-message error';
      })
    });
  }

  // Product/category modal and lightbox
  const categoryModal = document.getElementById('categoryModal');
  const categoryModalTitle = document.getElementById('categoryModalTitle');
  const categoryModalGallery = document.getElementById('categoryModalGallery');
  const categoryModalPrices = document.getElementById('categoryModalPrices');
  const categoryModalClose = categoryModal.querySelector('.modal-close');

  // Category mapping and pricing logic removed — modal will read data directly from the clicked card in the DOM

  function openCategoryModal(catKey, catLabel){
    // populate title
    categoryModalTitle.textContent = catLabel;
    // Try to find a per-category template first
    const tmpl = document.getElementById(`tmpl-${catKey}`);
    if(tmpl && tmpl.content){
      const clone = tmpl.content.cloneNode(true);
      // populate prices
      const priceList = clone.querySelector('.category-price-list');
      const images = clone.querySelector('.category-images');
      categoryModalPrices.innerHTML = priceList ? priceList.innerHTML : '';
      // build gallery thumbnails
      if(images){
        const thumbs = Array.from(images.querySelectorAll('figure'));
        categoryModalGallery.innerHTML = '';
        thumbs.forEach(fig=>{
          const img = fig.querySelector('img');
          const cap = fig.querySelector('figcaption')?.textContent || '';
          const thumb = document.createElement('figure');
          thumb.className = 'cat-item';
          const imgEl = document.createElement('img');
          imgEl.src = img.getAttribute('src');
          imgEl.alt = img.getAttribute('alt') || catLabel;
          imgEl.loading = 'lazy';
          const figc = document.createElement('figcaption');
          figc.textContent = cap;
          thumb.appendChild(imgEl);
          thumb.appendChild(figc);
          categoryModalGallery.appendChild(thumb);
          // click -> lightbox
          imgEl.addEventListener('click', ()=>{
            openLightbox(imgEl.src, imgEl.alt, ()=> openCategoryModal(catKey, catLabel));
          });
        });
      } else {
        categoryModalGallery.innerHTML = '<p>No images available.</p>';
      }
    } else {
      // Fallback: read from DOM card
      const card = document.querySelector(`.category-card[data-category="${catKey}"]`);
      if(!card){
        categoryModalGallery.innerHTML = '<p>No product information available.</p>';
        categoryModalPrices.innerHTML = '';
      } else {
        const cardImg = card.querySelector('img');
        const cardTitle = card.querySelector('h4')?.textContent || catLabel;
        const cardPrice = card.querySelector('.price')?.textContent || '';
        categoryModalPrices.innerHTML = cardPrice ? `<div class="category-price-list"><div class="category-price">${cardPrice}</div></div>` : '';
        if(cardImg){
          const src = cardImg.getAttribute('src');
          const alt = cardImg.getAttribute('alt') || cardTitle;
          categoryModalGallery.innerHTML = `<figure class="cat-item"><img src="${src}" alt="${alt}" loading="lazy"><figcaption>${cardTitle}</figcaption></figure>`;
          const modalImg = categoryModalGallery.querySelector('img');
          modalImg?.addEventListener('click', ()=> openLightbox(src, alt, ()=> openCategoryModal(catKey, catLabel)));
        } else {
          categoryModalGallery.innerHTML = `<div class="category-products"><div class="prod-name">${cardTitle}</div></div>`;
        }
      }
    }
    categoryModal.classList.add('open');
    categoryModal.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('scroll-lock');
    // focus
    lastActiveElement = document.activeElement;
    categoryModalClose.focus();
  }

  function openLightbox(src, alt, onClose){
    categoryModalGallery.innerHTML = `<div class="lightbox-wrapper"><button class="back-to-gallery btn-primary">Back</button><img src="${src}" alt="${alt}" style="width:100%;height:auto;object-fit:contain"></div>`;
    const backBtn = categoryModalGallery.querySelector('.back-to-gallery');
    backBtn?.addEventListener('click', ()=>{ if(typeof onClose === 'function') onClose(); });
  }

  function closeCategoryModal(){
    categoryModal.classList.remove('open');
    categoryModal.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('scroll-lock');
    if(lastActiveElement) lastActiveElement.focus();
  }

  // open-category buttons
  document.querySelectorAll('.open-category').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const cat = b.dataset.category;
      const label = b.closest('.category-card')?.querySelector('h4')?.textContent || cat;
      openCategoryModal(cat, label);
    });
  });

  // close handlers
  categoryModalClose.addEventListener('click', closeCategoryModal);
  categoryModal.addEventListener('click', (e)=>{ if(e.target === categoryModal) closeCategoryModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeCategoryModal(); });

  // Enquire buttons inside templates: open WhatsApp with a prefilled message
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest && e.target.closest('.tmpl-enquire');
    if(!btn) return;
    const cat = btn.getAttribute('data-cat') || 'product';
    // close modal for a clean transition
    try { closeCategoryModal(); } catch (err) { /* ignore */ }
    const phone = '256752558000';
    const text = `Hello Kalahari, I'm interested in ${cat} products. Please advise availability and pricing.`;
    const wa = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    // open WhatsApp in a new tab/window
    window.open(wa, '_blank');
  });

  // Product filter and search
  const categoryFilter = document.getElementById('categoryFilter');
  const searchInput = document.getElementById('searchProducts');
  function pushStateToUrl(cat, q){
    const params = new URLSearchParams(window.location.search);
    if(cat && cat !== 'all') params.set('cat', cat); else params.delete('cat');
    if(q) params.set('q', q); else params.delete('q');
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
    history.replaceState({}, '', newUrl);
  }

  function applyFilters(pushState = true){
    const cat = categoryFilter?.value || 'all';
    const q = (searchInput?.value || '').toLowerCase();
    const cards = Array.from(document.querySelectorAll('#productsGrid .category-card'));
    let visibleCount = 0;
    cards.forEach(card=>{
      const title = card.querySelector('h4').textContent.toLowerCase();
      const matchesCat = (cat === 'all') || (card.dataset.category === cat);
      const matchesQuery = !q || title.includes(q);
      const shouldShow = matchesCat && matchesQuery;
      // ensure transition class
      card.classList.add('anim-transition');
      if(shouldShow){
        // show with animation
        card.classList.remove('hidden');
        // remove inline display in case earlier code set it
        card.style.display = '';
        visibleCount++;
      } else {
        // hide with animation
        card.classList.add('hidden');
        // after animation, ensure display none to remove from flow if desired (kept visible for hardware acceleration)
        setTimeout(()=>{ if(card.classList.contains('hidden')) card.style.display = 'none'; }, 300);
      }
    });
    // update count UI
    const countEl = document.getElementById('filterCount');
    if(countEl) countEl.textContent = String(visibleCount);
    // If no cards are visible but there are cards in the grid, the filter may be stale — reset to show all
    const totalCards = cards.length;
    if(visibleCount === 0 && totalCards > 0){
      // show all as a safe fallback
      cards.forEach(card=>{ card.classList.remove('hidden'); card.style.display = ''; });
      visibleCount = totalCards;
      if(countEl) countEl.textContent = String(visibleCount);
      // update the UI select and filter variables so the final push sets 'all' once
      if(categoryFilter) categoryFilter.value = 'all';
      if(pushState){
        // ensure the variables reflect the reset so we only push once below
        // (don't call pushStateToUrl here to avoid double-push)
        // eslint-disable-next-line no-param-reassign
        // set local cat and q used by the final push
        // NOTE: cat and q are const earlier; redeclare a new variable to use for final push
      }
    }
    if(pushState) pushStateToUrl((categoryFilter?.value || 'all'), (searchInput?.value || ''));
  }
  categoryFilter?.addEventListener('change', ()=>applyFilters(true));
  searchInput?.addEventListener('input', ()=>applyFilters(true));
  const searchBtn = document.getElementById('searchBtn');
  searchBtn?.addEventListener('click', ()=>applyFilters(true));

  // Read filters from URL on load
  function readFiltersFromUrl(){
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat') || 'all';
    const q = params.get('q') || '';
    if(categoryFilter) categoryFilter.value = cat;
    if(searchInput){ searchInput.value = q; }
    applyFilters(false);
  }
  readFiltersFromUrl();

  // Reset button
  const resetBtn = document.getElementById('resetFilters');
  resetBtn?.addEventListener('click', ()=>{
    if(categoryFilter) categoryFilter.value = 'all';
    if(searchInput) searchInput.value = '';
    applyFilters(true);
  });

  // Register service worker for basic caching (if supported)
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{/* ignore */});
  }

  // Back to top button behavior
  const backToTop = document.getElementById('backToTop');
  const showThreshold = 300;
  function checkBackToTop(){
    if(!backToTop) return;
    if(window.scrollY > showThreshold) backToTop.classList.add('visible'); else backToTop.classList.remove('visible');
  }
  window.addEventListener('scroll', checkBackToTop, {passive:true});
  backToTop?.addEventListener('click', ()=>{ window.scrollTo({top:0,behavior:'smooth'}); });
  // initial
  checkBackToTop();

  // (removed image diagnostic and cache-busting helpers at user's request)
  
  /* Testimonials carousel: auto-rotate with controls */
  (function testimonialsCarousel(){
    const track = document.getElementById('testimonialTrack');
    if(!track) return;
    const slides = Array.from(track.querySelectorAll('.testimonial-slide'));
    const indicators = Array.from(document.querySelectorAll('#testimonialIndicators button'));
    const prev = document.querySelector('.carousel-prev');
    const next = document.querySelector('.carousel-next');
    let current = 0;
    let timer = null;
    function show(index){
      slides.forEach((s,i)=> s.setAttribute('aria-hidden', i===index ? 'false' : 'true'));
      indicators.forEach((btn,i)=> btn.setAttribute('aria-selected', i===index ? 'true' : 'false'));
      current = index;
    }
    function nextSlide(){ show((current+1) % slides.length); }
    function prevSlide(){ show((current-1+slides.length) % slides.length); }
    indicators.forEach((btn,i)=> btn.addEventListener('click', ()=>{ show(i); resetTimer(); }));
    next?.addEventListener('click', ()=>{ nextSlide(); resetTimer(); });
    prev?.addEventListener('click', ()=>{ prevSlide(); resetTimer(); });
    function resetTimer(){ clearInterval(timer); timer = setInterval(nextSlide, 6000); }
    show(0); resetTimer();
  }());

  /* FAQ accordion */
  (function faqAccordion(){
    const faq = document.querySelectorAll('.faq-item');
    faq.forEach(item=>{
      const btn = item.querySelector('.faq-q');
      const panel = item.querySelector('.faq-a');
      btn.addEventListener('click', ()=>{
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        if(expanded){ panel.hidden = true; } else { panel.hidden = false; }
      });
    });
  }());

  // Product image diagnostics (non-destructive)
  (function productImageDiagnostics(){
    const productsGrid = document.getElementById('productsGrid');
    if(!productsGrid) return;
    const banner = document.createElement('div');
    banner.className = 'image-debug-banner';
    banner.setAttribute('role','status');
    banner.style.display = 'none';
    productsGrid.parentNode.insertBefore(banner, productsGrid);

    let failed = [];
    const imgs = Array.from(productsGrid.querySelectorAll('img'));
    imgs.forEach(img=>{
      // if already complete and naturalWidth==0 treat as failure
      if(img.complete && img.naturalWidth === 0){ onImgError(img); }
      img.addEventListener('error', ()=> onImgError(img));
      img.addEventListener('load', ()=> onImgLoad(img));
    });

    function onImgError(img){
      const src = img.getAttribute('src') || img.src;
      if(!failed.find(f=>f.el === img)) failed.push({el: img, src});
      console.warn('Product image failed to load:', src);
      updateBanner();
    }
    function onImgLoad(img){
      failed = failed.filter(f => f.el !== img);
      updateBanner();
    }

    function updateBanner(){
      if(failed.length === 0){ banner.style.display = 'none'; banner.innerHTML = ''; return; }
      banner.style.display = 'flex';
      banner.innerHTML = `<div style="flex:1">Some product images failed to load (<strong>${failed.length}</strong>).</div>` +
        `<div style="display:flex;gap:.5rem"><button class="btn-primary" id="reloadImagesBtn">Reload images</button><button class="btn" id="hideImgErrors">Hide</button></div>`;
      const reload = banner.querySelector('#reloadImagesBtn');
      const hide = banner.querySelector('#hideImgErrors');
      reload?.addEventListener('click', ()=>{
        failed.forEach(f=>{
          try{
            const url = new URL(f.src, location.href);
            url.searchParams.set('_cb', Date.now());
            f.el.src = url.toString();
          }catch(e){
            // fallback: append timestamp
            f.el.src = f.src + (f.src.includes('?') ? '&' : '?') + '_cb=' + Date.now();
          }
        });
      });
      hide?.addEventListener('click', ()=>{ banner.style.display = 'none'; });
    }
  }());
});
