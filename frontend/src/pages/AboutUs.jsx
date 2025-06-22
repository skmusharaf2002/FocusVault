import { motion } from 'framer-motion';
import { BookOpen, Target, Users, Zap, Github, Mail, Heart, Shield, Database, Smartphone } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Target,
      title: 'Smart Study Timer',
      description: 'Track your study sessions with intelligent timing and progress analytics.'
    },
    {
      icon: BookOpen,
      title: 'Note Management',
      description: 'Organize your study notes with tags, search, and pinning capabilities.'
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Connect with study partners in real-time chat rooms for motivation.'
    },
    {
      icon: Zap,
      title: 'PWA Ready',
      description: 'Install on any device and study offline with our Progressive Web App.'
    }
  ];

  const techStack = [
    { name: 'React', description: 'Modern UI framework' },
    { name: 'Node.js', description: 'Backend runtime' },
    { name: 'MongoDB', description: 'Database storage' },
    { name: 'Redis', description: 'Caching & sessions' },
    { name: 'PWA', description: 'Mobile-first design' },
    { name: 'Socket.io', description: 'Real-time features' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Focus Vault
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your personal study companion designed to help you stay organized, motivated, and productive in your learning journey.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Heart className="text-red-500" size={24} />
            <span>Our Mission</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            We believe that effective studying shouldn't be complicated. Focus Vault combines modern technology
            with proven study techniques to create a seamless experience that adapts to your learning style.
            Whether you're a student, professional, or lifelong learner, our platform helps you build consistent
            study habits and achieve your educational goals.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * (index + 3) }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center space-x-2">
            <Database className="text-blue-500" size={24} />
            <span>Built With Modern Technology</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05 * index }}
                className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <h4 className="font-bold text-gray-800 dark:text-white mb-1">
                  {tech.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {tech.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Shield className="text-green-500" size={24} />
            <span>Privacy & Security</span>
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              <strong>Your data is secure:</strong> We use industry-standard encryption and security practices
              to protect your personal information and study data.
            </p>
            <p>
              <strong>Privacy-first approach:</strong> We only collect data necessary for app functionality
              and never share your personal information with third parties.
            </p>
            <p>
              <strong>Local storage:</strong> Many features work offline, keeping your data on your device
              when possible for maximum privacy and performance.
            </p>
          </div>
        </motion.div>

        {/* Developer Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white text-center"
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Have questions, suggestions, or need support? We'd love to hear from you!
            Focus Vault is continuously evolving based on user feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.a
              href="mailto:support@focusvault.app"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-colors"
            >
              <Mail size={20} />
              <span>support@focusvault.app</span>
            </motion.a>

            <motion.a
              href="https://github.com/focusvault/app"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-colors"
            >
              <Github size={20} />
              <span>View on GitHub</span>
            </motion.a>
          </div>
        </motion.div>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-gray-500 dark:text-gray-400"
        >
          <p className="text-sm">
            Focus Vault v1.0.0 • Built with ❤️ for learners everywhere
          </p>
          <p className="text-xs mt-2">
            © 2025 Focus Vault. Made for educational purposes.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;