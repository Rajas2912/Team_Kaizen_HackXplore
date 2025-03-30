import React from 'react';
import { useState } from "react";
import { Bar, Pie } from 'react-chartjs-2';
import { useEffect } from 'react';
import { BASE_URL } from '../redux/constants';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useLocation, useParams } from 'react-router-dom';
import { useGetSubmissionResultQuery } from '../redux/api/assignmentSlice';
import { useSelector } from 'react-redux';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Studentreport2 = () => {
  const {assignmentId} = useParams()
 const location = useLocation();
  const { studentId } = location.state || {}; // Extract student ID from location state
const {userInfo} = useSelector(state=>state.user)
  const [reportData, setReportData] = useState({
    results: [],
    totalScore: 0,
    assignmentTitle: 'Evaluation Report',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/assignments/${studentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        const data = await response.json();
        console.log(data);

        // Assuming the backend returns an array of assignments with submissions
        // Find the specific assignment and extract the results
        const assignment = data.find((assignment) =>
          assignment.submissions.some((submission) => submission.studentId === studentId)
        );

        if (!assignment) {
          throw new Error('No assignment found for the student');
        }

        const submission = assignment.submissions.find(
          (sub) => sub.studentId === studentId
        );

        if (!submission) {
          throw new Error('No submission found for the student');
        }

        setReportData({
          results: submission.result.results,
          totalScore: submission.result.total_score,
          assignmentTitle: assignment.title,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchReportData();
    } else {
      setError('No student ID provided');
      setLoading(false);
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-800">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-800">Error</h1>
        <p className="mt-4 text-center text-gray-600">{error}</p>
      </div>
    );
  }

  const { results, totalScore, assignmentTitle } = reportData;

  // Calculate derived values
  const maxMarks = results.length * 10;
  const percentage =
    maxMarks > 0 ? ((totalScore / maxMarks) * 100).toFixed(2) : 0;
  const grade =
    percentage >= 90
      ? 'A+'
      : percentage >= 80
      ? 'A'
      : percentage >= 70
      ? 'B'
      : percentage >= 60
      ? 'C'
      : 'D';

  // Chart data configurations
  const barChartData = {
    labels: results.map((result) => `Q${result.question_no}`),
    datasets: [
      {
        label: 'Score (out of 10)',
        data: results.map((r) => r?.score || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const pieChartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [totalScore, Math.max(maxMarks - totalScore, 0)],
        backgroundColor: ['#4CAF50', '#FF5252'],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
      {/* Header Section */}
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        {assignmentTitle}
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
          <p className="text-2xl font-bold text-yellow-600">
            {results.length}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold">Question-wise Scores</h3>
          <div className="h-64">
            <Bar
              data={barChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    max: 10,
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold">Score Distribution</h3>
          <div className="h-64">
            <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Detailed Answers Section */}
      <div className="rounded-lg bg-gray-50 p-4 shadow">
        <h3 className="mb-4 text-lg font-semibold">Detailed Analysis</h3>
        <div
          className="space-y-4 overflow-y-auto pr-2"
          style={{ maxHeight: '500px' }}
        >
          {results.map((result, index) => (
            <div key={index} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <h4 className="text-lg font-semibold">
                  Q{result.question_no}: {result.question}
                </h4>
                <span
                  className={`rounded px-2 py-1 ${
                    result.score >= 8
                      ? 'bg-green-100 text-green-800'
                      : result.score >= 5
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.score.toFixed(1)}/{result.max_score}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-blue-600">
                    Student Answer:
                  </span>{' '}
                  {result.answer || 'No answer provided'}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-green-600">Context:</span>{' '}
                  {result.context?.join(' ') || 'No context available'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Studentreport2;