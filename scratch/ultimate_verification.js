import { compareAnswers } from '../backend/services/scoreService.js';

const tests = [
  { u: 64, k: 64, expected: true, name: '64 vs 64' },
  { u: "64", k: 64, expected: true, name: '"64" vs 64' },
  { u: "Happiness", k: "HAPPINESS", expected: true, name: '"Happiness" vs "HAPPINESS"' },
  { u: " happiness ", k: "Happiness", expected: true, name: '" happiness " vs "Happiness"' },
  { u: "He doesn't like coffee.", k: "HE DOESN'T LIKE COFFEE.", expected: true, name: 'Complex sentence with punctuation' }
];

console.log('--- FINAL EVALUATION TESTS ---');
let allPassed = true;
tests.forEach(t => {
    const result = compareAnswers(t.u, t.k);
    if (result === t.expected) {
        console.log(`✅ PASSED: ${t.name}`);
    } else {
        console.log(`❌ FAILED: ${t.name} (Got: ${result})`);
        allPassed = false;
    }
});

if (allPassed) {
    console.log('\nALL ULTIMATE TESTS PASSED! Logic is permanent and robust.');
} else {
    process.exit(1);
}
