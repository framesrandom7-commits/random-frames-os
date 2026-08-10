/**
 * ForecastService contracts and interfaces for future predictive artificial intelligence analytics.
 * Per master architectural specification, these interfaces define expansion points without executing speculative AI algorithms today.
 */

export interface RevenueForecastPrediction {
  horizonMonth: string; // e.g., "2026-09"
  projectedRevenue: number;
  confidenceInterval: {
    lowerBound: number;
    upperBound: number;
  };
  keyDrivers: string[];
}

export interface SeasonalDemandModel {
  verticalName: string; // Photography, Videography, Weddings, Events, Cafe
  peakMonths: number[]; // e.g., [10, 11, 12] for festive Q4
  expectedCapacityLoadPercent: number;
  suggestedEquipmentPreallocations: string[];
}

export interface CashFlowRunwayEstimate {
  currentLiquidCash: number;
  estimatedMonthlyBurn: number;
  projectedInflows: number;
  runwayMonths: number;
  riskThresholdReached: boolean;
}

/**
 * Interface definition for any future pluggable AI Forecasting provider (e.g. Gemini BI PRO or custom analytics engine).
 */
export interface IForecastServiceProvider {
  predictRevenueGrowth(historicalMonths: number, forecastMonths: number): Promise<RevenueForecastPrediction[]>;
  generateSeasonalDemandModel(vertical: string): Promise<SeasonalDemandModel>;
  estimateCashRunway(): Promise<CashFlowRunwayEstimate>;
}
