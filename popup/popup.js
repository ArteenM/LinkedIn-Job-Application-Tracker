

document.addEventListener('DOMContentLoaded', function() {

    function loadJobs() {
        chrome.storage.local.get(['jobs']).then((result) => {
            const jobs = result.jobs || [];
            const jobList = document.getElementById('jobs-entries');
            jobList.innerHTML = ''; // Clear the list
            console.log('jobs.length', jobs.length);
            if (jobs.length === 0) {
                const noJobsItem = document.createElement('li');
                noJobsItem.textContent = 'No saved jobs.';
                jobList.appendChild(noJobsItem);
            }
            else {
                jobs.forEach((job) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${job.position} at ${job.company} - Status: ${job.status}`;
                listItem.style.cursor = 'pointer';
                listItem.addEventListener('click', () => {
                    chrome.tabs.create({ url: chrome.runtime.getURL('details/details.html') + '?jobId=' + job.id });
                });
                console.log('job', job);
                jobList.appendChild(listItem);
                });
            }
        });
    }

    loadJobs(); // Lowad jobs on popup open

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
        chrome.storage.local.get(['jobs']).then((result) => {
            const updatedJobs = result.jobs || [];
            updatedJobs.push(job);
            chrome.storage.local.set({jobs: updatedJobs}).then(() => {
                console.log('Job saved successfully.');
                loadJobs(); // Refresh the list
            });
        });
    });
});