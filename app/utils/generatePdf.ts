import jsPDF from 'jspdf'

// Logo path — place your logo in /public/logo.png
const logoPath = '/logo.png'

export async function generatePdf(data: Record<string, string>) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let y = 20

  // ===== Draw border for first page =====
  drawPageBorder(doc)

  // ===== Header with Logo =====
  try {
    const img = await fetch(logoPath)
    const blob = await img.blob()
    const reader = new FileReader()
    await new Promise<void>((resolve) => {
      reader.onloadend = () => {
        const base64 = reader.result as string
        doc.addImage(base64, 'PNG', 16, 12, 18, 18) // logo in top-left
        resolve()
      }
      reader.readAsDataURL(blob)
    })
  } catch {
    console.warn('Logo not found, skipping...')
  }

  // Title
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Research Portal', pageWidth / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(16)
  doc.text('Research Proposal Plan', pageWidth / 2, y, { align: 'center' })
  y += 6

  // Date
  doc.setFontSize(10)
  doc.setFont('Helvetica', 'normal')
  const dateStr = new Date().toLocaleDateString()
  doc.text(`Date: ${dateStr}`, pageWidth / 2, y, { align: 'center' })
  y += 10

  // ===== Sections =====
  const sections = [
    {
      title: 'Contact Information',
      fields: [
        { label: 'Client Name', key: 'client_name' },
        { label: 'Email Address', key: 'email' },
      ],
    },
    {
      title: 'Research Overview',
      fields: [
        { label: 'Proposed Study Title', key: 'proposed_study_title' },
        { label: 'Proposed Research Gap', key: 'proposed_research_gap' },
        { label: 'Significance', key: 'significance' },
        { label: 'Proposed Research Problem', key: 'proposed_research_problem' },
        { label: 'Proposed Research Purpose', key: 'proposed_research_purpose' },
        { label: 'Research Questions and Hypotheses', key: 'research_questions_and_hypotheses' },
        { label: 'Theoretical or Conceptual Framework', key: 'theoretical_or_conceptual_framework' },
      ],
    },
    {
      title: 'Methodology & Data',
      fields: [
        { label: 'Methodology', key: 'methodology' },
        { label: 'Design', key: 'design' },
        { label: 'Data Sources', key: 'data_sources' },
        { label: 'Data Collection Procedure', key: 'data_collection_procedure' },
        { label: 'Data Analysis', key: 'data_analysis' },
      ],
    },
    {
      title: 'Additional Notes',
      fields: [
        { label: 'Client Notes', key: 'client_notes' },
      ],
    },
  ]

  sections.forEach((section) => {
    // Section header
    doc.setFillColor(30, 64, 175) // Blue
    doc.rect(16, y, pageWidth - 32, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(section.title, 18, y + 6)
    y += 12

    // Fields
    section.fields.forEach((field) => {
      const value = data[field.key] || '-'

      doc.setFillColor(243, 244, 246) // Light gray
      const textLines = doc.splitTextToSize(`${value}`, pageWidth - 44)
      const boxHeight = textLines.length * 6 + 10
      doc.rect(16, y, pageWidth - 32, boxHeight, 'F')

      doc.setTextColor(17, 24, 39) // Dark text
      doc.setFont('Helvetica', 'bold')
      doc.text(field.label, 20, y + 6)

      doc.setFont('Helvetica', 'normal')
      doc.text(textLines, 20, y + 12)

      y += boxHeight + 4

      // Page break check
      if (y > pageHeight - 20) {
        addFooter(doc)
        doc.addPage()
        drawPageBorder(doc)
        y = 20
      }
    })
  })

  // Footer on last page
  addFooter(doc)

  doc.save('research_proposal.pdf')
}

// Draw faint border around page content
function drawPageBorder(doc: jsPDF) {
  doc.setDrawColor(200, 200, 200) // light gray border
  doc.setLineWidth(0.5)
  doc.rect(10, 10, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 20)
}

// Footer for each page
function addFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(9)
  doc.setFont('Helvetica', 'italic')
  doc.setTextColor(100, 100, 100)
  doc.text(
    'Generated via Research Portal',
    doc.internal.pageSize.width / 2,
    pageHeight - 10,
    { align: 'center' }
  )
}
