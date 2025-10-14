import { type TaskImportance } from "@prisma/client";

export interface DetailedData {
  partner: string;
  department: string;
  capitalAmount: number;
  capitalPercent: number;
  effortEquity: number;
  totalEquity: number;
}

export interface PartnerEquityData {
  name: string;
  equity: number;
  color: string;
}

export interface ReportData {
  departmentData: { name: string; weight: number; value: number }[];
  partnerEquityData: PartnerEquityData[];
  detailedData: DetailedData[];
  partnerTasks: { partner: string; department: string; tasks: { name: string; importance: TaskImportance; weight: number }[] }[];
}
