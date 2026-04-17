export const mockExams = [
  {
    id: '1',
    title: 'Full-Stack Web Development Quiz',
    category: 'Web Development',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
    duration: 30,
    passingScore: 70,
    validUntil: '2026-12-31',
    isActive: true,
    questions: [
      {
        id: 'q1',
        text: 'What is the role of a CSS preprocessor?',
        options: ['Compiling CSS to HTML', 'Extending CSS with variables and loops', 'Minifying JavaScript', 'Optimizing images'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        text: 'Which database is NoSQL?',
        options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: '2',
    title: 'JavaScript Algorithms & Logic',
    category: 'JavaScript',
    image: 'https://images.unsplash.com/photo-1579403175398-485f827c00d2?auto=format&fit=crop&q=80&w=600',
    duration: 45,
    passingScore: 75,
    validUntil: '2026-11-15',
    isActive: true,
    questions: [
      {
        id: 'q1',
        text: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: '3',
    title: 'Modern UI/UX Design Principles',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?auto=format&fit=crop&q=80&w=600',
    duration: 25,
    passingScore: 80,
    validUntil: '2026-12-01',
    isActive: true,
    questions: [
      {
        id: 'q1',
        text: 'What does UX stand for?',
        options: ['User Example', 'User Experience', 'User Extreme', 'Under X-ray'],
        correctAnswer: 1
      }
    ]
  }
];
