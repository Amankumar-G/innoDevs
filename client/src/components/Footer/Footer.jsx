// import React from "react";
// import { Mail, Users } from "lucide-react"; // Icons

// export default function Footer() {
//   return (
//     <footer className="bg-gray-900 text-gray-300 py-6 border-t border-gray-600">
//       <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
//         {/* Left Section - Brand */}
//         <div className="text-center md:text-left">
//           <h2 className="text-2xl font-bold text-white">InnoDevs</h2>
//           <p className="text-sm text-gray-400">Innovate. Create. Inspire.</p>
//         </div>

//         {/* Navigation Links */}
//         <ul className="flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0">
//           <li className="flex items-center gap-2 hover:text-red-500 transition">
//             <Mail className="w-5 h-5" />
//             <a href="mailto:contact@innodevs.com">Contact</a>
//           </li>
//           <li className="flex items-center gap-2 hover:text-red-500 transition">
//             <Users className="w-5 h-5" />
//             <a href="#life">Life @InnoDevs</a>
//           </li>
//         </ul>
//       </div>

//       {/* Bottom Copyright */}
//       <div className="text-center text-sm text-gray-500 mt-6">
//         © {new Date().getFullYear()} InnoDevs. All rights reserved.
//       </div>
//     </footer>
//   );
// }



import React from "react";
import { Mail, Users } from "lucide-react"; // Icons

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 py-6 border-t border-gray-300 dark:border-gray-600">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        {/* Left Section - Brand */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">InnoDevs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Innovate. Create. Inspire.</p>
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0">
          <li className="flex items-center gap-2 hover:text-red-600 dark:hover:text-red-500 transition">
            <Mail className="w-5 h-5" />
            <a href="mailto:contact@innodevs.com">Contact</a>
          </li>
          <li className="flex items-center gap-2 hover:text-red-600 dark:hover:text-red-500 transition">
            <Users className="w-5 h-5" />
            <a href="#life">Life @InnoDevs</a>
          </li>
        </ul>
      </div>

      {/* Bottom Copyright */}
      <div className="text-center text-sm text-gray-400 dark:text-gray-500 mt-6">
        © {new Date().getFullYear()} InnoDevs. All rights reserved.
      </div>
    </footer>
  );
}