const express = require('express');
const { URL } = require('url');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const {
    crawlAndSummarize,
    formatBusinessSummary,
    timing,
    logger,
    collectInternalUrls,    // Add this
    filterNonEssentialLinks // Add this
} = require('./utils/crawler');

// Initialize Express app
const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const DEFAULT_MAX_PAGES = parseInt(process.env.DEFAULT_MAX_PAGES) || 2;

// API endpoints
app.post('/api/crawl', async (req, res) => {
    try {
        const { url, maxPagesFromRequest } = req.body;
        const clientIp = req.ip || req.connection.remoteAddress;

        if (!url) {
            logger.warn('URL is required but not provided');
            return res.status(400).json({ error: 'URL is required' });
        }

        // Create reports directories
        const sampleReportsPath = process.env.SAMPLE_REPORTS_PATH;
        const fullReportsPath = process.env.FULL_REPORTS_PATH;
        await Promise.all([
            fs.mkdir(sampleReportsPath, { recursive: true }),
            fs.mkdir(fullReportsPath, { recursive: true })
        ]);

        const domain = new URL(url).hostname.replace(/^www\./, '');
        let reportsPath = sampleReportsPath;
        let maxPages = DEFAULT_MAX_PAGES;

        // Check existing records
        const { data: reports, error: queryError } = await supabase
            .from('ai_reports')
            .select('status')
            .eq('domain', domain);

        if (queryError) {
            logger.error({ error: queryError.message }, 'Database query error');
            throw new Error('Database query failed');
        }

        if (reports?.length > 0) {
            const existingReport = reports[0];
            if (existingReport.status === 'SAMPLE_GENERATED') {
                return res.json({
                    status: 'exists',
                    message: 'AI sample report was already generated, contact support for a copy'
                });
            } else if (['FULL_REP_GENERATED', 'PURCHASED'].includes(existingReport.status)) {
                return res.json({
                    status: 'exists',
                    message: 'AI Full Report already generated, contact support for a copy'
                });
            } else if (existingReport.status !== 'INITIATED') {
                return res.json({
                    status: 'error',
                    message: 'There is issue with report genration, please contact support'
                });
            }
        } else {
            const { error: insertError } = await supabase
                .from('ai_reports')
                .insert([{
                    url,
                    domain,
                    ip_address: clientIp,
                    status: 'INITIATED'
                }]);
            maxPages = 4;

            if (insertError) {
                logger.error({ error: insertError.message }, 'Database insert error');
                throw new Error('Failed to create report record');
            }
        }

        // Generate report
        const summaryFileName = path.join(reportsPath, `${domain}-summary.md`);
        const results = await crawlAndSummarize(url, maxPages, process.env.DEEPSEEK_API_KEY);

        let synopsis = `<span style="color:#0096FF; font-size:2em;">Synopsis</span> 

<span style="color:white; background:black; font-size:1.5em;"> Advaya AI</span> is an AI consulting firm that partners with companies to help them identify and implement AI solutions to eliminate redundancies, improve efficiencies and streamline operations creating a positive impact on end customer satisfaction.

The enclosed summary is Advaya AI's findings based purely on the information available on your website ${url}. For a detailed analysis and recommendations, please reach out to us @ - shachindra@advaya.ai or suneel@advaya.ai`;

        const markdown = `${synopsis}\n\n---\n\n` + results.map(({ url, summary }) => 
            `🔗 URL: ${url}\n\n${summary}\n\n${'-'.repeat(60)}\n\n`
        ).join('');

        const formattedMarkdown = await formatBusinessSummary(markdown, domain);
        await fs.writeFile(summaryFileName, formattedMarkdown, 'utf-8');

        // Update record status
        const { error: updateError } = await supabase
            .from('ai_reports')
            .update({ 
                status: 'SAMPLE_GENERATED',
                sample_rep_path: summaryFileName
            })
            .eq('domain', domain);

        if (updateError) {
            logger.error({ error: updateError.message }, 'Failed to update report status');
            throw new Error('Failed to update report status');
        }

        res.json({ 
            results, 
            message: `Crawling completed and results saved to ${summaryFileName}`,
            stats: {
                pagesVisited: results.length,
                summariesGenerated: results.length,
                totalTime: ((Date.now() - timing.getStartTimestamp()) / 1000).toFixed(2) + 's'
            }
        });
    } catch (error) {
        logger.error({ error: error.message }, 'Error in crawl process');
        timing.logCompletion();
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/format-markdown', async (req, res) => {
    try {
        const { filePath, domain } = req.body;

        if (!filePath || !domain) {
            return res.status(400).json({ 
                error: 'File path and domain are required' 
            });
        }

        const markdown = await fs.readFile(filePath, 'utf-8');
        const formattedMarkdown = await formatBusinessSummary(markdown, domain);
        
        res.json({ 
            success: true,
            formattedContent: formattedMarkdown
        });
    } catch (error) {
        logger.error({ error: error.message }, 'Error formatting markdown');
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/analyze-urls', async (req, res) => {
    try {
        const { url, depth = 3 } = req.body;

        if (!url) {
            logger.warn('URL is required but not provided');
            return res.status(400).json({ error: 'URL is required' });
        }

        // Collect all internal URLs
        timing.logWithTime(`Starting URL analysis for ${url}`);
        const allUrls = await collectInternalUrls(url, depth);
        timing.logWithTime(`Found ${allUrls.size} internal URLs`);

        // Filter out non-essential URLs
        const businessUrls = await filterNonEssentialLinks(allUrls);
        timing.logWithTime(`Filtered to ${businessUrls.size} business-relevant URLs`);

        res.json({
            totalUrls: allUrls.size,
            businessUrls: Array.from(businessUrls),
            stats: {
                originalCount: allUrls.size,
                filteredCount: businessUrls.size,
                processingTime: ((Date.now() - timing.getStartTimestamp()) / 1000).toFixed(2) + 's'
            }
        });

    } catch (error) {
        logger.error({ error: error.message }, 'Error analyzing URLs');
        timing.logCompletion();
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});