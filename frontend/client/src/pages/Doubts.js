import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Clock, 
  User,
  Eye,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Star,
  Tag
} from 'lucide-react';

const Doubts = () => {
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    isResolved: '',
    search: '',
    sort: 'newest'
  });

  const { data, isLoading, error } = useQuery(
    ['doubts', filters],
    () => fetchDoubts(filters),
    {
      keepPreviousData: true,
    }
  );

  const fetchDoubts = async (filters) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await axios.get(`/api/doubts?${params.toString()}`);
    return response.data;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const formatCategory = (category) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading doubts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading doubts</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Technical Doubts</h1>
          <p className="text-gray-300">
            Ask questions, share knowledge, and learn from the community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search doubts..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="bg-gray-700 text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="programming">Programming</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="data-science">Data Science</option>
                <option value="ai-ml">AI/ML</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="blockchain">Blockchain</option>
                <option value="game-development">Game Development</option>
                <option value="ui-ux-design">UI/UX Design</option>
                <option value="devops">DevOps</option>
                <option value="database">Database</option>
                <option value="cloud-computing">Cloud Computing</option>
                <option value="networking">Networking</option>
                <option value="hardware">Hardware</option>
                <option value="other">Other</option>
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="bg-gray-700 text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>

              <select
                value={filters.isResolved}
                onChange={(e) => handleFilterChange('isResolved', e.target.value)}
                className="bg-gray-700 text-white px-3 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="false">Unresolved</option>
                <option value="true">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-300">
            {data?.pagination?.total || 0} doubts found
          </div>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>

        {/* Doubts Grid */}
        <div className="grid gap-6">
          {data?.doubts?.map((doubt) => (
            <div key={doubt._id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {formatCategory(doubt.category)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      doubt.difficulty === 'beginner' ? 'bg-green-600 text-white' :
                      doubt.difficulty === 'intermediate' ? 'bg-yellow-600 text-white' :
                      doubt.difficulty === 'advanced' ? 'bg-orange-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {doubt.difficulty}
                    </span>
                    {doubt.isResolved && (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Resolved
                      </span>
                    )}
                    {doubt.bounty?.isActive && (
                      <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ${doubt.bounty.amount} Bounty
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    <Link to={`/doubts/${doubt._id}`} className="hover:text-blue-400 transition-colors">
                      {doubt.title}
                    </Link>
                  </h3>
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {doubt.content}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{doubt.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{doubt.answerCount || 0} answers</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{doubt.upvotes?.length || 0} upvotes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeAgo(doubt.createdAt)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {doubt.author?.username}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {doubt.author?.profile?.rating?.average ? 
                        `${doubt.author.profile.rating.average}/5` : 
                        'No rating'
                      }
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doubt.tags?.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {data?.doubts?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No doubts found</div>
            <p className="text-gray-500">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doubts;
