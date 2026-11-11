import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Building, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

const AdminPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [minExp, setMinExp] = useState(0);
  const [maxExp, setMaxExp] = useState(5);
  const [location, setLocation] = useState('Bangalore');
  const [jobType, setJobType] = useState('Remote');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/jobs?limit=50');
      setJobs(res.data.data || []);
    } catch (err) {
      setError('Could not fetch job listings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      await axios.post('/api/jobs', {
        title,
        company,
        description,
        requiredSkills: skills.split(',').map((s) => s.trim()),
        minExperience: Number(minExp),
        maxExperience: Number(maxExp),
        location,
        jobType,
      });

      setMessage('New job position created successfully!');
      // Reset Form
      setTitle('');
      setCompany('');
      setDescription('');
      setSkills('');
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;

    try {
      await axios.delete(`/api/jobs/${jobId}`);
      setMessage('Job listing deleted successfully');
      setJobs(jobs.filter((j) => j._id !== jobId));
    } catch (err) {
      setError('Could not delete job listing');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Job Management Panel</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create, review, and manage active job listings for the recommendation system
        </p>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-sm text-emerald-800">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Create Job Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Post New Job Opportunity</span>
        </h2>

        <form onSubmit={handleCreateJob} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior MERN Stack Developer"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Company</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. TechWave Labs"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Job Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe candidate responsibilities, role expectations..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node.js, Express, MongoDB, Docker, Redis"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Min Experience (Yrs)</label>
            <input
              type="number"
              min="0"
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Max Experience (Yrs)</label>
            <input
              type="number"
              min="0"
              value={maxExp}
              onChange={(e) => setMaxExp(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Bangalore, Pune, Noida, Remote"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Job Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Publishing...' : 'Publish Job Listing'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Listings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4">Current Active Job Listings ({jobs.length})</h2>
        <div className="divide-y divide-slate-100">
          {jobs.map((j) => (
            <div key={j._id} className="py-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{j.title}</h3>
                <div className="text-xs text-slate-500 flex items-center space-x-3 mt-0.5">
                  <span>{j.company}</span>
                  <span>•</span>
                  <span>{j.location} ({j.jobType})</span>
                  <span>•</span>
                  <span>Skills: {j.requiredSkills?.join(', ')}</span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteJob(j._id)}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                title="Delete Listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;

