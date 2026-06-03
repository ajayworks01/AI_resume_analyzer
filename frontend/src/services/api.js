import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 60000,
});

// Interceptors for error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);

export const resumeService = {
  upload: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return API.post('/upload-resume', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  list: () => API.get('/resumes'),

  analyze: (resumeId, jobDescription) => {
    const fd = new FormData();
    fd.append('resume_id', resumeId);
    fd.append('job_description', jobDescription);
    return API.post('/analyze-resume', fd);
  },

  rankMultiple: (resumeIds, jobDescription) => {
    const fd = new FormData();
    fd.append('resume_ids', resumeIds.join(','));
    fd.append('job_description', jobDescription);
    return API.post('/rank-resumes', fd);
  },

  getAnalysis: (id) => API.get(`/analysis/${id}`),
  getAllAnalyses: () => API.get('/analyses'),
  getRankings: () => API.get('/rankings'),
};
