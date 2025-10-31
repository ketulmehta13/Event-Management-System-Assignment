from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q
from .models import Event, RSVP, Review
from .serializers import EventSerializer, EventDetailSerializer, RSVPSerializer, ReviewSerializer
from .permissions import IsOrganizerOrReadOnly, IsOwnerOrReadOnly, CanViewPrivateEvent
import logging

logger = logging.getLogger(__name__)


class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_public', 'organizer']
    search_fields = ['title', 'description', 'location', 'organizer__username']
    ordering_fields = ['created_at', 'start_time', 'title']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.request.method == 'POST':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = Event.objects.all()
        user = self.request.user
        
        # Log for debugging
        logger.info(f"User authenticated: {user.is_authenticated}")
        logger.info(f"Total events in database: {queryset.count()}")
        
        # If user is not authenticated, only show public events
        if not user.is_authenticated:
            public_queryset = queryset.filter(is_public=True)
            logger.info(f"Public events for unauthenticated user: {public_queryset.count()}")
            return public_queryset
        
        # If user is authenticated, show public events and private events they organize or RSVPed to
        public_events = Q(is_public=True)
        organized_events = Q(organizer=user)
        rsvped_events = Q(rsvps__user=user)
        
        filtered_queryset = queryset.filter(public_events | organized_events | rsvped_events).distinct()
        logger.info(f"Filtered events for authenticated user {user.username}: {filtered_queryset.count()}")
        
        return filtered_queryset

    def perform_create(self, serializer):
        event = serializer.save(organizer=self.request.user)
        logger.info(f"Created event: {event.title} by {self.request.user.username}")

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        logger.info(f"API Response - Events count: {len(response.data.get('results', response.data))}")
        return response


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    permission_classes = [CanViewPrivateEvent, IsOrganizerOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EventDetailSerializer
        return EventSerializer

    def get_object(self):
        obj = super().get_object()
        # Add user RSVP status to the object
        if self.request.user.is_authenticated:
            try:
                rsvp = RSVP.objects.get(event=obj, user=self.request.user)
                obj.user_rsvp = rsvp.status
            except RSVP.DoesNotExist:
                obj.user_rsvp = None
        return obj


class EventRSVPView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RSVPSerializer
    
    def post(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user can access this event
        if not event.is_public:
            if event.organizer != request.user:
                return Response({'error': 'You cannot RSVP to this private event'}, 
                              status=status.HTTP_403_FORBIDDEN)
        
        status_value = request.data.get('status', 'going')
        
        if status_value not in ['going', 'maybe', 'not_going']:
            return Response({'error': 'Invalid RSVP status'}, status=status.HTTP_400_BAD_REQUEST)
        
        rsvp, created = RSVP.objects.get_or_create(
            event=event,
            user=request.user,
            defaults={'status': status_value}
        )
        
        if not created:
            rsvp.status = status_value
            rsvp.save()
        
        # Update event's attendee count if method exists
        if hasattr(event, 'update_attendee_count'):
            event.update_attendee_count()
        
        serializer = RSVPSerializer(rsvp, context={'request': request})
        return Response({
            'message': f'RSVP updated to {status_value}',
            'rsvp': serializer.data,
            'attendee_count': event.attendee_count if hasattr(event, 'attendee_count') else 0
        }, status=status.HTTP_200_OK)


class UserRSVPUpdateView(generics.UpdateAPIView):
    queryset = RSVP.objects.all()
    serializer_class = RSVPSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_object(self):
        event_id = self.kwargs.get('event_id')
        user_id = self.kwargs.get('user_id')
        return RSVP.objects.get(event_id=event_id, user_id=user_id)


class EventReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        event_id = self.kwargs.get('event_id')
        return Review.objects.filter(event_id=event_id).order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        # Get event_id from URL
        event_id = self.kwargs.get('event_id')
        
        try:
            # Verify event exists
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user already reviewed this event
        if Review.objects.filter(event=event, user=request.user).exists():
            return Response(
                {'error': 'You have already reviewed this event'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate the serializer with the request data
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Save with event and user set
        try:
            review = serializer.save(event=event, user=request.user)
            logger.info(f"Created review for event {event.title} by {request.user.username}")
            
            # Return the created review data
            return Response(
                self.get_serializer(review).data, 
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Error creating review: {str(e)}")
            return Response(
                {'error': 'Failed to create review'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard(request):
    user = request.user
    
    # Get user's organized events
    organized_events = Event.objects.filter(organizer=user).order_by('-created_at')
    
    # Get user's RSVPs with related events
    user_rsvps = RSVP.objects.filter(user=user).select_related('event').order_by('-created_at')
    
    # Get events user RSVPed to (going or maybe)
    rsvped_events = [rsvp.event for rsvp in user_rsvps if rsvp.status in ['going', 'maybe']]
    
    # Add user_rsvp status to each event
    for event in organized_events:
        try:
            rsvp = user_rsvps.filter(event=event).first()
            event.user_rsvp = rsvp.status if rsvp else None
        except:
            event.user_rsvp = None
    
    for event in rsvped_events:
        try:
            rsvp = user_rsvps.filter(event=event).first()
            event.user_rsvp = rsvp.status if rsvp else None
        except:
            event.user_rsvp = None
    
    return Response({
        'organized_events': EventSerializer(organized_events, many=True, context={'request': request}).data,
        'rsvped_events': EventSerializer(rsvped_events, many=True, context={'request': request}).data,
        'rsvp_count': len(rsvped_events),
        'organized_count': organized_events.count(),
    })
