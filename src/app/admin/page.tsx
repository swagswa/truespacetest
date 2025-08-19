'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { useLessons } from '@/contexts/LessonsContext';

interface Lesson {
  id: number;
  title: string;
  description: string;
  learningOutcomes: string[];
  chatLink: string;
  direction: string;
  sprint: string;
}

const directions = ['AI Агенты', 'No-Code', 'Графический ИИ', 'Для начинающих', 'ChatGPT'];
const sprints = ['Январь 2024', 'Февраль 2024', 'Март 2024', 'Апрель 2024'];

const initialLessons: Lesson[] = [
  {
    id: 1,
    title: 'Создание первого AI агента',
    description: 'Изучите основы создания AI агентов с помощью современных инструментов',
    learningOutcomes: [
      'Понимание принципов работы AI агентов',
      'Создание простого чат-бота',
      'Интеграция с внешними API'
    ],
    chatLink: 'https://t.me/truespace_chat',
    direction: 'AI Агенты',
    sprint: 'Январь 2024'
  }
];

export default function AdminPage() {
  const router = useRouter();
  const { clearCache } = useLessons();
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    learningOutcomes: [''],
    chatLink: '',
    direction: directions[0],
    sprint: sprints[0]
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      learningOutcomes: [''],
      chatLink: '',
      direction: directions[0],
      sprint: sprints[0]
    });
    setEditingLesson(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.chatLink) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const filteredOutcomes = formData.learningOutcomes.filter(outcome => outcome.trim() !== '');
    
    try {
      if (editingLesson) {
        // Редактирование существующего урока (пока не реализовано в backend)
        alert('Редактирование уроков пока не поддерживается');
        return;
      } else {
        // Создание нового урока через API
        const directionMap: { [key: string]: number } = {
          'AI Агенты': 1,
          'No-Code': 2,
          'Графический ИИ': 3,
          'Для начинающих': 4,
          'ChatGPT': 5
        };

        const lessonData = {
          title: formData.title,
          description: formData.description,
          content: {
            type: 'lesson' as const,
            blocks: [
              {
                type: 'text' as const,
                content: `Описание: ${formData.description}\n\nЧему вы научитесь:\n${filteredOutcomes.map(outcome => `• ${outcome}`).join('\n')}\n\nСсылка на чат: ${formData.chatLink || 'Не указана'}\n\nСпринт: ${formData.sprint}`
              }
            ]
          },
          chatLink: formData.chatLink,
          directionId: directionMap[formData.direction] || 1,
          published: true
        };

        const response = await fetch('http://localhost:4000/api/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lessonData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `Ошибка ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const newLesson = await response.json();
        
        // Добавляем урок в локальный state
        const localLesson: Lesson = {
          id: newLesson.id || Date.now(),
          title: formData.title,
          description: formData.description,
          learningOutcomes: filteredOutcomes,
          chatLink: formData.chatLink,
          direction: formData.direction,
          sprint: formData.sprint
        };
        
        setLessons([...lessons, localLesson]);
        
        // Очищаем кэш контекста, чтобы данные обновились на других страницах
        clearCache();
        
        resetForm();
        alert('Урок успешно создан!');
      }
    } catch (error) {
      console.error('Ошибка при сохранении урока:', error);
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при сохранении урока';
      alert(errorMessage);
    }
  };

  const addLearningOutcome = () => {
    setFormData({
      ...formData,
      learningOutcomes: [...formData.learningOutcomes, '']
    });
  };

  const updateLearningOutcome = (index: number, value: string) => {
    const newOutcomes = [...formData.learningOutcomes];
    newOutcomes[index] = value;
    setFormData({
      ...formData,
      learningOutcomes: newOutcomes
    });
  };

  const removeLearningOutcome = (index: number) => {
    if (formData.learningOutcomes.length > 1) {
      setFormData({
        ...formData,
        learningOutcomes: formData.learningOutcomes.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative">
      <AuroraBackground>
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="w-full max-w-sm mx-auto flex flex-col relative z-10 py-8">
            
            {/* Header */}
            <header className="relative z-10 pb-6 px-4 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => router.push('/')}
                  className="glass-button p-3 transition-colors duration-200 flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">TrueBase Admin</h1>
                  <p className="text-neutral-300 text-sm">Управление уроками</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass-button p-4 text-center">
                  <div className="w-5 h-5 text-blue-400 mx-auto mb-2">📚</div>
                  <p className="text-white text-sm font-medium">{lessons.length}</p>
                  <p className="text-neutral-300 text-xs">Уроков</p>
                </div>
                <div className="glass-button p-4 text-center">
                  <div className="w-5 h-5 text-green-400 mx-auto mb-2">📁</div>
                  <p className="text-white text-sm font-medium">{directions.length}</p>
                  <p className="text-neutral-300 text-xs">Направлений</p>
                </div>
              </div>
            </header>

            {/* Add/Edit Form */}
            <div className="flex-1 px-4 pb-6 relative z-10">
              <div className="glass-container p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">
                      {editingLesson ? 'Редактировать урок' : 'Новый урок'}
                    </h2>
                  </div>
                  {isEditing && (
                    <button
                      onClick={resetForm}
                      className="glass-button p-2 text-neutral-400 hover:text-white transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Название урока *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full glass-button px-4 py-3 text-white placeholder-neutral-400 focus:outline-none transition-colors duration-200"
                      placeholder="Введите название урока"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Описание *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full glass-button px-4 py-3 text-white placeholder-neutral-400 focus:outline-none transition-colors duration-200 resize-none"
                      placeholder="Краткое описание урока"
                      rows={3}
                    />
                  </div>

                  {/* Direction */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Направление
                    </label>
                    <select
                      value={formData.direction}
                      onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                      className="w-full glass-button px-4 py-3 text-white focus:outline-none transition-colors duration-200"
                    >
                      {directions.map((direction) => (
                        <option key={direction} value={direction} className="bg-black">
                          {direction}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sprint */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Спринт
                    </label>
                    <select
                      value={formData.sprint}
                      onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
                      className="w-full glass-button px-4 py-3 text-white focus:outline-none transition-colors duration-200"
                    >
                      {sprints.map((sprint) => (
                        <option key={sprint} value={sprint} className="bg-black">
                          {sprint}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chat Link */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Ссылка на чат *
                    </label>
                    <input
                      type="url"
                      value={formData.chatLink}
                      onChange={(e) => setFormData({ ...formData, chatLink: e.target.value })}
                      className="w-full glass-button px-4 py-3 text-white placeholder-neutral-400 focus:outline-none transition-colors duration-200"
                      placeholder="https://t.me/your_chat"
                    />
                  </div>

                  {/* Learning Outcomes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-neutral-300">
                        Результаты обучения
                      </label>
                      <button
                        onClick={addLearningOutcome}
                        className="glass-button p-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {formData.learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={outcome}
                          onChange={(e) => updateLearningOutcome(index, e.target.value)}
                          className="flex-1 glass-button px-4 py-2 text-white placeholder-neutral-400 focus:outline-none transition-colors duration-200"
                          placeholder={`Результат обучения ${index + 1}`}
                        />
                        {formData.learningOutcomes.length > 1 && (
                          <button
                            onClick={() => removeLearningOutcome(index)}
                            className="glass-button p-3 text-red-400 hover:text-red-300 transition-colors duration-200 flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <button
                    onClick={handleSave}
                    className="glass-button px-8 py-4 text-white font-medium flex items-center gap-3 transition-colors duration-200 text-lg"
                  >
                    <Save className="w-5 h-5" />
                    {editingLesson ? 'Сохранить' : 'Создать урок'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuroraBackground>
    </main>
  );
}