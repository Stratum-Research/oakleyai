export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
      <p className="text-black font-medium text-lg">Generating questions...</p>
      <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
    </div>
  );
}

