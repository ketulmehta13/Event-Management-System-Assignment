from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Event, RSVP, Review


class EventSerializer(serializers.ModelSerializer):
    organizer = serializers.CharField(source='organizer.username', read_only=True)
    organizer_id = serializers.IntegerField(source='organizer.id', read_only=True)
    attendee_count = serializers.ReadOnlyField()
    user_rsvp = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'organizer', 'organizer_id', 'location', 
                 'start_time', 'end_time', 'is_public', 'created_at', 'updated_at', 
                 'attendee_count', 'user_rsvp', 'can_edit']
        read_only_fields = ['organizer', 'created_at', 'updated_at']

    def get_user_rsvp(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rsvp = RSVP.objects.get(event=obj, user=request.user)
                return rsvp.status
            except RSVP.DoesNotExist:
                return None
        return None

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.organizer == request.user
        return False

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['organizer'] = request.user
        return super().create(validated_data)


class RSVPSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = RSVP
        fields = ['id', 'event', 'user', 'event_title', 'status', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField(read_only=True)
    can_edit = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_full_name', 'rating', 
                 'comment', 'created_at', 'updated_at', 'can_edit']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_user_full_name(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile and obj.user.profile.full_name:
            return obj.user.profile.full_name
        elif obj.user.get_full_name():
            return obj.user.get_full_name()
        return obj.user.username

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

    def validate_comment(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Comment must be at least 3 characters long")
        return value.strip()


class EventDetailSerializer(EventSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    rsvps = RSVPSerializer(many=True, read_only=True)
    
    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ['reviews', 'rsvps']
