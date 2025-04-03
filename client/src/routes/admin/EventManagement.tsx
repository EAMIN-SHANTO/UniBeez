import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Event {
  _id: string;
  title: string;
  description: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'upcoming' | 'current' | 'archived';
  organizer: {
    username: string;
  };
}

const EventManagement: React.FC = () => {
  const { API_URL } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events-21301429`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [API_URL]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      if (selectedFile) {
        formData.append('bannerImage', selectedFile);
      }

      const response = await fetch(`${API_URL}/api/events-21301429`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setShowAddForm(false);
        setSelectedFile(null);
        setPreviewUrl('');
        await fetchEvents();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to add event');
    }
  };

  const handleUpdateEvent = async (eventId: string, updatedData: Partial<Event>) => {
    try {
      const response = await fetch(`${API_URL}/api/events-21301429/${eventId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      if (data.success) {
        setEditingEvent(null);
        await fetchEvents();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`${API_URL}/api/events-21301429/${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        await fetchEvents();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  const handleArchiveEvent = async (eventId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/events-21301429/${eventId}/archive`, {
        method: 'PATCH',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        await fetchEvents();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to archive event');
    }
  };

  const handleToggleCurrent = async (eventId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/events-21301429/${eventId}/toggle-current`, {
        method: 'PATCH',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        await fetchEvents();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to toggle current status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showAddForm ? 'Cancel' : 'Add New Event'}
          </button>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Add Event Form */}
        {showAddForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Add New Event</h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="mt-1 block w-full"
                />
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="mt-2 h-40 object-cover rounded" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Event
              </button>
            </form>
          </div>
        )}

        {/* Events Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={event.bannerImage.startsWith('http') 
                          ? event.bannerImage 
                          : `${API_URL}${event.bannerImage}`}
                        alt=""
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.startDate).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.status === 'current' 
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'archived'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleCurrent(event._id)}
                        className={`${
                          event.status === 'current'
                            ? 'text-yellow-600 hover:text-yellow-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {event.status === 'current' ? 'Unset Current' : 'Set Current'}
                      </button>
                      <button
                        onClick={() => handleArchiveEvent(event._id)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        {event.status === 'archived' ? 'Unarchive' : 'Archive'}
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Event Modal */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Event</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateEvent(editingEvent._id, {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  location: formData.get('location') as string,
                  startDate: formData.get('startDate') as string,
                  endDate: formData.get('endDate') as string,
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingEvent.title}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      defaultValue={editingEvent.description}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={editingEvent.location}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      defaultValue={new Date(editingEvent.startDate).toISOString().slice(0, 16)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      defaultValue={new Date(editingEvent.endDate).toISOString().slice(0, 16)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement; 