import { Form, redirect } from "react-router-dom";
import Store from "../store";

const UploadPhoto = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-semibold">Upload Photos</h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="space-y-6">
            <Form
              method="POST"
              encType="multipart/form-data"
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium text-slate-300 mb-3"
                >
                  Photo
                </label>
                <div>
                  <input
                    id="photo"
                    type="file"
                    name="photo"
                    accept="image/*" // ✅ Fixed accept attribute
                    required // ✅ Added required validation
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-300 mb-3"
                >
                  Description
                </label>
                <div>
                  <input
                    id="description"
                    type="text"
                    name="description"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Enter a description about your photo"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                Post
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UploadPhotoAction = async (data) => {
  const formData = await data.request.formData();

  console.log("=== Frontend Upload Debug ===");
  console.log("FormData entries:", Object.fromEntries(formData));

  const { loginStatus, loginData } = Store.getState().login;

  console.log("LoginStatus in Upload form", loginStatus);
  console.log("LoginData in Upload form", loginData);

  // Validate file on frontend
  const photoFile = formData.get("photo");
  if (!photoFile || photoFile.size === 0) {
    alert("Please select a photo to upload");
    return redirect("/uploadphoto");
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (photoFile.size > maxSize) {
    alert("File size must be less than 5MB");
    return redirect("/uploadphoto");
  }

  try {
    console.log("Sending request to backend...");

    formData.append("userStatus", loginStatus);
    formData.append("userData", JSON.stringify(loginData));

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/photo/uploadphoto`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
        // ✅ Let fetch handle Content-Type automatically for multipart/form-data
      }
    );

    console.log("Response status:", res.status);
    console.log("Response headers:", res.headers);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    console.log("Backend response:", result);

    if (result.status) {
      const fullUrl = `${result.data.fileUrl}`;
      console.log("✅ Upload successful! Image URL:", fullUrl);
      alert(`${result.message}\nImage URL: ${fullUrl}`);
      return redirect("/");
    } else {
      console.error("Upload failed:", result.message);
      alert(`Upload failed: ${result.message}`);
      return redirect("/uploadphoto");
    }
  } catch (error) {
    console.error("Error during upload:", error);
    alert(`Upload error: ${error.message}`);
    return redirect("/uploadphoto");
  }
};

export default UploadPhoto;
