import { Logger } from "../../lib/logger";
import { EventBus } from "../events/EventBus";

export class WebsiteAnalyticsEngine {
  /**
   * Generates internal analytics events to feed into the Reporting & Business Intelligence module (Phase 6.3)
   */
  
  static async recordPageView(pagePath: string, referrer: string, utmCampaign: string) {
    Logger.info(`[WebsiteAnalytics] Page View: ${pagePath} | Referrer: ${referrer} | Campaign: ${utmCampaign}`);
    await EventBus.emit("WEBSITE_ANALYTICS_PAGE_VIEW", { pagePath, referrer, utmCampaign, timestamp: new Date().toISOString() });
  }

  static async recordInteraction(interactionType: "PORTFOLIO_VIEW" | "PRICING_VIEW" | "SERVICES_VIEW", details: string) {
    Logger.info(`[WebsiteAnalytics] Interaction: ${interactionType} - ${details}`);
    await EventBus.emit("WEBSITE_ANALYTICS_INTERACTION", { interactionType, details, timestamp: new Date().toISOString() });
  }

  static async recordConversion(conversionType: string, source: string, landingPage?: string) {
    Logger.info(`[WebsiteAnalytics] Conversion Achieved: ${conversionType} from ${source}`);
    await EventBus.emit("WEBSITE_ANALYTICS_CONVERSION", { conversionType, source, landingPage, timestamp: new Date().toISOString() });
  }
}
