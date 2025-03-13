import { DefaulLayout } from "../App";
import AdminLayout from "../layout/admin";
import Register from "../views/Auth/Register";
import Home from "../views/Home/Home";
import Login from "../views/Auth/Login";
import Role from "../views/Administrator/Role/Role";
import User from "../views/Administrator/User/User";
import WorkSchedule from "../views/WorkSchedule/WorkSchedule";

const routerConfig = [
  { path: "/", component: Home, layout: AdminLayout },
  { path: "/role", component: Role, layout: AdminLayout },
  { path: "/users", component: User, layout: AdminLayout },
  { path: "/register", component: Register, layout: DefaulLayout },
  { path: "/login", component: Login, layout: DefaulLayout },
  { path: "/job", component: WorkSchedule, layout: AdminLayout },
];

export { routerConfig };
