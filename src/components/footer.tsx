import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4 mt-12 h-">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-gray-400 mb-4">
          Made with sagar for the Nepalese market
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <Link href="/" className="hover:text-blue-400 transition">
            Home
          </Link>
          <Link href="/orders" className="hover:text-blue-400 transition">
            Orders
          </Link>
          <Link href="/help" className="hover:text-blue-400 transition">
            Help
          </Link>
          <Link href="/contact" className="hover:text-blue-400 transition">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
