import type { DepartmentFormData } from "../models/Department";
import api from "./api";

const getDepartments = async () => {   
    const response = await api.get("department/departments");
    return response.data;
};
const addDepartment = async (employee: DepartmentFormData) => {
    const response = await api.post(
        "department/department",
        employee
    );

    return response.data;
};

const deleteDepartment = async (id: number | string) => {
    const response = await api.delete(`department/department/${id}`);
    return response.data;
};
const departmentService = {
    getDepartments,
    addDepartment,
    deleteDepartment
};

export default departmentService;