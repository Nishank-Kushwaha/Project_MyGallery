import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Store from "../store";
import { loginActions } from "../store/LoginSlice";

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract ?result=... from URL
    const params = new URLSearchParams(location.search);
    const result = params.get("result");

    if (result) {
      const parsed = JSON.parse(result);

      if (parsed.status) {
        // ✅ Same Redux actions as email login
        Store.dispatch(loginActions.loginSuccess());
        Store.dispatch(loginActions.loginSuccessData(parsed));

        console.log(parsed);

        alert(parsed.message);
        navigate("/"); // redirect home
      } else {
        alert(parsed.message);
        navigate("/signin"); // back to sign-in
      }
    }
  }, [location, navigate]);

  return (
    <div className="text-white flex items-center justify-center min-h-screen">
      Processing Google login...
    </div>
  );
};

export default GoogleCallback;
