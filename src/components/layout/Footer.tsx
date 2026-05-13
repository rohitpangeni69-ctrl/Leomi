export function Footer() {
  return (
    <footer className="bg-gray-50 border-t py-12 mt-auto">
      <div className="container max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">LEOMI</h3>
          <p className="text-sm text-gray-500">Nepal's premier fashion & lifestyle marketplace.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black">New Arrivals</a></li>
            <li><a href="#" className="hover:text-black">Trending Now</a></li>
            <li><a href="#" className="hover:text-black">Men's Collection</a></li>
            <li><a href="#" className="hover:text-black">Women's Collection</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Help</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black">Track Order</a></li>
            <li><a href="#" className="hover:text-black">Returns & Exchanges</a></li>
            <li><a href="#" className="hover:text-black">Shipping Info</a></li>
            <li><a href="#" className="hover:text-black">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-black">Terms of Service</a></li>
            <li><a href="#" className="hover:text-black">Vendor Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t mt-12 pt-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Leomi E-commerce. All rights reserved.
      </div>
    </footer>
  );
}
