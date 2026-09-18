import { announcementsApi } from "@/api/announcements";
import { useAuth } from "@/auth/AuthContext";
import { AnnouncementsTab } from "@/components/AnnouncementsTab";

export function AnnouncementsPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Announcements</h2>
      <AnnouncementsTab
        canPost={user?.role === "admin"}
        fetcher={announcementsApi.listGlobal}
        poster={announcementsApi.postGlobal}
      />
    </div>
  );
}