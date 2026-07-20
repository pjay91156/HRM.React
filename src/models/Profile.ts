export interface MyProfile {
    userId: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    profilePictureUrl: string | null;
    employeeCode: string;
    departmentName: string;
    designationName: string;
    joiningDate: string;
    managerName: string | null;
    companyName: string;
    role: "Employee" | "Admin" | "SuperAdmin";
}

export interface UpdateMyProfileRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string;
}
