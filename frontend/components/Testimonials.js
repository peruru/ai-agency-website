export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Our Clients Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <i className="fas fa-user text-gray-500"></i>
              </div>
              <div>
                <h4 className="font-semibold">Sarah Johnson</h4>
                <p className="text-sm text-gray-500">CEO, TechSolutions Inc.</p>
              </div>
            </div>
            <p className="text-gray-600">"Advaya.ai transformed our customer service operations with their AI chatbot solution, reducing response times by 70%."</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <i className="fas fa-user text-gray-500"></i>
              </div>
              <div>
                <h4 className="font-semibold">Michael Chen</h4>
                <p className="text-sm text-gray-500">CTO, RetailGenius</p>
              </div>
            </div>
            <p className="text-gray-600">"Their predictive analytics platform helped us optimize inventory management, saving us over $200k annually."</p>
          </div>
        </div>
      </div>
    </section>
  );
}