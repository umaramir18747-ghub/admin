// ===== helpers =====
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ===== toast =====
const toast = $('#toast');
function notify(text) {
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ===== HELP MODAL =====
const helpModal = $('#helpModal');
const helpLink = $('#helpLink');
const closeHelp = $('#closeHelp');

function openHelp() {
  helpModal.classList.add('open');
}
function closeHelpModal() {
  helpModal.classList.remove('open');
}
helpLink.addEventListener('click', (e) => {
  e.preventDefault();
  openHelp();
});
closeHelp.addEventListener('click', closeHelpModal);
helpModal.addEventListener('click', (e) => {
  if (e.target === helpModal) closeHelpModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeHelpModal();
});

// ===== LOGO PREVIEW MODAL with COUNTDOWN (3 seconds) =====
const logoTrigger = $('#logoTrigger');
const logoPreviewModal = $('#logoPreviewModal');
const countdownBadge = $('#countdownBadge');
let logoTimeout = null;
let countdownInterval = null;
let countdownValue = 3;

function openLogoPreview() {
  if (logoTimeout) {
    clearTimeout(logoTimeout);
    logoTimeout = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  countdownValue = 3;
  countdownBadge.textContent = countdownValue;
  logoPreviewModal.classList.add('open');

  countdownInterval = setInterval(() => {
    countdownValue -= 1;
    if (countdownValue <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      closeLogoPreview();
    } else {
      countdownBadge.textContent = countdownValue;
    }
  }, 1000);

  logoTimeout = setTimeout(() => {
    if (logoPreviewModal.classList.contains('open')) {
      closeLogoPreview();
    }
  }, 3500);
}

function closeLogoPreview() {
  logoPreviewModal.classList.remove('open');
  if (logoTimeout) {
    clearTimeout(logoTimeout);
    logoTimeout = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

logoTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  openLogoPreview();
});
logoTrigger.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openLogoPreview();
  }
});
logoPreviewModal.addEventListener('click', (e) => {
  if (e.target === logoPreviewModal) {
    closeLogoPreview();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && logoPreviewModal.classList.contains('open')) {
    closeLogoPreview();
  }
});

// ===== role switch =====
const roleBtns = $$('.role-switch button');
let selectedRole = 'student';

roleBtns.forEach((btn) => {
  btn.addEventListener('click', function() {
    roleBtns.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    this.classList.add('active');
    this.setAttribute('aria-selected', 'true');
    selectedRole = this.dataset.role;
    notify(this.textContent + ' portal selected');
  });
});

// ===== password toggle =====
const togglePass = $('#togglePassword');
const passInput = $('#password');
togglePass.addEventListener('click', () => {
  const showing = passInput.type === 'text';
  passInput.type = showing ? 'password' : 'text';
  togglePass.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  togglePass.innerHTML = `<i data-lucide="${showing ? 'eye' : 'eye-off'}"></i>`;
  if (window.lucide) lucide.createIcons();
});

// ===== demo links =====
$('#forgotLink').addEventListener('click', (e) => {
  e.preventDefault();
  notify('Contact Admin to reset your password.');
});
$('#sso').addEventListener('click', () => { notify('Opening institute single sign-on'); });

// ===== Storage helpers =====
function loadFromStorage(key) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

// ===== login logic =====
const loginForm = $('#loginForm');
const statusEl = $('#status');
const btnText = $('#btnText');
const btnSpinner = $('#btnSpinner');
let loginTimeout = null;

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  statusEl.className = 'status';
  statusEl.textContent = '';

  const username = $('#username').value.trim();
  const password = $('#password').value;

  if (!username || !password) {
    statusEl.textContent = 'Please enter both username and password.';
    return;
  }

  // Disable button and show spinner (replace text)
  const submitBtn = this.querySelector('.primary');
  submitBtn.disabled = true;
  btnText.textContent = '';
  btnSpinner.style.display = 'inline-block';

  // Clear any previous timeout
  if (loginTimeout) {
    clearTimeout(loginTimeout);
    loginTimeout = null;
  }

  // Simulate 3 second delay
  loginTimeout = setTimeout(() => {
    let isValid = false;
    let redirectUrl = '';

    // STUDENT
    if (selectedRole === 'student') {
      const students = loadFromStorage('messStudents');
      const student = students.find(s => s.regNo.toLowerCase() === username.toLowerCase());
      if (!student) {
        statusEl.textContent = 'No student found with this Registration Number.';
        resetButton(submitBtn);
        return;
      }
      if ((student.password || 'MESS') !== password) {
        statusEl.textContent = 'Incorrect password. Please try again.';
        resetButton(submitBtn);
        return;
      }
      if (student.status === 'Inactive') {
        statusEl.textContent = 'Your account is marked Inactive. Please contact administration.';
        resetButton(submitBtn);
        return;
      }
      localStorage.setItem('messCurrentUser', JSON.stringify({
        regNo: student.regNo,
        role: 'student',
        name: student.studentName
      }));
      isValid = true;
      redirectUrl = 'student/student-dashboard.html';
    }

    // TEACHER
    else if (selectedRole === 'teacher') {
      const teachers = loadFromStorage('messTeachers');
      const teacher = teachers.find(t => t.regNo.toLowerCase() === username.toLowerCase());
      if (!teacher) {
        statusEl.textContent = 'No teacher found with this Registration Number.';
        resetButton(submitBtn);
        return;
      }
      if ((teacher.password || 'MESS') !== password) {
        statusEl.textContent = 'Incorrect password. Please try again.';
        resetButton(submitBtn);
        return;
      }
      if (teacher.status === 'Inactive') {
        statusEl.textContent = 'Your account is marked Inactive. Please contact administration.';
        resetButton(submitBtn);
        return;
      }
      localStorage.setItem('messCurrentUser', JSON.stringify({
        regNo: teacher.regNo,
        role: 'teacher',
        name: teacher.teacherName
      }));
      isValid = true;
      redirectUrl = 'teacher/teacher-dashboard.html';
    }

    // ADMIN
    else if (selectedRole === 'manager') {
      if (username === 'MEI.ADMIN.UMAR.18747' && password === 'mei.umar.18747') {
        localStorage.setItem('messCurrentUser', JSON.stringify({
          regNo: 'ADMIN',
          role: 'manager',
          name: 'Administrator'
        }));
        isValid = true;
        redirectUrl = 'admin/index.html';
      } else {
        statusEl.textContent = 'Invalid admin credentials.';
        resetButton(submitBtn);
        return;
      }
    } else {
      statusEl.textContent = 'Unknown role selected.';
      resetButton(submitBtn);
      return;
    }

    if (isValid && redirectUrl) {
      // Reset button before redirect
      resetButton(submitBtn);
      window.location.href = redirectUrl;
    }
  }, 3000);
});

function resetButton(btn) {
  btn.disabled = false;
  btnText.textContent = 'Sign in to portal';
  btnSpinner.style.display = 'none';
  if (loginTimeout) {
    clearTimeout(loginTimeout);
    loginTimeout = null;
  }
}

// Init Lucide icons
if (window.lucide) lucide.createIcons();
