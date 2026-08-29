/**
 * 中华人力资源学会 (ZHHR.NET) 核心交互脚本
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. 移动端汉堡菜单切换
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }

  // 2. 当前导航高亮
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href').toLowerCase();
    if (href === currentPath || (currentPath.includes('news') && href.includes('news')) || (currentPath.includes('join') && href.includes('join')) || (currentPath.includes('about') && href.includes('about'))) {
      link.classList.add('active');
    }
  });

  // 3. 数字滚动动画 (Stats Counter)
  const statNumbers = document.querySelectorAll('.stat-num');
  if (statNumbers.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target') || '0', 10);
          const suffix = el.getAttribute('data-suffix') || '';
          if (target > 0) {
            let count = 0;
            const step = Math.ceil(target / 40);
            const timer = setInterval(() => {
              count += step;
              if (count >= target) {
                count = target;
                clearInterval(timer);
              }
              el.innerHTML = `${count}<span>${suffix}</span>`;
            }, 30);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => observer.observe(num));
  }
});

// 全局 Toast 提示函数
function showToast(message, duration = 3000) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast-box';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}
