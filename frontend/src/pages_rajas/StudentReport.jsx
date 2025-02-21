import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const StudentReport = ({ results = [], totalScore = 0 }) => {
  // Calculate derived values
  const maxMarks = results.length * 10;
  const percentage = maxMarks > 0 ? ((totalScore / maxMarks) * 100).toFixed(2) : 0;
  const grade = percentage >= 90 ? 'A+' :
                percentage >= 80 ? 'A' :
                percentage >= 70 ? 'B' :
                percentage >= 60 ? 'C' : 'D';

  // Chart data configurations
  const barChartData = {
    labels: results.map((_, i) => `Q${i + 1}`),
    datasets: [{
      label: 'Score (out of 10)',
      data: results.map(r => r?.score || 0),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
    }]
  };

  const pieChartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [{
      data: [totalScore, Math.max(maxMarks - totalScore, 0)],
      backgroundColor: ['#4CAF50', '#FF5252'],
    }]
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
      {/* Header Section */}
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        Evaluation Report
      </h1>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-gray-600">Total Score</p>
          <p className="text-2xl font-bold text-blue-600">
            {totalScore.toFixed(1)}/{maxMarks}
          </p>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm text-gray-600">Percentage</p>
          <p className="text-2xl font-bold text-green-600">{percentage}%</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-4">
          <p className="text-sm text-gray-600">Grade</p>
          <p className="text-2xl font-bold text-purple-600">{grade}</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-sm text-gray-600">Questions</p>
          <p className="text-2xl font-bold text-yellow-600">{results.length}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold">Question-wise Scores</h3>
          <div className="h-64">
            <Bar 
              data={barChartData} 
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold">Score Distribution</h3>
          <div className="h-64">
            <Pie
              data={pieChartData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Answers Section */}
      <div className="rounded-lg bg-gray-50 p-4 shadow">
        <h3 className="mb-4 text-lg font-semibold">Detailed Analysis</h3>
        <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '500px' }}>
          {results.map((result, index) => {
            const safeContext = Array.isArray(result?.contexts) ? result.contexts : [];
            return (
              <div key={index} className="rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between">
                  <h4 className="text-lg font-semibold">
                    Q{index + 1}: {result?.question || 'No question text'}
                  </h4>
                  <span className={`rounded px-2 py-1 ${
                    (result?.score || 0) >= 8 ? 'bg-green-100 text-green-800' :
                    (result?.score || 0) >= 5 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {(result?.score || 0).toFixed(1)}/10
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-blue-600">Student Answer:</span>{' '}
                    {result?.student_answer || 'No answer provided'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Relevant Context:</span>{' '}
                    {safeContext.join(' ').substring(0, 200) || 'No context available'}...
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentReport;