import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

// Mock data
const mockEvent = {
  id: 1,
  title: "Summer Music Festival 2025",
  description:
    "Join us for an unforgettable night of live music featuring top artists from around the world. Experience amazing performances, food trucks, and a vibrant atmosphere under the stars.",
  location: "Central Park, New York",
  start_time: "2025-07-15T18:00:00",
  end_time: "2025-07-15T23:00:00",
  is_public: true,
  organizer: "Music Events Co.",
  organizer_id: 1,
  attendee_count: 250,
};

const mockReviews = [
  {
    id: 1,
    user: "John Doe",
    rating: 5,
    comment: "Absolutely amazing event! Great music and wonderful atmosphere.",
    created_at: "2025-07-16T10:00:00",
  },
  {
    id: 2,
    user: "Jane Smith",
    rating: 4,
    comment: "Had a fantastic time. The organization was top-notch!",
    created_at: "2025-07-16T14:30:00",
  },
];

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rsvpStatus, setRsvpStatus] = useState<string>("not_going");
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isAuthenticated] = useState(false);
  const [currentUserId] = useState(2);

  const event = mockEvent;
  const reviews = mockReviews;
  const isOrganizer = currentUserId === event.organizer_id;

  const handleRSVP = () => {
    if (!isAuthenticated) {
      toast.error("Please login to RSVP");
      navigate("/login");
      return;
    }
    toast.success(`RSVP updated to: ${rsvpStatus}`);
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
    toast.success("Review submitted successfully!");
    setReviewComment("");
  };

  const handleDelete = () => {
    toast.success("Event deleted successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
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
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-lg text-muted-foreground">{event.description}</p>
            </div>

            {/* Event Details Card */}
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

            {/* Reviews Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Reviews</h2>

              {/* Add Review Form */}
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
                  <Button onClick={handleSubmitReview} className="w-full">
                    Submit Review
                  </Button>
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {reviews.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No reviews yet. Be the first to review this event!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RSVP Card */}
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
                <Button onClick={handleRSVP} className="w-full" variant="success">
                  Update RSVP
                </Button>
              </CardContent>
            </Card>

            {/* Organizer Card */}
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
