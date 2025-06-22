import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmailVerification = () => {
  const { user, logout } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendVerification = async () => {
    if (countdown > 0 || isResending) return;

    try {
      setIsResending(true);
      await axios.post(`${API_URL}/api/auth/resend-verification`, {
        email: user.email
      });

      toast.success('Verification email sent! Check your inbox.');
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <Mail className="text-white" size={40} />
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Verify Your Email
        </h1>

        {/* Description */}
        <div className="space-y-4 mb-8">
          <p className="text-gray-600 dark:text-gray-300">
            We've sent a verification link to:
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <p className="font-medium text-gray-800 dark:text-white break-all">
              {user?.email}
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please check your email and click the verification link to access your account.
          </p>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-left">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Can't find the email?
              </h3>
              <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure the email address is correct</li>
                <li>• Wait a few minutes for delivery</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResendVerification}
            disabled={countdown > 0 || isResending}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isResending ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                <span>Sending...</span>
              </>
            ) : countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <>
                <RefreshCw size={20} />
                <span>Resend Verification Email</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Sign Out
          </motion.button>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Having trouble? Contact support at{' '}
            <a
              href="mailto:support@focusvault.app"
              className="text-primary-600 hover:text-primary-700"
            >
              support@focusvault.app
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;