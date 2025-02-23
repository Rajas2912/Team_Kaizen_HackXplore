import React, { useState, useRef, useEffect } from 'react'
import { Markmap } from 'markmap-view'
import { Transformer } from 'markmap-lib'
import { Toolbar } from 'markmap-toolbar'
import 'markmap-toolbar/dist/style.css'

const transformer = new Transformer()

// Function to render the toolbar
function renderToolbar(mm, wrapper) {
  if (!wrapper) return
  while (wrapper.firstChild) wrapper.firstChild.remove()

  const toolbar = new Toolbar()
  toolbar.attach(mm)

  toolbar.register({
    id: 'alert',
    title: 'Show Alert',
    content: 'Alert',
    onClick: () => alert('You made it!'),
  })

  toolbar.setItems([...Toolbar.defaultItems, 'alert'])
  wrapper.append(toolbar.render())
}

const Mindmap = () => {
  const [value, setValue] = useState('')
  const [showModal, setShowModal] = useState(true) // Control modal visibility
  const refSvg = useRef(null)
  const refMm = useRef(null)
  const refToolbar = useRef(null)

  // Handle PDF upload
  const handleFileUpload = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:5000/mipmap', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.text()
        setValue(data) // Set the mindmap content
        setShowModal(false) // Close the modal
      } else {
        throw new Error('Failed to fetch Mipmap data')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to process the PDF. Please try again.')
    }
  }

  useEffect(() => {
    if (refMm.current) return

    const mm = Markmap.create(refSvg.current)
    refMm.current = mm
    renderToolbar(mm, refToolbar.current)
  }, [])

  useEffect(() => {
    if (!refMm.current) return

    const { root } = transformer.transform(value)
    refMm.current.setData(root).then(() => {
      refMm.current.fit()
    })
  }, [value])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Modal for PDF Upload */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
              textAlign: 'center',
            }}
          >
            <h2>Upload PDF to Generate Mindmap</h2>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) handleFileUpload(file)
              }}
              style={{ margin: '20px 0' }}
            />
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mindmap Display */}
      <svg
        ref={refSvg}
        style={{
          flex: 2,
          border: '1px solid gray',
          width: '100%',
          height: '100%',
        }}
      />
      <div
        ref={refToolbar}
        style={{ position: 'absolute', bottom: '10px', right: '10px' }}
      ></div>
    </div>
  )
}

export default Mindmap
