import { Form, redirect } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-semibold">
            Create your account
          </h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="space-y-6">
            <Form method="POST" className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-300 mb-3"
                >
                  Full Name
                </label>
                <div>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    required=""
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-300 mb-3"
                >
                  Confirm Password
                </label>
                <div>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    required=""
                    autoComplete="new-password"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Sign Up
                </button>
              </div>
            </Form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Already a member?
              <a
                href="/signin"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition duration-200"
              >
                Sign in to your account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const createSignUpAction = async (data) => {
  const formData = await data.request.formData();
  const SignUpData = Object.fromEntries(formData);

  console.log("Data collected from signUp form:", SignUpData);

  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(SignUpData),
      credentials: "include", // 🔥 this sends & accepts cookies
    });

    const result = await res.json();
    console.log("Data received from signUp backend:", result);

    // ✅ Important: return redirect, not inside a .then
    if (result.status) {
      alert(result.message);
      return redirect("/signin");
    } else {
      alert(result.message);
      return redirect("/signup");
    }
  } catch (error) {
    console.error("Error while signing in:", error);
    return redirect("/signin");
  }
};

export default SignUp;
