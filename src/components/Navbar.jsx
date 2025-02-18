function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Branding - Shifted Right by 3px on Mobile */}
          <div className="flex items-center ml-[50px] sm:ml-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              AgriTech Support System
            </h1>
          </div>

          {/* User Avatar - Responsive Size */}
          <div className="flex items-center">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-xs sm:text-sm font-medium">
                US
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
