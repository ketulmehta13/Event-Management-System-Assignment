from rest_framework import permissions

class IsOrganizerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow organizers of an event to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the organizer of the event.
        return obj.organizer == request.user

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object.
        return obj.user == request.user

class CanViewPrivateEvent(permissions.BasePermission):
    """
    Custom permission to restrict access to private events.
    Only organizer and users who have RSVPed can view private events.
    """
    
    def has_object_permission(self, request, view, obj):
        # If event is public, allow access
        if obj.is_public:
            return True
        
        # If user is not authenticated, deny access to private events
        if not request.user.is_authenticated:
            return False
        
        # If user is the organizer, allow access
        if obj.organizer == request.user:
            return True
        
        # If user has RSVPed to the event, allow access
        from .models import RSVP
        return RSVP.objects.filter(event=obj, user=request.user).exists()
