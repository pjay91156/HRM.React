import { z } from "zod";

export const employeeSchema = z.object({

    firstName: z
        .string()
        .trim()
        .min(1, "First Name is required"),

    lastName: z
        .string()
        .trim()
        .min(1, "Last Name is required"),

    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Invalid Email"),

    empCode: z
        .string()
        .trim()
        .min(1, "Employee Code is required"),

    phone: z
        .string()
        .trim()
        .min(1, "Phone is required")
        .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),

    departmentId: z
        .string()
        .min(1, "Department is required"),

    designationId: z
        .string()
        .min(1, "Designation is required"),
});

export type EmployeeSchemaType =
    z.infer<typeof employeeSchema>;