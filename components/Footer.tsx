export default function Footer() {
  return (
    <footer className="bg-pink-100 p-8 mt-8 shadow-inner">
      <div className="container mx-auto text-center text-pink-600">
        <p>&copy; {new Date().getFullYear()} Flowershop. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-4">
          <a href="#" className="hover:text-pink-800 transition-colors duration-200">Privacy Policy</a>
          <a href="#" className="hover:text-pink-800 transition-colors duration-200">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
