import { Link, redirect } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import WelcomeMessage from "./WelcomeMessage";
import { useSelector } from "react-redux";
import { loginActions } from "../store/LoginSlice";
import Upload from "./Upload";
import Store from "../store";
import { IoCamera } from "react-icons/io5";
import { LogOut, Menu, RotateCcwKey } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const loginObj = useSelector((store) => store.login);
  const loginStatus = loginObj.loginStatus;
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="relative bg-gray-900 text-white">
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center">
          <Link to="/">
            <FaHome
              className="ml-2 font-bold text-4xl hover:text-blue-400"
              title="home"
            />
          </Link>
          <WelcomeMessage />
        </div>
        <div className="flex space-x-4">
          {loginStatus ? (
            isOpen ? (
              <div
                className="absolute w-fit h-fit z-50 rounded-lg"
                style={{
                  backgroundColor: "rgb(17 24 39)",
                  boxShadow: "0 3px 12px white",
                  display: "flex",
                  flexDirection: "row-reverse",
                  right: "20px",
                  top: "15px",
                }}
              >
                <button
                  className="text-gray-300 py-4 px-6 flex items-center justify-center rounded hover:text-blue-400"
                  title="close options"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  ⨯
                </button>
                <Link
                  to="/updatepassword"
                  className="text-gray-300 py-4 px-4 flex items-center justify-center rounded hover:text-blue-400 "
                  title="update password"
                >
                  <RotateCcwKey size={25} />
                </Link>

                <Upload />

                <Link
                  to="/cameracapture"
                  className="text-gray-300 py-4 px-4 flex items-center justify-center rounded hover:text-blue-400"
                  title="camera"
                >
                  <IoCamera size={25} />
                </Link>

                <button
                  type="button"
                  className="text-gray-300 py-2 px-4 rounded hover:text-blue-400"
                  onClick={handleOnLogOut}
                  title="logout"
                >
                  <LogOut />
                </button>
              </div>
            ) : (
              <div
                className="text-gray-300 py-4 px-4 flex items-center justify-center rounded hover:text-blue-400"
                title="open options"
              >
                <Menu onClick={() => setIsOpen(true)} />
              </div>
            )
          ) : (
            <>
              <Link
                to="/signin"
                className="text-gray-300 py-2 px-2 flex items-center justify-center rounded hover:text-blue-400"
              >
                LogIn
              </Link>

              <Link
                to="/signup"
                className="bg-blue-600 text-white py-2 px-4 flex items-center justify-center rounded hover:bg-blue-500"
              >
                SignUp
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
