// student-profile.js
(function() {
  'use strict';

  // ===== Session Guard =====
  function requireStudentSession() {
    const stored = localStorage.getItem('messCurrentUser');
    const session = stored ? JSON.parse(stored) : null;
    if (!session || session.role !== 'student') {
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
  function formatDateDMY(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // ===== Helper: set text content with fallback =====
  function setText(id, value, fallback = '—') {
    const el = document.getElementById(id);
    if (el) el.textContent = value || fallback;
  }

  // ===== Populate profile =====
  function populateStudentProfile() {
    const session = JSON.parse(localStorage.getItem('messCurrentUser'));
    const students = loadFromStorage('messStudents');
    const student = students.find(s => s.regNo === session.regNo);
    if (!student) return;

    document.title = `EHS – Student Profile | ${student.studentName || 'Student'}`;

    // Personal Information
    setText('studentName', student.studentName);
    setText('fatherName', student.fatherName);
    setText('phoneNumber', student.phoneNumber);
    setText('cnic', student.cnic);
    setText('address', student.address);
    setText('email', student.email);
    setText('gender', student.gender);
    setText('dob', formatDateDMY(student.dob));
    setText('nationality', student.nationality);
    setText('religion', student.religion);

    // Guardian Information
    setText('guardianName', student.guardianName);
    setText('guardianRelationship', student.guardianRelationship);
    setText('guardianPhone', student.guardianPhone);
    setText('guardianCnic', student.guardianCnic || 'N/A');
    setText('guardianOccupation', student.guardianOccupation || 'N/A');

    // Class Information
    setText('className', student.className);
    setText('classId', student.classId);
    setText('session', student.session);
    setText('grade', student.grade);
    setText('section', student.section);

    // Enrollment Information
    setText('joiningDate', formatDateDMY(student.joiningDate));

    // Status badge
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
      const status = student.status || 'Active';
      statusBadge.textContent = status;
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
    const photoImg = document.getElementById('studentPhoto');
    if (photoImg) {
      if (student.photoUrl) {
        photoImg.src = student.photoUrl;
        photoImg.alt = student.studentName || 'Student Photo';
        photoImg.style.display = 'block';
        // Remove placeholder if exists
        const placeholder = photoImg.parentElement.querySelector('.photo-placeholder');
        if (placeholder) placeholder.remove();
      } else {
        photoImg.style.display = 'none';
        const frame = photoImg.parentElement;
        let placeholder = frame.querySelector('.photo-placeholder');
        if (!placeholder) {
          placeholder = document.createElement('div');
          placeholder.className = 'photo-placeholder';
          placeholder.innerHTML = '<i class="fas fa-user"></i>';
          frame.appendChild(placeholder);
        }
      }
    }

    // Registration Number
    const regNumber = document.getElementById('regNumber');
    if (regNumber) {
      regNumber.innerHTML = `${student.regNo || '—'}`;
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
    if (!requireStudentSession()) return;

    loadComponents();
    setTimeout(() => {
      if (typeof window.initHeaderAndSidebar === 'function') {
        window.initHeaderAndSidebar();
      }
    }, 500);

    populateStudentProfile();
  };

})();