import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Star,
  Clock,
  DollarSign,
  Eye,
  Award
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Active Issues', value: '12', icon: TrendingUp, color: 'text-blue-400' },
    { name: 'Proposals Sent', value: '8', icon: MessageCircle, color: 'text-green-400' },
    { name: 'Completed Projects', value: '24', icon: Award, color: 'text-purple-400' },
    { name: 'Earnings', value: '$2,450', icon: DollarSign, color: 'text-yellow-400' },
  ];

  const recentIssues = [
    {
      id: 1,
      title: 'Mobile App Development',
      category: 'App Development',
      budget: '$2,000 - $5,000',
      status: 'open',
      proposals: 5,
      timeLeft: '2 days left'
    },
    {
      id: 2,
      title: 'Logo Design for Startup',
      category: 'Logo Design',
      budget: '$500 - $1,000',
      status: 'in-progress',
      proposals: 12,
      timeLeft: '1 week left'
    },
    {
      id: 3,
      title: 'E-commerce Website',
      category: 'Web Development',
      budget: '$3,000 - $8,000',
      status: 'completed',
      proposals: 8,
      timeLeft: 'Completed'
    }
  ];

  const recentActivity = [
    {
      type: 'proposal',
      message: 'You submitted a proposal for "Mobile App Development"',
      time: '2 hours ago',
      icon: MessageCircle
    },
    {
      type: 'rating',
      message: 'You received a 5-star rating for "E-commerce Website"',
      time: '1 day ago',
      icon: Star
    },
    {
      type: 'message',
      message: 'New message from John Doe',
      time: '2 days ago',
      icon: MessageCircle
    },
    {
      type: 'issue',
      message: 'Your issue "Logo Design" received 3 new proposals',
      time: '3 days ago',
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.profile?.firstName || user?.username}!
          </h1>
          <p className="text-gray-300 mt-2">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-700`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Issues */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Issues</h2>
              <Link
                to="/create-issue"
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create New
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentIssues.map((issue) => (
                <div key={issue.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium">{issue.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      issue.status === 'open' ? 'bg-green-600 text-white' :
                      issue.status === 'in-progress' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{issue.category}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-400 font-medium">{issue.budget}</span>
                    <div className="flex items-center text-gray-400">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      <span>{issue.proposals} proposals</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400 text-sm">{issue.timeLeft}</span>
                    <Link
                      to={`/issues/${issue.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <Link
                to="/activity"
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <activity.icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/create-issue"
              className="flex items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="p-3 bg-blue-600 rounded-lg mr-4">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Post an Issue</h3>
                <p className="text-gray-400 text-sm">Find freelancers for your project</p>
              </div>
            </Link>

            <Link
              to="/issues"
              className="flex items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="p-3 bg-green-600 rounded-lg mr-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Browse Issues</h3>
                <p className="text-gray-400 text-sm">Find work opportunities</p>
              </div>
            </Link>

            <Link
              to="/create-doubt"
              className="flex items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="p-3 bg-purple-600 rounded-lg mr-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Ask a Doubt</h3>
                <p className="text-gray-400 text-sm">Get help from the community</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
