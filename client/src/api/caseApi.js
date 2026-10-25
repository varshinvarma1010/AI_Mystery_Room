import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000 // Allow up to 45s for dual-pass Gemini generation
});

export const caseApi = {
  // Case lifecycle
  createCase: (data) => api.post('/cases', data).then((res) => res.data),
  getCase: (id) => api.get(`/cases/${id}`).then((res) => res.data),
  getDailyCase: () => api.get('/cases/daily').then((res) => res.data),

  // Core gameplay actions
  discoverClue: (caseId, clueId) => 
    api.post(`/cases/${caseId}/clues/${clueId}/discover`).then((res) => res.data),
  requestHint: (caseId) => 
    api.post(`/cases/${caseId}/hints`).then((res) => res.data),
  interrogateSuspect: (caseId, suspectId, question) => 
    api.post(`/cases/${caseId}/interrogate`, { suspectId, question }).then((res) => res.data),
  flagContradiction: (caseId, suspectId, clueId, statement) => 
    api.post(`/cases/${caseId}/contradictions`, { suspectId, clueId, statement }).then((res) => res.data),

  // Board & notebook
  updateBoard: (caseId, boardState) => 
    api.put(`/cases/${caseId}/board`, boardState).then((res) => res.data),
  updateNotebook: (caseId, notebook) => 
    api.put(`/cases/${caseId}/notebook`, { notebook }).then((res) => res.data),

  // Accusation & Results
  submitAccusation: (caseId, payload) => 
    api.post(`/cases/${caseId}/accuse`, payload).then((res) => res.data),
  getCaseResult: (caseId) => 
    api.get(`/cases/${caseId}/result`).then((res) => res.data),
  getCaseFile: (caseId) => 
    api.get(`/cases/${caseId}/file`).then((res) => res.data),

  // Leaderboard & History
  getLeaderboard: (difficulty = 'medium') => 
    api.get(`/leaderboard?difficulty=${difficulty}`).then((res) => res.data),
  getPlayerHistory: (playerId) => 
    api.get(`/cases/history/${playerId}`).then((res) => res.data)
};
