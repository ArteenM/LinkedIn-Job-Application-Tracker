// Background script to handle tab changes and update current job data

// Function to check if a tab is a job page and extract data
function updateCurrentJob(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
            console.log("Error getting tab:", chrome.runtime.lastError);
            return;
        }

        const url = tab.url;
        if ((url && url.includes('linkedin.com/jobs')) || 
            (url && url.includes('indeed.com'))) {
            
            // Send message to content script to get job data
            chrome.tabs.sendMessage(tabId, {action: "getJobData"}, (response) => {
                if (chrome.runtime.lastError) {
                    console.log("Error sending message:", chrome.runtime.lastError.message);
                    return;
                }
                
                if (response && response.job) {
                    // Store the current job data
                    chrome.storage.local.set({currentJob: response.job}, () => {
                        console.log("Updated current job:", response.job);
                    });
                } else {
                    // Clear current job if not on a job page
                    chrome.storage.local.remove('currentJob', () => {
                        console.log("Cleared current job");
                    });
                }
            });
        } else {
            // Clear current job if not on a job page
            chrome.storage.local.remove('currentJob', () => {
                console.log("Cleared current job");
            });
        }
    });
}

// Listen for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
    updateCurrentJob(activeInfo.tabId);
});

// Listen for tab updates (e.g., navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        updateCurrentJob(tabId);
    }
});