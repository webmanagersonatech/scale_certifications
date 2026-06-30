import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://161.248.37.193:8000/api";

export interface SubjectWiseScore {
  subjectName: string;
  score: number;
}
export interface ExportStudentsResponse {
  success: boolean;
  count: number;
  students: Student[];
}

export interface Student {
  _id?: string;
  studentScaleId: string;
  name: string;
  phone: string;
  email: string;
  specialisation: string; // Added
  aadharNumber?: string; // Added - optional
  badge: string; // Added
  photoUrl?: string; // Added - optional (for the photo URL from server)
  studentFeedback?: string;
  trainerFeedback?: string;
  subjectWiseScores: SubjectWiseScore[];
  events: string;
  date: string;
  qrCode?: string;
  photo?: string;
  overallScore: number;
  overallAttendance: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface StudentsResponse {
  success: boolean;
  students: {
    docs: Student[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
}

export interface StudentResponse {
  success: boolean;
  data: Student;
  message?: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "An error occurred";
    toast.error(message);
    return Promise.reject(error);
  }
);

// Create Student
export async function createStudent(data: Omit<Student, '_id' | 'createdAt' | 'updatedAt'>) {
  try {
    const response = await api.post<StudentResponse>("/students", data);
    toast.success(response.data.message || "Student created successfully");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create student."
    );
  }
}

// In your studentRequest.ts
export async function getStudentByScaleId(studentScaleId: string) {
  try {
    const response = await api.get<StudentResponse>(`/students/certification/${studentScaleId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch student by Scale ID."
    );
  }
}
// Generate QR code for a student
export const generateStudentQR = async (studentId: string): Promise<{ success: boolean; qrCode: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate QR code');
    }

    const data = await response.json();
    return { success: true, qrCode: data.qrCode };
  } catch (error: any) {
    console.error('Generate QR error:', error);
    throw error;
  }
};

// Regenerate QR code for a student
export const regenerateStudentQR = async (studentId: string): Promise<{ success: boolean; qrCode: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/regenerate-qr`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to regenerate QR code');
    }

    const data = await response.json();
    return { success: true, qrCode: data.qrCode };
  } catch (error: any) {
    console.error('Regenerate QR error:', error);
    throw error;
  }
};

// Download QR code for a student
export const downloadStudentQR = async (studentId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/download-qr`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to download QR code');
    }

    // Create a blob from the response
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'qr-code.png';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) {
        filename = match[1];
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Download QR error:', error);
    throw error;
  }
};
// List Students with pagination and search
// lib/request/studentRequest.ts

export async function getAllStudents({
  page = 1,
  limit = 10,
  search = "",
  event = "",
  dateRange = "", // Add dateRange parameter
}: {
  page?: number;
  limit?: number;
  search?: string;
  event?: string;
  dateRange?: string; // Add dateRange to type
}) {
  try {
    const response = await api.get<StudentsResponse>("/students", {
      params: {
        page,
        limit,
        search: search.trim(),
        event: event || undefined,
        dateRange: dateRange || undefined, // Pass dateRange filter
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch students."
    );
  }
}
export async function exportStudents({
  search = "",
  event = "",
  dateRange = "",
}: {
  search?: string;
  event?: string;
  dateRange?: string;
}) {
  try {
    const response = await api.get<ExportStudentsResponse>("/students/export", {
      params: {
        search: search.trim(),
        event: event || undefined,
        dateRange: dateRange || undefined,
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to export students."
    );
  }
}
// Get Student by ID
export async function getStudentById(id: string) {
  try {
    const response = await api.get<StudentResponse>(`/students/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch student."
    );
  }
}

// Update Student
export async function updateStudent(
  id: string,
  data: Partial<Omit<Student, '_id' | 'createdAt' | 'updatedAt'>>
) {
  try {
    const response = await api.put<StudentResponse>(`/students/${id}`, data);
    toast.success(response.data.message || "Student updated successfully");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update student."
    );
  }
}

// Delete Student
export async function deleteStudent(id: string) {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(`/students/${id}`);
    toast.success(response.data.message || "Student deleted successfully");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete student."
    );
  }
}

export default api;