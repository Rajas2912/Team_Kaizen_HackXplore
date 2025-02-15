import { Button } from '@mui/material'
import React from 'react'
import { FaPlus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import './AllTeaching.css'

const AllTeaching = () => {
  const navigate = useNavigate()

  return (
    <section>
      <div className="buttonContainer">
        <Button
          variant="contained"
          endIcon={<FaPlus />}
          onClick={() => navigate('/createClass')}
        >
          Create Class
        </Button>
      </div>
      Than
    </section>
  )
}

export default AllTeaching
