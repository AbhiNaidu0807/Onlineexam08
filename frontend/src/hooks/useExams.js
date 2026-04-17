import { useContext } from 'react';
import { ExamContext } from '../context/ExamContext';

export const useExams = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExams must be used within an ExamProvider');
  }
  return context;
};
