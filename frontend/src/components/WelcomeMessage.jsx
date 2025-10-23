import { useSelector } from "react-redux";

const WelcomeMessage = () => {
  const loginObj = useSelector((store) => store.login);
  const loginStatus = loginObj.loginStatus;
  const loginData = loginObj.loginData;

  return (
    <div className="text-2xl font-bold text-center p-2  text-white rounded-lg shadow-lg">
      {loginStatus
        ? `Hi ${loginData.data.name.split(" ")[0]}`
        : "Login Remaining"}
    </div>
  );
};

export default WelcomeMessage;
