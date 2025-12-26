document.addEventListener('DOMContentLoaded', function() {

    // Load current job data from storage
    chrome.storage.local.get(['currentJob'], (result) => {
        if (result.currentJob) {
            console.log("Loaded current job:", result.currentJob);
            autoFillForm(result.currentJob);
        } else {
            console.log("No current job data available");
        }
    });

    function autoFillForm(job) {
        document.getElementById('company-name').value = job.company || '';
        document.getElementById('job-title').value = job.position || '';
        document.getElementById('job-link').value = job.link || '';
    }

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
            });
        });
    });

    // View All Jobs Button
    const viewAllButton = document.getElementById('view-all-jobs-button');
    viewAllButton.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('jobs-table.html') });
    });
});