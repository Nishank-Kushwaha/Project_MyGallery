import { useSelector } from "react-redux";

import Home from "../components/Home";
import ImageContainer from "../components/ImageContainer";

const Screen = () => {
  const loginObj = useSelector((store) => store.login);
  const loginStatus = loginObj.loginStatus;

  return <div>{loginStatus ? <ImageContainer /> : <Home />}</div>;
};

export default Screen;
