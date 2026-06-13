import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Profile() {
  const { user, loading } = useContext(AuthContext)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    // TODO: Implement profile update API call
    setEditMode(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <p className="text-sm text-gray-600">Username</p>
            <p className="text-xl font-bold">{user?.username}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-50 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              disabled={!editMode}
              className="mt-1 block w-full border rounded-md px-3 py-2 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={!editMode}
              className="mt-1 block w-full border rounded-md px-3 py-2 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!editMode}
              className="mt-1 block w-full border rounded-md px-3 py-2 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="mt-1 text-gray-600">
              {new Date(user?.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
