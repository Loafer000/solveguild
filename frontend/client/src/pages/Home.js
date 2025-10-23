import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight, 
  Users, 
  Lightbulb, 
  Zap, 
  Shield, 
  Star,
  Code,
  Palette,
  Camera,
  Globe,
  Brain,
  Lock
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const categories = [
    { name: 'App Development', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { name: 'Web Development', icon: Globe, color: 'from-green-500 to-emerald-500' },
    { name: 'UI/UX Design', icon: Palette, color: 'from-purple-500 to-pink-500' },
    { name: 'AI/ML', icon: Brain, color: 'from-orange-500 to-red-500' },
    { name: 'Video Editing', icon: Camera, color: 'from-indigo-500 to-purple-500' },
    { name: 'Cybersecurity', icon: Lock, color: 'from-gray-500 to-slate-500' },
  ];

  const features = [
    {
      icon: Users,
      title: 'Reverse Freelancing',
      description: 'Clients post issues, freelancers approach them. No more endless browsing through profiles.'
    },
    {
      icon: Lightbulb,
      title: 'Technical Doubt Community',
      description: 'Ask questions, share knowledge, and learn from experts in your field.'
    },
    {
      icon: Zap,
      title: 'Premium Benefits',
      description: 'Enhanced visibility, early notifications, and priority support for premium members.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with milestone-based releases.'
    },
    {
      icon: Star,
      title: 'Quality Assurance',
      description: 'Rating system and verified freelancers ensure high-quality work.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Freelancers' },
    { number: '5K+', label: 'Issues Resolved' },
    { number: '2K+', label: 'Technical Doubts' },
    { number: '98%', label: 'Client Satisfaction' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              The Future of
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {' '}Freelancing
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              A revolutionary platform where clients post issues and freelancers approach them. 
              Join our technical community and solve problems together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create-issue"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    Post an Issue
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/issues"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Browse Issues
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explore Categories
            </h2>
            <p className="text-gray-300 text-lg">
              Find issues and opportunities in your area of expertise
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/issues?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group bg-gray-700 hover:bg-gray-600 rounded-xl p-6 text-center transition-all duration-300 hover:scale-105"
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose SolveGuild?
            </h2>
            <p className="text-gray-300 text-lg">
              Experience the next generation of freelancing
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Impact
            </h2>
            <p className="text-gray-300 text-lg">
              Numbers that speak for themselves
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Work?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of freelancers and clients who are already using SolveGuild
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Your Journey
              </Link>
              <Link
                to="/issues"
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Explore Issues
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
