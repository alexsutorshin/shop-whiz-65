import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import * as rrweb from 'rrweb';
import { getRecordConsolePlugin } from 'rrweb/lib/plugins/console-record';
import { v4 as uuidv4 } from 'uuid';
import "./index.css";

// НАСТРОЙКА ПЕРЕХВАТА В САМОМ НАЧАЛЕ - ДО ВСЕХ ОПЕРАЦИЙ
let events = [];
let consoleLogs = [];
// Generate a unique session ID for this visit
const sessionId = uuidv4();

// Функция для перехвата консольных логов
function captureConsoleLogs() {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  };

  const logLevels = ['log', 'warn', 'error', 'info', 'debug'];
  
  logLevels.forEach(level => {
    console[level] = function(...args) {
      // Вызываем оригинальную функцию
      originalConsole[level].apply(console, args);
      
      // Записываем лог для отправки на сервер
      const logEntry = {
        level: level,
        message: args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' '),
        timestamp: Date.now(),
        url: window.location.href
      };
      
      consoleLogs.push(logEntry);
      
      // Используем оригинальную функцию для отладки (не вызывает рекурсию)
      originalConsole.log(`[CAPTURE] Log captured: ${level} - ${logEntry.message.substring(0, 50)}...`);
    };
  });
  
  // Используем оригинальную функцию для отладки
  originalConsole.log('[CAPTURE] Console log capture initialized');
}

// Перехват системных ошибок браузера
function captureSystemErrors() {
  // Перехват fetch ошибок
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    return originalFetch.apply(this, args)
      .then(response => {
        if (!response.ok) {
          // Логируем ошибку с правильным статусом
          console.error('Fetch failed:', response.status, response.statusText, 'URL:', url);
        }
        return response;
      })
      .catch(error => {
        // Логируем ошибку fetch (сетевые ошибки, CORS, etc.)
        console.error('Fetch error:', error.message, 'URL:', url);
        throw error;
      });
  };

  // Перехват XMLHttpRequest ошибок
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(...args) {
    const url = args[1];
    this.addEventListener('error', () => {
      console.error('XHR error:', this.status, this.statusText, 'URL:', url);
    });
    this.addEventListener('loadend', () => {
      if (this.status >= 400) {
        console.error('XHR failed:', this.status, this.statusText, 'URL:', url);
      }
    });
    return originalXHROpen.apply(this, args);
  };

  // Перехват глобальных ошибок JavaScript
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error?.message || event.message, 'File:', event.filename, 'Line:', event.lineno);
  });

  // Перехват системных сообщений браузера (включая 401 ошибки)
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Вызываем оригинальную функцию
    originalConsoleError.apply(console, args);
    
    // Проверяем, является ли это системным сообщением браузера
    const message = args.join(' ');
    if (message.includes('Failed to load resource') || 
        message.includes('401 (Unauthorized)') ||
        message.includes('403 (Forbidden)') ||
        message.includes('404 (Not Found)') ||
        message.includes('500 (Internal Server Error)')) {
      // Логируем системное сообщение как нашу ошибку
      console.error('System error captured:', message);
    }
  };

  // Перехват необработанных промисов
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });

  // Перехват ошибок загрузки ресурсов
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      // Ошибка загрузки ресурса (изображение, скрипт, стиль)
      console.error('Resource load error:', event.target.src || event.target.href, 'Type:', event.target.tagName);
    }
  }, true);

  // Перехват ошибок сети
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.name === 'TypeError' && event.reason.message.includes('fetch')) {
      console.error('Network fetch error:', event.reason.message);
    }
  });

  // Performance API перехват отключен - может мешать работе других скриптов
  /*
  if (window.performance && window.performance.getEntriesByType) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.responseStatus >= 400) {
            console.error('Resource load failed:', resourceEntry.name, 'Status:', resourceEntry.responseStatus);
          }
        }
      });
    });
    observer.observe({ entryTypes: ['resource'] });
  }
  */

  console.log('[SYSTEM] System error capture initialized');
}

// ЗАПУСКАЕМ ПЕРЕХВАТ СРАЗУ - ДО ВСЕГО ОСТАЛЬНОГО
captureConsoleLogs();
captureSystemErrors();

createRoot(document.getElementById("root")!).render(<App />);


// Инициализация rrweb
rrweb.record({
  emit(event) {
    // push event into the events array
    events.push(event);
  },
});

// this function will send events to the backend and reset the events array
function save() {
  if (events.length === 0 && consoleLogs.length === 0) {
    return; // Don't send empty requests
  }

  // Отладочная информация ДО сброса массивов
  console.log('Sending rrweb events to server:', {
    sessionId,
    eventCount: events.length,
    consoleLogCount: consoleLogs.length,
    timestamp: new Date().toISOString()
  });
  
  const body = JSON.stringify({
    sessionId: sessionId,
    metadata: {
      userAgent: navigator.userAgent
    },
    events: events,
    consoleLogs: consoleLogs // Добавляем консольные логи
  });
  
  // Отладочная информация о payload
  console.log('Payload size:', body.length, 'bytes');
  console.log('Console logs sample:', consoleLogs.slice(0, 2)); // Показываем первые 2 лога
  
  events = []; // Reset events array after sending
  consoleLogs = []; // Reset console logs array after sending
  
  // Try different approaches to handle CORS issues
  const sendWithNoCors = () => {
    // Use HTTPS now that server supports it
    const url = 'https://204.12.205.239:3443/rrweb/events';
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ingest-token': 'change_me' // TODO: Обновить на правильный токен
      },
      body: body,
      mode: 'no-cors', // This bypasses CORS but we won't get response details
    })
    .then(() => {
      console.log('Sent rrweb events (no-cors mode - no response details available)');
    })
    .catch(error => {
      console.error('Error sending rrweb events with no-cors:', error);
      // Fallback to regular fetch
      sendWithCors();
    });
  };

  const sendWithCors = () => {
    const url = 'https://204.12.205.239:3443/rrweb/events';
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ingest-token': 'change_me' // TODO: Обновить на правильный токен
      },
      body: body,
      mode: 'cors',
    })
    .then(response => {
      if (!response.ok) {
        console.error('Failed to send rrweb events:', response.status, response.statusText);
      } else {
        console.log('Successfully sent rrweb events to server');
      }
    })
    .catch(error => {
      console.error('Error sending rrweb events:', error);
      console.log('Request body that failed to send:', body);
    });
  };

  // Try sendBeacon first (most reliable for cross-origin and mixed content)
  // ВАЖНО: sendBeacon не поддерживает заголовки, поэтому токен не передается
  // Отключаем sendBeacon из-за проблем с аутентификацией
  /*
  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      const url = 'https://204.12.205.239:3443/rrweb/events';
      
      const success = navigator.sendBeacon(url, blob);
      if (success) {
        console.log('Successfully sent rrweb events via sendBeacon');
        return; // Exit early if successful
      } else {
        console.warn('sendBeacon failed, trying other methods');
      }
    } catch (error) {
      console.warn('sendBeacon error:', error);
    }
  }
  */
  
  // Try no-cors first, then fallback to cors, then XMLHttpRequest
  sendWithNoCors();
  
  // Also try XMLHttpRequest as an alternative
  setTimeout(() => {
    try {
      const xhr = new XMLHttpRequest();
      const url = 'https://204.12.205.239:3443/rrweb/events';
      
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-ingest-token', 'change_me');
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Successfully sent rrweb events via XMLHttpRequest');
          } else {
            console.warn('XMLHttpRequest failed:', xhr.status, xhr.statusText);
          }
        }
      };
      
      xhr.onerror = function() {
        console.warn('XMLHttpRequest error occurred');
      };
      
      xhr.send(body);
    } catch (error) {
      console.warn('XMLHttpRequest failed to initialize:', error);
    }
  }, 100);
  
  // Log current page protocol for debugging
  console.log('Page protocol:', window.location.protocol);
  console.log('Target URL protocol: HTTPS (server now supports modern TLS)');
  
  // Тестовые логи для проверки перехвата консольных логов
  console.info('Console logging capture is active');
  console.warn('This is a test warning message');
  console.error('This is a test error message');
  console.log('Test log message with timestamp:', new Date().toISOString());
  console.debug('Debug message for testing');
}

// save events every 10 seconds
setInterval(save, 10 * 1000);

// Also save events when user is about to leave the page
window.addEventListener('beforeunload', function() {
  if (events.length > 0 || consoleLogs.length > 0) {
    const body = JSON.stringify({
      sessionId: sessionId,
      metadata: {
        userAgent: navigator.userAgent
      },
      events: events,
      consoleLogs: consoleLogs
    });
    
    // Use sendBeacon for reliable delivery on page unload
    // ВАЖНО: sendBeacon не поддерживает заголовки, поэтому токен не передается
    // Отключаем sendBeacon из-за проблем с аутентификацией
    /*
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const url = 'https://204.12.205.239:3443/rrweb/events';
      
      navigator.sendBeacon(url, blob);
    }
    */
  }
});

// Save events when page becomes hidden (user switches tabs, minimizes, etc.)
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden' && events.length > 0) {
    save();
  }
});

// Тестовые логи отключены для избежания рекурсии
/*
setTimeout(() => {
  console.log('=== TESTING CONSOLE LOG CAPTURE ===');
  console.info('Test info message after capture setup');
  console.warn('Test warning message after capture setup');
  console.error('Test error message after capture setup');
  console.debug('Test debug message after capture setup');
  console.log('Test log message after capture setup');
  console.log('=== END TESTING ===');
}, 1000);
*/
