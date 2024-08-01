import DashboardPageLayout from "../pages/Dashboard/Layout";
import RedirectPage from "../pages/Redirect";
import Home from "../pages/Dashboard/Home";
import Search from "../pages/Dashboard/Search";
import Landingpage from "../pages/Landing/LandingPage";
const appRoutes = [
  {
    path: "/",
    element: <Landingpage />,
  },

  {
    path: "/dashboard",
    element: <DashboardPageLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Home />,
      },
      {
        path: "/dashboard/search",
        element: <Search />,
      },
      {
        path: "/dashboard/*",
        element: <RedirectPage destination="/dashboard"/>,
      },
    ],
  },
  {
    path: "*",
    element: <div>404 Page</div>,
  },
];

export default appRoutes;
