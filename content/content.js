console.log("Content script loaded", window.location.href);

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getJobData") {
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
            extractIndeedJobDataAsync(sendResponse);
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

function extractIndeedJobDataAsync(sendResponse) {
    console.log("Waiting for Indeed job data...");

    const observer = new MutationObserver(() => {
        const titleElement = document.querySelector(
            'h2.jobsearch-JobInfoHeader-title'
        );
        const companyElement = document.querySelector(
            'span.css-qcqa6h'
        );

        if (
            titleElement &&
            titleElement.textContent.trim() &&
            companyElement &&
            companyElement.textContent.trim()
        ) {
            observer.disconnect();

            console.log("Indeed job data found");

            sendResponse({
                job: {
                    position: titleElement.textContent.trim(),
                    company: companyElement.textContent.trim(),
                    link: window.location.href
                }
            });
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Safety timeout so popup doesn't hang forever
    setTimeout(() => {
        observer.disconnect();
        sendResponse({ job: null });
    }, 4000);
}
