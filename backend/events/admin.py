from django.contrib import admin
from .models import Event, RSVP, Review

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'organizer', 'location', 'start_time', 'is_public', 'created_at')
    list_filter = ('is_public', 'created_at', 'start_time')
    search_fields = ('title', 'description', 'location', 'organizer__username')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'start_time'

@admin.register(RSVP)
class RSVPAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'event__title')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'event__title', 'comment')
    readonly_fields = ('created_at', 'updated_at')
