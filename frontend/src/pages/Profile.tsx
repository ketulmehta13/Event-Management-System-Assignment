import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, MapPin, Edit, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  bio: string;
  location: string;
  profile_picture: string;
}

interface ProfileStats {
  events_attended: number;
  events_organized: number;
  reviews_written: number;
}

const fetchProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/auth/profile/');
  return response.data;
};

const fetchProfileStats = async (): Promise<ProfileStats> => {
  const response = await api.get('/dashboard/');
  const data = response.data;
  return {
    events_attended: data.rsvped_events?.length || 0,
    events_organized: data.organized_events?.length || 0,
    reviews_written: 0,
  };
};

const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await api.patch('/auth/profile/', profileData);
  return response.data;
};

export default function Profile() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    bio: "",
    location: "",
  });

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: isAuthenticated,
  });

  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['profileStats'],
    queryFn: fetchProfileStats,
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  });

  // Update form data when profile loads - FIXED: Use useEffect instead of useState
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate(profileData);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    toast.error("Failed to load profile");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {getInitials(profile?.full_name || profile?.username || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h1 className="text-3xl font-bold">
                    {profile?.full_name || `${profile?.first_name} ${profile?.last_name}`.trim() || profile?.username}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                    <MapPin className="h-4 w-4" />
                    {profile?.location || "Location not set"}
                  </p>
                  <p className="text-foreground">
                    {profile?.bio || "No bio provided"}
                  </p>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  disabled={updateMutation.isPending}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, first_name: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, last_name: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Display Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, full_name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({ ...profileData, location: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {statsLoading ? "..." : stats?.events_attended || 0}
                </div>
                <div className="text-sm text-muted-foreground">Events Attended</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-secondary mb-2">
                  {statsLoading ? "..." : stats?.events_organized || 0}
                </div>
                <div className="text-sm text-muted-foreground">Events Organized</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-accent mb-2">
                  {statsLoading ? "..." : stats?.reviews_written || 0}
                </div>
                <div className="text-sm text-muted-foreground">Reviews Written</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
