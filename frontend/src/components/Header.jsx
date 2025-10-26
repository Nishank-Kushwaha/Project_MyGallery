import { Link, redirect } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import WelcomeMessage from "./WelcomeMessage";
import { useSelector } from "react-redux";
import { loginActions } from "../store/LoginSlice";
import Upload from "./Upload";
import Store from "../store";
import { Camera, KeyRound, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { isMobile } from "react-device-detect";

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

  const UploadButton = () => (
    <button
      className="text-gray-300 py-4 px-4 flex items-center justify-center rounded-lg hover:text-blue-400 hover:bg-gray-800/50 transition-all duration-200"
      title="upload"
    >
      <Upload size={22} />
    </button>
  );

  console.log(isMobile);

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
          {isMobile ? isOpen ? null : <WelcomeMessage /> : <WelcomeMessage />}
        </div>
        <div className="flex space-x-4">
          {loginStatus ? (
            isOpen ? (
              <div
                className="bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden z-50"
                style={{
                  animation: "slideIn 0.2s ease-out",
                }}
              >
                <style>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
              .hover-red:hover {
              color: red;
            }
          `}</style>

                <div className="relative">
                  {/* Close Button - Top Right */}
                  <button
                    className="absolute top-0 right-0 text-gray-400 p-1.5 flex items-center justify-center hover:text-gray-200 bg-gray-800 rounded-full border border-gray-700/50 hover:border-gray-600 transition-all duration-200 shadow-lg"
                    title="Close Menu"
                    type="button"
                    onClick={() => setIsOpen(false)}
                    style={{ margin: "5px" }}
                  >
                    <X size={15} />
                  </button>

                  {/* Menu Items */}
                  <div className="flex items-center divide-x divide-gray-700/50">
                    <Link
                      to="/updatepassword"
                      className="text-gray-300 py-4 px-4 flex items-center justify-center hover:text-blue-400 hover:bg-gray-800/50 transition-all duration-200 group"
                      title="Update Password"
                    >
                      <KeyRound
                        size={22}
                        className="group-hover:rotate-12 transition-transform duration-200"
                      />
                    </Link>

                    <UploadButton />

                    <Link
                      to="/cameracapture"
                      className="text-gray-300 py-4 px-4 flex items-center justify-center hover:text-blue-400 hover:bg-gray-800/50 transition-all duration-200 group"
                      title="Camera"
                    >
                      <Camera
                        size={22}
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                    </Link>

                    <button
                      type="button"
                      className="text-gray-300 py-4 px-4 flex items-center justify-center hover-red hover:bg-gray-800/50 transition-all duration-200 group"
                      onClick={handleOnLogOut}
                      title="Logout"
                    >
                      <LogOut
                        size={22}
                        className="group-hover:translate-x-0.5 transition-transform duration-200"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                className="text-gray-300 p-3 flex items-center justify-center rounded-xl hover:text-blue-400 hover:bg-gray-900/50 transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-gray-700/50 group"
                title="Open Menu"
                onClick={() => setIsOpen(true)}
              >
                <Menu
                  size={24}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
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
