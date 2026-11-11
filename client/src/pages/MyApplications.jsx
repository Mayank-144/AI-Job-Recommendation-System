import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Building, MapPin, AlertCircle, FileText } from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get('/api/applications/my-applications');
      setApplications(res.data.data || []);
    } catch (err) {
      setError('Could not retrieve submitted applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'under_review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'shortlisted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Application Tracking Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor the real-time review status of your submitted job applications
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-slate-500">Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Applications Submitted</h3>
          <p className="text-sm text-slate-500 mt-1">
            Explore your AI recommendations and apply to matching roles!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Position & Company</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Applied Date</th>
                <th className="px-6 py-3.5">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{app.jobId?.title || 'Job Listing'}</div>
                    <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                      <Building className="w-3 h-3" />
                      <span>{app.jobId?.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.jobId?.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(app.appliedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
