document.addEventListener('DOMContentLoaded', function() {

    // Load current job data from storage
    chrome.storage.local.get(['currentJob'], (result) => {
        if (result.currentJob) {
            console.log("Loaded current job:", result.currentJob);
            autoFillForm(result.currentJob);
        } else {
            console.log("No current job data available");
        }
        // After autoFill, load saved form data
        loadSavedFormData();
    });

    function autoFillForm(job) {
        document.getElementById('company-name').value = job.company || '';
        document.getElementById('job-title').value = job.position || '';
        document.getElementById('job-link').value = job.link || '';
    }

    function loadSavedFormData() {
        chrome.storage.local.get(['popupFormData'], (result) => {
            if (result.popupFormData) {
                const data = result.popupFormData;
                // Set fields if they are empty
                if (!document.getElementById('company-name').value) {
                    document.getElementById('company-name').value = data.company || '';
                }
                if (!document.getElementById('job-title').value) {
                    document.getElementById('job-title').value = data.position || '';
                }
                if (!document.getElementById('job-link').value) {
                    document.getElementById('job-link').value = data.link || '';
                }
                document.getElementById('application-status').value = data.status || 'Applied';
                document.getElementById('application-notes').value = data.notes || '';
            }
        });
    }

    function saveFormData() {
        const data = {
            company: document.getElementById('company-name').value,
            position: document.getElementById('job-title').value,
            link: document.getElementById('job-link').value,
            status: document.getElementById('application-status').value,
            notes: document.getElementById('application-notes').value
        };
        chrome.storage.local.set({popupFormData: data});
    }

    // Add event listeners to save form data on change
    document.getElementById('company-name').addEventListener('input', saveFormData);
    document.getElementById('job-title').addEventListener('input', saveFormData);
    document.getElementById('job-link').addEventListener('input', saveFormData);
    document.getElementById('application-status').addEventListener('change', saveFormData);
    document.getElementById('application-notes').addEventListener('input', saveFormData);

    // Save Job Button
    const trackButton = document.getElementById('save-job-button');
    trackButton.addEventListener('click', function() {
        const job = {
            id: Date.now(),
            company: document.getElementById('company-name').value,
            position: document.getElementById('job-title').value,
            link: document.getElementById('job-link').value,
            status: document.getElementById('application-status').value,
            notes: document.getElementById('application-notes').value,
            dateAdded: new Date().toISOString()
        }

        if (!job.company || !job.position || !job.link) {
            const errorMsg = document.getElementById('error-message');
            errorMsg.textContent = 'Please fill in all required fields.';
            errorMsg.style.display = 'block';
            return;
        }
        chrome.storage.local.get(['jobs']).then((result) => {
            const updatedJobs = result.jobs || [];
            for (oldJob of updatedJobs) {
                if (oldJob.link === job.link) {
                    const errorMsg = document.getElementById('error-message');
                    errorMsg.textContent = 'This job is already saved.';
                    errorMsg.style.display = 'block';
                    return;
                }
            }
            updatedJobs.push(job);
            chrome.storage.local.set({jobs: updatedJobs}).then(() => {
                console.log('Job saved successfully.');
                document.getElementById('error-message').style.display = 'none';
                // Clear the form
                document.getElementById('company-name').value = '';
                document.getElementById('job-title').value = '';
                document.getElementById('job-link').value = '';
                document.getElementById('application-status').value = 'Applied';
                document.getElementById('application-notes').value = '';
                // Remove saved form data
                chrome.storage.local.remove(['popupFormData']);
            });
        });
    });

    // View All Jobs Button
    const viewAllButton = document.getElementById('view-all-jobs-button');
    viewAllButton.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('jobs-table.html') });
    });
});