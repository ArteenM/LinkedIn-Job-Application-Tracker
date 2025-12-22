document.addEventListener('DOMContentLoaded', function() {
    loadJobsTable();

    function loadJobsTable() {
        chrome.storage.local.get(['jobs']).then((result) => {
            const jobs = result.jobs || [];
            const tbody = document.getElementById('jobs-tbody');
            tbody.innerHTML = '';

            if (jobs.length === 0) {
                const row = tbody.insertRow();
                const cell = row.insertCell(0);
                cell.colSpan = 6;
                cell.textContent = 'No jobs tracked yet.';
                return;
            }

            jobs.forEach((job, index) => {
                const row = tbody.insertRow();
                row.insertCell(0).textContent = job.company;
                row.insertCell(1).textContent = job.position;

                // Status cell with select
                const statusCell = row.insertCell(2);
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
                const notesCell = row.insertCell(3);
                notesCell.contentEditable = true;
                notesCell.textContent = job.notes || '';
                notesCell.addEventListener('blur', () => {
                    updateJob(index, 'notes', notesCell.textContent.trim());
                });

                row.insertCell(4).textContent = new Date(job.dateAdded).toLocaleDateString();

                // Actions cell with delete button
                const actionsCell = row.insertCell(5);
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => {
                    deleteJob(index);
                });
                actionsCell.appendChild(deleteButton);
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

    function deleteJob(index) {
        if (confirm('Are you sure you want to delete this job?')) {
            chrome.storage.local.get(['jobs']).then((result) => {
                const jobs = result.jobs || [];
                jobs.splice(index, 1);
                chrome.storage.local.set({jobs: jobs}).then(() => {
                    loadJobsTable(); // Refresh the table
                });
            });
        }
    }
});