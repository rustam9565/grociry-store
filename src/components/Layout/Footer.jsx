import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-gray-300">

  {/* Newsletter */}
  <div className="border-b border-slate-800">
    <div className="container-padding py-10 flex flex-col lg:flex-row items-center justify-between gap-6">

      <div>
        <h3 className="text-2xl font-bold text-white">
          Stay Updated
        </h3>

        <p className="text-gray-400 mt-2">
          Get offers, discounts and fresh arrivals.
        </p>
      </div>

      <div className="flex w-full lg:w-auto gap-3">
        <input
          type="email"
          placeholder="Enter your email"
          className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white min-w-[300px]"
        />

        <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-medium transition">
          Subscribe
        </button>
      </div>

    </div>
  </div>

  {/* Main Footer */}
  <div className="container-padding py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

    <div>
      <h2 className="text-3xl font-bold text-white mb-4">
        GroceryStore
      </h2>

      <p className="text-gray-400 leading-relaxed">
        Fresh groceries, daily essentials, and fast delivery at your doorstep.
      </p>

      <div className="flex gap-3 mt-6">

        <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition">
          <i className="ri-facebook-fill"></i>
        </a>

        <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition">
          <i className="ri-instagram-line"></i>
        </a>

        <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition">
          <i className="ri-twitter-x-line"></i>
        </a>

      </div>
    </div>

    <div>
      <h3 className="text-white font-semibold mb-5">
        Quick Links
      </h3>

      <ul className="space-y-3">
        <li><Link to="/" className="hover:text-emerald-400 transition">Home</Link></li>
        <li><Link to="/products" className="hover:text-emerald-400 transition">Shop</Link></li>
        <li><Link to="/cart" className="hover:text-emerald-400 transition">Cart</Link></li>
        <li><Link to="/orders" className="hover:text-emerald-400 transition">Orders</Link></li>
      </ul>
    </div>

    <div>
      <h3 className="text-white font-semibold mb-5">
        Categories
      </h3>

      <ul className="space-y-3">
        <ul className="space-y-3">
  <li>
    <Link
      to="/category/fruits"
      className="hover:text-emerald-400 transition"
    >
      🥭 Fruits
    </Link>
  </li>

  <li>
    <Link
      to="/category/vegetables"
      className="hover:text-emerald-400 transition"
    >
      🥬 Vegetables
    </Link>
  </li>

  <li>
    <Link
      to="/category/dairy"
      className="hover:text-emerald-400 transition"
    >
      🥛 Dairy
    </Link>
  </li>

  <li>
    <Link
      to="/category/meat"
      className="hover:text-emerald-400 transition"
    >
      🥩 Meat
    </Link>
  </li>

  <li>
    <Link
      to="/category/bakery"
      className="hover:text-emerald-400 transition"
    >
      🥖 Bakery
    </Link>
  </li>
</ul>
      </ul>
    </div>

    <div>
      <h3 className="text-white font-semibold mb-5">
        Contact
      </h3>

      <ul className="space-y-4 text-gray-400">
        <li><i className="ri-map-pin-line mr-2"></i>123 Main Street</li>
        <li><i className="ri-phone-line mr-2"></i>+1 234 567 890</li>
        <li><i className="ri-mail-line mr-2"></i>support@grocerystore.com</li>
      </ul>
    </div>

  </div>

  {/* Bottom */}
  <div className="border-t border-slate-800">
    <div className="container-padding py-6 flex flex-col md:flex-row justify-between items-center gap-4">

      <p className="text-gray-500 text-sm">
        © {new Date().getFullYear()} GroceryStore. All rights reserved.
      </p>

      <div className="flex gap-4 text-2xl text-gray-500">
        <i className="ri-visa-fill"></i>
        <i className="ri-mastercard-fill"></i>
        <i className="ri-paypal-fill"></i>
      </div>

    </div>
  </div>

</footer>
  );
};

export default Footer;
