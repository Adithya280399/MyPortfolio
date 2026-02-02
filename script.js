document.addEventListener('DOMContentLoaded', function() {
  // Wait for everything to load
  window.addEventListener('load', function() {
    // Fade out loader
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      
      // Remove loader after fade out completes
      setTimeout(function() {
        loader.style.display = 'none';
      }, 500); // Match this with the CSS transition duration
    }
  });
  
  // Fallback in case load event doesn't fire
  setTimeout(function() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(function() {
        loader.style.display = 'none';
      }, 500);
    }
  }, 4000); // Maximum 4 seconds wait time
});
document.addEventListener("DOMContentLoaded", () => {
  // Feather icons
  feather.replace();
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    // Apply dark class early to avoid flash
    if (localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    }
  // Elements for menu
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');

  // Toggle menu on button click
  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click from bubbling to document
    menu.classList.toggle('hidden');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !menuBtn.contains(event.target)) {
      menu.classList.add('hidden');
    }
  });

  // Close menu when clicking any menu link
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });


  // ========== Floating Pill Navigation ==========
  const navLinks = document.querySelectorAll('.nav-link');
  const navIndicator = document.getElementById('nav-indicator');
  const navLinksContainer = document.getElementById('nav-links');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDropdown = document.getElementById('mobile-dropdown');

  // Function to move indicator to a specific link
  function moveIndicator(link) {
    if (!link || !navIndicator || !navLinksContainer) return;
    
    const linkRect = link.getBoundingClientRect();
    const containerRect = navLinksContainer.getBoundingClientRect();
    
    navIndicator.style.width = `${linkRect.width}px`;
    navIndicator.style.left = `${linkRect.left - containerRect.left}px`;
  }

  // Initialize indicator on active link
  function initIndicator() {
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
      moveIndicator(activeLink);
    }
  }

  // Run on load and resize
  window.addEventListener('load', initIndicator);
  window.addEventListener('resize', initIndicator);

  // Hover effect - move indicator on hover
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      moveIndicator(link);
    });
  });

  // Reset to active link when mouse leaves nav
  if (navLinksContainer) {
    navLinksContainer.addEventListener('mouseleave', () => {
      const activeLink = document.querySelector('.nav-link.active');
      if (activeLink) {
        moveIndicator(activeLink);
      }
    });
  }

  // Update active link on scroll
  const sections = document.querySelectorAll('section[id]');
  
  function updateActiveOnScroll() {
    const scrollY = window.scrollY + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
            moveIndicator(link);
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveOnScroll);

  // Click to set active
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      moveIndicator(link);
    });
  });

  // Mobile menu toggle
  if (mobileMenuBtn && mobileDropdown) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileDropdown.classList.toggle('show');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileDropdown.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileDropdown.classList.remove('show');
      }
    });

    // Close mobile menu when clicking a link
    mobileDropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDropdown.classList.remove('show');
      });
    });
  }
  // Back to top button
  const topBtn = document.getElementById('top-btn');
  window.addEventListener('scroll', () => {
  topBtn.classList.toggle('hidden', window.scrollY < 300);
  });
  topBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  topBtn?.addEventListener('click', () => {
  topBtn.classList.add('animate-ping');
  setTimeout(() => {
    topBtn.classList.remove('animate-ping');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 200); // add small delay before scrolling
});

//cursor light
const cursorLight = document.getElementById('cursor-light');

document.addEventListener('mousemove', (e) => {
  cursorLight.style.top = `${e.clientY}px`;
  cursorLight.style.left = `${e.clientX}px`;
});

// Auto-update copyright year
    document.getElementById("year").textContent = new Date().getFullYear();
});  
      // Dark mode toggle
      // const setTheme = (mode) => {
      //   document.documentElement.classList.toggle('dark', mode === 'dark');
      //   localStorage.setItem('theme', mode);
      //   icon.textContent = mode === 'dark' ? '🌞' : '🌙';
      // };
      // const userTheme = localStorage.getItem('theme');
      // const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // const currentTheme = userTheme || (systemPrefersDark ? 'dark' : 'light');
      // setTheme(currentTheme);
      // toggle?.addEventListener('click', () => {
      //   const isDark = document.documentElement.classList.contains('dark');
      //   setTheme(isDark ? 'light' : 'dark');
      // });