import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, MessageSquare, Phone } from 'lucide-react';
import Logo from '../common/Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <span className="text-xl font-bold mb-2 block">Engiversee</span>
            <p className="text-gray-300 mb-4">
              Empowering students with knowledge, insights, and opportunities in engineering and technology.
            </p>
            <p className="text-gray-300">
              <span className="font-semibold">Phone:</span> 9964030096
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Free Workshops</li>
              <li className="text-gray-300">Programming Tutorials</li>
              <li className="text-gray-300">Aptitude Training</li>
              <li className="text-gray-300">Career Guidance</li>
              <li className="text-gray-300">Webinars & Events</li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Connect With Us</h3>
            <div className="flex space-x-4 mb-6">
              <a 
                href="https://www.linkedin.com/company/engiversee/posts/?feedView=all" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={24} />
              </a>
              <a 
                href="https://www.instagram.com/engiversee/?utm_source=qr&igsh=MTB4aHcwY2plZXMweA%3D%3D#" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a 
                href="https://t.me/engiverse" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Telegram"
              >
                <MessageSquare size={24} />
              </a>
              <a 
                href="tel:9964030096"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Call 9964030096"
              >
                <Phone size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Engiversee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
