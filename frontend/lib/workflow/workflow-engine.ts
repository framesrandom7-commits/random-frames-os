import { registerStorageHandlers } from "./handlers/storage-handler";
import { registerTimelineHandlers } from "./handlers/timeline-handler";
import { Logger } from "@/lib/logger";

class WorkflowEngineService {
  private isInitialized = false;

  /**
   * Bootstraps the workflow engine by registering all event handlers.
   * This should be called once when the application starts.
   */
  public initialize() {
    if (this.isInitialized) return;

    Logger.info("[WorkflowEngine] Initializing...");

    // Register all domain handlers
    registerStorageHandlers();
    registerTimelineHandlers();
    
    // Future handlers
    // registerCRMHandlers();
    // registerFinanceHandlers();
    
    this.isInitialized = true;
    Logger.info("[WorkflowEngine] Initialization complete. Listening for events.");
  }
}

export const WorkflowEngine = new WorkflowEngineService();
WorkflowEngine.initialize();
