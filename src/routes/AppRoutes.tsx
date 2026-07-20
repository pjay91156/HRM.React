import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import HRMDashboard from "../pages/Dashboard";
import Employee from "../pages/Employee";
import Departament from "../pages/Department"
import Layout from "../pages/Layout";
import Designation from "../pages/Designation";
import MyTeam from "../pages/MyTeam";
import LeaveTypes from "../pages/LeaveTypes";
import LeaveRequest from "../pages/LeaveRequest";
import MyLeaves from "../pages/MyLeaves";
import TeamLeaveRequests from "../pages/TeamLeaveRequest";
import TeamLeaveCalendar from "../pages/TeamLeaveCalendar";
import MyAttendance from "../pages/MyAttendance";
import TeamAttendance from "../pages/TeamAttendance";
import RegularizeAttendance from "../pages/RegularizeAttendance";
import TeamRegularizeAttendanceRequests from "../pages/TeamRegularizeRequest";
import PerformanceCycle from "../pages/PerformaceCycle";
import PerformanceRating from "../pages/PerformanceRating";
import PerformanceTemplate from "../pages/PerformanceTemplate";
import PerformanceCategory from "../pages/PerformanceCategory";
import PerformanceSkill from "../pages/PerformanceSkill";
import Review from "../pages/Review";
import MyTeamReview from "../pages/MyTeamReview";
import Reports from "../pages/Reports";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>

        <Route path="/dashboard" element={<HRMDashboard />} />
        <Route path="/employees" element={<Employee />} />
        <Route path="/departments" element={<Departament />} />
        <Route path="/designations" element={<Designation />} />
        <Route path="/myteam" element={<MyTeam />} />
        <Route path="/leave-types" element={<LeaveTypes />} />
        <Route path="/leave-request" element={<LeaveRequest />} />
        <Route path="/my-leaves" element={<MyLeaves />} />
        <Route path="/team-leaves" element={<TeamLeaveRequests />} />
        <Route path="/team-leave-calendar" element={<TeamLeaveCalendar />} />
        <Route path="/my-attendance" element={<MyAttendance />} />
        <Route path="/team-attendance" element={<TeamAttendance />} />
        <Route path="/regularize-attendance" element={<RegularizeAttendance />} />
          <Route path="/team-regularize-attendance-requests" element={<TeamRegularizeAttendanceRequests />} />
            <Route path="/performance-cycles" element={<PerformanceCycle />} />
            <Route path="/performance-ratings" element={<PerformanceRating />} />
            <Route path="/performance-templates" element={<PerformanceTemplate />} />
            <Route path="/performance-templates/:templateId/categories" element={<PerformanceCategory />} />
            <Route path="/performance-templates/:templateId/categories/:categoryId/skills" element={<PerformanceSkill />} />
            <Route path="/review" element={<Review />} />
            <Route path="/my-team-review" element={<MyTeamReview />} />
            <Route path="/reports" element={<Reports />} />

      </Route>
    </Routes>
  );
}