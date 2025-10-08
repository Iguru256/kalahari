// Mobile nav toggle and simple form handling
document.addEventListener('DOMContentLoaded', function(){
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if(toggle && mobileNav){
    toggle.addEventListener('click', ()=>{
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      const willOpen = !expanded;
      toggle.setAttribute('aria-expanded', String(willOpen));
      mobileNav.classList.toggle('open', willOpen);
      mobileNav.setAttribute('aria-hidden', String(!willOpen));
    });
    // Close mobile nav when a link inside it is clicked
    mobileNav.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        toggle.setAttribute('aria-expanded','false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden','true');
      });
    });
    // Close on Escape key
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){
        toggle.setAttribute('aria-expanded','false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden','true');
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
      if(!name || !email || !phone){
        msgEl.textContent = 'Please fill in name, email, and phone.';
        msgEl.className = 'form-message error';
        return;
      }
      // Simulate async submission
      msgEl.textContent = `Thanks, ${name}! We received your message and will respond soon.`;
      msgEl.className = 'form-message success';
      form.reset();
    });
  }
});
