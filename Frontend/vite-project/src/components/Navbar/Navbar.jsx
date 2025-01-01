import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/edu-logo.png';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
    } else {
      axios
        .get('http://localhost:3000/user/user-info', {
          headers: {
            'Auth-Token': token,
          },
        })
        .then((response) => {
          if (response.data && response.data.user) {
            setUser(response.data.user);
          } else {
            console.error('Invalid response structure:', response.data);
            navigate('/sign-in');
          }
        })
        .catch((error) => {
          console.error('Error fetching user info:', error);
          navigate('/sign-in');
        });
    }
  }, [navigate]);

  useEffect(() => {
    // Hàm đóng dropdown khi click ra ngoài
    const handleClickOutside = (event) => {
      // Nếu click không nằm trong dropdown hoặc nút avatar
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) && 
        event.target.id !== 'user-menu-button'
      ) {
        setDropdownOpen(false); // Đóng dropdown
      }
    };    

    // Thêm event listener nếu dropdown đang mở
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    // Cleanup event listener khi component unmount hoặc khi dropdown đóng
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen, navigate]);

  // Toggle dropdown
  const toggleDropdown = (event) => {
    event.stopPropagation(); // Ngăn chặn sự kiện click lan đến document
    setDropdownOpen((prev) => !prev); // Đảo ngược trạng thái dropdown
  };  

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/sign-in');
  };

  const isActiveLink = (path) => location.pathname === path ? 'text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500' : 'text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700';

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 w-full relative"> {/* Thêm relative ở đây */}
      <div className="flex flex-wrap items-center justify-between p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={logo} className="h-8" alt="Educoder Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Educoder
          </span>
        </Link>
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse relative">
          <button
            type="button"
            onClick={toggleDropdown}
            className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            id="user-menu-button"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <span className="sr-only">Open user menu</span>
            <img
              className="w-12 h-12 rounded-full"
              src={user?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt="user photo"
            />
          </button>
          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="z-50 absolute top-full right-0 mt-2 w-48 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
              id="user-dropdown"
            >
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-900 dark:text-white">{user?.fullname || 'Guest'}</span>
                <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                  {user?.email || 'guest@example.com'}
                </span>
              </div>
              <ul className="py-2" aria-labelledby="user-menu-button">
                <li>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-user"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link
                to="/dashboard"
                className={`block py-2 px-3 ${isActiveLink('/dashboard')}`}
              >
                Dashboard
              </Link>
            </li>
            {user && (user.role === 'instructor') &&
              (<li>
              <Link
                to="/courses-managerment"
                className={`block py-2 px-3 ${isActiveLink('/courses-managerment')}`}
              >
                My Courses
              </Link>
            </li>)}
            <li>
              <Link
                to="/profile"
                className={`block py-2 px-3 ${isActiveLink('/contact')}`}
              >
                Profile
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
