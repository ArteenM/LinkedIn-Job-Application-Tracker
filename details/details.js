document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId');

    if (!jobId) {
        document.getElementById('job-details').innerHTML = '<p>Invalid job ID.</p>';
        return;
    }

    chrome.storage.local.get(['jobs']).then((result) => {
        const jobs = result.jobs || [];
        const job = jobs.find(j => j.id == jobId);

        if (!job) {
            document.getElementById('job-details').innerHTML = '<p>Job not found.</p>';
            return;
        }

        // Display details
        document.getElementById('company').textContent = job.company;
        document.getElementById('position').textContent = job.position;
        document.getElementById('link').href = job.link;
        document.getElementById('link').textContent = job.link;
        document.getElementById('status').textContent = job.status;
        document.getElementById('notes').textContent = job.notes;
        document.getElementById('dateAdded').textContent = new Date(job.dateAdded).toLocaleDateString();
    });

    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
        window.close();
        // Not sure if there is a way to focus the popup again, but for now it'll just close the details tab.
        
    });

    // Delete button
    document.getElementById('delete-button').addEventListener('click', () => {
        chrome.storage.local.get(['jobs']).then((result) => {
            const jobs = result.jobs || [];
            const updatedJobs = jobs.filter(j => j.id != jobId);
            chrome.storage.local.set({jobs: updatedJobs}).then(() => {
                window.close();
            });
        });
    });
});