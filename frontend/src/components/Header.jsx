import { Link, redirect } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import WelcomeMessage from "./WelcomeMessage";
import { useDispatch, useSelector } from "react-redux";
import { loginActions } from "../store/LoginSlice";
import Upload from "./Upload";
import Store from "../store";
import { IoCamera } from "react-icons/io5";

const Header = () => {
  const loginObj = useSelector((store) => store.login);
  const loginStatus = loginObj.loginStatus;

  const dispatch = useDispatch();

  const handleOnLogOut = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 🔥 this sends & accepts cookies
        }
      );

      const result = await res.json();
      console.log("Data received from logout backend:", result);

      // ✅ Save to redux
      Store.dispatch(loginActions.logoutSuccess());
      alert(result.message);
      return redirect("/");
    } catch (error) {
      console.error("Error while signing in:", error);
      return redirect("/signin");
    }
  };

  return (
    <div className="bg-gray-900 text-white">
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center">
          <Link to="/">
            <FaHome className="ml-2 font-bold text-4xl hover:text-blue-400" />
          </Link>
        </div>
        <div className="flex space-x-4">
          <WelcomeMessage />

          {loginStatus ? (
            <>
              <Link
                to="/updatepassword"
                className="bg-blue-600 text-white py-4 px-4 rounded hover:bg-blue-500 "
              >
                Update Password
              </Link>
              <button
                type="button"
                className="text-gray-300 py-2 px-4 rounded hover:text-blue-400"
                onClick={handleOnLogOut}
              >
                Log out
              </button>
              <Link
                to="/cameracapture"
                className="text-gray-300 py-4 px-4 rounded hover:text-blue-400"
              >
                <IoCamera size={25} />
              </Link>

              <Upload />
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="text-gray-300 py-2 px-4 rounded hover:text-blue-400"
              >
                Log in
              </Link>

              <Link
                to="/signup"
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      <hr />
    </div>
  );
};

export default Header;
