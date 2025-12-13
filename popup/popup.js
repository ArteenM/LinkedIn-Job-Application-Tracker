console.log("This is a popup!")

document.addEventListener('DOMContentLoaded', function() {
    const trackButton = document.getElementById('track-job-button');
    trackButton.addEventListener('click', function() {
        const job = {
            id: Date.now(),
            company: document.getElementById('company-name').value,
            position: document.getElementById('position-title').value,
            link: document.getElementById('job-link').value,
            status: document.getElementById('application-status').value,
            notes: document.getElementById('application-notes').value,
            dateAdded: new Date().toISOString()
        }
        console.log("Job tracked:", job);
    });
});