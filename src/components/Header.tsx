import React from 'react';
import { ArrowLeft, Star, Trophy, LogOut, User } from 'lucide-react';
import { CourseWithLevels } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  selectedCourse: CourseWithLevels | null;
  onBackToCourses: () => void;
  totalStars: number;
  completedLevels: number;
  totalLevels: number;
}

const Header: React.FC<HeaderProps> = ({
  selectedCourse,
  onBackToCourses,
  totalStars,
  completedLevels,
  totalLevels
}) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {selectedCourse && (
              <button
                onClick={onBackToCourses}
                className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Cursos</span>
              </button>
            )}
            <h1 className="text-2xl font-bold text-white">
              {selectedCourse ? selectedCourse.title : 'LSP Learning'}
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            {selectedCourse && (
              <>
                <div className="flex items-center space-x-2 text-white">
                  <Star className="w-5 h-5 text-yellow-300 fill-current" />
                  <span className="font-semibold">{totalStars}</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <span className="font-semibold">{completedLevels}/{totalLevels}</span>
                </div>
                <div className="w-32 bg-white/20 rounded-full h-3">
                  <div 
                    className="h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0}%` }}
                  ></div>
                </div>
              </>
            )}
            
            {/* User info and logout */}
            <div className="flex items-center space-x-4 border-l border-white/20 pl-6">
              <div className="flex items-center space-x-2 text-white">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.name || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-white hover:text-red-300 transition-colors duration-200"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;