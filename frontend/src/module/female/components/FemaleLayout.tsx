import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FemaleBottomNavigation } from "./FemaleBottomNavigation";
import { PageSkeletonLoader } from "../../../shared/components/PageSkeletonLoader";
import { useFemaleNavigation } from "../hooks/useFemaleNavigation";

export const FemaleLayout: React.FC = () => {
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();
  const location = useLocation();

  // Hide bottom navigation on dedicated full-screen sub-routes:
  // 1. Active chat window (/female/chat/:chatId, but NOT /female/chats)
  // 2. Viewing another user's profile (/female/profile/:id)
  const isChatWindow =
    location.pathname.startsWith("/female/chat/") &&
    !location.pathname.startsWith("/female/chats");

  const isProfileView = location.pathname.startsWith("/female/profile/");
  const isEditProfile = location.pathname === "/female/edit-profile";
  const isSettings = location.pathname === "/female/settings";
  const isFaqs = location.pathname === "/female/faqs";
  const isSupportTicket = location.pathname.startsWith("/female/support/");

  const hideBottomNav =
    isChatWindow ||
    isProfileView ||
    isEditProfile ||
    isSettings ||
    isFaqs ||
    isSupportTicket;

  return (
    <div className="min-h-screen relative w-full bg-background-light">
      <Suspense fallback={<PageSkeletonLoader />}>
        <Outlet />
      </Suspense>

      {!hideBottomNav && (
        <FemaleBottomNavigation
          items={navigationItems}
          onItemClick={handleNavigationClick}
        />
      )}
    </div>
  );
};
