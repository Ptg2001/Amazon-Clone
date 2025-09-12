import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Get to Know Us',
      links: [
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' },
        { name: 'About NexaCart', href: '/about' },
        { name: 'Investor Relations', href: '/investor-relations' },
        { name: 'NexaCart Devices', href: '/devices' },
        { name: 'NexaCart Labs', href: '/science' },
      ],
    },
    {
      title: 'Make Money with Us',
      links: [
        { name: 'Sell products on NexaCart', href: '/sell' },
        { name: 'Sell on NexaCart Business', href: '/business-sell' },
        { name: 'Sell apps on NexaCart', href: '/app-sell' },
        { name: 'Become an Affiliate', href: '/affiliate' },
        { name: 'Advertise Your Products', href: '/advertise' },
        { name: 'Self-Publish with Us', href: '/publish' },
        { name: 'Host a NexaCart Hub', href: '/hub' },
      ],
    },
    {
      title: 'NexaCart Payment Products',
      links: [
        { name: 'NexaCart Business Card', href: '/business-card' },
        { name: 'Shop with Points', href: '/points' },
        { name: 'Reload Your Balance', href: '/reload' },
        { name: 'NexaCart Currency Converter', href: '/currency' },
      ],
    },
    {
      title: 'Let Us Help You',
      links: [
        { name: 'NexaCart and COVID-19', href: '/covid-19' },
        { name: 'Your Account', href: '/profile' },
        { name: 'Your Orders', href: '/orders' },
        { name: 'Shipping Rates & Policies', href: '/shipping' },
        { name: 'Returns & Replacements', href: '/returns' },
        { name: 'Manage Your Content and Devices', href: '/content-devices' },
        { name: 'NexaCart Assistant', href: '/assistant' },
        { name: 'Help', href: '/help' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Back to Top */}
      <div className="bg-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-center w-full text-sm hover:underline"
          >
            Back to top
          </button>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Bottom Section */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Logo */}
            <div className="flex items-center mb-4 md:mb-0">
              <Link to="/" className="flex items-center">
                <img src="/nexacart-logo.svg" alt="NexaCart" className="h-7 w-auto" />
              </Link>
            </div>

            {/* Social Media */}
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FiFacebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FiTwitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FiInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FiYoutube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
              <div className="mb-4 md:mb-0">
                <p>&copy; {currentYear} NexaCart. All rights reserved.</p>
                <p className="mt-1">
                  This is a demo project for educational purposes only.
                </p>
              </div>
              <div className="flex flex-wrap items-center space-x-4">
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="hover:text-white transition-colors">
                  Cookie Preferences
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
