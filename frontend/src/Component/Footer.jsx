import React from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaEnvelope, FaCode } from "react-icons/fa"; // Import social media icons

function Footer() {
  return (
    <footer className="bg-gray-900 lg shadow dark:bg-gray-700 m-4" style={{ width: "100%",margin:"0px" }}>
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        {/* Main Branding */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <a
            href="https://flowbite.com/"
            className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
          >
            <span
              className="self-center text-2xl font-semibold whitespace-nowrap"
              style={{ color: "white",fontFamily:"Montserrat-Regular",fontWeight:"100" }}
            >
              @RajasBhosale
            </span>
          </a>
        </div>

        {/* Contact and Social Sections Side by Side */}
        <div className="flex flex-col sm:flex-row justify-between mt-8">
          {/* Contact Section */}
          <div className="flex-1">
            <h2 className="text-white text-lg font-semibold">Contact</h2>
            <hr
              className="my-2 border-gray-600"
            //   style={{
            //     display: "inline-block",
            //     width: "fit-content",
            //     margin: "auto",
            //   }}
            />
            <div className="text-gray-400 mt-4">
              <p>Email: <a href="mailto:rajasvbhosale@gmail.com" className="hover:underline">rajasvbhosale@gmail.com</a></p>
              <p>Phone: <a href="tel:+91 8080498171" className="hover:underline">+91 8080498171</a></p>
            </div>
          </div>

          {/* Social Section */}
          <div className="flex-1 mt-8 sm:mt-0 sm:ml-8 sm:text-right">
            <h2 className="text-white text-lg font-semibold">Social</h2>
            <hr
              className="my-2 border-gray-600"
            //   style={{
            //     display: "inline-block",
            //     width: "fit-content",
            //     margin: "auto",
            //   }}
            />
            <div className="flex justify-end space-x-6 text-gray-500 dark:text-gray-400 mt-4">
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 dark:hover:text-white"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://www.linkedin.com/in/yourusername/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 dark:hover:text-white"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="https://leetcode.com/yourusername/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 dark:hover:text-white"
              >
                <FaCode size={24} />
              </a>
              <a
                href="https://www.instagram.com/yourusername/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 dark:hover:text-white"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="mailto:yourname@example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 dark:hover:text-white"
              >
                <FaEnvelope size={24} />
              </a>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2025 <a href="https://flowbite.com/" className="hover:underline">RajasBhosale™</a>
        </span>
      </div>
    </footer>
  );
}

export default Footer;
