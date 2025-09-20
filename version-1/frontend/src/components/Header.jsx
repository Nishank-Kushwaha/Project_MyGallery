import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import WelcomeMessage from "./WelcomeMessage";
import { useDispatch, useSelector } from "react-redux";
import { loginActions } from "../store/LoginSlice";

const Header = () => {
  const loginObj = useSelector((store) => store.login);
  const loginStatus = loginObj.loginStatus;

  const dispatch = useDispatch();

  const handleOnLogOut = () => {
    dispatch(loginActions.logoutSuccess());
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
            <button
              type="button"
              className="text-gray-300 py-2 px-4 rounded hover:text-blue-400"
              onClick={handleOnLogOut}
            >
              Log out
            </button>
          ) : (
            <Link
              to="/signin"
              className="text-gray-300 py-2 px-4 rounded hover:text-blue-400"
            >
              Log in
            </Link>
          )}

          <Link
            to="signup"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
          >
            Sign up
          </Link>
        </div>
      </nav>
      <hr />
    </div>
  );
};

export default Header;
