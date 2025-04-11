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
    // Toggle menu
    document.getElementById('menu-btn')?.addEventListener('click', () => {
        const menu = document.getElementById('menu');
        menu.classList.toggle('hidden');
      });

      document.addEventListener('click', (event) => {
        if (!menu.contains(event.target) && !menuBtn.contains(event.target)) {
          menu.classList.add('hidden');
        }
      });
      // Back to top button
      const topBtn = document.getElementById('top-btn');
      window.addEventListener('scroll', () => {
        topBtn.classList.toggle('hidden', window.scrollY < 300);
      });
      topBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
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