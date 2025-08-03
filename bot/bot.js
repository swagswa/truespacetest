const TelegramBot = require('node-telegram-bot-api');

// Токен бота
const token = '8446511797:AAGbqyRF_PHS5MYoCD3ItwZeSg1mbYMeU10';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// URL веб-приложения
const webAppUrl = 'https://truespacetest.vercel.app';

console.log('🤖 TrueSpace Bot запущен!');

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Пользователь';
    
    const welcomeMessage = `
🚀 Добро пожаловать в TrueSpace, ${firstName}!

Ваше творческое пространство для ИИ, дизайна и инноваций.

Нажмите кнопку ниже, чтобы открыть приложение:
    `;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🌟 Открыть TrueSpace',
                        web_app: { url: webAppUrl }
                    }
                ],
                [
                    {
                        text: '📚 О платформе',
                        callback_data: 'about'
                    },
                    {
                        text: '🆘 Помощь',
                        callback_data: 'help'
                    }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, welcomeMessage, options);
});

// Обработчик команды /app
bot.onText(/\/app/, (msg) => {
    const chatId = msg.chat.id;
    
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🚀 Запустить TrueSpace',
                        web_app: { url: webAppUrl }
                    }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, '🌟 Откройте TrueSpace прямо в Telegram!', options);
});

// Обработчик callback запросов
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = message.chat.id;

    switch (data) {
        case 'about':
            const aboutMessage = `
📖 О TrueSpace

TrueSpace - это инновационная образовательная платформа, которая объединяет:

🤖 AI Агенты - Создание умных помощников
🎨 Графика и Видео с ИИ - Творчество с искусственным интеллектом  
⚡ No-code разработка - Создание приложений без программирования
🎓 ИИ для начинающих - Изучение основ искусственного интеллекта
📹 Вебинары - Живые обучающие сессии

Присоединяйтесь к будущему обучения!
            `;
            
            const aboutOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🌟 Открыть TrueSpace',
                                web_app: { url: webAppUrl }
                            }
                        ],
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: 'back_to_start'
                            }
                        ]
                    ]
                }
            };
            
            bot.editMessageText(aboutMessage, {
                chat_id: chatId,
                message_id: message.message_id,
                ...aboutOptions
            });
            break;

        case 'help':
            const helpMessage = `
🆘 Помощь

Как использовать TrueSpace:

1️⃣ Нажмите "Открыть TrueSpace" для запуска приложения
2️⃣ Выберите интересующую вас категорию
3️⃣ Изучайте материалы и создавайте проекты
4️⃣ Участвуйте в вебинарах и общайтесь с сообществом

Команды бота:
/start - Главное меню
/app - Быстрый запуск приложения
/help - Эта справка

Нужна дополнительная помощь? Свяжитесь с поддержкой!
            `;
            
            const helpOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🌟 Открыть TrueSpace',
                                web_app: { url: webAppUrl }
                            }
                        ],
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: 'back_to_start'
                            }
                        ]
                    ]
                }
            };
            
            bot.editMessageText(helpMessage, {
                chat_id: chatId,
                message_id: message.message_id,
                ...helpOptions
            });
            break;

        case 'back_to_start':
            const firstName = callbackQuery.from.first_name || 'Пользователь';
            const welcomeMessage = `
🚀 Добро пожаловать в TrueSpace, ${firstName}!

Ваше творческое пространство для ИИ, дизайна и инноваций.

Нажмите кнопку ниже, чтобы открыть приложение:
            `;

            const startOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🌟 Открыть TrueSpace',
                                web_app: { url: webAppUrl }
                            }
                        ],
                        [
                            {
                                text: '📚 О платформе',
                                callback_data: 'about'
                            },
                            {
                                text: '🆘 Помощь',
                                callback_data: 'help'
                            }
                        ]
                    ]
                }
            };

            bot.editMessageText(welcomeMessage, {
                chat_id: chatId,
                message_id: message.message_id,
                ...startOptions
            });
            break;
    }

    // Отвечаем на callback запрос
    bot.answerCallbackQuery(callbackQuery.id);
});

// Обработчик команды /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `
🆘 Помощь TrueSpace Bot

Доступные команды:
/start - Главное меню
/app - Быстрый запуск приложения  
/help - Показать эту справку

🌟 Для запуска TrueSpace используйте кнопку "Открыть TrueSpace" или команду /app
    `;

    bot.sendMessage(chatId, helpMessage);
});

// Обработчик всех остальных сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Игнорируем команды, которые уже обработаны
    if (text && text.startsWith('/')) {
        return;
    }

    // Отвечаем на обычные сообщения
    const responseMessage = `
Привет! 👋 

Я бот TrueSpace - вашего творческого пространства для ИИ и инноваций.

Используйте /start для открытия главного меню или /app для быстрого запуска приложения.
    `;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🌟 Открыть TrueSpace',
                        web_app: { url: webAppUrl }
                    }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, responseMessage, options);
});

// Обработка ошибок
bot.on('error', (error) => {
    console.error('Ошибка бота:', error);
});

// Обработка polling ошибок
bot.on('polling_error', (error) => {
    console.error('Polling ошибка:', error);
});