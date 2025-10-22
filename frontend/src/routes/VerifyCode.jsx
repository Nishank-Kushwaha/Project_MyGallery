import { Form, redirect } from "react-router-dom";

const VerifyCode = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-semibold">
            Enter Verification Code
          </h2>
          <p className="text-slate-400 mt-2">
            We've sent a 6-digit OTP to your email address
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="space-y-6">
            <Form method="POST" className="space-y-6">
              <div>
                <label
                  htmlFor="verifycode"
                  className="block text-sm font-medium text-slate-300 mb-3"
                >
                  OTP Code
                </label>
                <div>
                  <input
                    id="verifycode"
                    type="text"
                    name="verifycode"
                    required
                    maxLength="6"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Enter 6-digit OTP"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Verify OTP
                </button>
              </div>
            </Form>

            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition duration-200"
              >
                Didn't receive code? Try again
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const createVerifyCodeAction = async (data) => {
  const formData = await data.request.formData();
  const verifyCodeData = Object.fromEntries(formData);

  console.log("Data collected from VerifyCode form:", verifyCodeData);

  // Get email from sessionStorage
  const email = sessionStorage.getItem("resetEmail");
  if (!email) {
    alert("Session expired. Please start the password reset process again.");
    return redirect("/forgot-password");
  }

  const requestData = {
    email: email,
    otp: verifyCodeData.verifycode,
  };

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
        credentials: "include",
      }
    );

    const result = await res.json();
    console.log("Data received from verify-otp backend:", result);

    if (result.status) {
      alert(result.message);
      // Store OTP for password reset
      sessionStorage.setItem("verifiedOTP", verifyCodeData.verifycode);
      return redirect("/resetpassword");
    } else {
      alert(result.message);
      return redirect("/verifycode");
    }
  } catch (error) {
    console.error("Error while verifying OTP:", error);
    alert("Something went wrong. Please try again.");
    return redirect("/verifycode");
  }
};

export default VerifyCode;
