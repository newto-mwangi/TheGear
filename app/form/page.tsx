'use client'

import { useForm } from 'react-hook-form'
import { generatePdf } from '../utils/generatePdf'
import { supabase } from '../lib/supabase'
import { useState, useRef } from 'react'

const fields = [
  { section: 'Contact Information', items: [
    { label: 'Client Name', name: 'client_name', placeholder: 'Enter your full name' },
    { label: 'Email Address', name: 'email', placeholder: 'Enter your email (e.g. name@example.com)', type: 'email' },
  ]},
  { section: 'Research Overview', items: [
    { label: 'Proposed Study Title', name: 'proposed_study_title', placeholder: 'Enter your research proposal title' },
    { label: 'Proposed Research Gap', name: 'proposed_research_gap', placeholder: 'Describe the gap in existing research' },
    { label: 'Proposed Research Problem', name: 'proposed_research_problem', placeholder: 'State the problem you want to solve' },
    { label: 'Proposed Research Purpose', name: 'proposed_research_purpose', placeholder: 'State the main purpose of the study' },
    { label: 'Research Questions and Hypotheses', name: 'research_questions_and_hypotheses', placeholder: 'List your main research questions and hypotheses' },
    { label: 'Theoretical or Conceptual Framework', name: 'theoretical_or_conceptual_framework', placeholder: 'Name and describe the theory or framework guiding your study' },
  ]},
  { section: 'Methodology & Data', items: [
    { label: 'Methodology', name: 'methodology', placeholder: 'Describe your chosen methodology (qualitative, quantitative, etc.)' },
    { label: 'Design', name: 'design', placeholder: 'Explain the research design (e.g., case study, experimental design)' },
    { label: 'Data Sources', name: 'data_sources', placeholder: 'Specify the data sources you will use' },
    { label: 'Data Collection Procedure', name: 'data_collection_procedure', placeholder: 'Explain how and where you will collect data' },
    { label: 'Data Analysis', name: 'data_analysis', placeholder: 'Describe your planned data analysis methods' },
  ]},
  { section: 'Additional Notes', items: [
    { label: 'Client Notes', name: 'client_notes', placeholder: 'Any extra notes or comments' },
  ]}
]

export default function FormPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [submittedData, setSubmittedData] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const topRef = useRef<HTMLDivElement | null>(null)

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true)
    setSuccessMessage(null)

    const { error } = await supabase.from('proposals').insert([data])

    // Scroll to top to show message
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    if (error) {
      console.error('Supabase insert error:', error)
      setSuccessMessage('❌ Failed to save. Please try again.')
    } else {
      setSuccessMessage('✅ Proposal saved successfully!')
      setSubmittedData(data)
      reset()
    }
    setLoading(false)
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        
        {/* Scroll target for messages */}
        <div ref={topRef}></div>

        <h1 className="text-3xl font-bold mb-6 text-center">Research Proposal Form</h1>

        {successMessage && (
          <div
            className={`mb-6 p-3 rounded-md text-white text-center ${
              successMessage.startsWith('✅') ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {fields.map((section) => (
            <div key={section.section}>
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">{section.section}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.items.map((field) => (
                  <div key={field.name} className="flex flex-col space-y-2 md:col-span-2">
                    <label className="font-medium">{field.label}</label>

                    {field.type === 'email' ? (
                      <>
                        <input
                          type="email"
                          placeholder={field.placeholder}
                          {...register(field.name, { required: `${field.label} is required` })}
                          className="w-full border border-gray-300 p-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {errors[field.name] && (
                          <p className="text-red-500 text-sm">{errors[field.name]?.message as string}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <textarea
                          placeholder={field.placeholder}
                          {...register(field.name, { required: `${field.label} is required` })}
                          rows={3}
                          className="w-full border border-gray-300 p-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                        />
                        {errors[field.name] && (
                          <p className="text-red-500 text-sm">{errors[field.name]?.message as string}</p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-col md:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>

            {submittedData && (
              <button
                type="button"
                onClick={() => generatePdf(submittedData)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Download PDF
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
