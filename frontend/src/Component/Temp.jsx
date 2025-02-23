import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const API = import.meta.env.VITE_BACKEND_URL;

const Temp = () => {
  const { userInfo } = useSelector((state) => state.user); // Get user info from Redux store
  const [userid, setUserid] = useState(null); // State to store user ID

  console.log('User Info:', userInfo); // Log user info to console

  // Update userid when userInfo._id changes
  useEffect(() => {
    if (userInfo?._id) {
      setUserid(userInfo._id);
    }
  }, [userInfo?._id]);

  // Fetch quiz results when userid changes
  useEffect(() => {
    const fetchViviaResult = async () => {
      if (!userid) return; // Don't fetch if userid is not available

      try {
        const response = await axios.get(`${API}/vivaresult/getvivaresultbystudentid/${userid}`);
        console.log('Viva result :', response?.data); // Log quiz results to console
      } catch (error) {
        console.error('Error fetching quiz results:', error); // Log errors
      }
    };

    fetchViviaResult();
  }, [userid]);
  useEffect(() => {
    const fetchduedate = async () => {
      if (!userid) return; // Don't fetch if userid is not available

      try {
        const response = await axios.get(`${API}/dashboard/getduedate/${userid}`);
        console.log('Due  Dates :', response?.data); // Log quiz results to console
      } catch (error) {
        console.error('Error fetching quiz results:', error); // Log errors
      }
    };

    fetchduedate();
  }, [userid]);
  useEffect(() => {
    const fetchQuizResult = async () => {
      if (!userid) return; // Don't fetch if userid is not available
      try {
        const response = await axios.get(`${API}/quizresult/quizresultbystudentid/${userid}`);
        console.log('Quiz Results:', response?.data); // Log quiz results to console
      } catch (error) {
        console.error('Error fetching quiz results:', error); // Log errors
      }
    };
    fetchQuizResult();
  }, [userid]);

  return (
    <>
      <div>This is the temp file</div>
    </>
  );
};

export default Temp;