console.log("Content script loaded", window.location.href);

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getJobData") {
        console.log("Popup requested job data, extracting...");
        // Check which link it game from
        if (window.location.href.includes('linkedin.com')) {
            const jobData = extractLinkedInJobData();
            if (jobData) {
                sendResponse({job: jobData});
            } else {
                sendResponse({job: null});
            }
            return true; // Keep message channel open for async response
        }

        if (window.location.href.includes('indeed.com')) {
            const jobData = extractIndeedJobData();
            if (jobData) {
                sendResponse({job: jobData});
            } else {
                sendResponse({job: null});
            }
            return true; // Keep message channel open for async response
        }
    }
});

function extractLinkedInJobData() {
    // Check if we're actually looking at a job
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('currentJobId')) {
        console.log("Not viewing a specific job");
        return null;
    }

    // Try multiple selectors for job title
    const titleElement = document.querySelector('[class*="job-details-jobs-unified-top-card__job-title"]')

    // Try multiple selectors for company name
    const companyElement = document.querySelector('[class*="job-details-jobs-unified-top-card__company-name"]')


    if (!titleElement && !companyElement) {
        console.log("Job elements not found");
        return null;
    }

    return {
        company: companyElement ? companyElement.textContent.trim() : '',
        position: titleElement ? titleElement.textContent.trim() : '',
        link: window.location.href
    };
}

function extractIndeedJobData() {
    console.log("Extracting Indeed job data");
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('vjk')) {
        console.log("Not viewing a specific job on Indeed");
        return null;
    }

    const titleElement = document.querySelector('h2.jobsearch-JobInfoHeader-title');
    const companyElement = document.querySelector('span.css-qcqa6h');

    console.log('titleElement', titleElement.textContent.trim(), 'companyElement', companyElement.textContent.trim());

    if (!titleElement && !companyElement) {
        console.log("Indeed job elements not found");
        return null;
    }

    return {
        company: companyElement ? companyElement.textContent.trim() : '',
        position: titleElement ? titleElement.textContent.trim() : '',
        link: window.location.href
    };
}