import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import * as rrweb from 'rrweb';
import { v4 as uuidv4 } from 'uuid';
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

let events = [];
// Generate a unique session ID for this visit
const sessionId = uuidv4();

rrweb.record({
  emit(event) {
    // push event into the events array
    events.push(event);
  },
});

// this function will send events to the backend and reset the events array
function save() {
  if (events.length === 0) {
    return; // Don't send empty requests
  }

  const body = JSON.stringify({
    sessionId: sessionId,
    metadata: {
      userAgent: navigator.userAgent
    },
    events: events
  });
  
  events = []; // Reset events array after sending
  
  // Try different approaches to handle CORS issues
  const sendWithNoCors = () => {
    // Try relative URL first (same domain), then absolute
    const url = window.location.protocol === 'https:' 
      ? 'https://204.12.205.239:3000/rrweb/events'
      : 'http://204.12.205.239:3000/rrweb/events';
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ingest-token': 'change_me'
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
    const url = window.location.protocol === 'https:' 
      ? 'https://204.12.205.239:3000/rrweb/events'
      : 'http://204.12.205.239:3000/rrweb/events';
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ingest-token': 'change_me'
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
  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      const url = window.location.protocol === 'https:' 
        ? 'https://204.12.205.239:3000/rrweb/events'
        : 'http://204.12.205.239:3000/rrweb/events';
      
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
  
  // Try no-cors first, then fallback to cors, then XMLHttpRequest
  sendWithNoCors();
  
  // Also try XMLHttpRequest as an alternative
  setTimeout(() => {
    try {
      const xhr = new XMLHttpRequest();
      const url = window.location.protocol === 'https:' 
        ? 'https://204.12.205.239:3000/rrweb/events'
        : 'http://204.12.205.239:3000/rrweb/events';
      
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
  
  console.log(body);
}

// save events every 10 seconds
setInterval(save, 10 * 1000);

// Also save events when user is about to leave the page
window.addEventListener('beforeunload', function() {
  if (events.length > 0) {
    const body = JSON.stringify({
      sessionId: sessionId,
      metadata: {
        userAgent: navigator.userAgent
      },
      events: events
    });
    
    // Use sendBeacon for reliable delivery on page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const url = window.location.protocol === 'https:' 
        ? 'https://204.12.205.239:3000/rrweb/events'
        : 'http://204.12.205.239:3000/rrweb/events';
      
      navigator.sendBeacon(url, blob);
    }
  }
});

// Save events when page becomes hidden (user switches tabs, minimizes, etc.)
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden' && events.length > 0) {
    save();
  }
});
