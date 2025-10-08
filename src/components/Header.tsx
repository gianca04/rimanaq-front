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
    <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {selectedCourse && (
              <button
                onClick={onBackToCourses}
                className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">Cursos</span>
              </button>
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {selectedCourse ? selectedCourse.title : 'Rimanaq'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {selectedCourse && (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-white">{totalStars}</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white">{completedLevels}/{totalLevels}</span>
                  </div>
                  <div className="w-32 bg-white/20 rounded-full h-2.5 shadow-inner">
                    <div
                      className="h-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2 border-l border-white/20 pl-4">
              <button
                onClick={onGoToProfile}
                className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/10"
                title="Ver perfil"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium hidden lg:inline">{user?.name || user?.email}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-white/70 hover:text-rose-300 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-rose-500/20"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;