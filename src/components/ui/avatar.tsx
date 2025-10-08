import { User } from "lucide-react";
import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-lg",
  xl: "w-32 h-32 text-4xl",
};

/**
 * Avatar component con fallback automático
 * 
 * Si la imagen falla o no existe, muestra las iniciales del nombre
 * o un ícono de usuario genérico.
 */
export function Avatar({
  src,
  alt = "Usuario",
  className = "",
  fallbackClassName = "",
  size = "md",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const showImage = src && !imageError;
  const initials = alt?.charAt(0)?.toUpperCase() || "U";

  const sizeClass = sizeClasses[size];

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.warn(`Avatar image failed to load: ${src}`);
            setImageError(true);
          }}
        />
      ) : null}

      {/* Fallback */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white font-bold ${
          showImage && imageLoaded ? "opacity-0" : "opacity-100"
        } transition-opacity duration-200 ${fallbackClassName}`}
      >
        {initials}
      </div>
    </div>
  );
}
