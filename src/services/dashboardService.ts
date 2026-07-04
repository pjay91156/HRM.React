import api from "./api";
import { type DashboardResponse,type HeadcountChart } from "../models/Dashboard";


export const getDashboard = async (): Promise<DashboardResponse> => {
    const response = await api.get("dashboard/dashboarddetails"); 
    return response.data.data;
};
export const getHeadcountTrend = async (): Promise<HeadcountChart[]> => {
    const response = await api.get("dashboard/headcount-trend");
    return response.data;
};
export const getDepartmentChart = async () => {
    const response = await api.get(
        "dashboard/department-chart"
    );

    return response.data;
};

