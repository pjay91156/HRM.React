import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {getDepartmentChart} from "../../services/dashboardService"
import { useTheme } from "../../context/ThemeContext";

const COLORS = [
  "#6366F1",
  "#06B6D4",
  "#F59E0B",
  "#10B981",
  "#EC4899",
];

const DepartmentChart = () => {
  const [data, setData] = useState<any[]>([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    loadChart();
  }, []);

  const loadChart = async () => {
    try {
      const response =
        await getDepartmentChart();

      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const totalEmployees = data.reduce(
    (sum, item) => sum + item.employeeCount,
    0
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">

      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          By Department
        </h3>

        <p className="text-slate-500 dark:text-slate-400">
          {totalEmployees} total employees
        </p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="employeeCount"
              nameKey="departmentName"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: isDark ? "#0f172a" : "#fff",
                borderRadius: "12px",
                border: isDark ? "1px solid #1e293b" : "1px solid #E2E8F0",
                color: isDark ? "#e2e8f0" : "#0f172a",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-4">
        {data.map((item, index) => (
          <div
            key={item.departmentName}
            className="flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    COLORS[index % COLORS.length],
                }}
              />

              <span className="text-slate-600 dark:text-slate-400">
                {item.departmentName}
              </span>
            </div>

            <span className="font-medium text-slate-800 dark:text-slate-200">
              {item.employeeCount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentChart;