import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MenuIcon,
  SearchIcon,
  BellIcon,
  UserCircleIcon,
  UserIcon,
  CogIcon,
  LogoutIcon,
} from "@heroicons/react/outline";
import "@fontsource/roboto";
const SideBar = ({ token }) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", search);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed top-0 left-0 h-full w-1/5 bg-gray-900 text-white flex flex-col p-5 font-roboto">
      <NavLink
        to="/"
        className="flex items-center mb-6 text-decoration-none text-white"
      >
        <MenuIcon className="h-8 w-8 mr-3" />
        <span className="text-2xl font-bold">MoodTune</span>
      </NavLink>
      <form className="flex items-center mb-6" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="Search"
          className="flex-grow bg-gray-800 text-white rounded-full py-2 px-4 focus:outline-none"
          value={search}
          onChange={handleSearchChange}
        />
        <button
          type="submit"
          className="ml-2 bg-green-600 hover:bg-green-700 text-white rounded-full p-2 focus:outline-none"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </form>
      <hr className="border-gray-700 mb-6" />
      <nav className="flex-grow">
        <ul>
          <li className="mb-4">
            <NavLink
              to="/home"
              activeClassName="text-green-500"
              className="flex items-center text-lg hover:text-green-500"
            >
              <MenuIcon className="h-5 w-5 mr-3" />
              Home
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink
              to="/trending"
              activeClassName="text-green-500"
              className="flex items-center text-lg hover:text-green-500"
            >
              <MenuIcon className="h-5 w-5 mr-3" />
              Trending
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink
              to="/favorites"
              activeClassName="text-green-500"
              className="flex items-center text-lg hover:text-green-500"
            >
              <MenuIcon className="h-5 w-5 mr-3" />
              Favorites
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink
              to="/playlists"
              activeClassName="text-green-500"
              className="flex items-center text-lg hover:text-green-500"
            >
              <MenuIcon className="h-5 w-5 mr-3" />
              Playlists
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink
              to="/books"
              activeClassName="text-green-500"
              className="flex items-center text-lg hover:text-green-500"
            >
              <MenuIcon className="h-5 w-5 mr-3" />
              Books
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink
              to="/news"
              activeClassName="text-green-500"
              className="flex items-center text-lg hover:text-green-500"
            >
              <MenuIcon className="h-5 w-5 mr-3" />
              News
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="mt-auto">
        <hr className="border-gray-700 mb-4" />
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center w-full text-left focus:outline-none"
          >
            <UserCircleIcon className="h-10 w-10 mr-3" />
            <span className="font-medium">Username</span>
          </button>
          {isOpen && (
            <div className="absolute left-0 bottom-16 w-full bg-gray-800 rounded-lg shadow-lg z-10">
              <NavLink
                to="/profile"
                className="block px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
              >
                <UserIcon className="h-5 w-5 mr-2" />
                Profile
              </NavLink>
              <NavLink
                to="/settings"
                className="block px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
              >
                <CogIcon className="h-5 w-5 mr-2" />
                Settings
              </NavLink>
              <hr className="border-gray-700" />
              <NavLink
                to="/"
                className="block px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
              >
                <LogoutIcon className="h-5 w-5 mr-2" />
                Sign out
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
