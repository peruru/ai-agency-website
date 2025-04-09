export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center mr-3">
                <i className="fas fa-robot text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold">Advaya.ai</h3>
            </div>
            <p className="text-gray-400">Empowering businesses with intelligent AI solutions since 2023.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">AI Strategy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Process Automation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Custom Solutions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">AI Training</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-advaya-primary transition">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-advaya-primary transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-advaya-primary transition">
                <i className="fab fa-github"></i>
              </a>
            </div>
            <p className="text-gray-400">hello@advaya.ai</p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2023 Advaya.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}