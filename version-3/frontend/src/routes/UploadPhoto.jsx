import { Form, redirect } from "react-router-dom";

const UploadPhoto = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-semibold">Upload Photos</h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="space-y-6">
            <Form method="POST" className="space-y-6">
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
                    required=""
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Give your photo"
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
                    required=""
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
  const UploadPhotoData = Object.fromEntries(formData);

  console.log("Data collected from uploadPhoto form:", UploadPhotoData);

  return redirect("/");
};

export default UploadPhoto;
