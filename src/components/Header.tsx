import React from 'react';
import { ArrowLeft, Star, Trophy, LogOut, User } from 'lucide-react';
import { CourseWithLevels } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  selectedCourse: CourseWithLevels | null;
  onBackToCourses: () => void;
  onGoToProfile: () => void;
  totalStars: number;
  completedLevels: number;
  totalLevels: number;
}

const Header: React.FC<HeaderProps> = ({
  selectedCourse,
  onBackToCourses,
  onGoToProfile,
  totalStars,
  completedLevels,
  totalLevels
}) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white border-b-2 border-duo-gray sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {selectedCourse && (
              <button
                onClick={onBackToCourses}
                className="flex items-center space-x-2 text-duo-gray-dark hover:text-duo-text transition-colors duration-200 px-3 py-2 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                <span className="font-black uppercase text-sm hidden sm:inline">Cursos</span>
              </button>
            )}
            <h1 className="text-2xl font-black text-duo-blue">
              {selectedCourse ? selectedCourse.title : 'RIMANAQ'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {selectedCourse && (
              <>
                <div className="hidden md:flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Star className="w-6 h-6 text-duo-yellow fill-duo-yellow" strokeWidth={3} />
                    <span className="font-black text-duo-yellow text-lg">{totalStars}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-6 h-6 text-duo-green" strokeWidth={3} />
                    <span className="font-black text-duo-green text-lg">{completedLevels}/{totalLevels}</span>
                  </div>
                  <div className="w-40 bg-duo-gray rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-duo-green rounded-full transition-all duration-500"
                      style={{ width: `${totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2 border-l-2 border-duo-gray pl-4">
              <button
                onClick={onGoToProfile}
                className="flex items-center space-x-2 text-duo-gray-dark hover:text-duo-blue transition-colors duration-200 px-3 py-2"
                title="Ver perfil"
              >
                <User className="w-5 h-5" strokeWidth={3} />
                <span className="text-sm font-black uppercase hidden lg:inline">{user?.name || user?.email}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-duo-gray-dark hover:text-duo-red transition-colors duration-200 px-3 py-2"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" strokeWidth={3} />
                <span className="text-sm font-black uppercase hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;