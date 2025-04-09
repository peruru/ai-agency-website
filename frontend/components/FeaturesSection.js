export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our AI Consulting Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300">
            <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-brain text-white text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">AI Strategy Development</h3>
            <p className="text-gray-600">We help you create a comprehensive AI roadmap aligned with your business objectives.</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300">
            <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-chart-line text-white text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Process Automation</h3>
            <p className="text-gray-600">Identify and automate repetitive tasks to boost efficiency and reduce operational costs.</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300">
            <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-users-cog text-white text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Custom AI Solutions</h3>
            <p className="text-gray-600">Tailored AI implementations designed specifically for your unique business needs.</p>
          </div>
        </div>
      </div>
    </section>
  );
}