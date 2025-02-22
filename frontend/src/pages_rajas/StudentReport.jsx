import React from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useLocation } from 'react-router-dom'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

const StudentReport = () => {
  const location = useLocation()
  const {
    results = {},
    totalScore = 0,
    assignmentTitle = 'Evaluation Report',
  } = location.state || {}

  console.log('Location State:', location.state)

  // Extract the nested results array
  const resultsArray = results.results || []

  if (!Array.isArray(resultsArray)) {
    return (
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-800">
          Invalid Report Data
        </h1>
        <p className="mt-4 text-center text-gray-600">
          The report data is not in the expected format.
        </p>
      </div>
    )
  }

  if (resultsArray.length === 0) {
    return (
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-800">
          No Report Data Available
        </h1>
        <p className="mt-4 text-center text-gray-600">
          Please complete an assignment to view your report
        </p>
      </div>
    )
  }

  // Calculate derived values
  const maxMarks = resultsArray.length * 10
  const percentage =
    maxMarks > 0 ? ((totalScore / maxMarks) * 100).toFixed(2) : 0
  const grade =
    percentage >= 90
      ? 'A+'
      : percentage >= 80
        ? 'A'
        : percentage >= 70
          ? 'B'
          : percentage >= 60
            ? 'C'
            : 'D'

  // Chart data configurations
  const barChartData = {
    labels: resultsArray.map((result) => `Q${result.question_no}`),
    datasets: [
      {
        label: 'Score (out of 10)',
        data: resultsArray.map((r) => r?.score || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  }

  const pieChartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [totalScore, Math.max(maxMarks - totalScore, 0)],
        backgroundColor: ['#4CAF50', '#FF5252'],
      },
    ],
  }

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
            {resultsArray.length}
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
          {resultsArray.map((result, index) => (
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentReport
