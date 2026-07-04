import api from "./api";
import { type DesignationFormData } from "../models/Designation";

// Fetch designations (with an optional departmentId filter)
const getDesignations = async (departmentId?: string) => {
    console.log('Fetching designations for department: ' + (departmentId || 'All'));
    
    // If a departmentId is provided, hit the filtered endpoint, otherwise fallback to a global list
    const url = departmentId 
        ? `designation/designations/${departmentId}` 
        : `designation/designations`;

    const response = await api.get(url);
    return response.data;
};
const getAllDesignations = async () => {
    console.log('Fetching all designations globally');
    
    const response = await api.get(`designation/alldesignations`);
    return response.data;
};

// Add a new designation
const addDesignation = async (designationData: DesignationFormData) => {
    debugger;
    const response = await api.post(`designation/designation`, designationData);
    return response.data;
};

// Delete an existing designation by its ID
const deleteDesignation = async (id: string | number) => {
    const response = await api.delete(`designation/designation/${id}`);
    return response.data;
};

const designationService = {
    getDesignations,
    addDesignation,
    getAllDesignations,
    deleteDesignation
};

export default designationService;