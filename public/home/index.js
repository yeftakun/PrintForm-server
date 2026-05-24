import { initClients } from "./clients.js";
import { initHomeSession } from "./session.js";

if (initHomeSession()) {
  initClients();
}
