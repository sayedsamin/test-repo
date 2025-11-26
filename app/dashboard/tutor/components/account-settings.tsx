"use client";

import {
  User,
  Lock,
  Bell,
  Globe,
  CreditCard,
  Shield,
  Briefcase,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string | null;
  profileImageUrl: string | null;
}

interface AccountSettingsProps {
  user: User | null;
}

interface TutorProfile {
  name: string;
  bio: string;
  profileImageUrl: string;
  hourlyRate: number;
  specialties: string[];
  availability: string;
  sessionDuration: string;
  language: string;
  timezone: string;
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [profile, setProfile] = useState<TutorProfile>({
    name: user?.name || "",
    bio: user?.bio || "",
    profileImageUrl: user?.profileImageUrl || "",
    hourlyRate: 25,
    specialties: [],
    availability: "Flexible - All days",
    sessionDuration: "1 hour",
    language: "English",
    timezone: "UTC-08:00 Pacific Time",
  });

  const [newSpecialty, setNewSpecialty] = useState("");

  // Fetch tutor profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);
        console.log("Token preview:", token ? token.substring(0, 20) + "..." : "No token");
        
        if (!token) {
          console.warn("No token found, skipping profile fetch");
          setIsLoading(false);
          return;
        }
        
        const response = await axios.get("/api/tutors/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("Profile response:", response.data);
        
        if (response.data.success) {
          const data = response.data.data;
          setProfile({
            name: data.name || "",
            bio: data.bio || "",
            profileImageUrl: data.profileImageUrl || "",
            hourlyRate: data.hourlyRate || 25,
            specialties: data.specialties || [],
            availability: data.availability || "Flexible - All days",
            sessionDuration: data.sessionDuration || "1 hour",
            language: data.language || "English",
            timezone: data.timezone || "UTC-08:00 Pacific Time",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (axios.isAxiosError(error)) {
          console.error("Response status:", error.response?.status);
          console.error("Response data:", error.response?.data);
          
          if (error.response?.status === 401) {
            setMessage({ 
              type: 'error', 
              text: 'Session expired. Please log out and log in again.' 
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      const token = localStorage.getItem("token");
      const response = await axios.patch("/api/tutors/profile", profile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTeachingPreferences = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      const token = localStorage.getItem("token");
      const response = await axios.patch("/api/tutors/profile", {
        hourlyRate: profile.hourlyRate,
        availability: profile.availability,
        sessionDuration: profile.sessionDuration,
        specialties: profile.specialties,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Teaching preferences updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage({ type: 'error', text: 'Failed to update preferences. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLanguagePreferences = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      const token = localStorage.getItem("token");
      const response = await axios.patch("/api/tutors/profile", {
        language: profile.language,
        timezone: profile.timezone,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Preferences updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage({ type: 'error', text: 'Failed to update preferences. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !profile.specialties.includes(newSpecialty.trim())) {
      setProfile({
        ...profile,
        specialties: [...profile.specialties, newSpecialty.trim()],
      });
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setProfile({
      ...profile,
      specialties: profile.specialties.filter(s => s !== specialty),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage your tutor profile and preferences
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-lg p-4 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-100' : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-100'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
<div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
  shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200">

  {/* Header */}
  <div className="border-b border-white/10 pb-4 mb-4">
    <div className="flex items-center gap-2">


      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/10">
        <User className="h-5 w-5 text-black" />
      </div>


      <h3 className="text-lg font-semibold">Profile Information</h3>
    </div>
  </div>

  {/* Content */}
  <div className="space-y-4">

    {/* Full Name */}
    <div>
      <label className="text-sm font-medium mb-2 block">Full Name</label>
      <input
        type="text"
        value={profile.name}
        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background placeholder:text-muted-foreground 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2"
      />
    </div>

    {/* Email */}
    <div>
      <label className="text-sm font-medium mb-2 block">Email Address</label>
      <input
        type="email"
        value={user?.email || ""}
        disabled
        className="flex h-10 w-full rounded-md border border-input bg-muted/40 px-3 py-2 
        text-sm opacity-50 cursor-not-allowed"
      />
      <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
    </div>

    {/* Bio */}
    <div>
      <label className="text-sm font-medium mb-2 block">Professional Bio</label>
      <textarea
        value={profile.bio}
        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
        placeholder="Tell students about your expertise and teaching experience..."
        rows={4}
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background placeholder:text-muted-foreground 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2"
      />
    </div>

    {/* Image URL */}
    <div>
      <label className="text-sm font-medium mb-2 block">Profile Image URL</label>
      <input
        type="url"
        value={profile.profileImageUrl}
        onChange={(e) =>
          setProfile({ ...profile, profileImageUrl: e.target.value })
        }
        placeholder="https://example.com/your-photo.jpg"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background placeholder:text-muted-foreground 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2"
      />

      <p className="text-xs text-muted-foreground mt-1">
        Enter a URL to your profile photo
      </p>

      {profile.profileImageUrl && (
        <div className="mt-3">
          <p className="text-xs font-medium mb-2">Preview:</p>
          <img
            src={profile.profileImageUrl}
            alt="Profile preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-primary"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
      )}
    </div>

    {/* Save Button */}
    <button
      onClick={handleSaveProfile}
      disabled={isSaving}
      className="inline-flex h-9 items-center justify-center rounded-md bg-primary 
      px-4 text-sm font-medium text-primary-foreground shadow transition-colors 
      hover:bg-primary/90 disabled:opacity-50"
    >
      {isSaving ? "Saving..." : "Save Changes"}
    </button>

  </div>
</div>





           

      {/* Teaching Preferences */}
<div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
  shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200">

  <div className="border-b border-white/10 pb-4 mb-4">
    <div className="flex items-center gap-2">
      <Briefcase className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-semibold">Teaching Preferences</h3>
    </div>
  </div>

  <div className="space-y-4">
    <div>
      <label className="text-sm font-medium mb-2 block">
        Hourly Rate (USD)
      </label>
      <input
        type="number"
        value={profile.hourlyRate}
        onChange={(e) =>
          setProfile({
            ...profile,
            hourlyRate: parseFloat(e.target.value) || 0,
          })
        }
        placeholder="25"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background placeholder:text-muted-foreground 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2"
      />
    </div>

    <div>
      <label className="text-sm font-medium mb-2 block">Specialties</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newSpecialty}
          onChange={(e) => setNewSpecialty(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addSpecialty()}
          placeholder="Add a specialty (e.g., JavaScript, React)"
          className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 
          text-sm ring-offset-background placeholder:text-muted-foreground 
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
          focus-visible:ring-offset-2"
        />
        <button
          onClick={addSpecialty}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary 
          px-4 text-sm font-medium text-primary-foreground shadow transition-colors 
          hover:bg-primary/90"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {profile.specialties.map((specialty) => (
          <span
            key={specialty}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 
            px-3 py-1 text-sm"
          >
            {specialty}
            <button
              onClick={() => removeSpecialty(specialty)}
              className="hover:text-destructive"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>

    <div>
      <label className="text-sm font-medium mb-2 block">Availability</label>
      <select
        value={profile.availability}
        onChange={(e) =>
          setProfile({ ...profile, availability: e.target.value })
        }
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option>Weekdays only</option>
        <option>Weekends only</option>
        <option>Flexible - All days</option>
      </select>
    </div>

    <div>
      <label className="text-sm font-medium mb-2 block">Session Duration</label>
      <select
        value={profile.sessionDuration}
        onChange={(e) =>
          setProfile({ ...profile, sessionDuration: e.target.value })
        }
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option>30 minutes</option>
        <option>1 hour</option>
        <option>2 hours</option>
        <option>Custom</option>
      </select>
    </div>

    <button
      onClick={handleSaveTeachingPreferences}
      disabled={isSaving}
      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 
      text-sm font-medium text-primary-foreground shadow transition-colors 
      hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSaving ? "Saving..." : "Update Preferences"}
    </button>
  </div>
</div>




{/* Security */}
<div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
  shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200">

  <div className="border-b border-white/10 pb-4 mb-4">
    <div className="flex items-center gap-2">
      <Lock className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-semibold">Security</h3>
    </div>
  </div>

  <div className="space-y-4">
    <div>
      <label className="text-sm font-medium mb-2 block">
        Current Password
      </label>
      <input
        type="password"
        placeholder="Enter current password"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background placeholder:text-muted-foreground 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2"
      />
    </div>

    <div>
      <label className="text-sm font-medium mb-2 block">
        New Password
      </label>
      <input
        type="password"
        placeholder="Enter new password"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background placeholder:text-muted-foreground 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2"
      />
    </div>

    <div>
      <label className="text-sm font-medium mb-2 block">
        Confirm New Password
      </label>
      <input
        type="password"
        placeholder="Confirm new password"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background placeholder:text-muted-foreground 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2"
      />
    </div>

    <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary 
      px-4 text-sm font-medium text-primary-foreground shadow transition-colors 
      hover:bg-primary/90">
      Update Password
    </button>
  </div>
</div>



{/* Notifications */}
<div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
  shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200">

  {/* Header */}
  <div className="border-b border-white/10 pb-4 mb-4">
    <div className="flex items-center gap-2">
      <Bell className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-semibold">Notifications</h3>
    </div>
  </div>

  {/* Content */}
  <div className="space-y-4">

    {/* Email Notifications */}
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">Email Notifications</p>
        <p className="text-sm text-muted-foreground">
          Receive updates via email
        </p>
      </div>

      <button
        onClick={() => setEmailNotifications(!emailNotifications)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          emailNotifications ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            emailNotifications ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>

    {/* Push Notifications */}
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">Push Notifications</p>
        <p className="text-sm text-muted-foreground">
          Receive browser notifications
        </p>
      </div>

      <button
        onClick={() => setPushNotifications(!pushNotifications)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          pushNotifications ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            pushNotifications ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>

    {/* Booking Notifications */}
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">Booking Alerts</p>
        <p className="text-sm text-muted-foreground">
          Get notified about new bookings
        </p>
      </div>

      <button
        onClick={() => setBookingNotifications(!bookingNotifications)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          bookingNotifications ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            bookingNotifications ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>

  </div>
</div>


{/* Payment Settings */}
<div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
  shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200">

  <div className="border-b border-white/10 pb-4 mb-4">
    <div className="flex items-center gap-2">
      <CreditCard className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-semibold">Payment Settings</h3>
    </div>
  </div>

  <div className="space-y-4">
    <div>
      <label className="text-sm font-medium mb-2 block">
        Bank Account
      </label>
      <input
        type="text"
        placeholder="Not connected"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background placeholder:text-muted-foreground 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2"
      />
    </div>

    <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary 
      px-4 text-sm font-medium text-primary-foreground shadow transition-colors 
      hover:bg-primary/90">
      Connect Bank Account
    </button>
  </div>
</div>

 
{/* Preferences */}
<div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
  shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200">

  <div className="border-b border-white/10 pb-4 mb-4">
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-semibold">Preferences</h3>
    </div>
  </div>

  <div className="space-y-4">
    <div>
      <label className="text-sm font-medium mb-2 block">Language</label>
      <select
        value={profile.language}
        onChange={(e) => setProfile({ ...profile, language: e.target.value })}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option>English</option>
        <option>Spanish</option>
        <option>French</option>
        <option>German</option>
      </select>
    </div>

    <div>
      <label className="text-sm font-medium mb-2 block">Timezone</label>
      <select
        value={profile.timezone}
        onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 
        text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option>UTC-08:00 Pacific Time</option>
        <option>UTC-05:00 Eastern Time</option>
        <option>UTC+00:00 GMT</option>
        <option>UTC+01:00 Central European Time</option>
      </select>
    </div>

    <button
      onClick={handleSaveLanguagePreferences}
      disabled={isSaving}
      className="inline-flex h-9 items-center justify-center rounded-md bg-primary 
      px-4 text-sm font-medium text-primary-foreground shadow transition-colors 
      hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSaving ? 'Saving...' : 'Save Preferences'}
    </button>
  </div>
</div>

    

      


    

    







      {/* Danger Zone */}
      <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 shadow-sm">
        <div className="border-b border-red-200 dark:border-red-900 p-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Danger Zone
            </h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">
                Delete Account
              </p>
              <p className="text-sm text-red-800 dark:text-red-200">
                Permanently delete your account and all data
              </p>
            </div>
            <button className="inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-medium text-white shadow transition-colors hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
