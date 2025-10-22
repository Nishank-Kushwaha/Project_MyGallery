import { Form, redirect } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-semibold">
            Forgot Your Password?
          </h2>
          <p className="text-slate-400 mt-2">
            Enter your email address and we'll send you an OTP to reset your
            password.
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="space-y-6">
            <Form method="POST" className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-3"
                >
                  Email Address
                </label>
                <div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Send OTP
                </button>
              </div>
            </Form>

            <div className="text-center">
              <a
                href="/signin"
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition duration-200"
              >
                Back to Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const createForgotPasswordAction = async (data) => {
  const formData = await data.request.formData();
  const forgotPasswordData = Object.fromEntries(formData);

  console.log("Data collected from ForgotPassword form:", forgotPasswordData);

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotPasswordData),
        credentials: "include",
      }
    );

    const result = await res.json();
    console.log("Data received from forgot-password backend:", result);

    if (result.status) {
      alert(result.message);
      // Store email in sessionStorage for next steps
      sessionStorage.setItem("resetEmail", forgotPasswordData.email);
      return redirect("/verifycode");
    } else {
      alert(result.message);
      return redirect("/forgot-password");
    }
  } catch (error) {
    console.error("Error while sending forgot password request:", error);
    alert("Something went wrong. Please try again.");
    return redirect("/forgot-password");
  }
};

export default ForgotPassword;
