'use client';

import { Heart, Check } from 'lucide-react';
import { useState } from 'react';

export default function TestCompletedPage() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Тестовая страница кнопок</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Тестовый урок</h2>
          
          <div className="flex gap-4 justify-center">
            {/* Кнопка избранного */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`transition-all duration-200 hover:scale-110 ${
                isFavorite
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
              />
            </button>

            {/* Кнопка завершения */}
            <button
              onClick={() => setIsCompleted(!isCompleted)}
              className={`transition-all duration-200 hover:scale-110 ${
                isCompleted
                  ? 'text-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              <Check 
                className="w-4 h-4" 
              />
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-400">
            Избранное: {isFavorite ? 'Да' : 'Нет'} | Завершено: {isCompleted ? 'Да' : 'Нет'}
          </div>
        </div>
        
        {/* Дополнительные тесты */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-md font-semibold mb-3">Дополнительные тесты</h3>
          
          {/* Простые кнопки без стилей */}
          <div className="flex gap-2 mb-4">
            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Простая красная
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded">
              Простая зеленая
            </button>
          </div>
          
          {/* Иконки без кнопок */}
          <div className="flex gap-4 items-center">
            <Heart className="w-8 h-8 text-red-500" />
            <Check className="w-8 h-8 text-green-500" />
            <span className="text-gray-400">Иконки без кнопок</span>
          </div>
        </div>
      </div>
    </div>
  );
}