const { 
    collectInternalUrls, 
    filterNonEssentialLinks, 
    getTextFromUrl,
    summarizeWithDeepseek,
    formatBusinessSummary,  // Add this import
    timing,
    logger 
} = require('../utils/crawler');
const { URL } = require('url');
const path = require('path');
const fs = require('fs').promises;

async function generateAiFromUrl(url, apiKey) {
    try {
        // Step 1: Collect all internal URLs
        timing.logWithTime('Collecting internal URLs');
        const allUrls = await collectInternalUrls(url, 1);
        timing.logWithTime(`Found ${allUrls.size} internal URLs`);

        // Step 2: Filter non-essential URLs
        timing.logWithTime('Filtering non-essential URLs');
        const allUrlsArray = Array.from(allUrls);
        const businessUrls = await filterNonEssentialLinks(allUrls);
        const removedLinks = allUrlsArray.filter(link => !businessUrls.has(link));
        timing.logWithTime(`Filtered to ${businessUrls.size} business-relevant URLs`);

        // Step 3 & 4: Get text and generate summaries for each URL
        const summaries = [];
        let i = 0; // Initialize the counter her
        for (const currentUrl of businessUrls) {
            //if (i>1) break;
            i++; // Increment the counter here
            try {
                timing.logWithTime(`Processing ${currentUrl}`);
                
                // Get text content using the correct function name
                const text = await getTextFromUrl(currentUrl);
                
                if (text.length > 100) {
                    // Generate summary
                    const summary = await summarizeWithDeepseek(text, apiKey);
                    summaries.push({
                        url: currentUrl,
                        summary
                    });
                    timing.logWithTime(`Generated summary for ${currentUrl}`);
                } else {
                    logger.warn(`Skipping ${currentUrl} - insufficient content`);
                }
            } catch (error) {
                logger.error({ url: currentUrl, error: error.message }, 'Error processing URL');
            }
        }

        timing.logWithTime(`Completed processing ${summaries.length} URLs`);
        
        // Format the summaries
        const domain = new URL(url).hostname;
        let formattedContent = '';
        
        // Add synopsis at the beginning
        let synopsis = `<span style="color:#0096FF; font-size:2em;">Synopsis</span> 

<span style="color:white; background:black; font-size:1.5em;"> Advaya AI</span> is an AI consulting firm that partners with companies to help them identify and implement AI solutions to eliminate redundancies, improve efficiencies and streamline operations creating a positive impact on end customer satisfaction.

The enclosed summary is Advaya AI's findings based purely on the information available on your website ${url}. For a detailed analysis and recommendations, please reach out to us @ - shachindra@advaya.ai or suneel@advaya.ai

---

`;

        formattedContent = synopsis;
        for (const { url, summary } of summaries) {
            formattedContent += `URL: ${url}\n\n${summary}\n\n---\n\n`;
        }
        
        // Format the business summary
        const finalSummary = await formatBusinessSummary(formattedContent, domain);

        // Add removed links section to the summary
        let finalContentWithRemovedLinks = finalSummary;
        if (removedLinks.length > 0) {
            finalContentWithRemovedLinks += '\n\n## Non-Essential Links Filtered\n\n';
            finalContentWithRemovedLinks += 'The following links were identified as non-essential and excluded from analysis:\n\n';
            removedLinks.forEach(link => {
                finalContentWithRemovedLinks += `- ${link}\n`;
            });
        }
        
        // Save to file
        const fileName = `${domain}-summary.md`;
        const filePath = path.join(process.env.SAMPLE_REPORTS_PATH, fileName);
        await fs.writeFile(filePath, finalContentWithRemovedLinks, 'utf-8');
        
        timing.logWithTime(`Saved summary to ${filePath}`);
        return summaries;
    } catch (error) {
        logger.error({ error: error.message }, 'Error in generateAiFromUrl');
        throw error;
    }
}

module.exports = {
    generateAiFromUrl
};