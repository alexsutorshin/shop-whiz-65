import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import * as rrweb from 'rrweb';
import "./index.css";


createRoot(document.getElementById("root")!).render(<App />);

let events = [];

rrweb.record({
  emit(event) {
    // push event into the events array
    events.push(event);
  },
});

// this function will send events to the backend and reset the events array
function save() {
  const body = JSON.stringify({ events });
  events = [];
//   fetch('http://YOUR_BACKEND_API', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body,
//   });
    console.log(body);
}

// save events every 10 seconds
setInterval(save, 10 * 1000);
