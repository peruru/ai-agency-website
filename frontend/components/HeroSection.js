import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/HeroSection.module.css';

export default function HeroSection() {
  // State management for form inputs and UI states
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [url, setUrl] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [urlError, setUrlError] = useState('');

  // Validate URL format using regex
  const isUrlValid = (userInput) => {
    const regexQuery = "^(https?:\\/\\/)?((([-a-z0-9]{1,63}\\.)*?[a-z0-9]([-a-z0-9]{0,253}[a-z0-9])?\\.[a-z]{2,63})|((\\d{1,3}\\.){3}\\d{1,3}))(:\\d{1,5})?((\\/|\\?)((%[0-9a-f]{2})|[-\\w\\+\\.\\?\\/@~#&=])*)?$";
    const url = new RegExp(regexQuery,"i");
    return url.test(userInput);
  };

  // Handle URL input changes and validation
  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    if (inputUrl && !isUrlValid(inputUrl)) {
      setUrlError('Please enter a valid URL (e.g., https://example.com)');
    } else {
      setUrlError('');
    }
  };

  // Enable button only if URL is valid and user has authorized
  const isButtonEnabled = isUrlValid(url) && isAuthorized;

  // Handle the analysis process when button is clicked
  const handleAnalyze = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setAnalysisResult('');
    
    try {
      // Make API call to backend for website analysis
      const response = await axios.post('http://localhost:5000/api/crawl', 
        { url },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          withCredentials: true
        }
      );
      // Combine all summaries from different pages with separators
      const summaries = response.data.results.map(result => result.summary).join('\n\n---\n\n');
      setAnalysisResult(summaries);
    } catch (error) {
      console.error('Error:', error);
      // Handle different types of errors with user-friendly messages
      if (error.message === 'Network Error') {
        setAnalysisResult('CORS Error: Unable to connect to the server. Please check if CORS is enabled on the backend.');
      } else {
        setAnalysisResult(`Failed to analyze the website: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-indigo-600 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Advaya.ai - AI Consulting</h1>
        <p className="text-xl md:text-2xl mb-10 text-center">We help you achieve your AI goals for improved productivity.</p>
        
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="mb-4">
            <label htmlFor="companyUrl" className="block text-gray-700 text-left font-medium mb-2">My company URL</label>
            <div className="relative">
              <input 
                type="url" 
                id="companyUrl" 
                placeholder="https://example.com" 
                className={`w-full px-4 py-3 border ${
                  urlError ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black`}
                value={url}
                onChange={handleUrlChange}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
              </svg>
            </div>
            {urlError && (
              <p className="text-red-500 text-sm mt-1">{urlError}</p>
            )}
          </div>
          
          <div className="flex items-center mb-6">
            <input 
              type="checkbox" 
              id="authorizeCheckbox" 
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              checked={isAuthorized}
              onChange={(e) => setIsAuthorized(e.target.checked)}
            />
            <label htmlFor="authorizeCheckbox" className="ml-2 text-gray-700">
              I authorize Advaya.ai to analyze my company website
            </label>
          </div>
          
          <button 
            onClick={handleAnalyze}
            className={`w-full ${
              isButtonEnabled ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
            } text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center`}
            disabled={!isButtonEnabled}
          >
            Analyze my business for AI
          </button>
          
          {isLoading && (
            <div className="mt-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-700">Analyzing your website...</span>
              </div>
            </div>
          )}
          
          {/* Display analysis results in sections */}
          {analysisResult && (
            <div className="result-box show bg-gray-50 rounded-lg p-4 mt-4">
              <div className="text-gray-700 text-left">
                {/* Display first 15 lines of the analysis */}
                <ReactMarkdown>
                  {analysisResult.split('\n').slice(0, 15).join('\n')}
                </ReactMarkdown>
                {/* Display lines 15-23 in lighter gray */}
                <div className="text-gray-400">
                  <ReactMarkdown>
                    {analysisResult.split('\n').slice(15, 23).join('\n')}
                  </ReactMarkdown>
                </div>
                {/* Full text display removed to avoid redundancy */}
                <div className="bg-gray-100 p-3 rounded-md mt-3">
                  <p className="text-gray-600 text-sm">For detailed analysis and insights...</p>
                </div>
                {/* Contact button */}
                <button 
                  className="mt-3 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
                  onClick={() => window.location.href = 'mailto:contact@advaya.ai'}
                >
                  To know more contact us
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}