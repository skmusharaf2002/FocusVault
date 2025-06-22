import { NavLink } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, Calendar, User, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavigation = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/reading', icon: BookOpen, label: 'Reading' },
    { path: '/todo', icon: CheckSquare, label: 'ToDo' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-2 z-50 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] touch-manipulation ${isActive
                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 active:scale-95'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="mb-1"
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className={`text-xs font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;