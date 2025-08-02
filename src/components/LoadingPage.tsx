'use client';

import { motion } from 'framer-motion';

interface LoadingPageProps {
  title?: string;
  subtitle?: string;
  showSpinner?: boolean;
}

export default function LoadingPage({ 
  title = "Verificando autenticación...", 
  subtitle = "Por favor, espera mientras verificamos tu sesión",
  showSpinner = true 
}: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        {/* Loading Card */}
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-700">
          <div className="text-center space-y-6">
            {/* Icon */}
            <motion.div 
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </motion.div>

            {/* Title */}
            <motion.h2 
              className="text-xl sm:text-2xl font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p 
              className="text-gray-300 text-sm sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {subtitle}
            </motion.p>

            {/* Spinner */}
            {showSpinner && (
              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="relative">
                  {/* Outer ring */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-600 rounded-full"></div>
                  
                  {/* Animated spinner */}
                  <motion.div 
                    className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-t-orange-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Inner pulse */}
                  <motion.div 
                    className="absolute top-1/2 left-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-orange-500 rounded-full"
                    style={{ 
                      transform: 'translate(-50%, -50%)',
                      marginTop: '-2px',
                      marginLeft: '-2px'
                    }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Progress dots */}
            <motion.div 
              className="flex justify-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-orange-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-400">
<<<<<<< HEAD
          {/* Footer eliminado por requerimiento */}
=======
          <p>
            &copy; 2024 Sistema de Restaurante
            {' '}|{' '}
            <a
              href="https://my-portfolio-lime-zeta-70.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              Edgar Martinez - Desarrollador Web
            </a>
          </p>
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
        </div>
      </div>
    </div>
  );
} 