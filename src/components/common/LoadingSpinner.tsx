// Fancy loading spinner component
const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-24 h-24">
        {/* Outer spinning circle */}
        <div className="absolute inset-0 rounded-full border-4 border-[#e8934a]/20"></div>
        <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>

        {/* Inner spinning circle - opposite direction */}
        <div className="absolute inset-2 rounded-full border-2 border-[#e3bb52]/30"></div>
        <div className="absolute inset-2 rounded-full border-t-2 border-b-2 border-[#e3bb52] animate-reverse"></div>

        {/* Center dot */}
        <div className="absolute inset-1/3 rounded-full bg-primary animate-pulse"></div>
      </div>
      <p className="mt-6 text-lg font-medium text-gray-700">Cargando...</p>
    </div>
  );
};

export default LoadingSpinner;
