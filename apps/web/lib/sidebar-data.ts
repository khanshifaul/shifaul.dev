
import {
    LuFileText,
    LuMessageSquare,
    LuSettings,
    LuUser,
    LuUsers,
} from "react-icons/lu";
import { PiProjectorScreenChart } from "react-icons/pi";
import { RiHome2Line } from "react-icons/ri";

export const data = {
    // Fallback user data; intended to be overridden by Redux state
    user: {
        name: "Admin User",
        email: "admin@example.com",
        avatar: "/avatars/admin.jpg",
    },
    navMain: [
        {
            title: "Platform",
            items: [
                { title: "Dashboard", url: "/admin", icon: RiHome2Line },
                { title: "Messages", url: "/admin/messages", icon: LuMessageSquare },
                { title: "Users", url: "/admin/users", icon: LuUser },
                { title: "Subscribers", url: "/admin/subscribers", icon: LuUsers },
            ],
        },
        {
            title: "Content",
            items: [
                {
                    title: "Portfolio Projects",
                    url: "/admin/projects",
                    icon: PiProjectorScreenChart,
                },
                { title: "Blog Posts", url: "/admin/blog-posts", icon: LuFileText },
            ],
        },
        {
            title: "Settings",
            items: [
                { title: "General", url: "/admin/settings", icon: LuSettings },
            ],
        }
    ],
};
