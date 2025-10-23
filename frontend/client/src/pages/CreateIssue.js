import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Upload, 
  X, 
  DollarSign, 
  Clock, 
  MapPin, 
  Tag,
  FileText,
  AlertCircle
} from 'lucide-react';

const CreateIssue = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [attachments, setAttachments] = useState([]);
  const [requirements, setRequirements] = useState(['']);
  const [skills, setSkills] = useState(['']);
  const [tags, setTags] = useState(['']);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      category: '',
      timeline: '',
      location: 'remote',
      budget: {
        min: '',
        max: '',
        currency: 'USD',
        isNegotiable: true
      }
    }
  });

  const createIssueMutation = useMutation(
    (data) => axios.post('/api/issues', data),
    {
      onSuccess: (response) => {
        toast.success('Issue created successfully!');
        queryClient.invalidateQueries('issues');
        navigate(`/issues/${response.data.issue._id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create issue');
      }
    }
  );

  const onSubmit = (data) => {
    const issueData = {
      ...data,
      requirements: requirements.filter(req => req.trim()),
      skills: skills.filter(skill => skill.trim()),
      tags: tags.filter(tag => tag.trim()),
      attachments: attachments.map(att => ({
        filename: att.name,
        url: att.url,
        type: att.type,
        size: att.size
      }))
    };

    createIssueMutation.mutate(issueData);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file) // In production, upload to cloud storage
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addRequirement = () => {
    setRequirements(prev => [...prev, '']);
  };

  const removeRequirement = (index) => {
    if (requirements.length > 1) {
      setRequirements(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateRequirement = (index, value) => {
    setRequirements(prev => prev.map((req, i) => i === index ? value : req));
  };

  const addSkill = () => {
    setSkills(prev => [...prev, '']);
  };

  const removeSkill = (index) => {
    if (skills.length > 1) {
      setSkills(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateSkill = (index, value) => {
    setSkills(prev => prev.map((skill, i) => i === index ? value : skill));
  };

  const addTag = () => {
    setTags(prev => [...prev, '']);
  };

  const removeTag = (index) => {
    if (tags.length > 1) {
      setTags(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateTag = (index, value) => {
    setTags(prev => prev.map((tag, i) => i === index ? value : tag));
  };

  const categories = [
    { value: 'logo-design', label: 'Logo Design' },
    { value: 'video-editing', label: 'Video Editing' },
    { value: 'app-development', label: 'App Development' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'ai-ml', label: 'AI/ML' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'game-development', label: 'Game Development' },
    { value: 'ui-ux-design', label: 'UI/UX Design' },
    { value: 'digital-marketing', label: 'Digital Marketing' },
    { value: 'content-writing', label: 'Content Writing' },
    { value: 'translation', label: 'Translation' },
    { value: 'voice-over', label: 'Voice Over' },
    { value: 'photography', label: 'Photography' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Create New Issue</h1>
          <p className="text-gray-300">
            Describe your project and let freelancers approach you
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timeline *
                </label>
                <select
                  {...register('timeline', { required: 'Timeline is required' })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select timeline</option>
                  <option value="urgent">Urgent (ASAP)</option>
                  <option value="1-week">1 Week</option>
                  <option value="2-weeks">2 Weeks</option>
                  <option value="1-month">1 Month</option>
                  <option value="2-months">2 Months</option>
                  <option value="3-months">3 Months</option>
                  <option value="flexible">Flexible</option>
                </select>
                {errors.timeline && (
                  <p className="text-red-400 text-sm mt-1">{errors.timeline.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Title *
              </label>
              <input
                {...register('title', { 
                  required: 'Title is required',
                  minLength: { value: 10, message: 'Title must be at least 10 characters' },
                  maxLength: { value: 200, message: 'Title must be less than 200 characters' }
                })}
                placeholder="Brief, descriptive title for your project"
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Description *
              </label>
              <textarea
                {...register('description', { 
                  required: 'Description is required',
                  minLength: { value: 50, message: 'Description must be at least 50 characters' },
                  maxLength: { value: 5000, message: 'Description must be less than 5000 characters' }
                })}
                rows={6}
                placeholder="Describe your project in detail. Include goals, requirements, and any specific needs..."
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Budget Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Budget Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Budget *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    {...register('budget.min', { 
                      required: 'Minimum budget is required',
                      min: { value: 1, message: 'Minimum budget must be at least $1' }
                    })}
                    placeholder="100"
                    className="w-full bg-gray-700 text-white pl-10 pr-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                {errors.budget?.min && (
                  <p className="text-red-400 text-sm mt-1">{errors.budget.min.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Budget *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    {...register('budget.max', { 
                      required: 'Maximum budget is required',
                      min: { value: 1, message: 'Maximum budget must be at least $1' }
                    })}
                    placeholder="1000"
                    className="w-full bg-gray-700 text-white pl-10 pr-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                {errors.budget?.max && (
                  <p className="text-red-400 text-sm mt-1">{errors.budget.max.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  {...register('budget.currency')}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('budget.isNegotiable')}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-300">Budget is negotiable</span>
              </label>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Requirements</h2>
            
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder="Enter a requirement..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                {requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addRequirement}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              + Add Requirement
            </button>
          </div>

          {/* Skills */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Required Skills</h2>
            
            {skills.map((skill, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  placeholder="Enter a skill..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                {skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addSkill}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              + Add Skill
            </button>
          </div>

          {/* Tags */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Tags</h2>
            
            {tags.map((tag, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                  placeholder="Enter a tag..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                {tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addTag}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              + Add Tag
            </button>
          </div>

          {/* Attachments */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Attachments</h2>
            
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-4">Upload files related to your project</p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Choose Files
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{attachment.name}</span>
                      <span className="text-gray-400 text-sm">
                        ({(attachment.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/issues')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createIssueMutation.isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {createIssueMutation.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Issue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssue;
