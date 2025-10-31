import { Calendar, MapPin, Users, Clock, Edit, Trash2 } from "lucide-react";
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
  organizer_id?: number;
  attendee_count?: number;
  user_rsvp?: string | null;
  can_edit?: boolean;
}

interface EventCardProps {
  event: Event;
  onRSVP?: (eventId: number, status: string) => Promise<void>;
  showEditOptions?: boolean;
}

export const EventCard = ({ event, onRSVP, showEditOptions = false }: EventCardProps) => {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  const handleRSVP = async (status: string) => {
    if (onRSVP) {
      await onRSVP(event.id, status);
    }
  };

  const getRSVPButtonVariant = (status: string) => {
    return event.user_rsvp === status ? "default" : "outline";
  };

  const getRSVPStatusText = (status: string) => {
    switch (status) {
      case 'going':
        return 'Going';
      case 'maybe':
        return 'Maybe';
      case 'not_going':
        return 'Not Going';
      default:
        return status;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-2">
              {!event.is_public && (
                <Badge variant="secondary" className="text-xs">
                  Private
                </Badge>
              )}
              {event.user_rsvp && (
                <Badge variant="outline" className="text-xs">
                  {getRSVPStatusText(event.user_rsvp)}
                </Badge>
              )}
            </div>
          </div>
          {showEditOptions && event.can_edit && (
            <div className="flex gap-1 ml-2">
              <Link to={`/events/${event.id}/edit`}>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this event?')) {
                    console.log('Delete event', event.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {event.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(startDate, "PPP")}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(startDate, "p")} - {format(endDate, "p")}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{event.attendee_count || 0} attendees</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3">
        <div className="text-xs text-muted-foreground w-full">
          Organized by {event.organizer}
        </div>
        
        {onRSVP && (
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              variant={getRSVPButtonVariant('going')}
              onClick={() => handleRSVP('going')}
              className="flex-1"
            >
              Going
            </Button>
            <Button
              size="sm"
              variant={getRSVPButtonVariant('maybe')}
              onClick={() => handleRSVP('maybe')}
              className="flex-1"
            >
              Maybe
            </Button>
            <Button
              size="sm"
              variant={getRSVPButtonVariant('not_going')}
              onClick={() => handleRSVP('not_going')}
              className="flex-1"
            >
              No
            </Button>
          </div>
        )}
        
        <Link to={`/events/${event.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
