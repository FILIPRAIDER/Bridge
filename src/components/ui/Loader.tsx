export function Loader({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        
        {/* Pulse effect */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-gray-900 rounded-full animate-ping opacity-20"></div>
      </div>
      
      {/* Message */}
      <p className="mt-6 text-gray-600 font-medium animate-pulse">{message}</p>
    </div>
  );
}

export function FullScreenLoader({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Spinner */}
        <div className="w-20 h-20 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        
        {/* Pulse effect */}
        <div className="absolute inset-0 w-20 h-20 border-4 border-gray-900 rounded-full animate-ping opacity-20"></div>
      </div>
      
      {/* Message */}
      <p className="mt-8 text-lg text-gray-600 font-medium animate-pulse">{message}</p>
    </div>
  );
}
