import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ListView from './routes/links.tsx';
import Redirect from './routes/redirect.tsx';
import Analytics from './routes/analytics.tsx';
import Login from './routes/auth/login.tsx';
import Signup from './routes/auth/signup.tsx';
import ForgetPasswordForm from "./routes/auth/forget.tsx";

import {AuthService} from "@genezio/auth";
import ResetPasswordForm from "./routes/auth/reset.tsx";

const authToken = import.meta.env.VITE_AUTH_TOKEN;
const region = import.meta.env.VITE_AUTH_REGION;

AuthService.getInstance().setTokenAndRegion(authToken, region);

const router = createBrowserRouter([
  {
    path: "/",
    element: <ListView/>,
  },
  {
    path: "/l/:id",
    element: <Redirect/>,
  },
  {
    path: "/:id",
    element: <Analytics/>,
  },
  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/signup",
    element: <Signup/>,
  },
  {
    path: "/reset",
    element: <ResetPasswordForm/>,
  },
  {
    path: "/forgot-password",
    element: <ForgetPasswordForm/>
  }
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router}/>
)
