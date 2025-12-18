document.addEventListener('DOMContentLoaded', function() {

    // Check if we're on LinkedIn and auto-fill form
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        
        if (currentTab.url && currentTab.url.includes('linkedin.com/jobs')) {
            console.log("On LinkedIn jobs page, requesting data...");
            
            chrome.tabs.sendMessage(currentTab.id, {action: "getJobData"}, function(response) {
                if (chrome.runtime.lastError) {
                    console.log("Error:", chrome.runtime.lastError.message);
                    return;
                }
                
                if (response && response.job) {
                    console.log("Got job data:", response.job);
                    autoFillForm(response.job);
                } else {
                    console.log("No job data available");
                }
            });
        }
    });

    function autoFillForm(job) {
        document.getElementById('company-name').value = job.company || '';
        document.getElementById('job-title').value = job.position || '';
        document.getElementById('job-link').value = job.link || '';
    }

    function loadJobs() {
        chrome.storage.local.get(['jobs']).then((result) => {
            const jobs = result.jobs || [];
            if (jobs.length > 0) {
                // Auto-fill with the most recent job
                const recentJob = jobs[jobs.length - 1];
                autoFillForm(recentJob);
            }
        });
    }

    loadJobs(); // Load jobs on popup open

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
                loadJobs(); // Refresh the list
            });
        });
    });

    // View All Jobs Button
    const viewAllButton = document.getElementById('view-all-jobs-button');
    viewAllButton.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('jobs-table.html') });
    });
});