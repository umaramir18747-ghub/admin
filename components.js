/* ================== components.js ================== */
/* Consolidated JavaScript for all components */
/* Used by: Dashboard, Student, Teacher, Admission, Academic Managers */

// ========== DATE & TIME UPDATER ==========
function updateDateTime() {
  const dateEl = document.getElementById('currentDate');
  const timeEl = document.getElementById('currentTime');
  if (!dateEl || !timeEl) return;

  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  timeEl.textContent = `${String(h).padStart(2, '0')}:${m}:${s} ${ap}`;
}

// ========== UTILITY FUNCTIONS ==========
function isMobileView() {
  return window.matchMedia('(max-width: 768px)').matches;
}

// ========== SIDEBAR FUNCTIONALITY ==========
function initSidebar() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (!sidebar || !sidebarToggle) return;

  // Create overlay if it doesn't exist
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    const appWrapper = document.querySelector('.app-wrapper');
    if (appWrapper) appWrapper.prepend(overlay);
  }

  // Update toggle icon
  function updateToggleIcon() {
    const icon = sidebarToggle.querySelector('i');
    if (!icon) return;
    if (isMobileView()) {
      icon.className = sidebar.classList.contains('mobile-visible') ? 'fas fa-bars' : 'fas fa-bars';
    } else {
      icon.className = sidebar.classList.contains('hidden') ? 'fas fa-chevron-right' : 'fas fa-bars';
    }
  }

  // Toggle sidebar based on device type
  function toggleSidebar() {
    if (isMobileView()) {
      // Mobile: use transform
      sidebar.classList.toggle('mobile-visible');
      overlay.classList.toggle('active');
    } else {
      // Desktop: collapse width
      sidebar.classList.toggle('hidden');
    }
    updateToggleIcon();
  }

  // Close sidebar on mobile
  function closeSidebarMobile() {
    sidebar.classList.remove('mobile-visible');
    overlay.classList.remove('active');
    updateToggleIcon();
  }

  // Toggle button click
  sidebarToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebar();
  });

  // Overlay click closes sidebar
  overlay.addEventListener('click', closeSidebarMobile);

  // Auto-close sidebar when navigation link is clicked (mobile only)
  const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-item-side');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMobileView()) {
        setTimeout(closeSidebarMobile, 100);
      }
    });
  });

  // Handle resize events
  window.addEventListener('resize', () => {
    if (!isMobileView()) {
      sidebar.classList.remove('mobile-visible');
      overlay.classList.remove('active');
    }
  });

  updateToggleIcon();
}

// ========== DROPDOWN FUNCTIONALITY ==========
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown-nav');

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Close other dropdowns
      dropdowns.forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
      });

      // Toggle current
      dropdown.classList.toggle('active');
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-nav')) {
      dropdowns.forEach(d => d.classList.remove('active'));
    }
  });
}

// ========== HEADER DROPDOWN ==========
function initHeaderDropdown() {
  const threeDotsBtn = document.getElementById('threeDotsBtn');
  const dropdownMenu = document.getElementById('headerDropdown');

  if (!threeDotsBtn || !dropdownMenu) return;

  threeDotsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-dropdown')) {
      dropdownMenu.classList.remove('active');
    }
  });
}

// ========== FULLSCREEN TOGGLE ==========
function initFullscreen() {
  const fullscreenToggle = document.getElementById('fullscreenToggle');
  if (!fullscreenToggle) return;

  fullscreenToggle.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen request failed:', err);
      });
      fullscreenToggle.querySelector('i').className = 'fas fa-compress';
    } else {
      document.exitFullscreen();
      fullscreenToggle.querySelector('i').className = 'fas fa-expand';
    }
  });

  // Update icon on fullscreen change
  document.addEventListener('fullscreenchange', () => {
    const icon = fullscreenToggle.querySelector('i');
    if (icon) {
      icon.className = document.fullscreenElement ? 'fas fa-compress' : 'fas fa-expand';
    }
  });
}

// ========== MAIN INITIALIZATION ==========
function initHeaderAndSidebar() {
  // Initialize date/time
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // Initialize all components
  initSidebar();
  initDropdowns();
  initHeaderDropdown();
  initFullscreen();
}

// ========== AUTO-INIT ON DOM READY ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeaderAndSidebar);
} else {
  initHeaderAndSidebar();
}

// Export for manual initialization if needed
window.initHeaderAndSidebar = initHeaderAndSidebar;
window.updateDateTime = updateDateTime;
