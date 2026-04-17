import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './authContext';
import api from '../services/api';

export const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Advanced React Exam is starting tomorrow!", type: 'alert', time: '2 mins ago' },
    { id: 2, text: "Your score for UI/UX Design has been declared.", type: 'success', time: '1 hour ago' },
  ]);
 
  const { token, user } = useAuth();

  const fetchExams = async () => {
    try {
      const data = await api.get('/exams');
      const mapped = (data || []).map(e => ({
        ...e,
        status: e.is_published ? 'published' : 'draft',
        startDate: e.start_time,
        endDate: e.end_time || e.expiration_time,
        image: e.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(e.title || 'Ex')}&background=random&size=128`
      }));
      setExams(mapped);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const data = await api.get('/admin/dashboard');
      if (data.recentSubmissions) {
        setSubmissions(data.recentSubmissions);
      }
    } catch (err) {
      console.error('Admin Stats Fetch Error:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await api.get('/admin/students');
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const data = await api.get('/attempts/my');
      setSubmissions(data);
    } catch (err) {
      console.error('History Fetch Error:', err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    const tasks = [fetchExams()];
    if (user?.role === 'admin') {
      tasks.push(fetchStudents());
      tasks.push(fetchAdminStats());
    } else if (user?.role === 'student') {
      tasks.push(fetchMySubmissions());
    }
    await Promise.all(tasks);
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    } else {
      setLoading(false);
      setExams([]);
      setSubmissions([]);
      setStudents([]);
    }
  }, [token, user?.role]);

  const createExam = async (examData) => {
    try {
      const result = await api.post('/exams', examData);
      await fetchExams();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const publishExam = async (id) => {
    try {
      await api.post(`/exams/${id}/publish`);
      await fetchExams();
    } catch (err) {
      console.error('Publishing Failure:', err);
      throw err;
    }
  };

  const deleteExam = async (id) => {
    try {
      await api.delete(`/exams/${id}`);
      setExams(prev => prev.filter(exam => exam.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const fetchQuestionsForExam = async (examId) => {
    try {
      const data = await api.get(`/questions/exam/${examId}`);
      return data || [];
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      return [];
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await api.delete(`/questions/${id}`);
    } catch (err) {
      console.error('Failed to delete question:', err);
      throw err;
    }
  };

  const addQuestionsToExam = async (examId, questions) => {
    try {
      const payload = {
        exam_id: examId,
        questions: questions.map(q => ({
          type: q.type?.toLowerCase() || 'mcq',
          question_text: q.question_text || q.text || '',
          options: typeof q.options === 'object' ? JSON.stringify(q.options) : (q.options || '[]'),
          correct_answer: q.correct_answer || q.answer || '',
          marks: parseInt(q.marks) || 1,
          explanation: q.explanation || '',
          language: q.language || null,
          base_code: q.base_code || null,
          test_cases: q.test_cases || null,
          order_index: q.order_index || 0
        }))
      };
      await api.post('/questions/bulk', payload);
      await fetchExams(); 
    } catch (err) {
      console.error('Failure during bulk question upload:', err);
      throw err;
    }
  };

  const submitAttempt = async (attemptData) => {
    try {
      const res = await api.post('/attempts/submit', attemptData);
      await fetchMySubmissions();
      return res;
    } catch (err) {
      throw err;
    }
  };

  const getStudentStats = (userId) => {
    const userSubmissions = submissions.filter(s => s.user_id?.toString() === userId?.toString() || s.studentId?.toString() === userId?.toString());
    const totalScore = userSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
    const avgScore = userSubmissions.length ? (totalScore / userSubmissions.length) : 0;
    const rank = avgScore > 90 ? 1 : avgScore > 80 ? 5 : avgScore > 70 ? 12 : 25;

    return {
      completed: userSubmissions.length,
      avgScore: Math.round(avgScore),
      rank: userSubmissions.length > 0 ? rank : 'N/A',
      lastActive: userSubmissions.length ? (userSubmissions[0].submit_time || userSubmissions[0].submitTime) : 'Never'
    };
  };

  const isAttempted = (examId, userId) => {
    if (!userId || !examId) return false;
    return submissions.some(s => 
      (s.examId?.toString() === examId?.toString() || s.exam_id?.toString() === examId?.toString())
    );
  };

  return (
    <ExamContext.Provider value={{ 
      exams, 
      submissions,
      students,
      notifications,
      loading,
      searchTerm,
      setSearchTerm,
      activeExams: exams.filter(e => e.status === 'published' || e.is_published === 1),
      upcomingExams: exams.filter(e => e.status === 'published' && new Date(e.startDate) > new Date()),
      fetchExams,
      refreshData: fetchAllData,
      fetchQuestionsForExam,
      createExam,
      publishExam,
      deleteExam,
      deleteQuestion,
      addQuestionsToExam,
      submitAttempt,
      getStudentStats,
      isAttempted,
      getExamById: (id) => exams.find(e => e.id.toString() === id.toString()),
      getSubmissionsForExam: (examId) => submissions.filter(s => s.examId?.toString() === examId.toString() || s.exam_id?.toString() === examId.toString())
    }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExams = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExams must be used within an ExamProvider');
  }
  return context;
};
