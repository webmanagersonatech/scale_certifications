import { useState, useMemo, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { ExportModal } from "@/components/ui/ExportModal";
import { Plus, Pencil, Trash2, Eye, Download, Filter, RefreshCw, Search, QrCode, Calendar } from "lucide-react";
import StudentForm from "@/components/forms/studentform";
import {
  getAllStudents,
  deleteStudent,
  Student,
  generateStudentQR,
  regenerateStudentQR,
  downloadStudentQR
} from "@/lib/request/studentRequest";
import { toast } from "react-toastify";

interface DistinctEvent {
  eventName: string;
  dateRange: string;
}

export default function StudentsPage() {
  // State management
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [distinctEvents, setDistinctEvents] = useState<DistinctEvent[]>([]);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    event: "all",
    dateRange: "", // Add date range filter
  });

  const PAGE_SIZE = 10;

  // Export headers and mapping
  const exportHeaders = [
    "Student Scale ID",
    "Full Name",
    "Email",
    "Phone",
    "Event",
    "Date",
    "Overall Score",
    "Overall Attendance",
    "Subjects Count",
    "QR Code"
  ];

  const exportMapping = {
    studentScaleId: "Student Scale ID",
    name: "Full Name",
    email: "Email",
    phone: "Phone",
    events: "Event",
    date: "Date",
    overallScore: "Overall Score",
    overallAttendance: "Overall Attendance",
    subjectWiseScores: "Subjects Count",
    qrCode: "QR Code"
  };

  // Prepare data for export
  const getExportData = useCallback(() => {
    return students.map((student) => ({
      _id: student._id,
      studentScaleId: student.studentScaleId,
      name: student.name,
      phone: student.phone,
      email: student.email,
      events: student.events,
      date: student.date || "",
      subjectWiseScores: student.subjectWiseScores?.length || 0,
      overallScore: student.overallScore?.toFixed(1) || 0,
      overallAttendance: student.overallAttendance,
      qrCode: student.qrCode || "",
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    }));
  }, [students]);

  // Fetch students from API
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response:any = await getAllStudents({
        page: currentPage,
        limit: PAGE_SIZE,
        search: search,
        event: filters.event !== "all" ? filters.event : undefined,
      });

      if (response.success) {
        setStudents(response.students.docs);
        setPagination({
          totalDocs: response.students.totalDocs,
          totalPages: response.students.totalPages,
          page: response.students.page,
          limit: response.students.limit,
          hasNextPage: response.students.hasNextPage,
          hasPrevPage: response.students.hasPrevPage,
        });
        // Set distinct events from backend response
        if (response.distinctEvents) {
          setDistinctEvents(response.distinctEvents);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch students:", error);
      toast.error(error.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, filters.event]);

  // Load students on mount and when dependencies change
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchStudents();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Generate QR Code
  const handleGenerateQR = useCallback(async (student: Student) => {
    setQrLoading(true);
    setSelectedStudent(student);
    try {
      const response = await generateStudentQR(student._id!);
      if (response.success) {
        setQrCodeUrl(response.qrCode);
        setIsQRModalOpen(true);
        toast.success("QR Code generated successfully!");
        fetchStudents();
      }
    } catch (error: any) {
      console.error("Failed to generate QR code:", error);
      toast.error(error.message || "Failed to generate QR code");
    } finally {
      setQrLoading(false);
    }
  }, [fetchStudents]);

  // Regenerate QR Code
  const handleRegenerateQR = useCallback(async () => {
    if (!selectedStudent) return;

    setQrLoading(true);
    try {
      const response = await regenerateStudentQR(selectedStudent._id!);
      if (response.success) {
        setQrCodeUrl(response.qrCode);
        toast.success("QR Code regenerated successfully!");
        fetchStudents();
      }
    } catch (error: any) {
      console.error("Failed to regenerate QR code:", error);
      toast.error(error.message || "Failed to regenerate QR code");
    } finally {
      setQrLoading(false);
    }
  }, [selectedStudent, fetchStudents]);

  // Download QR Code
  const handleDownloadQR = useCallback(async () => {
    if (!selectedStudent) return;

    try {
      await downloadStudentQR(selectedStudent._id!);
      toast.success("QR Code downloaded successfully!");
    } catch (error: any) {
      console.error("Failed to download QR code:", error);
      toast.error(error.message || "Failed to download QR code");
    }
  }, [selectedStudent]);

  const handleAddStudent = useCallback((data: any) => {
    toast.success("Student added successfully!");
    fetchStudents();
    setIsAddModalOpen(false);
  }, [fetchStudents]);

  const handleEditStudent = useCallback((data: any) => {
    toast.success("Student updated successfully!");
    fetchStudents();
    setIsEditModalOpen(false);
    setSelectedStudent(null);
  }, [fetchStudents]);

  const handleDeleteStudent = useCallback(async () => {
    if (!selectedStudent) return;

    setLoading(true);
    try {
      await deleteStudent(selectedStudent._id!);
      toast.success("Student deleted successfully!");
      fetchStudents();
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
    } catch (error: any) {
      console.error("Failed to delete student:", error);
      toast.error(error.message || "Failed to delete student");
    } finally {
      setLoading(false);
    }
  }, [selectedStudent, fetchStudents]);

  const handleViewStudent = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setFilters({ 
      event: "all",
      dateRange: "" 
    });
    setCurrentPage(1);
  }, []);

  const handleCloseQRModal = useCallback(() => {
    setIsQRModalOpen(false);
    setQrCodeUrl(null);
    setSelectedStudent(null);
  }, []);

  // Get unique date ranges for filter
  const uniqueDateRanges = useMemo(() => {
    const dates = distinctEvents.map(e => e.dateRange).filter(Boolean);
    return ["all", ...new Set(dates)];
  }, [distinctEvents]);

  // Column definitions
  const columns: any = [
    {
      key: "name",
      header: "Student",
      render: (_: any, row: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{row.name}</p>
            <p className="text-gray-400 text-xs">{row.email}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "studentScaleId",
      header: "Scale ID",
      className: "font-mono text-xs uppercase",
      sortable: true,
    },
    {
      key: "events",
      header: "Event",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-700 truncate max-w-[200px] block" title={value}>
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date Range",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: "subjectWiseScores",
      header: "Subjects",
      render: (value: any[]) => (
        <span className="text-sm text-gray-600">
          {value?.length || 0} subjects
        </span>
      ),
    },
    {
      key: "overallScore",
      header: "Score",
      render: (value: number) => (
        <span className={`font-medium ${value >= 80 ? 'text-green-600' :
          value >= 60 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
          {value?.toFixed(1) || 0}%
        </span>
      ),
      sortable: true,
    },
    {
      key: "overallAttendance",
      header: "Attendance",
      render: (value: number) => (
        <span className={`font-medium ${value >= 75 ? 'text-green-600' :
          value >= 50 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
          {value || 0}%
        </span>
      ),
      sortable: true,
    },
    {
      key: "phone",
      header: "Phone",
      hideOnTablet: true,
    },
    {
      key: "qrCode",
      header: "QR Code",
      width: "180px",
      className: "min-w-[180px]",
      render: (value: string, row: Student) => (
        <div className="flex items-center gap-3 min-w-[160px]">
          {value ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">
              ✓ Generated
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 whitespace-nowrap">
              Not Generated
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (value) {
                setSelectedStudent(row);
                setQrCodeUrl(value);
                setIsQRModalOpen(true);
              } else {
                handleGenerateQR(row);
              }
            }}
            disabled={qrLoading}
            className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-900 transition disabled:opacity-50 flex-shrink-0"
            title={value ? "View QR Code" : "Generate QR Code"}
          >
            <QrCode className="w-4.5 h-4.5" />
          </button>
        </div>
      ),
    },
  ];

  // Action buttons
  const renderActions = (row: Student) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleViewStudent(row)}
        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-900 transition"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          setSelectedStudent(row);
          setIsEditModalOpen(true);
        }}
        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-900 transition"
        title="Edit Student"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          setSelectedStudent(row);
          setIsDeleteDialogOpen(true);
        }}
        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
        title="Delete Student"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Management</h2>
            <p className="text-sm text-gray-500">
              Manage all students across events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm shadow-blue-900/20"
            >
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, scale ID..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Filter by Event:</span>
          </div>

          <select
            value={filters.event}
            onChange={(e) => {
              setFilters({ 
                ...filters, 
                event: e.target.value 
              });
              setCurrentPage(1);
            }}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 transition text-gray-600 min-w-[200px] max-w-[300px]"
          >
            <option value="all">All Events</option>
            {distinctEvents.map((event) => (
              <option key={event.eventName} value={event.eventName} title={`${event.eventName} (${event.dateRange})`}>
                {event.eventName.length > 30 ? `${event.eventName.substring(0, 30)}...` : event.eventName}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Date Range:</span>
          </div>

          <select
            value={filters.dateRange}
            onChange={(e) => {
              setFilters({ 
                ...filters, 
                dateRange: e.target.value 
              });
              setCurrentPage(1);
            }}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 transition text-gray-600 min-w-[180px]"
          >
            <option value="all">All Dates</option>
            {uniqueDateRanges.filter(d => d !== "all").map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition ml-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

     
        {/* Data Table */}
        <DataTable
          columns={columns}
          data={students}
          loading={loading}
          totalEntries={pagination.totalDocs}
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
          onSearch={setSearch}
          searchPlaceholder="Search students..."
          pageSize={PAGE_SIZE}
          actions={renderActions}
        />
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={handleCloseQRModal}
        title={`QR Code - ${selectedStudent?.name || 'Student'}`}
        size="md"
      >
        <div className="flex flex-col items-center space-y-6 py-4">
          {qrLoading ? (
            <div className="flex items-center justify-center w-48 h-48 bg-gray-50 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
            </div>
          ) : qrCodeUrl ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${selectedStudent?.name}`}
                  className="w-48 h-48 object-contain"
                />
              </div>

              <div className="text-sm text-gray-500 text-center">
                <p>Student: <span className="font-semibold text-gray-700">{selectedStudent?.name}</span></p>
                <p>Scale ID: <span className="font-mono text-gray-700">{selectedStudent?.studentScaleId}</span></p>
                <p>Event: <span className="font-medium text-gray-700">{selectedStudent?.events}</span></p>
                <p>Date: <span className="font-medium text-gray-700">{selectedStudent?.date}</span></p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm shadow-blue-900/20"
                >
                  <Download className="w-4 h-4" /> Download
                </button>

                {selectedStudent?.qrCode && (
                  <button
                    onClick={handleRegenerateQR}
                    disabled={qrLoading}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${qrLoading ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                )}
              </div>

              {selectedStudent?.qrCode && (
                <p className="text-xs text-gray-400 mt-2">
                  QR Code already exists. Click Regenerate to create a new one.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No QR Code available</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Export Modal - with QR support */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={getExportData()}
        filename="students"
        headers={exportHeaders}
        mapping={exportMapping}
        includeQR={true}
      />

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student"
        size="lg"
      >
        <StudentForm
          onSubmit={handleAddStudent}
          onCancel={() => setIsAddModalOpen(false)}
          loading={loading}
        />
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
        title="Edit Student"
        size="lg"
      >
        <StudentForm
          initialData={selectedStudent}
          studentId={selectedStudent?._id}
          onSubmit={handleEditStudent}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedStudent(null);
          }}
          loading={loading}
          isEdit={true}
        />
      </Modal>

      {/* View Student Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        title="Student Details"
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">Student Scale ID</label>
                <p className="text-sm font-mono text-gray-900">{selectedStudent.studentScaleId}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Full Name</label>
                <p className="text-sm font-semibold text-gray-900">{selectedStudent.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Email</label>
                <p className="text-sm text-gray-900">{selectedStudent.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Phone</label>
                <p className="text-sm text-gray-900">{selectedStudent.phone}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Event</label>
                <p className="text-sm text-gray-900">{selectedStudent.events}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Date Range</label>
                <p className="text-sm text-gray-900">
                  {selectedStudent.date}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Overall Score</label>
                <p className={`text-sm font-semibold ${selectedStudent.overallScore >= 80 ? 'text-green-600' :
                  selectedStudent.overallScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                  {selectedStudent.overallScore.toFixed(1)}%
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Overall Attendance</label>
                <p className={`text-sm font-semibold ${selectedStudent.overallAttendance >= 75 ? 'text-green-600' :
                  selectedStudent.overallAttendance >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                  {selectedStudent.overallAttendance}%
                </p>
              </div>
              {selectedStudent.qrCode && (
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-medium">QR Code</label>
                  <div className="mt-1">
                    <img
                      src={selectedStudent.qrCode}
                      alt="QR Code"
                      className="w-24 h-24 object-contain border rounded-lg p-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Subject-wise Scores */}
            {selectedStudent.subjectWiseScores && selectedStudent.subjectWiseScores.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-2">
                  Subject-wise Scores
                </label>
                <div className="space-y-2">
                  {selectedStudent.subjectWiseScores.map((subject, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <span className="text-sm font-medium">{subject.subjectName}</span>
                      <span className="text-sm font-semibold text-blue-600">{subject.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {(selectedStudent.studentFeedback || selectedStudent.trainerFeedback) && (
              <div className="grid grid-cols-1 gap-4">
                {selectedStudent.studentFeedback && (
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Student Feedback</label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                      {selectedStudent.studentFeedback}
                    </p>
                  </div>
                )}
                {selectedStudent.trainerFeedback && (
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Trainer Feedback</label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                      {selectedStudent.trainerFeedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedStudent(null);
        }}
        onConfirm={handleDeleteStudent}
        title="Delete Student"
        message={`Are you sure you want to delete ${selectedStudent?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={loading}
      />
    </DashboardLayout>
  );
}