// Import required dependencies
const express = require('express');
const axios = require('axios');     // For making HTTP requests
const cheerio = require('cheerio'); // For parsing HTML
const { URL } = require('url');     // For URL parsing
const fs = require('fs').promises;  // For file operations
const path = require('path');       // For handling file paths
const cors = require('cors');       // Add this line for CORS
const pino = require('pino');
require('dotenv').config();         // Load environment variables

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

// Initialize Express app
const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true
}));
app.use(express.json());           // Middleware to parse JSON requests

// Configuration for DeepSeek AI API
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEFAULT_MAX_PAGES = parseInt(process.env.DEFAULT_MAX_PAGES) || 2; // Add this line
const visited = new Set();         // Track visited URLs to avoid duplicates

// Timing utility for tracking process times
let lastTimestamp = null;
let startTimestamp = null;

function logWithTime(message) {
    const now = Date.now();
    if (!startTimestamp) {
        startTimestamp = now;
        lastTimestamp = now;
        logger.info(message);
    } else {
        const timeSinceLast = (now - lastTimestamp) / 1000;
        logger.info(`(${timeSinceLast.toFixed(2)}s since last) ${message}`);
        lastTimestamp = now;
    }
}

function logCompletion() {
    const now = Date.now();
    const totalTime = (now - startTimestamp) / 1000;
    logger.info(`Process completed in ${totalTime.toFixed(2)} seconds`);
    lastTimestamp = null;
    startTimestamp = null;
}

// Function to extract internal links from a webpage
async function getInternalLinks(url, baseUrl) {
    const links = new Set();
    try {
        // Fetch webpage content
        const response = await axios.get(url, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        const baseDomain = new URL(baseUrl).hostname;

        // Find all <a> tags and process their href attributes
        $('a[href]').each((_, element) => {
            const href = $(element).attr('href');
            // Skip invalid or special links
            if (!href || href.startsWith(('javascript:')) || href.startsWith('mailto:') || 
                href.startsWith('tel:') || href.startsWith('#')) {
                return;
            }

            // Process only internal links from same domain
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

// Function to extract text content from a webpage
async function getTextFromUrl(url) {
    try {
        const response = await axios.get(url, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        // Remove non-content elements
        $('script, style, nav, footer, header').remove();
        return $.text().replace(/\s+/g, ' ').trim();
    } catch (error) {
        logger.error({ url, error: error.message }, 'Error reading URL');
        return "";
    }
}

// Function to generate AI summary using DeepSeek API
async function summarizeWithDeepseek(text) {
    // Construct prompt for AI analysis
    const prompt = `Summarize Business details from this website content:\n\n${text.slice(0, 3000)} \n\n 
    Rules: 1. Do not ask leading questions. \n\n
    2. Do not assume anything outside the content. \n\n
    3. Do not repeat the content. \n\n
    4. Ignore team details. \n\n
    5. Ignore recruitment details. \n\n
    6. Ignore press releases. \n\n
    7. Ignore Testimonials. \n\n
    
    From the generated summary identify the following: \n\n
    1. Touch points for implementing AI/ML.  Explain atleast in two sentences what the AI touch point means to business. \n\n
    2. AI implementation plan for each touch point identified.  Include example of similar implementation.\n\n
    
    Response: \n\n
    1. Business Summary: \n\n
    2. AI Touch points: \n\n
    3. AI Implementation Strategy: \n\n`;

    try {
        logger.info('Generating summary with DeepSeek AI');
        // Call DeepSeek API for text summarization
        const response = await axios.post(DEEPSEEK_API_URL, {
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 512
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
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

// Main crawling function
async function crawlAndSummarize(startUrl, maxPages = 10) {
    const toVisit = [startUrl];
    const summaries = [];
    visited.clear();
    
    // Reset timing for new crawl process
    startTimestamp = null;
    lastTimestamp = null;
    
    logWithTime(`Starting crawl process from ${startUrl} with max ${maxPages} pages`);

    // Crawl pages until max limit reached
    while (toVisit.length && visited.size < maxPages) {
        const url = toVisit.shift();
        if (visited.has(url)) continue;
        visited.add(url);

        logWithTime(`Crawling: ${url} (${visited.size}/${maxPages})`);
        const pageText = await getTextFromUrl(url);

        // Generate summary for pages with sufficient content
        if (pageText.length > 100) {
            const summary = await summarizeWithDeepseek(pageText);
            summaries.push({ url, summary });
            logWithTime(`Added summary for ${url}`);
        } else {
            logWithTime(`Skipping summary for ${url} (insufficient content)`);
        }

        // Add new unvisited links to the queue
        const newLinks = await getInternalLinks(url, startUrl);
        const addedLinks = [...newLinks].filter(link => !visited.has(link));
        toVisit.push(...addedLinks);
        logWithTime(`Found ${newLinks.size} links, added ${addedLinks.length} new links to queue`);
    }

    logWithTime(`Crawling completed. Processed ${visited.size} pages, generated ${summaries.length} summaries`);
    return summaries;
}

// API endpoint to start crawling
app.post('/api/crawl', async (req, res) => {
    try {
        const { url, maxPages } = req.body;
        if (!url) {
            logger.warn('URL is required but not provided');
            return res.status(400).json({ error: 'URL is required' });
        }
        
        logger.info({ url, maxPages, defaultMaxPages: DEFAULT_MAX_PAGES }, 'Received crawl request');
        
        // Extract domain name for the summary file
        const domain = new URL(url).hostname.replace(/^www\./, '');
        const summaryFileName = `${domain}-summary.md`;
        
        // Start crawling process (removed duplicate declaration)
        const results = await crawlAndSummarize(url, maxPages || DEFAULT_MAX_PAGES);
        
        // Format results as markdown
        logWithTime(`Formatting results and saving to file ${summaryFileName}`);
        const markdown = results.map(({ url, summary }) => 
            `🔗 URL: ${url}\n\n${summary}\n\n${'-'.repeat(60)}\n\n`
        ).join('');
        
        // Save results to file with domain name
        await fs.writeFile(summaryFileName, markdown, 'utf-8');
        
        logWithTime(`Results saved to ${summaryFileName}`);
        logCompletion();
        
        res.json({ 
            results, 
            message: `Crawling completed and results saved to ${summaryFileName}`,
            stats: {
                pagesVisited: visited.size,
                summariesGenerated: results.length,
                totalTime: ((Date.now() - startTimestamp) / 1000).toFixed(2) + 's'
            }
        });
    } catch (error) {
        logger.error({ error: error.message }, 'Error in crawl process');
        logCompletion();
        res.status(500).json({ error: error.message });
    }
});

// Update server start logging
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});