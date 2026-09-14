// fee-invoices.js
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

  // ===== Global state =====
  let studentName = '';
  let studentRegNo = '';
  let studentInvoices = [];

  // ===== Load invoices =====
  function loadMyInvoices() {
    const session = JSON.parse(localStorage.getItem('messCurrentUser'));
    const students = loadFromStorage('messStudents');
    const student = students.find(s => s.regNo === session.regNo);

    studentName = student ? student.studentName : session.name;
    studentRegNo = session.regNo;

    document.getElementById('regNumberDisplay').textContent = studentRegNo;

    const allFeeRecords = loadFromStorage('messFeeRecords');
    studentInvoices = allFeeRecords
      .filter(r => r.regNo === studentRegNo)
      .map(r => ({
        id: r.id,
        feeType: r.feeType,
        feeMonth: r.feeMonth,
        amount: r.amount,
        dueDate: r.dueDate,
        status: r.status,
        paidDate: r.paidDateTime,
        receiptNo: r.receiptNo
      }));
  }

  // ===== Render invoices =====
  function renderInvoices(invoices) {
    const tbody = document.getElementById('invoiceTableBody');
    const emptyState = document.getElementById('emptyState');
    tbody.innerHTML = '';

    if (invoices.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      invoices.forEach(inv => {
        const isPaid = inv.status === 'Paid';
        const pillClass = isPaid ? 'paid' : 'pending';
        const pillIcon = isPaid ? 'fa-check-circle' : 'fa-clock';
        const actionCell = isPaid
          ? `<button class="action-btn" onclick="viewReceipt('${inv.id}')"><i class="fas fa-receipt"></i> View Receipt</button>`
          : `<span class="pending-note"><i class="fas fa-info-circle"></i> Pay at school counter</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><div class="fee-type-cell"><i class="fas fa-tag"></i> ${inv.feeType}</div></td>
          <td>${inv.feeMonth}</td>
          <td class="amount-cell">${inv.amount.toLocaleString()}</td>
          <td>${inv.dueDate}</td>
          <td><span class="status-pill ${pillClass}"><i class="fas ${pillIcon}"></i> ${inv.status === 'Unpaid' ? 'Pending' : 'Paid'}</span></td>
          <td>${actionCell}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    updateSummary(invoices);
  }

  // ===== Update summary =====
  function updateSummary(invoices) {
    const pending = invoices.filter(i => i.status === 'Unpaid');
    const paid = invoices.filter(i => i.status === 'Paid');
    const totalDue = pending.reduce((sum, i) => sum + i.amount, 0);

    document.getElementById('totalCount').textContent = invoices.length;
    document.getElementById('pendingCount').textContent = pending.length;
    document.getElementById('paidCount').textContent = paid.length;
    document.getElementById('totalDue').textContent = totalDue.toLocaleString();
  }

  // ===== Filter invoices =====
  window.filterInvoices = function() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;

    let filtered = studentInvoices;
    if (status) filtered = filtered.filter(inv => inv.status === status);
    if (search) {
      filtered = filtered.filter(inv =>
        inv.feeType.toLowerCase().includes(search) ||
        inv.feeMonth.toLowerCase().includes(search)
      );
    }
    renderInvoices(filtered);
  };

  // ===== View receipt =====
  window.viewReceipt = function(id) {
    const inv = studentInvoices.find(i => i.id === id);
    if (!inv || inv.status !== 'Paid') return;

    document.getElementById('receiptContent').innerHTML = `
      <div class="receipt-doc">
        <div class="receipt-top">
          <div class="r-logo">Muhammad Education Institute</div>
          <div class="r-title">Fee Payment Receipt</div>
        </div>
        <div class="receipt-fields">
          <div class="receipt-row"><span>Receipt No.</span><strong>${inv.receiptNo}</strong></div>
          <div class="receipt-row"><span>Paid On</span><strong>${inv.paidDate}</strong></div>
          <div class="receipt-row"><span>Student Name</span><strong>${studentName}</strong></div>
          <div class="receipt-row"><span>Registration No.</span><strong>${studentRegNo}</strong></div>
          <div class="receipt-row"><span>Fee Type</span><strong>${inv.feeType}</strong></div>
          <div class="receipt-row"><span>Fee Month</span><strong>${inv.feeMonth}</strong></div>
        </div>
        <div class="receipt-amount">PKR ${inv.amount.toLocaleString()}</div>
        <div class="receipt-thanks">Thank you for your payment!</div>
      </div>
    `;
    document.getElementById('receiptModal').classList.add('active');
  };

  // ===== Close receipt modal =====
  window.closeReceiptModal = function() {
    document.getElementById('receiptModal').classList.remove('active');
  };

  // ===== Click outside modal =====
  document.getElementById('receiptModal').addEventListener('click', function(e) {
    if (e.target === this) closeReceiptModal();
  });

  // ===== Event listeners for filters =====
  document.getElementById('searchInput').addEventListener('keyup', window.filterInvoices);
  document.getElementById('statusFilter').addEventListener('change', window.filterInvoices);

  // ===== onload =====
  window.onload = function() {
    if (!requireStudentSession()) return;

    fetch('header.html').then(r => r.text()).then(d => {
      document.getElementById('header-placeholder').innerHTML = d;
    }).catch(e => console.error(e));
    fetch('sidebar.html').then(r => r.text()).then(d => {
      document.getElementById('sidebar-placeholder').innerHTML = d;
    }).catch(e => console.error(e));

    setTimeout(() => {
      if (typeof window.initHeaderAndSidebar === 'function') {
        window.initHeaderAndSidebar();
      }
    }, 400);

    loadMyInvoices();
    renderInvoices(studentInvoices);
  };

})();