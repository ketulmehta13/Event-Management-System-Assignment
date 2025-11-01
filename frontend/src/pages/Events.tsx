import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Calendar, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  is_public: boolean;
  organizer: string;
  organizer_id: number;
  attendee_count: number;
  user_rsvp: string | null;
  can_edit: boolean;
}

interface ApiResponse {
  count?: number;
  next?: string;
  previous?: string;
  results?: Event[];
}

const fetchEvents = async (search?: string, location?: string): Promise<Event[]> => {
  try {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (location && location !== 'all') {
      params.append('location', location);
    }
    
    console.log('Fetching events with params:', params.toString());
    console.log('API URL:', `/events/?${params.toString()}`);
    
    const response = await api.get(`/events/?${params.toString()}`);
    console.log('Events API response:', response.data);
    
    // Handle paginated response or direct array
    let events: Event[] = [];
    
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        events = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        events = response.data.results;
      } else if (response.data.count !== undefined) {
        // Paginated response without results array (empty)
        events = [];
      } else {
        console.error('Unexpected response format:', response.data);
        events = [];
      }
    } else {
      console.error('Invalid response data:', response.data);
      events = [];
    }
    
    console.log('Processed events:', events);
    return events;
  } catch (error: any) {
    console.error('Error fetching events:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: events = [],
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['events', debouncedSearch, filterLocation],
    queryFn: () => fetchEvents(debouncedSearch || undefined, filterLocation),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Only retry on network errors, not 404/403 etc
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 1000,
  });

  const handleRSVP = async (eventId: number, status: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to RSVP");
      return;
    }

    try {
      const response = await api.post(`/events/${eventId}/rsvp/`, { status });
      toast.success(response.data.message || `RSVP updated to ${status}`);
      
      // Refetch events to get updated data
      refetch();
    } catch (error: any) {
      console.error('RSVP error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "Failed to update RSVP";
      toast.error(errorMessage);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Events refreshed!");
  };

  // Log for debugging
  useEffect(() => {
    console.log('Events component state:');
    console.log('- Events data:', events);
    console.log('- Events length:', events.length);
    console.log('- Is loading:', isLoading);
    console.log('- Is refetching:', isRefetching);
    console.log('- Error:', error);
    console.log('- Search query:', debouncedSearch);
    console.log('- Filter location:', filterLocation);
    console.log('- Is authenticated:', isAuthenticated);
  }, [events, isLoading, isRefetching, error, debouncedSearch, filterLocation, isAuthenticated]);

  if (error) {
    console.error("Events error:", error);
    toast.error("Failed to load events. Please try refreshing.");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80"></div>
        <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-white/90">
            Find and join events that match your interests
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="default" size="lg">
              <Calendar className="h-5 w-5 mr-2" />
              Explore Events
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search Events</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <label className="text-sm font-medium mb-2 block">Filter by Location</label>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="San Francisco">San Francisco</SelectItem>
                <SelectItem value="Chicago">Chicago</SelectItem>
                <SelectItem value="Boston">Boston</SelectItem>
                <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                <SelectItem value="Austin">Austin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Upcoming Events</h2>
          <span className="text-muted-foreground">
            {isLoading ? "Loading..." : `${events.length} ${events.length === 1 ? "event" : "events"} found`}
          </span>
        </div>
        
        
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onRSVP={handleRSVP}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {error 
                ? "There was an error loading events. Please check your connection and try again." 
                : debouncedSearch 
                  ? `No events match your search "${debouncedSearch}"` 
                  : "No events are currently available. Create the first event!"}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              {isAuthenticated && (
                <Button onClick={() => window.location.href = '/create-event'}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
