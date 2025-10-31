import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - will be replaced with API calls
const mockEvents = [
  {
    id: 1,
    title: "Summer Music Festival 2025",
    description: "Join us for an unforgettable night of live music featuring top artists from around the world.",
    location: "Central Park, New York",
    start_time: "2025-07-15T18:00:00",
    end_time: "2025-07-15T23:00:00",
    is_public: true,
    organizer: "Music Events Co.",
    attendee_count: 250,
  },
  {
    id: 2,
    title: "Tech Conference 2025",
    description: "Discover the latest in technology and innovation. Network with industry leaders and experts.",
    location: "Convention Center, San Francisco",
    start_time: "2025-08-20T09:00:00",
    end_time: "2025-08-20T17:00:00",
    is_public: true,
    organizer: "Tech Innovators",
    attendee_count: 500,
  },
  {
    id: 3,
    title: "Food & Wine Tasting",
    description: "Experience exquisite culinary delights paired with fine wines from local vineyards.",
    location: "Downtown Restaurant, Chicago",
    start_time: "2025-09-10T19:00:00",
    end_time: "2025-09-10T22:00:00",
    is_public: true,
    organizer: "Culinary Guild",
    attendee_count: 80,
  },
  {
    id: 4,
    title: "Marathon Running Event",
    description: "Challenge yourself in our annual city marathon. All skill levels welcome!",
    location: "City Stadium, Boston",
    start_time: "2025-10-05T07:00:00",
    end_time: "2025-10-05T14:00:00",
    is_public: true,
    organizer: "Runners Association",
    attendee_count: 1200,
  },
  {
    id: 5,
    title: "Art Gallery Opening",
    description: "Exclusive showcase of contemporary art from emerging artists. Wine and hors d'oeuvres included.",
    location: "Modern Art Gallery, Los Angeles",
    start_time: "2025-11-12T18:30:00",
    end_time: "2025-11-12T21:00:00",
    is_public: false,
    organizer: "Art Collective",
    attendee_count: 45,
  },
  {
    id: 6,
    title: "Startup Networking Mixer",
    description: "Meet fellow entrepreneurs and investors. Share ideas and build connections.",
    location: "Co-working Space, Austin",
    start_time: "2025-12-03T17:00:00",
    end_time: "2025-12-03T20:00:00",
    is_public: true,
    organizer: "Startup Hub",
    attendee_count: 150,
  },
];

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [isAuthenticated] = useState(false); // This would come from auth context

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === "all" || event.location.includes(filterLocation);
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} />
      
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            
            
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80"></div>
        </div>
        <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-white/90">
            Find and join events that match your interests
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="hero" size="xl">
              <Calendar className="h-5 w-5" />
              Explore Events
            </Button>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
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
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Upcoming Events</h2>
          <span className="text-muted-foreground">
            {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </section>
    </div>
  );
}
