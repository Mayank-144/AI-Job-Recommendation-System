import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sparkles,
  RefreshCw,
  Building,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Bookmark,
  Send,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const Dashboard = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  useEffect(() => {
    fetchRecommendations();
    fetchUserSavedAndApplied();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/recommendations?limit=20');
      setRecommendations(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not load recommendations. Please upload your resume first.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSavedAndApplied = async () => {
    try {
      const [savedRes, appsRes] = await Promise.all([
        axios.get('/api/interactions/saved'),
        axios.get('/api/applications/my-applications'),
      ]);
      setSavedJobIds(new Set((savedRes.data.data || []).map((j) => j._id)));
      setAppliedJobIds(new Set((appsRes.data.data || []).map((a) => a.jobId?._id)));
    } catch (err) {
      // Non-blocking
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage('');
    try {
      await axios.post('/api/recommendations/refresh');
      setMessage('Recommendations freshly recalculated using weighted scoring!');
      fetchRecommendations();
    } catch (err) {
      setError('Failed to refresh recommendations');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSave = async (jobId) => {
    try {
      await axios.post('/api/interactions', { jobId, actionType: 'saved' });
      setSavedJobIds(new Set([...savedJobIds, jobId]));
      setMessage('Job saved to your bookmarks!');
    } catch (err) {
      setError('Could not save job');
    }
  };

  const handleApply = async (jobId) => {
    try {
      await axios.post(`/api/applications/apply/${jobId}`, {
        notes: 'Applied through AI JobMatch Recommendations',
      });
      setAppliedJobIds(new Set([...appliedJobIds, jobId]));
      setMessage('Application submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
    }
  };

  const getBadgeColor = (percentage) => {
    if (percentage >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (percentage >= 50) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Recommended Jobs</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Matched via In-House NLP, TF-IDF Content Similarity, and Weighted Compatibility Scores
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 border border-slate-300 rounded-lg text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{refreshing ? 'Recalculating...' : 'Refresh Matches'}</span>
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-sm text-emerald-800">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-slate-500">Calculating recommendations & matching vectors...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Recommendations Available</h3>
          <p className="text-sm text-slate-500 mt-1">
            Please make sure your resume is uploaded with valid skills to receive recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const job = rec.jobId;
            if (!job) return null;
            const isSaved = savedJobIds.has(job._id);
            const isApplied = appliedJobIds.has(job._id);

            return (
              <div
                key={rec._id}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4">
                  {/* Left Job Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-xs font-bold text-slate-400">#{rec.rank}</span>
                      <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{job.location} ({job.jobType})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{job.minExperience} - {job.maxExperience} Yrs Exp</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skills Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {/* Matching Skills */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 mb-2">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Matching Skills ({rec.matchingSkills.length})</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.matchingSkills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="flex items-center space-x-1 text-xs font-semibold text-amber-700 mb-2">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Skill Gap ({rec.missingSkills.length})</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.missingSkills.length > 0 ? (
                            rec.missingSkills.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No missing skills detected!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendation Reason */}
                    <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                      <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
                        Recommendation Explanation:
                      </span>
                      <p className="text-xs text-blue-800 leading-normal">{rec.explanation}</p>
                    </div>
                  </div>

                  {/* Right Score & Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 gap-4">
                    {/* Compatibility Score Circle */}
                    <div
                      className={`px-4 py-2 rounded-xl border text-center font-bold ${getBadgeColor(
                        rec.overallMatchPercentage
                      )}`}
                    >
                      <div className="text-2xl">{rec.overallMatchPercentage}%</div>
                      <div className="text-[10px] uppercase tracking-wider">Match Score</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSave(job._id)}
                        disabled={isSaved}
                        className={`p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                        title="Save Job"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleApply(job._id)}
                        disabled={isApplied}
                        className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isApplied
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isApplied ? 'Applied' : 'Apply Now'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
