import React, { useState } from 'react';
import { Search, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
// import { DeleteFormModal } from '../modules/Delete';
// import { dbService } from '@/lib/supabase';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, signOut } = useAuth();
  // const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  // const handleDeleteAccount = async () => {
  //   if (!user) return;
  //   const result = await dbService.deleteAccount(user.id);
  //   if (result.success) {
  //     await signOut();
  //     window.location.href = '/';
  //   } else {
  //     alert('Error deleting account: ' + result.message);
  //   }
  // };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap">
        {/* Left Section: Title and Date */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">{title}</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Right Section: Search, User Actions, and Mobile Menu Toggle */}
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Search Bar */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Hamburger Menu for Mobile */}
          <button
            className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* User Actions - Desktop */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="h-5 w-5" />
              <div className="text-left">
                <p className="text-sm font-medium truncate max-w-[150px]">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-1 text-sm"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>

            {/* <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              title="Delete Account"
            >
              Delete Account
            </button> */}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="w-full sm:hidden mt-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <User className="h-5 w-5" />
                <div className="text-left">
                  <p className="text-sm font-medium truncate">{user?.user_metadata?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>

              {/* <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                title="Delete Account"
              >
                Delete Account
              </button> */}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {/* <DeleteFormModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      /> */}
    </header>
  );
};