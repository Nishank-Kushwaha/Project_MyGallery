import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./routes/App.jsx";
import SignIn, { createSignInAction } from "./routes/SignIn.jsx";
import SignUp, { createSignUpAction } from "./routes/SignUp.jsx";

import ForgotPassword, {
  createForgotPasswordAction,
} from "./components/ForgotPassword";
import VerifyCode, { createVerifyCodeAction } from "./components/VerifyCode";
import ResetPassword, {
  createResetPasswordAction,
} from "./components/ResetPassword";

import PageNotFound from "./routes/PageNotFound.jsx";
import Store from "./store/index.js";
import GoogleCallback from "./routes/GoogleCallback.jsx";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Screen from "./components/Screen.jsx";
import UploadPhoto, { UploadPhotoAction } from "./routes/UploadPhoto.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Screen />,
      },
      {
        path: "/signin",
        element: <SignIn />,
        action: createSignInAction,
      },
      {
        path: "/signup",
        element: <SignUp />,
        action: createSignUpAction,
      },

      {
        path: "/forgot-password",
        element: <ForgotPassword />,
        action: createForgotPasswordAction,
      },
      {
        path: "/verifycode",
        element: <VerifyCode />,
        action: createVerifyCodeAction,
      },
      {
        path: "/resetpassword",
        element: <ResetPassword />,
        action: createResetPasswordAction,
      },
      {
        path: "/google/callback",
        element: <GoogleCallback />,
      },
      {
        path: "/uploadphoto",
        element: <UploadPhoto />,
        action: UploadPhotoAction,
      },
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={Store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
