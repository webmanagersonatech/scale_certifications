import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen } from "lucide-react";

export default function CoursesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-900" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Courses</h2>
          <p className="text-gray-500 text-sm">Course management module coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
