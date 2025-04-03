import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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

const Events: React.FC = () => {
  const { user, API_URL } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    status: 'upcoming' as const
  });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    console.log('Fetching events...');
    try {
      console.log('Making request to:', `${API_URL}/api/events-21301429`);
      const response = await fetch(`${API_URL}/api/events-21301429`, {
        credentials: 'include'
      });
      console.log('Response received:', response);
      const data = await response.json();
      console.log('Data received:', data);
      
      if (data.success) {
        setEvents(data.events);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Events component mounted');
    fetchEvents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!selectedFile) {
        setError('Please select an image file');
        return;
      }

      // Create FormData with all the required fields
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('startDate', newEvent.startDate);
      formData.append('endDate', newEvent.endDate);
      formData.append('location', newEvent.location);
      formData.append('status', newEvent.status);
      formData.append('bannerImage', selectedFile);

      console.log('Submitting form data:', {
        title: newEvent.title,
        description: newEvent.description,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
        location: newEvent.location,
        status: newEvent.status,
        file: selectedFile.name
      });

      const response = await fetch(`${API_URL}/api/events-21301429`, {
        method: 'POST',
        credentials: 'include',
        body: formData // Don't set Content-Type header for FormData
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }

      if (data.success) {
        setShowAddForm(false);
        setNewEvent({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          location: '',
          status: 'upcoming'
        });
        setSelectedFile(null);
        setPreviewUrl('');
        await fetchEvents();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`${API_URL}/api/events-21301429/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchEvents();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
    }
  };

  const handleArchive = async (eventId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/events-21301429/${eventId}/archive`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchEvents();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error archiving event:', err);
      setError('Failed to archive event');
    }
  };

  const handleToggleCurrent = async (eventId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/events-21301429/${eventId}/toggle-current`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle current status');
      }

      if (data.success) {
        await fetchEvents();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error toggling current status:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle current status');
    }
  };

  const handleUpdate = async (eventId: string, updatedData: Partial<Event>) => {
    try {
      const url = `${API_URL}/api/events-21301429/${eventId}`;
      console.log('Making request to:', url);
      console.log('With data:', updatedData);
      
      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      console.log('Update response:', response);
      const data = await response.json();
      console.log('Update data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update event');
      }

      if (data.success) {
        setEditingEvent(null);
        await fetchEvents();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
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
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showAddForm ? 'Cancel' : 'Add New Event'}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Image <span className="text-gray-500">(Max 5MB)</span>
                </label>
                <input
                  type="file"
                  name="bannerImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {selectedFile && selectedFile.size > 5 * 1024 * 1024 && (
                  <p className="mt-1 text-sm text-red-600">
                    File is too large. Please select an image under 5MB.
                  </p>
                )}
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Event
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={event.bannerImage.startsWith('http') 
                  ? event.bannerImage 
                  : `${API_URL}${event.bannerImage}`}
                alt={event.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/600x400?text=No+Image';
                }}
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                  {(user?.role === 'admin' || user?.role === 'staff') && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleCurrent(event._id)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          event.status === 'current'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                        }`}
                      >
                        {event.status === 'current' ? 'Unset Current' : 'Set Current'}
                      </button>
                      <button
                        onClick={() => handleArchive(event._id)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  <span>{event.location}</span>
                </div>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    event.status === 'current' 
                      ? 'bg-green-100 text-green-800' 
                      : event.status === 'archived'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Event</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedData = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  location: formData.get('location') as string,
                  startDate: formData.get('startDate') as string,
                  endDate: formData.get('endDate') as string,
                };
                console.log('Form data:', updatedData);
                await handleUpdate(editingEvent._id, updatedData);
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

export default Events; 