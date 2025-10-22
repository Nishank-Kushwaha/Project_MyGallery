import { Form, redirect } from "react-router-dom";
import { loginActions } from "../store/LoginSlice";
import Store from "../store";

const SignIn = () => {
  const handleGoogleLogin = async () => {
    try {
      // Start Google login flow
      window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
    } catch (error) {
      console.error("Google login failed", error);
    }
  };
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-semibold">
            Sign in to your account
          </h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="space-y-6">
            <Form method="POST" className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-3"
                >
                  Email address
                </label>
                <div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required=""
                    autoComplete="email"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300 mb-3"
                >
                  Password
                </label>
                <div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    required=""
                    autoComplete="current-password"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="flex items-center">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        name="rememberMe"
                        className="w-4 h-4 text-indigo-600 bg-slate-600 border-slate-500 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                      <svg
                        viewBox="0 0 14 14"
                        fill="none"
                        className="absolute inset-0 w-4 h-4 pointer-events-none opacity-0 transition-opacity duration-200"
                        id="checkbox-icon"
                      >
                        <path
                          d="M3 8L6 11L11 3.5"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="stroke-white"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <label
                    htmlFor="rememberMe"
                    className="ml-3 text-sm text-slate-300"
                  >
                    Remember me
                  </label>
                </div>

                <div>
                  <a
                    href="/forgot-password"
                    className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition duration-200"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Sign in
                </button>
              </div>
            </Form>

            <div>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center">
                  <p className="px-4 bg-slate-800 text-sm text-slate-400">
                    Or continue with
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1">
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                      fill="#EA4335"
                    ></path>
                    <path
                      d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                      fill="#4285F4"
                    ></path>
                    <path
                      d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                      fill="#34A853"
                    ></path>
                  </svg>
                  <span className="text-sm">Google</span>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            Not a member?
            <a
              href="#"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition duration-200"
            >
              Start a 14 day free trial
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export const createSignInAction = async (data) => {
  const formData = await data.request.formData();
  const SignInData = Object.fromEntries(formData);

  console.log("Data collected from signIn form:", SignInData);

  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(SignInData),
      credentials: "include", // 🔥 this sends & accepts cookies
    });

    const result = await res.json();
    console.log("Data received from signIn backend:", result);

    // ✅ Important: return redirect, not inside a .then
    if (result.status) {
      // ✅ Save to redux
      Store.dispatch(loginActions.loginSuccess());
      Store.dispatch(loginActions.loginSuccessData(result));

      alert(result.message);
      return redirect("/");
    } else {
      alert(result.message);
      return redirect("/signin");
    }
  } catch (error) {
    console.error("Error while signing in:", error);
    return redirect("/signin");
  }
};

export default SignIn;
