import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/ReviewCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Edit,
  Trash2,
  Star,
  ArrowLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

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
  reviews: Review[];
}

interface Review {
  id: number;
  user: string;
  user_full_name: string;
  rating: number;
  comment: string;
  created_at: string;
  can_edit: boolean;
}

const fetchEvent = async (id: string): Promise<Event> => {
  const response = await api.get(`/events/${id}/`);
  return response.data;
};

const fetchReviews = async (eventId: string): Promise<Review[]> => {
  const response = await api.get(`/events/${eventId}/reviews/`);
  return response.data.results || response.data;
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [rsvpStatus, setRsvpStatus] = useState<string>("not_going");
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");

  const {
    data: event,
    isLoading: eventLoading,
    error: eventError
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEvent(id!),
    enabled: !!id,
  });

  const {
    data: reviews = [],
    isLoading: reviewsLoading
  } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetchReviews(id!),
    enabled: !!id,
  });

  const rsvpMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await api.post(`/events/${id}/rsvp/`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      toast.success(`RSVP updated to: ${rsvpStatus}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update RSVP");
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number, comment: string }) => {
      const response = await api.post(`/events/${id}/reviews/`, reviewData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      setReviewComment("");
      setRating(5);
      toast.success("Review submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to submit review");
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/events/${id}/`);
    },
    onSuccess: () => {
      toast.success("Event deleted successfully");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete event");
    }
  });

  const handleRSVP = () => {
    if (!isAuthenticated) {
      toast.error("Please login to RSVP");
      navigate("/login");
      return;
    }
    rsvpMutation.mutate(rsvpStatus);
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      toast.error("Please login to submit a review");
      navigate("/login");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    reviewMutation.mutate({
      rating,
      comment: reviewComment,
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate();
    }
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const isOrganizer = user?.id === event.organizer_id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-4xl font-bold">{event.title}</h1>
                {isOrganizer && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/events/${id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleDelete}
                      disabled={deleteEventMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-lg text-muted-foreground">{event.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-muted-foreground">
                      {format(new Date(event.start_time), "PPPP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Time</p>
                    <p className="text-muted-foreground">
                      {format(new Date(event.start_time), "p")} -{" "}
                      {format(new Date(event.end_time), "p")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Attendees</p>
                    <p className="text-muted-foreground">
                      {event.attendee_count} people going
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Reviews</h2>

              {isAuthenticated && (
                <Card>
                  <CardHeader>
                    <CardTitle>Leave a Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center gap-2 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setRating(i + 1)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                i < rating
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="review">Your Review</Label>
                      <Textarea
                        id="review"
                        placeholder="Share your experience..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <Button 
                      onClick={handleSubmitReview} 
                      className="w-full"
                      disabled={reviewMutation.isPending}
                    >
                      {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-16 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No reviews yet. Be the first to review this event!
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>RSVP to Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Your Response</Label>
                  <Select value={rsvpStatus} onValueChange={setRsvpStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="going">Going</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                      <SelectItem value="not_going">Not Going</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleRSVP} 
                  className="w-full"
                  disabled={rsvpMutation.isPending}
                >
                  {rsvpMutation.isPending ? "Updating..." : "Update RSVP"}
                </Button>
                {event.user_rsvp && (
                  <p className="text-sm text-center text-muted-foreground">
                    Current status: <strong>{event.user_rsvp.replace('_', ' ')}</strong>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organized By</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-lg">{event.organizer}</p>
                <Button variant="outline" className="w-full mt-4">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
