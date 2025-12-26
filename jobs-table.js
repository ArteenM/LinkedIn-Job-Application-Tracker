document.addEventListener('DOMContentLoaded', function() {
    loadJobsTable();

    // Select all checkbox
    document.getElementById('select-all').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.job-checkbox');
        checkboxes.forEach(cb => cb.checked = this.checked);
    });

    // Delete selected jobs
    document.getElementById('delete-selected').addEventListener('click', deleteSelectedJobs);

    function loadJobsTable() {
        chrome.storage.local.get(['jobs']).then((result) => {
            const jobs = result.jobs || [];
            const tbody = document.getElementById('jobs-tbody');
            tbody.innerHTML = '';

            if (jobs.length === 0) {
                const row = tbody.insertRow();
                const cell = row.insertCell(0);
                cell.colSpan = 7;
                cell.textContent = 'No jobs tracked yet.';
                return;
            }

            jobs.forEach((job, index) => {
                const row = tbody.insertRow();

                // Checkbox cell
                const checkboxCell = row.insertCell(0);
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'job-checkbox';
                checkbox.dataset.index = index;
                checkboxCell.appendChild(checkbox);

                row.insertCell(1).textContent = job.company;
                row.insertCell(2).textContent = job.position;

                // Status cell with select
                const statusCell = row.insertCell(3);
                const statusSelect = document.createElement('select');
                statusSelect.innerHTML = `
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                `;
                statusSelect.value = job.status;
                statusSelect.addEventListener('change', () => {
                    updateJob(index, 'status', statusSelect.value);
                });
                statusCell.appendChild(statusSelect);

                // Notes cell, contenteditable
                const notesCell = row.insertCell(4);
                notesCell.contentEditable = true;
                notesCell.textContent = job.notes || '';
                notesCell.addEventListener('blur', () => {
                    updateJob(index, 'notes', notesCell.textContent.trim());
                });

                row.insertCell(5).innerHTML = `<a href="${job.link}" target="_blank">View Job</a>`;
                row.insertCell(6).textContent = new Date(job.dateAdded).toLocaleDateString();
            });
        });
    }

    function updateJob(index, field, value) {
        chrome.storage.local.get(['jobs']).then((result) => {
            const jobs = result.jobs || [];
            if (jobs[index]) {
                jobs[index][field] = value;
                chrome.storage.local.set({jobs: jobs});
            }
        });
    }

    function deleteSelectedJobs() {
        const checkboxes = document.querySelectorAll('.job-checkbox:checked');
        if (checkboxes.length === 0) {
            alert('No jobs selected.');
            return;
        }
        if (confirm(`Are you sure you want to delete ${checkboxes.length} job(s)?`)) {
            chrome.storage.local.get(['jobs']).then((result) => {
                const jobs = result.jobs || [];
                const indices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index)).sort((a, b) => b - a);
                indices.forEach(idx => jobs.splice(idx, 1));
                chrome.storage.local.set({jobs: jobs}).then(() => {
                    loadJobsTable(); // Refresh the table
                });
            });
        }
    }
});