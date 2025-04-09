export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center mr-3">
            <i className="fas fa-robot text-white text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Advaya.ai</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">I am interested. Contact me @ :</span>
            <div className="relative">
              <input type="email" placeholder="Email" className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-advaya-primary focus:border-transparent text-black" />
              <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
            </div>
            <div className="relative">
              <input type="tel" placeholder="Phone number" className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-advaya-primary focus:border-transparent text-black" />
              <i className="fas fa-phone absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>
        </div>
        
        <button className="md:hidden text-gray-600">
          <i className="fas fa-bars text-2xl"></i>
        </button>
      </div>
    </header>
  );
}