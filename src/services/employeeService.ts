import api from "./api";
import { type EmployeeFormData } from "../models/Employee";

const getEmployees = async () => {
   
    const response = await api.get("employee/employees");
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

const employeeService = {
    getEmployees,
    addEmployee,
    getMyTeamHierarchy,
    deleteEmployee // ✅ Added to the exported service object
};

export default employeeService;