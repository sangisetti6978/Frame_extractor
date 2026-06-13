import { useState } from 'react'

export default function SetupWizard() {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState({
    folderPath: '',
    format: 'png',
    compressionQuality: 85,
    enableBlurDetection: false
  })

  const handleNext = () => {
    setStep(step + 1)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Setup Wizard</h2>
      
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Output Folder</label>
            <input type="text" className="w-full border rounded-md px-3 py-2" />
          </div>
          <button onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded">
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Image Format</label>
            <select className="w-full border rounded-md px-3 py-2">
              <option>PNG</option>
              <option>JPG</option>
              <option>WebP</option>
            </select>
          </div>
          <button onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
