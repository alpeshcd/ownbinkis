

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-bnkis-primary mb-4">
          Access Denied
        </h1>
        <div className="bg-red-100 border border-red-200 rounded-lg p-6 mb-6">
          <p className="text-xl text-red-600 mb-2">page not found</p>
          <p className="text-gray-700">
            You do not have permission to access this page. Please contact your
            administrator if you believe this is an error.
          </p>
        </div>
        <div className="flex justify-center gap-4">
       
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
