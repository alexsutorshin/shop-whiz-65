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
  
  fetch('https://204.12.205.239:3000/rrweb/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ingest-token': 'change_me'
    },
    body: body,
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
  });
  
  console.log(body)
}

// save events every 10 seconds
setInterval(save, 10 * 1000);
