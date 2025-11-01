from django.urls import path
from . import views

urlpatterns = [
    path('events/', views.EventListCreateView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    
    path('events/<int:event_id>/rsvp/', views.EventRSVPView.as_view(), name='event-rsvp'),
    path('events/<int:event_id>/rsvp/<int:user_id>/', views.UserRSVPUpdateView.as_view(), name='rsvp-update'),
    
    path('events/<int:event_id>/reviews/', views.EventReviewListCreateView.as_view(), name='event-reviews'),
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    
    path('dashboard/', views.user_dashboard, name='user-dashboard'),
]
