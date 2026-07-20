export interface EmployeeResponse {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    departmentName: string;
    designationName: string;
    joiningDate: string;
    isActive: boolean;
    role: "Employee" | "Admin" | "SuperAdmin";
}
export interface EmployeeFormData {
    firstName: string;
    lastName: string;
    email: string;
    empCode:string;
    phone: string;
    departmentId: string;
    designationId: string;
    managerId:string;
    
}