import api from "./api";

const triggerDownload = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

const downloadEmployeeDirectoryReport = async () => {
    const response = await api.get("/Reports/employees", {
        responseType: "blob",
        skipSuccessToast: true
    });
    triggerDownload(response.data, "employee-directory.csv");
};

const downloadAttendanceReport = async (fromDate: string, toDate: string) => {
    const response = await api.get("/Reports/attendance", {
        params: { fromDate, toDate },
        responseType: "blob",
        skipSuccessToast: true
    });
    triggerDownload(response.data, `attendance-report_${fromDate}_${toDate}.csv`);
};

const downloadLeaveReport = async (fromDate?: string, toDate?: string, status?: string) => {
    const response = await api.get("/Reports/leaves", {
        params: { fromDate, toDate, status },
        responseType: "blob",
        skipSuccessToast: true
    });
    triggerDownload(response.data, "leave-report.csv");
};

const downloadPerformanceReviewReport = async (cycleId?: string) => {
    const response = await api.get("/Reports/performance-reviews", {
        params: { cycleId },
        responseType: "blob",
        skipSuccessToast: true
    });
    triggerDownload(response.data, "performance-review-report.csv");
};

export default {
    downloadEmployeeDirectoryReport,
    downloadAttendanceReport,
    downloadLeaveReport,
    downloadPerformanceReviewReport
};
