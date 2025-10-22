import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./routes/App.jsx";
import Screen from "./routes/Screen.jsx";

import SignIn, { createSignInAction } from "./routes/SignIn.jsx";
import SignUp, { createSignUpAction } from "./routes/SignUp.jsx";
import GoogleCallback from "./routes/GoogleCallback.jsx";

import ForgotPassword, {
  createForgotPasswordAction,
} from "./routes/ForgotPassword.jsx";
import VerifyCode, { createVerifyCodeAction } from "./routes/VerifyCode.jsx";
import ResetPassword, {
  createResetPasswordAction,
} from "./routes/ResetPassword.jsx";
import UpdatePassword, {
  createUpdatePasswordAction,
} from "./routes/UpdatePassword.jsx";

import UploadPhoto, { UploadPhotoAction } from "./routes/UploadPhoto.jsx";

import PageNotFound from "./components/PageNotFound.jsx";

import Store from "./store/index.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
        path: "/updatepassword",
        element: <UpdatePassword />,
        action: createUpdatePasswordAction,
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
