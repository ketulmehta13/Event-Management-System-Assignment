from rest_framework import permissions

class IsOrganizerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow organizers of an event to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
       
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.organizer == request.user

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.user == request.user

class CanViewPrivateEvent(permissions.BasePermission):
    """
    Custom permission to restrict access to private events.
    Only organizer and users who have RSVPed can view private events.
    """
    
    def has_object_permission(self, request, view, obj):
        if obj.is_public:
            return True
        
        if not request.user.is_authenticated:
            return False
        
        if obj.organizer == request.user:
            return True
        
        from .models import RSVP
        return RSVP.objects.filter(event=obj, user=request.user).exists()
