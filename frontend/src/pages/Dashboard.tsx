import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Mock data
const myEvents = [
  {
    id: 1,
    title: "Summer Music Festival 2025",
    description: "Join us for an unforgettable night of live music featuring top artists.",
    location: "Central Park, New York",
    start_time: "2025-07-15T18:00:00",
    end_time: "2025-07-15T23:00:00",
    is_public: true,
    organizer: "John Doe",
    attendee_count: 250,
  },
];

const attendingEvents = [
  {
    id: 2,
    title: "Tech Conference 2025",
    description: "Discover the latest in technology and innovation.",
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
    description: "Experience exquisite culinary delights.",
    location: "Downtown Restaurant, Chicago",
    start_time: "2025-09-10T19:00:00",
    end_time: "2025-09-10T22:00:00",
    is_public: true,
    organizer: "Culinary Guild",
    attendee_count: 80,
  },
];

export default function Dashboard() {
  const [isAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your events and track your RSVPs
            </p>
          </div>
          <Link to="/create-event">
            <Button variant="default" size="lg">
              <PlusCircle className="h-5 w-5" />
              Create Event
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="organized" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="organized">Events I Organize</TabsTrigger>
            <TabsTrigger value="attending">Events I'm Attending</TabsTrigger>
          </TabsList>

          <TabsContent value="organized" className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span>
                {myEvents.length} {myEvents.length === 1 ? "event" : "events"}
              </span>
            </div>
            {myEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first event to get started
                </p>
                <Link to="/create-event">
                  <Button>
                    <PlusCircle className="h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attending" className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span>
                {attendingEvents.length}{" "}
                {attendingEvents.length === 1 ? "event" : "events"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
