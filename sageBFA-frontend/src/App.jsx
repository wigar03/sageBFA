import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700 text-center">
        <h1 className="text-3xl font-extrabold text-indigo-400 mb-2">SAGE-BFA</h1>
        <p className="text-slate-400 mb-6">Sistema Automatizado para la Batería Factorial de Aptitudes</p>
        <div className="p-4 bg-slate-900 rounded-lg text-sm text-slate-300 font-mono border border-slate-800">
          Frontend inicializado con React, Vite y Tailwind CSS
        </div>
      </div>
    </div>
  )
}

export default App
