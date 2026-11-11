import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, Edit3, Plus, X, AlertCircle } from 'lucide-react';

const ResumeUpload = () => {
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Editing state for skills & experience
  const [editMode, setEditMode] = useState(false);
  const [skillsList, setSkillsList] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [expYears, setExpYears] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const res = await axios.get('/api/resumes/me');
      setResume(res.data.data);
      setSkillsList(res.data.data.skills || []);
      setExpYears(res.data.data.experienceYears || 0);
    } catch (err) {
      // Resume not yet uploaded
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or DOCX file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post('/api/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Resume uploaded and parsed successfully!');
      fetchResume();
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const clean = newSkill.trim().toLowerCase();
    if (!skillsList.includes(clean)) {
      setSkillsList([...skillsList, clean]);
    }
    setNewSkill('');
  };

  const handleSaveEdits = async () => {
    setSavingEdit(true);
    try {
      const res = await axios.put('/api/resumes/skills', {
        skills: skillsList,
        experienceYears: Number(expYears),
      });
      setResume(res.data.data);
      setEditMode(false);
      setMessage('Skills & experience updated successfully! Your recommendations will reflect this.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update skills');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Resume Management & Skill Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your resume in PDF or DOCX format. Our NLP engine will extract skills and experience.
        </p>
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

      {/* Upload Box */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Upload New Resume</h2>
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Parsing...' : 'Upload & Parse'}</span>
          </button>
        </form>
      </div>

      {/* Current Extracted Profile */}
      {resume ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Extracted Skills & Qualifications</h2>
              <p className="text-xs text-slate-500">
                Active file: <span className="font-mono text-slate-700">{resume.originalFileName}</span> ({resume.fileType?.toUpperCase()})
                {resume.isManuallyEdited && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                    Manually Verified
                  </span>
                )}
              </p>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Skills</span>
              </button>
            )}
          </div>

          {/* Experience Years */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Estimated Work Experience
            </span>
            {editMode ? (
              <input
                type="number"
                min="0"
                max="40"
                value={expYears}
                onChange={(e) => setExpYears(e.target.value)}
                className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
              />
            ) : (
              <span className="text-sm font-semibold text-slate-800">{resume.experienceYears} Years</span>
            )}
          </div>

          {/* Skills Badges */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Recognized Technical Competencies ({skillsList.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {skill}
                  {editMode && (
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1.5 hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Add Skill in Edit Mode */}
          {editMode && (
            <div className="pt-4 border-t border-slate-200">
              <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Add a new skill (e.g. Docker, TypeScript)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                />
                <button
                  type="submit"
                  className="flex items-center space-x-1 px-4 py-1.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={handleSaveEdits}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">No resume uploaded yet</p>
          <p className="text-xs text-slate-400 mt-1">Upload your resume above to unlock recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;

