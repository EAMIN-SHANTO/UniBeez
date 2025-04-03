import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Event {
  _id: string;
  title: string;
  bannerImage: string;
  startDate: string;
  location: string;
  status: string;
}

const EventSlideshow: React.FC = () => {
  const { API_URL } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Default placeholder events
  const placeholderEvents = [
    {
      _id: 'placeholder1',
      title: 'Welcome to UniBeez Events',
      bannerImage: 'https://placehold.co/1200x600/648dcb/ffffff?text=Welcome+to+UniBeez+Events',
      startDate: new Date().toISOString(),
      location: 'Online',
      status: 'current'
    },
    {
      _id: 'placeholder2',
      title: 'Upcoming University Events',
      bannerImage: 'https://placehold.co/1200x600/4a90e2/ffffff?text=University+Events',
      startDate: new Date().toISOString(),
      location: 'Campus',
      status: 'upcoming'
    }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/api/events-21301429`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success && data.events.length > 0) {
          setEvents(data.events);
        } else {
          setEvents(placeholderEvents);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setEvents(placeholderEvents);
      }
    };

    fetchEvents();
  }, [API_URL]);

  const handleSlideChange = (newIndex: number) => {
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    if (events.length > 1) {
      const timer = setInterval(() => {
        handleSlideChange((currentIndex + 1) % events.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [events.length, currentIndex]);

  const displayEvents = events.length > 0 ? events : placeholderEvents;

  return (
    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-lg bg-gray-100">
      {displayEvents.map((event, index) => (
        <div
          key={event._id}
          className={`absolute inset-0 transform transition-all duration-500 ease-in-out ${
            index === currentIndex 
              ? 'opacity-100 translate-x-0 scale-100' 
              : index < currentIndex
              ? 'opacity-0 -translate-x-full scale-95'
              : 'opacity-0 translate-x-full scale-95'
          }`}
          style={{
            zIndex: index === currentIndex ? 20 : 10,
          }}
        >
          <img
            src={event.bannerImage.startsWith('http') 
              ? event.bannerImage 
              : `${API_URL}${event.bannerImage}`}
            alt={event.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isTransitioning ? 'scale-105' : 'scale-100'
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/1200x600/648dcb/ffffff?text=UniBeez+Events';
            }}
          />
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 transform transition-all duration-500 ${
              isTransitioning ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
            <div className="flex items-center justify-between text-white/80">
              <span>{new Date(event.startDate).toLocaleDateString()}</span>
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {displayEvents.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 transform ${
              index === currentIndex 
                ? 'bg-white scale-125 shadow-lg' 
                : 'bg-white/50 hover:bg-white/75 hover:scale-110'
            }`}
            onClick={() => handleSlideChange(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default EventSlideshow; 