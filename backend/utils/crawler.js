const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const fs = require('fs').promises;
const path = require('path');
const pino = require('pino');
const { log } = require('console');

// Configure Pino logger
const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    }
});

// Timing utility
let lastTimestamp = null;
let startTimestamp = null;
const visited = new Set();

// Export timing variables along with their utility functions
const timing = {
    startTimestamp: null,
    lastTimestamp: null,
    
    logWithTime(message) {
        const now = Date.now();
        if (!this.startTimestamp) {
            this.startTimestamp = now;
            this.lastTimestamp = now;
            logger.info(message);
        } else {
            const timeSinceLast = (now - this.lastTimestamp) / 1000;
            logger.info(`(${timeSinceLast.toFixed(2)}s since last) ${message}`);
            this.lastTimestamp = now;
        }
    },

    logCompletion() {
        const now = Date.now();
        const totalTime = (now - this.startTimestamp) / 1000;
        logger.info(`Process completed in ${totalTime.toFixed(2)} seconds`);
        this.lastTimestamp = null;
        this.startTimestamp = null;
        return totalTime;
    },

    getStartTimestamp() {
        return this.startTimestamp;
    }
};

// Add this function after other utility functions
async function filterNonEssentialLinks(links) {
    const linksArray = Array.from(links);
    logger.info({ links: linksArray }, 'Input links for filtering');
    
    const prompt = `You are a URL filter. Given a list of URLs, remove any that represent frequently asked questions (faq), news, newsroom, investors corner, Testimonials, team, leadership, management,contact, case studies, resources, facilities,about, company profile,webinars, blogs, events, gallery,partnerships,sustainability,policies, or careers pages.

Input URLs:
${linksArray.join('\n')}

Return only a JSON array of filtered URLs. Do not include any markdown formatting, explanation, or additional text. Example:
["http://example.com/service","http://example.com/products"]`;

    try {
        logger.info('Filtering non-essential links with DeepSeek AI');
        const response = await axios.post(process.env.DEEPSEEK_URL, {
            model: process.env.DEEPSEEK_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 512
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Clean and parse the response
        const content = response.data.choices[0].message.content.trim();
        const jsonContent = content.replace(/^```json\n|\n```$/g, '').trim();
        logger.info({ response: content }, 'Raw response from DeepSeek');
        
        const filteredLinks = JSON.parse(jsonContent);
        logger.info({ filteredLinks }, 'Filtered links from DeepSeek');
        
        // Log removed links
        const removedLinks = linksArray.filter(link => !filteredLinks.includes(link));
        logger.info({ removedLinks }, 'Links removed by DeepSeek');
        
        logger.info(`Filtered ${links.size - filteredLinks.length} non-essential links`);
        return new Set(filteredLinks);
    } catch (error) {
        logger.error({ error: error.message }, 'Error filtering links with DeepSeek AI');
        return links;
    }
}

// Update module exports
// Remove or comment out the first export
// module.exports = {
//     crawlAndSummarize,
//     formatBusinessSummary,
//     timing,
//     logger,
//     filterNonEssentialLinks // Remove this duplicate export
// };

// Keep only the final export at the bottom of the file
module.exports = {
    crawlAndSummarize,
    formatBusinessSummary,
    timing,
    logger,
    filterNonEssentialLinks,
    collectInternalUrls,
    getTextFromUrl,
    summarizeWithDeepseek
};

async function formatBusinessSummary(markdown, domain) {
    const lines = markdown.split('\n');
    const formattedLines = lines.map((line, currentIndex) => {
        if (line.includes('Business Summary:')) {
            const urlIndex = currentIndex - 2;
            console.log('Index of business summary: ', currentIndex);
            
            if (urlIndex >= 0) {
                const urlLine = lines[urlIndex];
                const urlMatch = urlLine.match(/URL: (.+)/);
                if (urlMatch) {
                    const url = urlMatch[1];
                    const pathParts = new URL(url).pathname.split('/').filter(Boolean);
                    const lastPart = pathParts[pathParts.length - 1] || 'home';
                    return `### **${domain.toUpperCase()} - ${lastPart.replace(/-/g, ' ').toUpperCase()}:**`;
                }
            }
        }
        return line;
    });
    
    const formattedContent = formattedLines.join('\n');
    const tempPath = path.join(__dirname, 'temp.md');
    await fs.writeFile(tempPath, formattedContent, 'utf-8');
    
    return formattedContent;
}

async function getInternalLinks(url, baseUrl) {
    const links = new Set();
    try {
        const response = await axios.get(url, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        const baseDomain = new URL(baseUrl).hostname;

        $('a[href]').each((_, element) => {
            const href = $(element).attr('href');
            if (!href || href.startsWith(('javascript:')) || href.startsWith('mailto:') || 
                href.startsWith('tel:') || href.startsWith('#')) {
                return;
            }

            const fullUrl = new URL(href, baseUrl);
            if (fullUrl.hostname === baseDomain && 
                ['http:', 'https:'].includes(fullUrl.protocol) &&
                !['.pdf', '.jpg', '.png', '.gif'].some(ext => fullUrl.pathname.toLowerCase().includes(ext))) {
                
                const cleanUrl = `${fullUrl.protocol}//${fullUrl.hostname}${fullUrl.pathname}`;
                links.add(cleanUrl.replace(/\/$/, ''));
            }
        });
    } catch (error) {
        logger.error({ url, error: error.message }, 'Error fetching links');
    }
    return links;
}

async function getTextFromUrl(url) {
    try {
        const response = await axios.get(url, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        $('script, style, nav, footer, header').remove();
        return $.text().replace(/\s+/g, ' ').trim();
    } catch (error) {
        logger.error({ url, error: error.message }, 'Error reading URL');
        return "";
    }
}

async function summarizeWithDeepseek(text, apiKey) {
    const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
    const prompt = `Summarize Business details from this website content:\n\n${text.slice(0, 3000)} \n\n 
    Rules: 1. Do not ask leading questions. \n\n
    2. Do not assume anything outside the content. \n\n
    3. Do not repeat the content. \n\n
    4. Ignore team details. \n\n
    5. Ignore recruitment details. \n\n
    6. Ignore press releases. \n\n
    7. Ignore Testimonials. \n\n
    8. Do not generate line breaks. \n\n
    9. Do not include numbers in any heading level. \n\n
    
    From the generated summary identify the following: \n\n
    1. Touch points for implementing AI/ML.  Explain atleast in two sentences what the AI touch point means to business. \n\n
    2. AI implementation plan for each touch point identified.  Include example of similar implementation.\n\n
    
    Response: \n\n
    1. Business Summary: \n\n
    2. AI Touch points: \n\n
    3. AI Implementation Strategy: \n\n`;

    try {
        logger.info('Generating summary with DeepSeek AI');
        const response = await axios.post(DEEPSEEK_API_URL, {
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 512
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        logger.info('Summary generated successfully');
        return response.data.choices[0].message.content;
    } catch (error) {
        logger.error({ error: error.message }, 'Error calling DeepSeek API');
        return "Summary failed.";
    }
}

// Update crawlAndSummarize function to use timing object
async function crawlAndSummarize(startUrl, maxPages = 10, apiKey) {
    const toVisit = [startUrl];
    const summaries = [];
    visited.clear();
    
    timing.startTimestamp = null;
    timing.lastTimestamp = null;
    
    timing.logWithTime(`Starting crawl process from ${startUrl} with max ${maxPages} pages`);

    while (toVisit.length && visited.size < maxPages) {
        const url = toVisit.shift();
        if (visited.has(url)) continue;
        visited.add(url);

        timing.logWithTime(`Crawling: ${url} (${visited.size}/${maxPages})`);
        const pageText = await getTextFromUrl(url);

        if (pageText.length > 100) {
            const summary = await summarizeWithDeepseek(pageText, apiKey);
            summaries.push({ url, summary });
            timing.logWithTime(`Added summary for ${url}`);
        } else {
            timing.logWithTime(`Skipping summary for ${url} (insufficient content)`);
        }

        const newLinks = await getInternalLinks(url, startUrl);
        const addedLinks = [...newLinks].filter(link => !visited.has(link));
        toVisit.push(...addedLinks);
        timing.logWithTime(`Found ${newLinks.size} links, added ${addedLinks.length} new links to queue`);
    }

    timing.logWithTime(`Crawling completed. Processed ${visited.size} pages, generated ${summaries.length} summaries`);
    return summaries;
}

// Add this new function before module.exports
async function collectInternalUrls(startUrl, maxDepth = 3) {
    logger.info(`Starting URL collection from ${startUrl}, max depth: ${maxDepth}`);
    const allLinks = new Set();
    const toVisit = [[startUrl, 0]]; // [url, depth] pairs
    const visited = new Set();
    const baseDomain = new URL(startUrl).hostname;

    while (toVisit.length > 0) {
        const [currentUrl, depth] = toVisit.shift();
        
        if (visited.has(currentUrl) || depth >= maxDepth) continue;
        visited.add(currentUrl);

        try {
            const response = await axios.get(currentUrl, { timeout: 10000 });
            const $ = cheerio.load(response.data);

            $('a[href]').each((_, element) => {
                const href = $(element).attr('href');
                if (!href || href.startsWith('javascript:') || 
                    href.startsWith('mailto:') || 
                    href.startsWith('tel:') || 
                    href.startsWith('#')) {
                    return;
                }

                try {
                    const fullUrl = new URL(href, currentUrl);
                    if (fullUrl.hostname === baseDomain && 
                        ['http:', 'https:'].includes(fullUrl.protocol) &&
                        !['.pdf', '.jpg', '.png', '.gif'].some(ext => 
                            fullUrl.pathname.toLowerCase().includes(ext))) {
                        
                        const cleanUrl = `${fullUrl.protocol}//${fullUrl.hostname}${fullUrl.pathname}`
                            .replace(/\/$/, '');
                        
                        allLinks.add(cleanUrl);
                        if (!visited.has(cleanUrl)) {
                            toVisit.push([cleanUrl, depth + 1]);
                        }
                    }
                } catch (urlError) {
                    logger.error({ url: href, error: urlError.message }, 'Invalid URL');
                }
            });

            logger.info(`Collected ${allLinks.size} unique URLs from ${currentUrl} (depth: ${depth})`);
        } catch (error) {
            logger.error({ url: currentUrl, error: error.message }, 'Error fetching page');
        }
    }

    logger.info(`URL collection completed. Found ${allLinks.size} unique internal URLs`);
    return allLinks;
}