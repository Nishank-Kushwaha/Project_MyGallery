import { FiUpload } from "react-icons/fi";
import { Link } from "react-router-dom";

const Upload = () => {
  return (
    <Link
      to={"/uploadphoto"}
      className="text-gray-300 py-4 px-4 rounded hover:text-blue-400"
    >
      <FiUpload size={"25"} />
    </Link>
  );
};

export default Upload;
