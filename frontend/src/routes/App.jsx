import { Outlet, redirect, useLocation } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginActions } from "../store/LoginSlice.js";
import Store from "../store/index.js";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const restoreUser = async () => {
      // ⛔️ Don't check session if already on login or register pages
      if (["/signin", "/signup"].includes(location.pathname)) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 🔥 this sends & accepts cookies
        });

        const result = await res.json();
        console.log("Data received from me backend:", result);

        // ✅ Important: return redirect, not inside a .then
        if (result.status) {
          // ✅ Save to redux
          Store.dispatch(loginActions.loginSuccess());
          Store.dispatch(loginActions.loginSuccessData(result));

          return redirect("/");
        } else {
          Store.dispatch(loginActions.logoutSuccess());
          return redirect("/signin");
        }
      } catch (error) {
        Store.dispatch(loginActions.logoutSuccess());
        console.error("Error while signing in:", error);
        return redirect("/signin");
      }
    };

    restoreUser();
  }, [dispatch, location.pathname]); // 👈 also include location to re-run on route change

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
