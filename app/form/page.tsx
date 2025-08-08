'use client'
import { useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { generatePdf } from '../utils/generatePdf'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const sections = [
  {
    title: 'Contact Information',
    fields: [
      { label: 'Client Name', name: 'client_name', placeholder: 'Enter your full legal name', tooltip: 'Your full legal name as it should appear in the research proposal.' },
      { label: 'Email Address', name: 'email', type: 'email', placeholder: 'name@example.com', tooltip: 'We will use this email to contact you about your proposal.' }
    ]
  },
  {
    title: 'Research Overview',
    fields: [
      { label: 'Proposed Study Title', name: 'proposed_study_title', placeholder: 'Enter the title of your proposed study', tooltip: 'Provide a concise and descriptive title for your study.' },
      { label: 'Proposed Research Gap', name: 'proposed_research_gap', placeholder: 'Describe the research gap you aim to address', tooltip: 'Identify missing, outdated, or inconsistent findings in existing research that your study will address.' },
      { label: 'Proposed Research Problem', name: 'proposed_research_problem', placeholder: 'State the problem your research will address', tooltip: 'Clearly define the specific problem or challenge your research will tackle.' },
      { label: 'Proposed Research Purpose', name: 'proposed_research_purpose', placeholder: 'State the main purpose of your research', tooltip: 'Explain the overall aim or objective of your study.' },
      { label: 'Research Questions and Hypotheses', name: 'research_questions_and_hypotheses', placeholder: 'List your main research questions or hypotheses', tooltip: 'Provide the specific research questions or hypotheses your study will investigate.' },
      { label: 'Theoretical or Conceptual Framework', name: 'theoretical_or_conceptual_framework', placeholder: 'Describe the framework guiding your research', tooltip: 'Outline the theory or concept that forms the foundation of your study.' }
    ]
  },
  {
    title: 'Methodology & Data',
    fields: [
      { label: 'Methodology', name: 'methodology', placeholder: 'Describe your research methodology', tooltip: 'Explain the overall approach or research strategy you will use (e.g., qualitative, quantitative, mixed methods).' },
      { label: 'Design', name: 'design', placeholder: 'Describe your study design', tooltip: 'Detail the structure or plan of your study, such as experimental, survey, or case study.' },
      { label: 'Data Sources', name: 'data_sources', placeholder: 'List your data sources', tooltip: 'Identify the primary and secondary data sources for your research.' },
      { label: 'Data Collection Procedure', name: 'data_collection_procedure', placeholder: 'Describe how you will collect your data', tooltip: 'Explain the step-by-step process you will use to gather data.' },
      { label: 'Data Analysis', name: 'data_analysis', placeholder: 'Describe how you will analyze your data', tooltip: 'Outline the techniques or methods you will use to interpret your data.' }
    ]
  },
  {
    title: 'Additional Notes',
    fields: [
      { label: 'Client Notes', name: 'client_notes', placeholder: 'Any additional notes or comments', tooltip: 'Include any extra information, clarifications, or requests related to your proposal.' }
    ]
  }
]

export default function Home() {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>([sections[0].title])
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  const toggleSection = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title) ? prev.filter(s => s !== title) : [...prev, title]
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const goToNextSection = (index: number) => {
    const current = sections[index]
    const allFilled = current.fields.every(f => formData[f.name]?.trim())
    if (!allFilled) {
      alert('Please fill all fields in this section before continuing.')
      return
    }

    const next = sections[index + 1]
    if (next) {
      // Close current, open next
      setOpenSections([next.title])
      sectionRefs.current[index + 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const { error } = await supabase.from('proposals').insert([formData])
    setLoading(false)

    if (!error) {
      setSuccess(true)
      generatePdf(formData)
      setFormData({})
      setOpenSections([sections[0].title]) // reset form view
    } else {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Research Proposal Form</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {sections.map((section, idx) => (
            <div
              key={section.title}
              ref={el => { sectionRefs.current[idx] = el; }}
              className="border rounded"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="w-full flex justify-between items-center p-3 bg-blue-600 text-white font-semibold rounded-t hover:bg-blue-700"
              >
                {section.title}
                <span>{openSections.includes(section.title) ? '▲' : '▼'}</span>
              </button>

              {openSections.includes(section.title) && (
                <div className="p-4 space-y-4 bg-white">
                  {section.fields.map((field) => (
                    <div key={field.name}>
                      <label className="flex items-center font-medium relative group">
                        {field.label}
                        {field.tooltip && (
                          <span className="ml-2 text-blue-600 cursor-pointer relative">
                            ℹ️
                            <span className="absolute left-0 top-6 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                              {field.tooltip}
                            </span>
                          </span>
                        )}
                      </label>
                      {field.type === 'email' || field.type === 'text' || !field.type ? (
                        <input
                          type={field.type || 'text'}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          required
                          placeholder={field.placeholder}
                          className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
                        />
                      ) : (
                        <textarea
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          required
                          placeholder={field.placeholder}
                          className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
                        />
                      )}
                    </div>
                  ))}
                  {idx < sections.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => goToNextSection(idx)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Next ➡
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Submit & Download PDF'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {success && (
            <p className="text-green-600 font-medium mt-4">
              ✅ Your proposal has been saved and downloaded as PDF!
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
