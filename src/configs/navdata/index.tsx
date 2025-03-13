import { IconBriefcase2, IconHome, IconUserCog } from "@tabler/icons-react";

export const router = [
  {
    label: "Trang chủ",
    icon: IconHome,
    initiallyOpened: true,
    link: "/",
  },
  {
    label: "Công việc",
    icon: IconBriefcase2,
    initiallyOpened: true,
    links: [{ label: "Lịch làm việc", link: "/job" }],
  },
  {
    label: "Quản trị",
    icon: IconUserCog,
    initiallyOpened: true,
    links: [
      { label: "Chức danh", link: "/role" },
      { label: "Nhân viên", link: "/users" },
    ],
  },
];
