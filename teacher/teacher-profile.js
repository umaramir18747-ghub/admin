// teacher-profile.js
(function() {
  'use strict';

  // ===== Session Guard =====
  function requireTeacherSession() {
    const stored = localStorage.getItem('messCurrentUser');
    const session = stored ? JSON.parse(stored) : null;
    if (!session || session.role !== 'teacher') {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  // ===== Storage Helpers =====
  function loadFromStorage(key) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  // ===== Helper: format date =====
  function formatDateLong(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  // ===== Helper: set text content with fallback =====
  function setText(id, value, fallback = '—') {
    const el = document.getElementById(id);
    if (el) el.textContent = value || fallback;
  }

  // ===== Populate profile =====
  function populateTeacherProfile() {
    const session = JSON.parse(localStorage.getItem('messCurrentUser'));
    const teachers = loadFromStorage('messTeachers');
    const teacher = teachers.find(t => t.regNo === session.regNo);
    if (!teacher) return;

    document.title = `EHS – Teacher Profile | ${teacher.teacherName || 'Teacher'}`;

    // Personal Information
    setText('teacherName', teacher.teacherName);
    setText('fatherName', teacher.fatherName);
    setText('phoneNumber', teacher.phoneNumber);
    setText('cnic', teacher.cnic);
    setText('address', teacher.address);
    setText('email', teacher.email);
    setText('gender', teacher.gender);
    setText('dob', formatDateLong(teacher.dob));
    setText('nationality', teacher.nationality);
    setText('religion', teacher.religion);

    // Professional Information
    setText('qualification', teacher.qualification);
    setText('previousSchool', teacher.previousSchool);
    setText('experience', teacher.experience);

    // Subjects - update tags
    const subjectsContainer = document.getElementById('subjectsTags');
    if (subjectsContainer) {
      const subjects = (teacher.subjectsCanTeach || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      
      if (subjects.length === 0) {
        subjectsContainer.innerHTML = '<span class="subjects-tag" style="background:#f1f5f9;color:#94a3b8;">Not specified</span>';
      } else {
        subjectsContainer.innerHTML = subjects
          .map(sub => `<span class="subjects-tag">${sub}</span>`)
          .join('');
      }
    }

    // Employment Information
    setText('designation', teacher.designation);
    setText('joiningDate', formatDateLong(teacher.joiningDate));

    // Status badge
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
      const status = teacher.status || 'Active';
      statusBadge.textContent = status;
      // Update badge color based on status
      if (status.toLowerCase() === 'active') {
        statusBadge.style.background = '#d1fae5';
        statusBadge.style.color = '#166534';
      } else if (status.toLowerCase() === 'inactive') {
        statusBadge.style.background = '#fee2e2';
        statusBadge.style.color = '#991b1b';
      } else {
        statusBadge.style.background = '#fef3c7';
        statusBadge.style.color = '#92400e';
      }
    }

    // Photo
    const photoImg = document.getElementById('teacherPhoto');
    if (photoImg) {
      if (teacher.photoUrl) {
        photoImg.src = teacher.photoUrl;
        photoImg.alt = teacher.teacherName || 'Teacher Photo';
      } else {
        photoImg.style.display = 'none';
        // Show placeholder if no photo
        const frame = photoImg.parentElement;
        const placeholder = document.createElement('div');
        placeholder.className = 'photo-placeholder';
        placeholder.innerHTML = '<i class="fas fa-user-graduate"></i>';
        if (!frame.querySelector('.photo-placeholder')) {
          frame.appendChild(placeholder);
        }
      }
    }

    // Registration Number
    const regNumber = document.getElementById('regNumber');
    if (regNumber) {
      regNumber.innerHTML = `${teacher.regNo || '—'}`;
    }
  }

  // ===== Load components (header/sidebar) =====
  function loadComponents() {
    fetch('header.html')
      .then(r => r.text())
      .then(data => {
        const headerEl = document.getElementById('header-placeholder');
        if (headerEl) headerEl.innerHTML = data;
      })
      .catch(() => console.log("Header loaded (simulated)"));

    fetch('sidebar.html')
      .then(r => r.text())
      .then(data => {
        const sidebarEl = document.getElementById('sidebar-placeholder');
        if (sidebarEl) sidebarEl.innerHTML = data;
      })
      .catch(() => console.log("Sidebar loaded (simulated)"));
  }

  // ===== onload =====
  window.onload = function() {
    if (!requireTeacherSession()) return;

    loadComponents();
    setTimeout(() => {
      if (typeof window.initHeaderAndSidebar === 'function') {
        window.initHeaderAndSidebar();
      }
    }, 500);

    populateTeacherProfile();
  };

})();