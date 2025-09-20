import { useSelector } from "react-redux";

import Home from "../routes/Home";
import ImageContainer from "../routes/ImageContainer";

const Screen = () => {
  const loginObj = useSelector((store) => store.login);
  const loginStatus = loginObj.loginStatus;

  return <div>{loginStatus ? <ImageContainer /> : <Home />}</div>;
};

export default Screen;
