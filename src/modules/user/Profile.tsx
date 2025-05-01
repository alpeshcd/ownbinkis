
import React from "react";
import ProfileForm from "./ProfileForm";
import { useAuth } from "@/contexts/auth";

const Profile = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="text-center">
          Loading user profile...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <ProfileForm />
    </div>
  );
};

export default Profile;
