const Home = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center bg-slate-800 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
        <h1 className="text-2xl font-bold mb-2">
          WELCOME TO MY CUSTOM GALLERY
        </h1>
        <p className="text-gray-400">
          Browse through amazing pictures curated just for you.
        </p>
      </div>
    </div>
  );
};

export default Home;
