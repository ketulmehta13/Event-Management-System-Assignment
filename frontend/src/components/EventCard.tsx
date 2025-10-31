import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  is_public: boolean;
  organizer: string;
  attendee_count?: number;
}

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border">
      <CardHeader className="p-0">
        <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent"></div>
          <Calendar className="h-24 w-24 text-primary/30 absolute" />
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <h3 className="text-xl font-bold text-foreground line-clamp-2">
              {event.title}
            </h3>
          </div>
          {!event.is_public && (
            <Badge className="absolute top-4 right-4 bg-secondary">Private</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <p className="text-muted-foreground line-clamp-2 min-h-[3rem]">
          {event.description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{format(startDate, "PPP")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              {format(startDate, "p")} - {format(endDate, "p")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span>{event.attendee_count || 0} attendees</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Organized by <span className="font-semibold text-foreground">{event.organizer}</span>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link to={`/events/${event.id}`} className="w-full">
          <Button variant="default" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
