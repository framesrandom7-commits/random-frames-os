 
import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export const formatSuccess = <T>(data: T, message?: string, meta?: any) => {
  return NextResponse.json({
    success: true,
    message,
    data,
    meta,
  }, { status: 200 });
};

export const formatError = (message: string, errors?: any, status = 400) => {
  return NextResponse.json({
    success: false,
    message,
    errors,
  }, { status });
};
