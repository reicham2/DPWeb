// Delegated row click + keyboard accessibility + search/filter
(function () {
  const input = document.getElementById('activitySearch');
  const clearBtn = document.getElementById('clearSearch');
  const table = document.getElementById('activitysTable');
  if (!table) return;

  const tbody = table.tBodies[0];
  const noResultsRow = document.getElementById('noResultsRow');
  const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => r.id !== 'noResultsRow');

  // Utility: try to determine an id or href to navigate to for a row
  function getRowTarget(row) {
    // 1) data-href attribute
    if (row.dataset && row.dataset.href) return row.dataset.href;

    // 2) hidden input[name="id"] (delete form)
    const idInput = row.querySelector('input[name="id"][type="hidden"]');
    if (idInput && idInput.value) return '/activity/' + idInput.value;

    // 3) any anchor that contains "/activity/" and looks like a show link
    const anchors = Array.from(row.querySelectorAll('a[href]'));
    for (const a of anchors) {
      const href = a.getAttribute('href');
      // direct show links like /activity/<id>
      const m1 = href && href.match(/^\/activity\/([a-f0-9\-]+)$/i);
      if (m1) return href;
      // links like /activity/update?id=<id>
      const m2 = href && href.match(/[?&]id=([^&]+)/);
      if (m2) return '/activity/' + decodeURIComponent(m2[1]);
    }

    // 4) fallback: no target
    return null;
  }

  // Make rows focusable and set up keyboard/click handling per row
  rows.forEach(row => {
    const target = getRowTarget(row);
    if (!target) return; // don't make it clickable if we can't determine target

    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'link');
    row.classList.add('cursor-pointer');

    // Click: ignore clicks on interactive elements
    row.addEventListener('click', (e) => {
      const tg = e.target;
      if (tg.closest('a') || tg.closest('button') || tg.closest('form') || tg.closest('input')) return;
      window.location.href = target;
    });

    // Keyboard
    row.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = document.activeElement;
      if (el && (el.closest('a') || el.closest('button') || el.closest('form') || el.closest('input'))) return;
      e.preventDefault();
      window.location.href = target;
    });
  });

  // Search/filter logic (rows are expected to have data-search attribute)
  function setClearVisible(visible) {
    if (!clearBtn) return;
    clearBtn.style.display = visible ? '' : 'none';
  }

  function filterRows() {
    if (!input) return;
    const q = input.value.trim().toLowerCase();
    let visibleCount = 0;

    if (q === '') {
      rows.forEach(r => { r.style.display = ''; visibleCount++; });
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

  // debounce input
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