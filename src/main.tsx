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
    fetch('http://204.12.205.239:3000/rrweb/events', {
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
    fetch('http://204.12.205.239:3000/rrweb/events', {
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

  // Try no-cors first, then fallback to cors, then XMLHttpRequest
  sendWithNoCors();
  
  // Also try XMLHttpRequest as an alternative
  setTimeout(() => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://204.12.205.239:3000/rrweb/events', true);
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
