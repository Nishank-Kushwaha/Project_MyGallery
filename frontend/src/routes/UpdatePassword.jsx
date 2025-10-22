import { Form, redirect } from "react-router-dom";

const UpdatePassword = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-semibold">Update Password</h2>
          <p className="text-slate-400 mt-2">Enter your new password below</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="space-y-6">
            <Form method="POST" className="space-y-6">
              <div>
                <label
                  htmlFor="oldPassword"
                  className="block text-sm font-medium text-slate-300 mb-3"
                >
                  Old Password
                </label>
                <div>
                  <input
                    id="oldPassword"
                    type="password"
                    name="oldPassword"
                    required
                    minLength="6"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Enter old password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-slate-300 mb-3"
                >
                  New Password
                </label>
                <div>
                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    required
                    minLength="6"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-sm font-medium text-slate-300 mb-3"
                >
                  Confirm New Password
                </label>
                <div>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    name="confirmNewPassword"
                    required
                    minLength="6"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Update Password
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const createUpdatePasswordAction = async (data) => {
  const formData = await data.request.formData();
  const resetPasswordData = Object.fromEntries(formData);

  console.log("Data collected from UpdatePassword form:", resetPasswordData);

  const requestData = {
    currentPassword: resetPasswordData.oldPassword,
    newPassword: resetPasswordData.newPassword,
    confirmNewPassword: resetPasswordData.confirmNewPassword,
  };

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth//update-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
        credentials: "include",
      }
    );

    const result = await res.json();
    console.log("Data received from update-password backend:", result);

    if (result.status) {
      alert(result.message);
      return redirect("/signin");
    } else {
      alert(result.message);
      return redirect("/updatepassword");
    }
  } catch (error) {
    console.error("Error while updating password:", error);
    alert("Something went wrong. Please try again.");
    return redirect("/updatepassword");
  }
};

export default UpdatePassword;
