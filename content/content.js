console.log("Content script loaded on:", window.location.href);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', extractJobData);
}
else {
    extractJobData();
}

function extractJobData() {
    const titleElement = document.querySelector('[class*="job-details-jobs-unified-top-card__job-title"] a');
    
    const companyElement = document.querySelector('[class*="job-details-jobs-unified-top-card__company-name"] a');

    const link = window.location.href;

    if (titleElement && companyElement) {
        const position_title = titleElement.textContent.trim();
        const company_name = companyElement.textContent.trim();

        const job = {
            id: Date.now(),
            company: company_name,
            position: position_title,
            link: link,
            status: 'Not Applied',
            notes: '',
            dateAdded: new Date().toISOString()
        }

        console.log('Detected job:', job);
    } else {
        console.log('Job elements not found. Title element:', titleElement, 'Company element:', companyElement);
    }
}