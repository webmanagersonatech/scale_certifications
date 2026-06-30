// components/forms/studentform.tsx
import { useState, useEffect, useRef } from "react";
import { createStudent, updateStudent, Student, getStudentById } from "@/lib/request/studentRequest";
import { toast } from "react-toastify";

interface SubjectScore {
  subjectName: string;
  score: number;
}

interface StudentFormProps {
  initialData?: Student | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
  studentId?: string; // For editing
}

// Event options with dates
const EVENT_OPTIONS = [
  {
    id: 1,
    name: "FSP For MBA 2nd Year Students",
    startDate: "19-01-2026",
    endDate: "10-04-2026",
    dateRange: "19-01-2026 to 10-04-2026"
  },
  {
    id: 2,
    name: "SDP Business Analytics Workshop for 1st year MBA Students",
    startDate: "16-04-2026",
    endDate: "18-04-2026",
    dateRange: "16-04-2026 to 18-04-2026"
  },
  {
    id: 3,
    name: "FDP for Thiagarajar Polytechnic College",
    startDate: "20-04-2026",
    endDate: "21-04-2026",
    dateRange: "20-04-2026 to 21-04-2026"
  },
  {
    id: 4,
    name: "FDP for Sona College of Technology and Management",
    startDate: "28-04-2026",
    endDate: "29-04-2026",
    dateRange: "28-04-2026 to 29-04-2026"
  },
  {
    id: 5,
    name: "FDP for Sona Medical College of Yoga and Naturopath",
    startDate: "15-05-2026",
    endDate: "16-05-2026",
    dateRange: "15-05-2026 to 16-05-2026"
  },
  {
    id: 6,
    name: "SDP for Sona Medical College of Yoga and Naturopath",
    startDate: "28-05-2026",
    endDate: "30-05-2026",
    dateRange: "28-05-2026 to 30-05-2026"
  },
  {
    id: 7,
    name: "FDP for Management, MCA & Arts and Science",
    startDate: "04-06-2026",
    endDate: "05-06-2026",
    dateRange: "04-06-2026 to 05-06-2026"
  }
];

// Specialisation options
const SPECIALISATION_OPTIONS = [
  "Marketing",
  "Finance",
  "HR/Operations",
  "Analytics"
];

// Badge options
const BADGE_OPTIONS = [
  { value: "gold", label: "🥇 Gold", color: "bg-yellow-500" },
  { value: "silver", label: "🥈 Silver", color: "bg-gray-400" },
  { value: "bronze", label: "🥉 Bronze", color: "bg-amber-600" }
];

// Helper function to get event date range by event name
const getEventDateRange = (eventName: string): string => {
  const event = EVENT_OPTIONS.find(e => e.name === eventName);
  return event ? event.dateRange : "";
};

// Searchable Single-Select Component
interface SearchableSingleSelectProps {
  options: string[];
  selected: string | null;
  onChange: (selected: string | null) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
}

function SearchableSingleSelect({
  options,
  selected,
  onChange,
  onBlur,
  placeholder = "Select an event...",
  error,
  touched,
  disabled = false
}: SearchableSingleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (option: string) => selected === option;

  const selectOption = (option: string) => {
    if (isSelected(option)) {
      onChange(null);
    } else {
      onChange(option);
    }
    setSearchTerm("");
    setHighlightedIndex(-1);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeOption = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        selectOption(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur();
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const hasError = touched && error;

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`w-full min-h-[42px] p-1 border rounded-lg focus-within:border-blue-900 focus-within:ring-2 focus-within:ring-blue-900/10 flex flex-wrap items-center gap-1 cursor-text ${hasError
          ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10'
          : 'border-gray-200'
          } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        {selected && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white bg-blue-600 rounded-full">
            {selected.length > 25 ? selected.substring(0, 25) + '...' : selected}
            {!disabled && (
              <button
                type="button"
                onClick={removeOption}
                className="hover:bg-blue-700 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        )}

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          placeholder={!selected ? placeholder : ''}
          className="flex-1 min-w-[80px] py-1 px-1 text-sm bg-transparent outline-none disabled:cursor-not-allowed"
          disabled={disabled}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div ref={listRef} className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No events found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center gap-2 transition-colors ${index === highlightedIndex ? 'bg-blue-50' : ''
                    } ${isSelected(option) ? 'bg-blue-100' : ''} hover:bg-blue-50`}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex-shrink-0 w-4 h-4 border-2 rounded-full border-gray-300 flex items-center justify-center">
                    {isSelected(option) && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                  <span className="flex-1 text-sm">{option}</span>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-gray-100 px-3 py-2 bg-gray-50 text-xs text-gray-500 flex justify-between">
            <span>{selected ? '1 selected' : 'No selection'}</span>
            {selected && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-red-600 hover:text-red-800"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      )}

      {hasError && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

export default function StudentForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
  studentId
}: StudentFormProps) {
  const [formData, setFormData] = useState({
    studentScaleId: "",
    name: "",
    phone: "",
    email: "",
    studentFeedback: "",
    trainerFeedback: "",
    subjectWiseScores: [] as SubjectScore[],
    events: "",
    date: "",
    overallScore: 0,
    overallAttendance: 0,
    specialisation: "",
    badge: "",
    photo: "", // Base64 string
    aadharNumber: "" // Optional field
  });

  const [newSubject, setNewSubject] = useState("");
  const [newScore, setNewScore] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<{
    studentScaleId?: string;
    name?: string;
    phone?: string;
    email?: string;
    events?: string;
    date?: string;
    subjectWiseScores?: string;
    overallAttendance?: string;
    newSubject?: string;
    newScore?: string;
    specialisation?: string;
    badge?: string;
    photo?: string;
    aadharNumber?: string;
  }>({});

  const [touched, setTouched] = useState<{
    studentScaleId?: boolean;
    name?: boolean;
    phone?: boolean;
    email?: boolean;
    events?: boolean;
    date?: boolean;
    overallAttendance?: boolean;
    specialisation?: boolean;
    badge?: boolean;
    photo?: boolean;
    aadharNumber?: boolean;
  }>({});

  // Fetch student data for editing
  useEffect(() => {
    const fetchStudentData = async () => {
      if (isEdit && studentId) {
        try {
          setFetchLoading(true);
          const response = await getStudentById(studentId);
          const studentData = response.data;

          if (studentData) {
            setFormData({
              studentScaleId: studentData.studentScaleId || "",
              name: studentData.name || "",
              phone: studentData.phone || "",
              email: studentData.email || "",
              studentFeedback: studentData.studentFeedback || "",
              trainerFeedback: studentData.trainerFeedback || "",
              subjectWiseScores: studentData.subjectWiseScores || [],
              events: studentData.events || "",
              date: studentData.date || "",
              overallScore: studentData.overallScore || 0,
              overallAttendance: studentData.overallAttendance || 0,
              specialisation: studentData.specialisation || "",
              badge: studentData.badge || "",
              photo: studentData.photo || "",
              aadharNumber: studentData.aadharNumber || ""
            });

            if (studentData.photo) {
              setPhotoPreview(studentData.photo);
            }
          }
        } catch (error: any) {
          console.error("Error fetching student data:", error);
          toast.error(error.message || "Failed to fetch student data. Please try again.");
          onCancel(); // Close form on error
        } finally {
          setFetchLoading(false);
        }
      } else if (initialData) {
        // Fallback to initialData if provided
        setFormData({
          studentScaleId: initialData.studentScaleId || "",
          name: initialData.name || "",
          phone: initialData.phone || "",
          email: initialData.email || "",
          studentFeedback: initialData.studentFeedback || "",
          trainerFeedback: initialData.trainerFeedback || "",
          subjectWiseScores: initialData.subjectWiseScores || [],
          events: initialData.events || "",
          date: initialData.date || "",
          overallScore: initialData.overallScore || 0,
          overallAttendance: initialData.overallAttendance || 0,
          specialisation: initialData.specialisation || "",
          badge: initialData.badge || "",
          photo: initialData.photo || "",
          aadharNumber: initialData.aadharNumber || ""
        });

        if (initialData.photo) {
          setPhotoPreview(initialData.photo);
        }
      }
    };

    fetchStudentData();
  }, [isEdit, studentId, initialData, onCancel]);

  // Auto-calculate overall score
  useEffect(() => {
    if (formData.subjectWiseScores.length > 0) {
      const total = formData.subjectWiseScores.reduce((sum, subj) => sum + subj.score, 0);
      const avg = total / formData.subjectWiseScores.length;
      setFormData(prev => ({
        ...prev,
        overallScore: Math.round(avg * 100) / 100
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        overallScore: 0
      }));
    }
  }, [formData.subjectWiseScores]);

  // Validation functions
  const validatePhone = (phone: string): string | undefined => {
    const phoneRegex = /^[6-9][0-9]{9}$/; // Starts with 6,7,8,9 and exactly 10 digits
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Phone number must start with 6,7,8,or 9 and be exactly 10 digits";
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    const nameRegex = /^[a-zA-Z\s]+$/; // Only letters and spaces
    if (!name) return "Full name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!nameRegex.test(name)) return "Name must contain only letters and spaces";
    return undefined;
  };

  const validateStudentScaleId = (id: string): string | undefined => {
    if (!id) return "Student Scale ID is required";
    if (id.trim().length < 3) return "Student Scale ID must be at least 3 characters";
    return undefined;
  };

  const validateEvents = (events: string): string | undefined => {
    if (!events || events.trim() === "") return "Please select an event";
    return undefined;
  };

  const validateDate = (date: string): string | undefined => {
    if (!date) return "Date is required";
    return undefined;
  };

  const validateOverallAttendance = (attendance: number): string | undefined => {
    if (isNaN(attendance)) return "Attendance is required";
    if (attendance < 0 || attendance > 100) return "Attendance must be between 0 and 100";
    return undefined;
  };

  const validateSubjectScore = (score: number): string | undefined => {
    if (isNaN(score) || score < 0 || score > 100) return "Score must be between 0 and 100";
    return undefined;
  };

  const validateNewSubject = (subject: string): string | undefined => {
    if (!subject.trim()) return "Subject name is required";
    return undefined;
  };

  const validateNewScore = (score: string): string | undefined => {
    const numScore = parseFloat(score);
    if (!score) return "Score is required";
    if (isNaN(numScore)) return "Please enter a valid number";
    if (numScore < 0 || numScore > 100) return "Score must be between 0 and 100";
    return undefined;
  };

  const validateSpecialisation = (value: string): string | undefined => {
    if (!value) return "Please select a specialisation";
    return undefined;
  };

  const validateBadge = (value: string): string | undefined => {
    if (!value) return "Please select a badge";
    return undefined;
  };

  const validatePhoto = (value: string): string | undefined => {
    if (!value) return "Please upload a photo";
    return undefined;
  };

  const validateAadharNumber = (value: string): string | undefined => {
    const aadharRegex = /^[0-9]{12}$/;
    if (value && !aadharRegex.test(value)) {
      return "Aadhar number must be exactly 12 digits";
    }
    return undefined;
  };

  const validateField = (field: string, value: any) => {
    let error;
    switch (field) {
      case 'studentScaleId':
        error = validateStudentScaleId(value);
        break;
      case 'name':
        error = validateName(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'events':
        error = validateEvents(value);
        break;
      case 'date':
        error = validateDate(value);
        break;
      case 'overallAttendance':
        error = validateOverallAttendance(value);
        break;
      case 'specialisation':
        error = validateSpecialisation(value);
        break;
      case 'badge':
        error = validateBadge(value);
        break;
      case 'photo':
        error = validatePhoto(value);
        break;
      case 'aadharNumber':
        error = validateAadharNumber(value);
        break;
      default:
        break;
    }
    return error;
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = formData[field as keyof typeof formData];
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Handle event selection - automatically set date
  const handleEventChange = (selectedEvent: string | null) => {
    const eventName = selectedEvent || "";
    setFormData(prev => ({
      ...prev,
      events: eventName,
      date: eventName ? getEventDateRange(eventName) : ""
    }));

    setTouched(prev => ({ ...prev, events: true, date: true }));
    const error = validateEvents(eventName);
    setErrors(prev => ({ ...prev, events: error, date: error }));
  };

  // Handle photo upload with compression to 100KB
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > 1024 * 1024) { // 1MB max for compression
      toast.error("File is too large. Maximum size is 1MB.");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;

      // Compress image to ~100KB
      compressImage(base64String, 100, (compressedBase64) => {
        setFormData(prev => ({ ...prev, photo: compressedBase64 }));
        setPhotoPreview(compressedBase64);
        setTouched(prev => ({ ...prev, photo: true }));
        const error = validatePhoto(compressedBase64);
        setErrors(prev => ({ ...prev, photo: error }));
        toast.success("Photo uploaded successfully!");
      });
    };
    reader.readAsDataURL(file);
  };

  // Compress image to target size
  const compressImage = (base64String: string, targetSizeKB: number, callback: (compressed: string) => void) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      let quality = 0.9;
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');

      // Calculate dimensions to maintain aspect ratio
      let width = img.width;
      let height = img.height;
      const maxDimension = 800;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      let fileSizeKB = (compressedDataUrl.length * 3) / 4 / 1024; // Approximate size in KB

      // Reduce quality until size is under target or quality is too low
      let attempts = 0;
      while (fileSizeKB > targetSizeKB && quality > 0.1 && attempts < 10) {
        quality -= 0.05;
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        fileSizeKB = (compressedDataUrl.length * 3) / 4 / 1024;
        attempts++;
      }

      callback(compressedDataUrl);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: any = {};
    let hasError = false;

    const fieldsToValidate = ['studentScaleId', 'name', 'phone', 'email', 'events', 'date', 'overallAttendance', 'specialisation', 'badge', 'photo'];
    fieldsToValidate.forEach(field => {
      const value = formData[field as keyof typeof formData];
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    // Validate Aadhar (optional)
    const aadharError = validateAadharNumber(formData.aadharNumber);
    if (aadharError) {
      newErrors.aadharNumber = aadharError;
      hasError = true;
    }

    if (formData.subjectWiseScores.length === 0) {
      newErrors.subjectWiseScores = "Please add at least one subject score";
      hasError = true;
    } else {
      for (const subject of formData.subjectWiseScores) {
        const scoreError = validateSubjectScore(subject.score);
        if (scoreError) {
          newErrors.subjectWiseScores = "All subject scores must be between 0 and 100";
          hasError = true;
          break;
        }
      }
    }

    if (hasError) {
      setErrors(newErrors);
      const allTouched: any = fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {});
      if (aadharError) {
        allTouched.aadharNumber = true;
      }
      setTouched(allTouched);
      toast.error("Please fix all validation errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        studentScaleId: formData.studentScaleId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        studentFeedback: formData.studentFeedback,
        trainerFeedback: formData.trainerFeedback,
        subjectWiseScores: formData.subjectWiseScores,
        events: formData.events,
        date: formData.date,
        overallScore: formData.overallScore,
        overallAttendance: formData.overallAttendance,
        specialisation: formData.specialisation,
        badge: formData.badge,
        photo: formData.photo,
        aadharNumber: formData.aadharNumber || undefined // Only send if provided
      };

      let response;
      if (isEdit && studentId) {
        response = await updateStudent(studentId, payload);
        toast.success(response.message || "Student updated successfully!");
      } else {
        response = await createStudent(payload);
        toast.success(response.message || "Student created successfully!");
      }

      onSubmit(payload);
    } catch (error: any) {
      console.error("Submit error:", error);

      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} student.`;

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMessage = data.message || "Invalid data provided. Please check your inputs.";

          if (data.errors && typeof data.errors === 'object') {
            const backendErrors: any = {};
            let hasBackendError = false;

            Object.keys(data.errors).forEach(key => {
              if (key in formData) {
                backendErrors[key] = data.errors[key];
                hasBackendError = true;
              }
            });

            if (hasBackendError) {
              setErrors(prev => ({ ...prev, ...backendErrors }));
              setTouched(prev => {
                const newTouched: any = { ...prev };
                Object.keys(backendErrors).forEach(key => {
                  newTouched[key] = true;
                });
                return newTouched;
              });
              toast.error("Please fix the highlighted errors.");
              return;
            }
          }
        } else if (status === 404) {
          errorMessage = "Student not found. It may have been deleted.";
        } else if (status === 409) {
          errorMessage = data.message || "A student with this ID already exists.";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later or contact support.";
        } else {
          errorMessage = data.message || `Server error (${status}). Please try again.`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your internet connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred.";
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSubjectScore = () => {
    const subjectError = validateNewSubject(newSubject);
    const scoreError = validateNewScore(newScore);

    if (subjectError || scoreError) {
      setErrors(prev => ({
        ...prev,
        newSubject: subjectError,
        newScore: scoreError
      }));
      toast.error("Please fix the subject or score errors.");
      return;
    }

    if (formData.subjectWiseScores.some(s => s.subjectName.toLowerCase() === newSubject.trim().toLowerCase())) {
      setErrors(prev => ({
        ...prev,
        newSubject: "This subject is already added"
      }));
      toast.error("This subject is already added.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      subjectWiseScores: [...prev.subjectWiseScores, {
        subjectName: newSubject.trim(),
        score: parseFloat(newScore)
      }]
    }));

    setNewSubject("");
    setNewScore("");
    setErrors(prev => ({ ...prev, newSubject: undefined, newScore: undefined }));

    if (errors.subjectWiseScores) {
      setErrors(prev => ({ ...prev, subjectWiseScores: undefined }));
    }

    toast.success("Subject score added successfully!");
  };

  const removeSubjectScore = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subjectWiseScores: prev.subjectWiseScores.filter((_, i) => i !== index)
    }));

    if (formData.subjectWiseScores.length === 1) {
      setErrors(prev => ({ ...prev, subjectWiseScores: undefined }));
    }
  };

  const updateSubjectScore = (index: number, field: keyof SubjectScore, value: any) => {
    if (field === 'score') {
      const score = parseFloat(value);
      const error = validateSubjectScore(score);
      if (error) {
        setErrors(prev => ({ ...prev, subjectWiseScores: error }));
        return;
      } else {
        setErrors(prev => ({ ...prev, subjectWiseScores: undefined }));
      }
    }

    setFormData(prev => ({
      ...prev,
      subjectWiseScores: prev.subjectWiseScores.map((subj, i) =>
        i === index ? { ...subj, [field]: field === 'score' ? parseFloat(value) : value } : subj
      )
    }));
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student Scale ID *
          </label>
          <input
            type="text"
            value={formData.studentScaleId}
            onChange={(e) => handleFieldChange('studentScaleId', e.target.value)}
            onBlur={() => handleBlur('studentScaleId')}
            className={`w-full px-3 uppercase py-2 text-sm border rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none ${touched.studentScaleId && errors.studentScaleId
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-gray-200'
              }`}
            required
            disabled={loading || isSubmitting}
          />
          {touched.studentScaleId && errors.studentScaleId && (
            <p className="mt-1 text-xs text-red-600">{errors.studentScaleId}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              // Only allow letters and spaces
              const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              handleFieldChange('name', value);
            }}
            onBlur={() => handleBlur('name')}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none ${touched.name && errors.name
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-gray-200'
              }`}
            required
            disabled={loading || isSubmitting}
            placeholder="Enter full name (letters only)"
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone * (10 digits)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              handleFieldChange('phone', value);
            }}
            onBlur={() => handleBlur('phone')}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none ${touched.phone && errors.phone
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-gray-200'
              }`}
            placeholder="Enter 10 digit phone number"
            required
            disabled={loading || isSubmitting}
            maxLength={10}
          />
          {touched.phone && errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Must start with 6, 7, 8, or 9 • 10 digits only</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none ${touched.email && errors.email
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-gray-200'
              }`}
            placeholder="Enter valid email address"
            required
            disabled={loading || isSubmitting}
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Aadhar Number - Optional */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Aadhar Number <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <input
          type="text"
          value={formData.aadharNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 12);
            handleFieldChange('aadharNumber', value);
          }}
          onBlur={() => handleBlur('aadharNumber')}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none ${touched.aadharNumber && errors.aadharNumber
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
            : 'border-gray-200'
            }`}
          placeholder="Enter 12 digit Aadhar number (optional)"
          disabled={loading || isSubmitting}
          maxLength={12}
        />
        {touched.aadharNumber && errors.aadharNumber && (
          <p className="mt-1 text-xs text-red-600">{errors.aadharNumber}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">12 digits only • Optional field</p>
      </div>

      {/* Specialisation and Badge */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specialisation *
          </label>
          <select
            value={formData.specialisation}
            onChange={(e) => handleFieldChange('specialisation', e.target.value)}
            onBlur={() => handleBlur('specialisation')}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none ${touched.specialisation && errors.specialisation
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-gray-200'
              }`}
            required
            disabled={loading || isSubmitting}
          >
            <option value="">Select Specialisation</option>
            {SPECIALISATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {touched.specialisation && errors.specialisation && (
            <p className="mt-1 text-xs text-red-600">{errors.specialisation}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Badge *
          </label>
          <select
            value={formData.badge}
            onChange={(e) => handleFieldChange('badge', e.target.value)}
            onBlur={() => handleBlur('badge')}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none ${touched.badge && errors.badge
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-gray-200'
              }`}
            required
            disabled={loading || isSubmitting}
          >
            <option value="">Select Badge</option>
            {BADGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {touched.badge && errors.badge && (
            <p className="mt-1 text-xs text-red-600">{errors.badge}</p>
          )}
          {formData.badge && (
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 text-xs font-medium text-white rounded-full ${BADGE_OPTIONS.find(b => b.value === formData.badge)?.color || 'bg-gray-500'
                }`}>
                {BADGE_OPTIONS.find(b => b.value === formData.badge)?.label || formData.badge}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Student Photo *
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isSubmitting}
              className="w-full px-4 py-2 text-sm font-medium text-blue-900 border-2 border-blue-900 border-dashed rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
            >
              {formData.photo ? "Change Photo" : "Upload Photo"}
            </button>
            <p className="mt-1 text-xs text-gray-500">Max size: 100KB (auto-compressed)</p>
            {touched.photo && errors.photo && (
              <p className="mt-1 text-xs text-red-600">{errors.photo}</p>
            )}
          </div>
          {photoPreview && (
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
              <img
                src={photoPreview}
                alt="Student"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Events Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event * (Select one event)
        </label>
        <SearchableSingleSelect
          options={EVENT_OPTIONS.map(e => e.name)}
          selected={formData.events || null}
          onChange={handleEventChange}
          onBlur={() => handleBlur('events')}
          placeholder="Search and select an event..."
          error={errors.events}
          touched={touched.events}
          disabled={loading || isSubmitting}
        />
        {formData.events && formData.date && (
          <p className="mt-1 text-xs text-green-600">
            Event Date: <span className="font-medium">{formData.date}</span>
          </p>
        )}
      </div>

      {/* Date - Now read-only and auto-populated from event */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Date Range * (Auto-populated from selected event)
        </label>
        <input
          type="text"
          value={formData.date}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none cursor-not-allowed"
          disabled
          placeholder="Select an event to auto-populate date"
        />
        {touched.date && errors.date && (
          <p className="mt-1 text-xs text-red-600">{errors.date}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">This field is automatically populated when you select an event</p>
      </div>

      {/* Subject-wise Scores */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subject-wise Scores * (Score: 0-100)
        </label>

        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Subject/Course Name"
              value={newSubject}
              onChange={(e) => {
                setNewSubject(e.target.value);
                if (errors.newSubject) {
                  setErrors(prev => ({ ...prev, newSubject: undefined }));
                }
              }}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none ${errors.newSubject ? 'border-red-500' : 'border-gray-200'
                }`}
              disabled={loading || isSubmitting}
            />
            {errors.newSubject && (
              <p className="mt-1 text-xs text-red-600">{errors.newSubject}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              placeholder="Score"
              value={newScore}
              onChange={(e) => {
                setNewScore(e.target.value);
                if (errors.newScore) {
                  setErrors(prev => ({ ...prev, newScore: undefined }));
                }
              }}
              className={`w-24 px-3 py-2 text-sm border rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none ${errors.newScore ? 'border-red-500' : 'border-gray-200'
                }`}
              min="0"
              max="100"
              disabled={loading || isSubmitting}
            />
            {errors.newScore && (
              <p className="mt-1 text-xs text-red-600">{errors.newScore}</p>
            )}
          </div>
          <button
            type="button"
            onClick={addSubjectScore}
            disabled={loading || isSubmitting || !newSubject.trim() || !newScore}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {formData.subjectWiseScores.length > 0 && (
          <div className="space-y-2">
            {formData.subjectWiseScores.map((subject, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <span className="flex-1 text-sm font-medium">{subject.subjectName}</span>
                <input
                  type="number"
                  value={subject.score}
                  onChange={(e) => updateSubjectScore(index, 'score', e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-900 focus:ring-1 focus:ring-blue-900/10 outline-none"
                  min="0"
                  max="100"
                  disabled={loading || isSubmitting}
                />
                <span className="text-xs text-gray-500">/100</span>
                <button
                  type="button"
                  onClick={() => removeSubjectScore(index)}
                  disabled={loading || isSubmitting}
                  className="text-red-600 hover:text-red-800 transition disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.subjectWiseScores && (
          <p className="mt-1 text-xs text-red-600">{errors.subjectWiseScores}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Add at least one subject score. All scores must be between 0 and 100.</p>
      </div>

      {/* Overall Score and Attendance */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overall Score (Auto-calculated)
          </label>
          <input
            type="number"
            value={formData.overallScore}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none"
            min="0"
            max="100"
            step="0.01"
            disabled
          />
          <p className="text-xs text-blue-600 mt-1">Auto-calculated from subject scores</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overall Attendance * (0-100)
          </label>
          <input
            type="number"
            value={formData.overallAttendance}
            onChange={(e) => handleFieldChange('overallAttendance', parseFloat(e.target.value) || 0)}
            onBlur={() => handleBlur('overallAttendance')}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none ${touched.overallAttendance && errors.overallAttendance
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-gray-200'
              }`}
            min="0"
            max="100"
            step="0.01"
            disabled={loading || isSubmitting}
          />
          {touched.overallAttendance && errors.overallAttendance && (
            <p className="mt-1 text-xs text-red-600">{errors.overallAttendance}</p>
          )}
        </div>
      </div>

      {/* Feedback */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Student Feedback
        </label>
        <textarea
          value={formData.studentFeedback}
          onChange={(e) => setFormData({ ...formData, studentFeedback: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none"
          disabled={loading || isSubmitting}
          placeholder="Student's feedback about the program..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trainer's Feedback
        </label>
        <textarea
          value={formData.trainerFeedback}
          onChange={(e) => setFormData({ ...formData, trainerFeedback: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none"
          disabled={loading || isSubmitting}
          placeholder="Trainer's feedback about the student..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 flex items-center gap-2"
        >
          {(loading || isSubmitting) && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading || isSubmitting ? 'Saving...' : (isEdit ? "Update Student" : "Add Student")}
        </button>
      </div>
    </form>
  );
}