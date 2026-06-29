import DashboardLayout from "../../components/DashboardLayout";
import {
  Users, BookOpen, GraduationCap, Award,
  TrendingUp, TrendingDown, ArrowRight, CheckCircle, Clock, AlertCircle
} from "lucide-react";

const stats = [
  {
    label: "Total Users",
    value: "12,847",
    change: "+8.2%",
    up: true,
    icon: Users,
    color: "bg-blue-900",
    lightColor: "bg-blue-50",
    textColor: "text-blue-900",
  },
  {
    label: "Active Courses",
    value: "384",
    change: "+3.1%",
    up: true,
    icon: BookOpen,
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    label: "Institutes",
    value: "56",
    change: "+2",
    up: true,
    icon: GraduationCap,
    color: "bg-gray-700",
    lightColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
  {
    label: "Certifications",
    value: "1,290",
    change: "-0.4%",
    up: false,
    icon: Award,
    color: "bg-blue-600",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
];

const recentUsers = [
  { name: "Riya Sharma", email: "riya@example.com", role: "admin", status: "active", joined: "Jun 28" },
  { name: "Arjun Nair", email: "arjun@example.com", role: "user", status: "active", joined: "Jun 27" },
  { name: "Priya Menon", email: "priya@example.com", role: "department_user", status: "inactive", joined: "Jun 26" },
  { name: "Karan Verma", email: "karan@example.com", role: "user", status: "active", joined: "Jun 25" },
  { name: "Sneha Pillai", email: "sneha@example.com", role: "admin", status: "active", joined: "Jun 24" },
];

const activities = [
  { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", text: "New course 'Data Science Basics' published", time: "2 min ago" },
  { icon: Users, color: "text-blue-600", bg: "bg-blue-50", text: "5 new users registered from Chennai Institute", time: "18 min ago" },
  { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50", text: "Course 'Web Dev 101' has pending review", time: "1 hr ago" },
  { icon: Clock, color: "text-gray-500", bg: "bg-gray-100", text: "Scheduled maintenance window at 2:00 AM IST", time: "3 hr ago" },
  { icon: Award, color: "text-indigo-500", bg: "bg-indigo-50", text: "48 certifications issued this week", time: "5 hr ago" },
];

const roleColor: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700",
  superadmin: "bg-purple-100 text-purple-700",
  user: "bg-gray-100 text-gray-600",
  department_user: "bg-indigo-100 text-indigo-700",
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Welcome banner */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-5 flex items-center justify-between overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -right-4 bottom-0 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-medium">Good day,</p>
            <h2 className="text-xl font-bold mt-0.5">Welcome back, Admin 👋</h2>
            <p className="text-blue-200 text-sm mt-1">Here's what's happening with your platform today.</p>
          </div>
          <div className="relative z-10 hidden sm:flex items-center gap-2">
            <div className="text-right">
              <p className="text-blue-200 text-xs">Today's date</p>
              <p className="text-white font-semibold text-sm">
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(({ label, value, change, up, icon: Icon, color, lightColor, textColor }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${lightColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${textColor}`} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
                  {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Table + Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Recent Users table */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Recent Users</h3>
              <button className="flex items-center gap-1 text-xs font-medium text-blue-900 hover:text-blue-700 transition">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-semibold">User</th>
                    <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Role</th>
                    <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Joined</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs">{u.name}</p>
                            <p className="text-gray-400 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role] || "bg-gray-100 text-gray-600"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs hidden md:table-cell">{u.joined}</td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${u.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-green-500" : "bg-gray-300"}`} />
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-5 space-y-4">
              {activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <a.icon className={`w-4 h-4 ${a.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-700 leading-snug">{a.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4">Platform Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Course Completion Rate", value: 72, color: "bg-blue-900" },
              { label: "Active User Rate", value: 88, color: "bg-indigo-600" },
              { label: "Certification Pass Rate", value: 64, color: "bg-gray-700" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">{label}</p>
                  <p className="text-sm font-bold text-gray-900">{value}%</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full transition-all duration-700`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
