import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Advaya.ai - AI Consulting</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    advaya: {
                      primary: '#4F46E5',
                      dark: '#312E81',
                      light: '#C7D2FE'
                    }
                  }
                }
              }
            };
          `
        }} />
        <style jsx>{`
          .gradient-bg {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          }
          .result-box {
            transition: all 0.3s ease;
            max-height: 0;
            overflow: hidden;
          }
          .result-box.show {
            max-height: 1000px;
            margin-top: 1.5rem;
          }
          .loading-spinner {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Head>
      <div className="font-sans bg-gray-50">
        {children}
      </div>
    </>
  );
}