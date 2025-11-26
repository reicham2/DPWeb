// ...existing code...
// This file now contains shared JS for activity listing (search + row click) and the activity_edit page (program rows + SiKo toggle)

(function () {
    // ---------- Listing page: search + row navigation ----------
    (function listingModule() {
        const input = document.getElementById('activitySearch');
        const clearBtn = document.getElementById('clearSearch');
        const table = document.getElementById('activitysTable') || document.getElementById('activitysTable') || document.getElementById('activitysTable');
        const tableAlt = document.getElementById('activitiesTable') || document.getElementById('activitysTable') || document.getElementById('activitysTable');

        const tbl = table || tableAlt;
        if (!tbl) return;

        const tbody = tbl.tBodies[0];
        const noResultsRow = document.getElementById('noResultsRow');
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => r.id !== 'noResultsRow');

        function getRowTarget(row) {
            if (row.dataset && row.dataset.href) return row.dataset.href;
            const idInput = row.querySelector('input[name="id"][type="hidden"]');
            if (idInput && idInput.value) return '/activity/' + idInput.value;
            const anchors = Array.from(row.querySelectorAll('a[href]'));
            for (const a of anchors) {
                const href = a.getAttribute('href');
                const m1 = href && href.match(/^\/activity\/([a-f0-9\-]+)$/i);
                if (m1) return href;
                const m2 = href && href.match(/[?&]id=([^&]+)/);
                if (m2) return '/activity/' + decodeURIComponent(m2[1]);
            }
            return null;
        }

        // make rows focusable and attach handlers
        rows.forEach(row => {
            const target = getRowTarget(row);
            if (!target) return;
            row.setAttribute('tabindex', '0');
            row.setAttribute('role', 'link');
            row.classList.add('cursor-pointer');

            row.addEventListener('click', (e) => {
                const tg = e.target;
                if (tg.closest('a') || tg.closest('button') || tg.closest('form') || tg.closest('input')) return;
                window.location.href = target;
            });

            row.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                const el = document.activeElement;
                if (el && (el.closest('a') || el.closest('button') || el.closest('form') || el.closest('input'))) return;
                e.preventDefault();
                window.location.href = target;
            });
        });

        // search/filter
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

    // ---------- Edit page: SiKo toggle + dynamic program rows ----------
    (function editModule() {
        const programList = document.getElementById('programList');
        const addProgramBtn = document.getElementById('addProgram');
        const template = document.getElementById('program-row-template');
        const programDataJson = document.getElementById('programDataJson');
        const sikoCheckbox = document.getElementById('needs_SiKo');
        const sikoContainer = document.getElementById('sikoContainer');

        // SiKo toggle
        if (sikoCheckbox && sikoContainer) {
            // set initial state based on checkbox
            sikoContainer.style.display = sikoCheckbox.checked ? 'block' : 'none';
            sikoCheckbox.addEventListener('change', () => {
                sikoContainer.style.display = sikoCheckbox.checked ? 'block' : 'none';
            });
        }

        if (!programList || !template) return;

        let programData = [];
        if (programDataJson) {
            try {
                programData = JSON.parse(programDataJson.textContent || '[]');
            } catch (e) {
                programData = [];
            }
        }

        function createInputRow(values = {}) {
            const clone = template.content ? template.content.cloneNode(true) : document.createRange().createContextualFragment(template.innerHTML);
            // wrapper may contain top-level nodes; make a container to return single element
            const container = document.createElement('div');
            container.appendChild(clone);

            // find the first element that represents a program row (the top-level div inside template)
            const rowEl = container.firstElementChild;
            if (!rowEl) return null;

            const time = rowEl.querySelector('input[name="program_time"]');
            const title = rowEl.querySelector('input[name="program_title"]');
            const description = rowEl.querySelector('textarea[name="program_description"]');
            const responsible = rowEl.querySelector('input[name="program_responsible"]');

            if (time) time.value = values.time || '';
            if (title) title.value = values.title || '';
            if (description) description.value = values.description || '';
            if (responsible) responsible.value = values.responsible || '';

            const removeBtn = rowEl.querySelector('.remove-program');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    rowEl.remove();
                    if (!programList.children.length) addRow({});
                });
            }

            return rowEl;
        }

        function addRow(values = {}) {
            const row = createInputRow(values);
            if (row) programList.appendChild(row);
        }

        // populate existing data or create empty row
        if (programData.length) {
            programData.forEach(p => addRow({
                time: p.time || '',
                title: p.title || '',
                description: p.description || '',
                responsible: p.responsible || ''
            }));
        } else {
            addRow({});
        }

        if (addProgramBtn) {
            addProgramBtn.addEventListener('click', () => addRow({}));
        }

        // ---------- Materials dynamic inputs (max 3 per row, always keep one empty) ----------
        const materialsContainer = document.getElementById('materialsContainer');
        const materialTemplate = document.getElementById('material-input-template');
        const materialsDataJson = document.getElementById('materialsDataJson');
        const formEl = document.querySelector('form[action^="/activity/"]') || document.querySelector('form');

        if (materialsContainer && materialTemplate) {
            let materialsData = [];
            if (materialsDataJson) {
                try { materialsData = JSON.parse(materialsDataJson.textContent || '[]'); } catch (e) { materialsData = []; }
            }

            function createMaterialItem(value) {
                const frag = materialTemplate.content ? materialTemplate.content.cloneNode(true) : document.createRange().createContextualFragment(materialTemplate.innerHTML);
                const wrapper = document.createElement('div');
                wrapper.appendChild(frag);
                const item = wrapper.firstElementChild;
                const input = item.querySelector('input.material-input');
                const removeBtn = item.querySelector('.remove-material');
                if (input) input.value = value || '';

                // when typing into the last (trailing) input, ensure a new empty one exists
                input.addEventListener('input', () => {
                    ensureTrailingEmptyExists();
                });

                // when user leaves an empty input, remove it — but keep one empty input around
                input.addEventListener('blur', () => {
                    try {
                        if (input.value.trim() === '') {
                            const allInputs = Array.from(materialsContainer.querySelectorAll('input.material-input'));
                            const emptyCount = allInputs.filter(i => i.value.trim() === '').length;
                            // only remove this input if there's at least one other empty field
                            if (emptyCount > 1) {
                                const parent = input.closest('.material-item');
                                if (parent) parent.remove();
                                cleanupEmptyRows();
                            }
                        }
                    } catch (e) {
                        // defensive: do nothing on unexpected errors
                    }
                });

                if (removeBtn) {
                    removeBtn.addEventListener('click', () => {
                        item.remove();
                        cleanupEmptyRows();
                        ensureTrailingEmptyExists();
                    });
                }

                return item;
            }

            function appendToRow(item) {
                let lastRow = materialsContainer.lastElementChild;
                if (!lastRow || !lastRow.classList.contains('materials-row')) {
                    lastRow = document.createElement('div');
                    lastRow.className = 'materials-row flex gap-3';
                    materialsContainer.appendChild(lastRow);
                }
                if (lastRow.children.length >= 3) {
                    lastRow = document.createElement('div');
                    lastRow.className = 'materials-row flex gap-3';
                    materialsContainer.appendChild(lastRow);
                }
                lastRow.appendChild(item);
            }

            function ensureTrailingEmptyExists() {
                const inputs = Array.from(materialsContainer.querySelectorAll('input.material-input'));
                const lastInput = inputs[inputs.length - 1];
                if (!lastInput || lastInput.value.trim() !== '') {
                    const newItem = createMaterialItem('');
                    appendToRow(newItem);
                }
            }

            function cleanupEmptyRows() {
                const rows = Array.from(materialsContainer.querySelectorAll('.materials-row'));
                rows.forEach(row => {
                    if (row.children.length === 0) row.remove();
                });
            }

            // populate existing materials
            if (materialsData && materialsData.length) {
                materialsData.forEach(m => {
                    const it = createMaterialItem(m || '');
                    appendToRow(it);
                });
            }

            // always keep at least one empty input
            ensureTrailingEmptyExists();

            // before submit, remove empty inputs so they are not sent to server
            if (formEl) {
                formEl.addEventListener('submit', (e) => {
                    const inputs = Array.from(materialsContainer.querySelectorAll('input.material-input'));
                    inputs.forEach(inp => {
                        if (inp.value.trim() === '') {
                            const parent = inp.closest('.material-item');
                            if (parent) parent.remove();
                        }
                    });
                    cleanupEmptyRows();
                });
            }
        }
    })();

})();