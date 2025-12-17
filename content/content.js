console.log("Content script loaded on:", window.location.href);

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getJobData") {
        console.log("Popup requested job data, extracting...");
        
        const jobData = extractJobData();
        
        if (jobData) {
            sendResponse({job: jobData});
        } else {
            sendResponse({job: null});
        }
    }
    
    return true; // Keep message channel open for async response
});

function extractJobData() {
    // Check if we're actually looking at a job
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('currentJobId')) {
        console.log("Not viewing a specific job");
        return null;
    }
    
    const titleElement = document.querySelector('[class*="job-details-jobs-unified-top-card__job-title"]');
    const companyElement = document.querySelector('[class*="job-details-jobs-unified-top-card__company-name"]');
    
    console.log('title:', titleElement, 'company:', companyElement);
    
    if (!titleElement || !companyElement) {
        console.log("Job elements not found");
        return null;
    }
    
    return {
        company: companyElement.textContent.trim(),
        position: titleElement.textContent.trim(),
        link: window.location.href
    };
}