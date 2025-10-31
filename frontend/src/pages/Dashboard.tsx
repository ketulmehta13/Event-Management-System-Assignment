import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
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

interface DashboardData {
  organized_events: Event[];
  rsvped_events: Event[];
  rsvp_count: number;
  organized_count: number;
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get('/dashboard/');
  return response.data;
};

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    enabled: isAuthenticated,
    retry: 2,
  });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleRSVP = async (eventId: number, status: string) => {
    try {
      await api.post(`/events/${eventId}/rsvp/`, { status });
      toast.success(`RSVP updated to ${status}`);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update RSVP");
    }
  };

  if (error) {
    toast.error("Failed to load dashboard data");
  }

  const myEvents = dashboardData?.organized_events || [];
  const attendingEvents = dashboardData?.rsvped_events || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.profile?.full_name || user?.username}! Manage your events and track your RSVPs
            </p>
          </div>
          <Link to="/create-event">
            <Button variant="default" size="lg">
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="p-6 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : myEvents.length}
                </p>
                <p className="text-sm text-muted-foreground">Events Organized</p>
              </div>
            </div>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <PlusCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : attendingEvents.length}
                </p>
                <p className="text-sm text-muted-foreground">Events Attending</p>
              </div>
            </div>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : myEvents.reduce((sum, event) => sum + event.attendee_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Attendees</p>
              </div>
            </div>
          </div>
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
                {isLoading ? "Loading..." : `${myEvents.length} ${myEvents.length === 1 ? "event" : "events"}`}
              </span>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : myEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onRSVP={handleRSVP}
                    showEditOptions={true}
                  />
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
                    <PlusCircle className="h-4 w-4 mr-2" />
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
                {isLoading ? "Loading..." : `${attendingEvents.length} ${attendingEvents.length === 1 ? "event" : "events"}`}
              </span>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : attendingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attendingEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onRSVP={handleRSVP}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events in your calendar</h3>
                <p className="text-muted-foreground mb-4">
                  Browse events and RSVP to see them here
                </p>
                <Link to="/">
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Browse Events
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
  