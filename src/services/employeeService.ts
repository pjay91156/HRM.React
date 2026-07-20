import api from "./api";
import { type EmployeeFormData } from "../models/Employee";

const getEmployees = async () => {

    const response = await api.get("employee/employees");
    return response.data;
};
const getEmployeesByDepartment = async (departmentId: string) => {
    const response = await api.get(`employee/employees/${departmentId}`);
    return response.data;
};
const addEmployee = async (employee: EmployeeFormData) => {
    const response = await api.post(
        "employee/employee",
        employee
    );

    return response.data;
};

const deleteEmployee = async (id: number | string) => {
    const response = await api.delete(`employee/employee/${id}`);
    return response.data;
};
const getMyTeamHierarchy = async () => {
    const response = await api.get("employee/my-team");
    return response.data;
};

// Backend UserRole enum: Employee = 1, Admin = 2, SuperAdmin = 3 (SuperAdmin is never settable here)
const ROLE_VALUE: Record<"Employee" | "Admin", number> = { Employee: 1, Admin: 2 };

const updateEmployeeRole = async (employeeId: string, role: "Employee" | "Admin") => {
    const response = await api.put(`employee/employee/${employeeId}/role`, { role: ROLE_VALUE[role] });
    return response.data;
};

const employeeService = {
    getEmployees,
    getEmployeesByDepartment,
    addEmployee,
    getMyTeamHierarchy,
    updateEmployeeRole,
    deleteEmployee // ✅ Added to the exported service object
};

export default employeeService;