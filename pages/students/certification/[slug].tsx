import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getStudentByScaleId } from "@/lib/request/studentRequest";

// Types
interface SubjectWiseScore {
  subjectName: string;
  score: number;
}

interface Student {
  _id?: string;
  studentScaleId: string;
  name: string;
  phone: string;
  email: string;
  studentFeedback?: string;
  trainerFeedback?: string;
  subjectWiseScores: SubjectWiseScore[];
  events: string;
  date: string;
  overallScore: number;
  overallAttendance: number;
  specialisation?: string;
  badge?: string;
  photo?: string;
  aadharNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Badge configuration
const BADGE_CONFIG: Record<string, { label: string; color: string; icon: string; bgColor: string }> = {
  gold: { label: 'Gold', color: 'text-yellow-700', icon: '🥇', bgColor: 'bg-yellow-100' },
  silver: { label: 'Silver', color: 'text-gray-600', icon: '🥈', bgColor: 'bg-gray-100' },
  bronze: { label: 'Bronze', color: 'text-amber-700', icon: '🥉', bgColor: 'bg-amber-100' }
};

export default function CertificationSlugPage() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch student data when slug is available
  useEffect(() => {
    const fetchStudent = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await getStudentByScaleId(slug as string);
        
        if (response.success) {
          setStudent(response.data);
        } else {
          setError(response.message || "Failed to fetch student data");
        }
      } catch (err: any) {
        console.error("Error fetching student:", err);
        setError(err.message || "Failed to fetch student certification. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [slug]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format Aadhar number
  const formatAadhar = (aadhar: string) => {
    if (!aadhar) return 'N/A';
    return aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading certification...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // No student data
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Data Found</h2>
          <p className="text-gray-600">Unable to load student certification.</p>
        </div>
      </div>
    );
  }

  // Get badge info
  const badgeInfo = student.badge ? BADGE_CONFIG[student.badge] : null;

  // Main Certification Display
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Certification Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with Badge */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Certificate of Achievement</h1>
              <p className="text-blue-100 text-sm mt-1">Student Performance Record</p>
            </div>
            {badgeInfo && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${badgeInfo.bgColor}`}>
                <span className="text-2xl">{badgeInfo.icon}</span>
                <span className={`font-bold ${badgeInfo.color}`}>{badgeInfo.label}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Student Profile Header */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              {student.photo ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-900 flex-shrink-0">
                  <img 
                    src={student.photo} 
                    alt={student.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                  {student.specialisation && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {student.specialisation}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  ID: <span className="font-mono">{student.studentScaleId}</span>
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{student.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{student.phone}</p>
                </div>
              </div>
              {student.aadharNumber && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded sm:col-span-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Aadhar Number</p>
                    <p className="text-sm font-mono text-gray-900">{formatAadhar(student.aadharNumber)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Event & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Date Range</p>
                  <p className="text-sm text-gray-900">{student.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Event</p>
                  <p className="text-sm text-gray-900">{student.events}</p>
                </div>
              </div>
            </div>

            {/* Subject Scores */}
            {student.subjectWiseScores && student.subjectWiseScores.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Subject Scores</h3>
                <div className="space-y-2">
                  {student.subjectWiseScores.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{subject.subjectName}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-600"
                            style={{ width: `${subject.score}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold ${getScoreColor(subject.score)}`}>
                          {subject.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Performance */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-green-50 rounded border border-green-200 text-center">
                <p className="text-sm text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold text-green-700">{student.overallScore || 0}%</p>
              </div>
              <div className="p-4 bg-blue-50 rounded border border-blue-200 text-center">
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-blue-700">{student.overallAttendance || 0}%</p>
              </div>
            </div>

            {/* Feedback Section */}
            {(student.studentFeedback || student.trainerFeedback) && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Feedback</h3>
                <div className="space-y-2">
                  {student.studentFeedback && (
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs font-medium text-gray-500 mb-1">Student Feedback</p>
                      <p className="text-sm text-gray-700">"{student.studentFeedback}"</p>
                    </div>
                  )}
                  {student.trainerFeedback && (
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs font-medium text-gray-500 mb-1">Trainer Feedback</p>
                      <p className="text-sm text-gray-700">"{student.trainerFeedback}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 mt-6 pt-4">
              <p className="text-xs text-gray-400 text-center">
                Issued on {formatDate(student.createdAt || student.date)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}