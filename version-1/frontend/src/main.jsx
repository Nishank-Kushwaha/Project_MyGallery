import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./routes/App.jsx";
import Home from "./routes/Home.jsx";
import SignIn, { createSignInAction } from "./routes/SignIn.jsx";
import SignUp, { createSignUpAction } from "./routes/SignUp.jsx";
import PageNotFound from "./routes/PageNotFound.jsx";
import Store from "./store/index.js";
import GoogleCallback from "./routes/GoogleCallback.jsx";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
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
        path: "/google/callback", // ✅ add this
        element: <GoogleCallback />,
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
