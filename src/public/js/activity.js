// delegierte Row-Klicks + keyboard accessibility + Suche/Filter

(function () {
  // Elements
  const input = document.getElementById('activitySearch');
  const clearBtn = document.getElementById('clearSearch');
  const table = document.getElementById('activitysTable');
  if (!table) return;

  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => r.id !== 'noResultsRow');
  const noResultsRow = document.getElementById('noResultsRow');

  // Row click / keyboard handling (delegation)
  tbody.addEventListener('click', function (e) {
    const target = e.target;
    // ignore clicks on interactive elements
    if (target.closest('a') || target.closest('button') || target.closest('form') || target.closest('input')) return;
    const tr = target.closest('tr');
    if (!tr) return;
    const href = tr.dataset.href;
    if (href) window.location.href = href;
  });

  tbody.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = document.activeElement;
    const tr = el && el.closest ? el.closest('tr') : null;
    if (!tr) return;
    if (el.closest('a') || el.closest('button') || el.closest('form')) return;
    const href = tr.dataset.href;
    if (href) {
      e.preventDefault();
      window.location.href = href;
    }
  });

  // make rows focusable
  rows.forEach(r => {
    if (r.dataset.href) {
      r.setAttribute('tabindex', '0');
      r.setAttribute('role', 'link');
    }
  });

  // Search/filter logic
  function setClearVisible(visible) {
    if (!clearBtn) return;
    clearBtn.style.display = visible ? '' : 'none';
  }

  function filterRows() {
    if (!input) return;
    const q = input.value.trim().toLowerCase();
    let visibleCount = 0;

    if (q === '') {
      rows.forEach(r => r.style.display = '');
      visibleCount = rows.length;
    } else {
      rows.forEach(r => {
        const hay = (r.dataset.search || '').toLowerCase();
        const ok = hay.indexOf(q) !== -1;
        r.style.display = ok ? '' : 'none';
        if (ok) visibleCount++;
      });
    }

    if (noResultsRow) {
      if (visibleCount === 0) noResultsRow.classList.remove('hidden');
      else noResultsRow.classList.add('hidden');
    }

    setClearVisible(q.length > 0);
  }

  // events
  if (input) {
    let timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(filterRows, 120);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!input) return;
      input.value = '';
      filterRows();
      input.focus();
    });
  }

  // init
  setClearVisible(false);
})();