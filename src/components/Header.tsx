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
    <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {selectedCourse && (
              <button
                onClick={onBackToCourses}
                className="flex items-center space-x-2 text-slate-700 hover:text-teal-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-teal-50"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">Cursos</span>
              </button>
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {selectedCourse ? selectedCourse.title : 'Rimanaq'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {selectedCourse && (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-amber-700">{totalStars}</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-teal-50 rounded-lg border border-teal-200">
                    <Trophy className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold text-teal-700">{completedLevels}/{totalLevels}</span>
                  </div>
                  <div className="w-32 bg-slate-200 rounded-full h-2.5 shadow-inner">
                    <div
                      className="h-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
              <button
                onClick={onGoToProfile}
                className="flex items-center space-x-2 text-slate-700 hover:text-teal-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-100"
                title="Ver perfil"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium hidden lg:inline">{user?.name || user?.email}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-rose-50"
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