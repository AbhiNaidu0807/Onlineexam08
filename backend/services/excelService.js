import xlsx from 'xlsx';
import fs from 'fs';

export const parseExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const imported = [];
    const failed = [];

    data.forEach((row, index) => {
      const { question_text, type, option_a, option_b, option_c, option_d, correct_answer, marks, explanation } = row;
      
      const validationErrors = [];
      if (!question_text) validationErrors.push('Missing question_text');
      if (!type || !['MCQ', 'SHORT', 'CODING'].includes(type.toUpperCase())) validationErrors.push('Invalid type');
      if (type.toUpperCase() === 'MCQ' && (!option_a || !option_b)) validationErrors.push('MCQ requires options');
      if (!correct_answer) validationErrors.push('Missing correct_answer');
      
      if (validationErrors.length > 0) {
        failed.push({ row: index + 2, reason: validationErrors.join(', ') });
      } else {
        const options = type.toUpperCase() === 'MCQ' ? [option_a, option_b, option_c, option_d].filter(o => o) : null;
        imported.push({
          question_text,
          type: type.toUpperCase(),
          options: options ? JSON.stringify(options) : null,
          correct_answer,
          marks: marks || 1,
          explanation: explanation || '',
          language: row.language || null,
          base_code: row.base_code || null,
          test_cases: row.test_cases || null
        });
      }
    });

    return { imported, failed };
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw error;
  } finally {
    // Clean up temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};
