'use client';

import { motion } from 'framer-motion';

export default function SystemCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        {/* System Check Card */}
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-700">
          <div className="text-center space-y-6">
            {/* Icon */}
            <motion.div 
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>

            {/* Title */}
            <motion.h2 
              className="text-xl sm:text-2xl font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Verificando sistema...
            </motion.h2>

            {/* Subtitle */}
            <motion.p 
              className="text-gray-300 text-sm sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Comprobando configuración y estado del sistema
            </motion.p>

            {/* Check items */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {[
                { text: "Verificando archivos de configuración", delay: 0.6 },
                { text: "Comprobando conexión a base de datos", delay: 0.8 },
                { text: "Validando usuario administrador", delay: 1.0 }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 text-sm text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: item.delay }}
                >
                  <motion.div
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Spinner */}
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="relative">
                {/* Outer ring */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-600 rounded-full"></div>
                
                {/* Animated spinner */}
                <motion.div 
                  className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-t-blue-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                {/* Inner pulse */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded-full"
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
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-400">
          <p>&copy; 2024 Sistema de Restaurante. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
} 