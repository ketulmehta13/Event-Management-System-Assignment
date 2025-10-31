from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'location', 'created_at')
    list_filter = ('created_at', 'location')
    search_fields = ('user__username', 'user__email', 'full_name')
    readonly_fields = ('created_at', 'updated_at')
