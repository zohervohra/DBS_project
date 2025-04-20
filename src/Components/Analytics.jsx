import { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { supabase } from '../client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Color palettes for charts
const pieChartPalette = {
  primary: '#336D82',
  secondary: '#B4EBE6',
  accent: '#9FB3DF',
  neutral: '#6B7280',
  error: '#F8ED8C',
  info: '#2DAA9E',
  purple: '#C8AAAA',
  pink: '#FFCFCF'
};

const barChartPalette = {
  primary: '#9FB3DF',
  secondary: '#48A6A7',
  accent: '#E4C087',
  neutral: '#007074',
  error: '#98D2C0',
  info: '#E3F0AF',
  purple: '#66D2CE',
  pink: '#E5989B'
};

// Common chart options
const commonPieOptions = {
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    }
  },
  maintainAspectRatio: false
};

const commonBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

const AnalyticsDashboard = () => {
  const [students, setStudents] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enquiryViewMode, setEnquiryViewMode] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const dashboardRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchStudents(), fetchEnquiries()]);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || "User not authenticated");
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('admin, center_name')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      let query = supabase.from('students').select('*');
      if (!userData.admin) {
        query = query.eq('center_name', userData.center_name);
      }

      const { data: studentsData, error: studentError } = await query;
      if (studentError) throw studentError;

      console.log("Students data:", studentsData); // Debug log
      setStudents(studentsData || []);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(`Error loading students: ${err.message}`);
      setStudents([]);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || "User not authenticated");
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('admin, center_name')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      let query = supabase.from('enquiry_desk').select('*');
      if (!userData.admin) {
        query = query.eq('center_name', userData.center_name);
      }

      const { data: enquiriesData, error: enquiryError } = await query;
      if (enquiryError) throw enquiryError;

      console.log("Enquiries data:", enquiriesData); // Debug log
      setEnquiries(enquiriesData || []);
    } catch (err) {
      console.error("Error fetching enquiries:", err);
      setError(`Error loading enquiries: ${err.message}`);
      setEnquiries([]);
    }
  };

  // Improved date handling
  const getMonthName = (dateString) => {
    try {
      if (!dateString) return "Unknown";
      
      const months = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try alternative format if ISO parse fails
        const parts = String(dateString).split(/[-/T]/);
        if (parts.length >= 2) {
          return months[parseInt(parts[1], 10) - 1] || "Unknown";
        }
        return "Unknown";
      }
      return months[date.getMonth()];
    } catch (e) {
      console.error("Date parsing error:", e);
      return "Unknown";
    }
  };

  const getWeekNumber = (dateString) => {
    try {
      if (!dateString) return 0;
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 0;
      
      // Copy date so don't modify original
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      // Set to nearest Thursday: current date + 4 - current day number
      // Make Sunday's day number 7
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      // Get first day of year
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      // Calculate full weeks to nearest Thursday
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      // Return array of year and week number
      return weekNo;
    } catch (e) {
      console.error("Week number calculation error:", e);
      return 0;
    }
  };

  // Data calculations with null checks
  const calculateGenderData = () => {
    return students.reduce((acc, student) => {
      const gender = student.gender === 'M' ? 'Male' : 'Female';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, { Male: 0, Female: 0 });
  };

  const calculateCourseData = () => {
    return students.reduce((acc, student) => {
      const course = student.course_name || 'Unknown';
      acc[course] = (acc[course] || 0) + 1;
      return acc;
    }, {});
  };

  const calculateDailyEnquiries = () => {
    const result = {};
    
    enquiries.forEach(enquiry => {
      try {
        if (enquiry.created_at) {
          const date = new Date(enquiry.created_at);
          if (isNaN(date.getTime())) return;
          
          // Format date as YYYY-MM-DD for consistent grouping
          const dateStr = date.toISOString().split('T')[0];
          result[dateStr] = (result[dateStr] || 0) + 1;
        }
      } catch (e) {
        console.error("Error processing enquiry date:", e);
      }
    });
    
    // Sort by date
    const sortedEntries = Object.entries(result).sort((a, b) => new Date(a[0]) - new Date(b[0]));
    return Object.fromEntries(sortedEntries);
  };

  const calculateWeeklyEnquiries = () => {
    const result = {};
    
    enquiries.forEach(enquiry => {
      try {
        if (enquiry.created_at) {
          const date = new Date(enquiry.created_at);
          if (isNaN(date.getTime())) return;
          
          const year = date.getFullYear();
          const weekNumber = getWeekNumber(date);
          const weekKey = `Week ${weekNumber}, ${year}`;
          
          result[weekKey] = (result[weekKey] || 0) + 1;
        }
      } catch (e) {
        console.error("Error processing weekly enquiry:", e);
      }
    });
    
    // Sort by week
    const sortedEntries = Object.entries(result).sort((a, b) => {
      const [weekA, yearA] = a[0].match(/\d+/g).map(Number);
      const [weekB, yearB] = b[0].match(/\d+/g).map(Number);
      
      if (yearA !== yearB) return yearA - yearB;
      return weekA - weekB;
    });
    
    return Object.fromEntries(sortedEntries);
  };

  const calculateMonthlyEnquiries = () => {
    const result = {};
    
    enquiries.forEach(enquiry => {
      try {
        if (enquiry.created_at) {
          const date = new Date(enquiry.created_at);
          if (isNaN(date.getTime())) return;
          
          const monthName = getMonthName(date);
          const year = date.getFullYear();
          const monthKey = `${monthName} ${year}`;
          
          result[monthKey] = (result[monthKey] || 0) + 1;
        }
      } catch (e) {
        console.error("Error processing monthly enquiry:", e);
      }
    });
    
    // Sort by month
    const monthOrder = ["January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December"];
    
    const sortedEntries = Object.entries(result).sort((a, b) => {
      const [aMonth, aYear] = a[0].split(' ');
      const [bMonth, bYear] = b[0].split(' ');
      
      if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });
    
    return Object.fromEntries(sortedEntries);
  };

  // Student data with fallbacks
  const genderData = calculateGenderData();
  const totalGender = genderData.Male + genderData.Female;
  const courseData = calculateCourseData();

  const monthlyData = students.reduce((acc, student) => {
    try {
      if (student.date_of_registration) {
        const monthName = getMonthName(student.date_of_registration);
        acc[monthName] = (acc[monthName] || 0) + 1;
      }
    } catch (e) {
      console.error("Error processing student registration:", e);
    }
    return acc;
  }, {});

  // Enquiry data with fallbacks
  const dailyEnquiryData = calculateDailyEnquiries();
  const weeklyEnquiryData = calculateWeeklyEnquiries();
  const monthlyEnquiryData = calculateMonthlyEnquiries();

  // Combined Enquiry Chart Data
  const generateEnquiryChartData = () => {
    let labels = [];
    let values = [];
    let backgroundColor = barChartPalette.primary;
    let label = 'Daily Enquiries';
    
    switch (enquiryViewMode) {
      case 'weekly':
        labels = Object.keys(weeklyEnquiryData);
        values = Object.values(weeklyEnquiryData);
        backgroundColor = barChartPalette.secondary;
        label = 'Weekly Enquiries';
        break;
      case 'monthly':
        labels = Object.keys(monthlyEnquiryData);
        values = Object.values(monthlyEnquiryData);
        backgroundColor = barChartPalette.accent;
        label = 'Monthly Enquiries';
        break;
      default: // daily
        labels = Object.keys(dailyEnquiryData);
        values = Object.values(dailyEnquiryData);
        backgroundColor = barChartPalette.primary;
        label = 'Daily Enquiries';
    }
    
    return {
      labels,
      datasets: [{
        label,
        data: values,
        backgroundColor,
        borderRadius: 4
      }],
    };
  };

  // Chart data generators with empty state handling
  const generateGenderChartData = () => {
    const data = {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [genderData.Male, genderData.Female],
        backgroundColor: [pieChartPalette.primary, pieChartPalette.accent],
        borderColor: ['#fff'],
        borderWidth: 1
      }],
    };
    return totalGender > 0 ? data : null;
  };

  const generateMonthlyChartData = () => {
    const labels = Object.keys(monthlyData).filter(k => k !== 'Unknown');
    const values = labels.map(label => monthlyData[label]);
    
    return labels.length > 0 ? {
      labels,
      datasets: [{
        label: 'Registrations',
        data: values,
        backgroundColor: barChartPalette.info,
        borderRadius: 4
      }],
    } : null;
  };

  const generateCourseChartData = () => {
    const labels = Object.keys(courseData).filter(k => k !== 'Unknown');
    const values = labels.map(label => courseData[label]);
    
    return labels.length > 0 ? {
      labels,
      datasets: [{
        label: 'Students',
        data: values,
        backgroundColor: barChartPalette.secondary,
        borderRadius: 4
      }],
    } : null;
  };

  // Income groups with null checks
  const incomeGroups = { '<2L': 0, '2L-4L': 0, '4L+': 0 };
  students.forEach(student => {
    try {
      const income = Number(student.family_income) || 0;
      if (income < 200000) incomeGroups['<2L']++;
      else if (income <= 400000) incomeGroups['2L-4L']++;
      else incomeGroups['4L+']++;
    } catch (e) {
      console.error("Error processing income data:", e);
    }
  });

  const generateIncomeChartData = () => {
    const totalIncome = Object.values(incomeGroups).reduce((a, b) => a + b, 0);
    return totalIncome > 0 ? {
      labels: Object.keys(incomeGroups),
      datasets: [{
        data: Object.values(incomeGroups),
        backgroundColor: [pieChartPalette.primary, pieChartPalette.accent, pieChartPalette.secondary],
        borderColor: ['#fff'],
        borderWidth: 1
      }],
    } : null;
  };

  // Age groups with null checks
  const ageGroups = { '16+': 0, '18+': 0, '22+': 0, '24+': 0 };
  students.forEach(student => {
    try {
      const age = Number(student.age) || 0;
      if (age >= 16) ageGroups['16+']++;
      if (age >= 18) ageGroups['18+']++;
      if (age >= 22) ageGroups['22+']++;
      if (age >= 24) ageGroups['24+']++;
    } catch (e) {
      console.error("Error processing age data:", e);
    }
  });

  const generateAgeChartData = () => {
    const totalAges = Object.values(ageGroups).reduce((a, b) => a + b, 0);
    return totalAges > 0 ? {
      labels: Object.keys(ageGroups),
      datasets: [{
        label: 'Students',
        data: Object.values(ageGroups),
        backgroundColor: barChartPalette.accent,
        borderRadius: 4
      }],
    } : null;
  };

  // Job requirements with null checks
  const jobData = { 'Job Required': 0, 'Not Required': 0 };
  students.forEach(student => {
    try {
      const needsJob = Boolean(student.job_required);
      jobData[needsJob ? 'Job Required' : 'Not Required']++;
    } catch (e) {
      console.error("Error processing job data:", e);
    }
  });

  const generateJobChartData = () => {
    const totalJobs = Object.values(jobData).reduce((a, b) => a + b, 0);
    return totalJobs > 0 ? {
      labels: Object.keys(jobData),
      datasets: [{
        data: Object.values(jobData),
        backgroundColor: [pieChartPalette.error, pieChartPalette.neutral],
        borderColor: ['#fff'],
        borderWidth: 1
      }],
    } : null;
  };

  // Working status with null checks
  const workingData = { 'Working': 0, 'Non-Working': 0 };
  students.forEach(student => {
    try {
      const isWorking = Boolean(student.working_status);
      workingData[isWorking ? 'Working' : 'Non-Working']++;
    } catch (e) {
      console.error("Error processing working status:", e);
    }
  });

  const generateWorkingChartData = () => {
    const totalWorking = Object.values(workingData).reduce((a, b) => a + b, 0);
    return totalWorking > 0 ? {
      labels: Object.keys(workingData),
      datasets: [{
        data: Object.values(workingData),
        backgroundColor: [pieChartPalette.pink, pieChartPalette.purple],
        borderColor: ['#fff'],
        borderWidth: 1
      }],
    } : null;
  };

  // Chart + Summary Card Component with empty state handling
  const ChartBox = ({ title, chart, summary, children }) => (
    <div className="rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 bg-white">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-focus">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {children}
      </div>
      <div className="p-4 bg-white chart-container">
        {chart ? (
          <div className="h-64">{chart}</div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available for this chart
          </div>
        )}
      </div>
      {summary && (
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          {summary}
        </div>
      )}
    </div>
  );

  // Generate PDF report with error handling
  const generatePDF = async () => {
    try {
      if (students.length === 0 && enquiries.length === 0) {
        alert("No data available to generate report!");
        return;
      }

      const doc = new jsPDF('p', 'pt', 'a4');
      doc.setFont('helvetica', 'normal');
      
      // Title
      doc.setFontSize(20);
      doc.text("Analytics Report", 40, 40);

      // Student Summary Table
      doc.autoTable({
        head: [['Metric', 'Value']],
        body: [
          ['Total Students', students.length],
          ['Total Enquiries', enquiries.length],
          ['Male Students', `${genderData.Male}`],
          ['Female Students', `${genderData.Female}`],
        ],
        startY: 60,
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [111,150,93],
          textColor: [255, 255, 255],
        }
      });

      // Only include tables if data exists
      if (Object.keys(courseData).length > 0) {
        doc.autoTable({
          head: [['Course', 'Number of Students']],
          body: Object.keys(courseData).map(course => [course, courseData[course]]),
          startY: doc.lastAutoTable.finalY + 20,
          styles: { fontSize: 10 },
          headStyles: {
            fillColor: [111,150,93],
            textColor: [255, 255, 255],
          }
        });
      }

      if (Object.keys(monthlyData).length > 0) {
        doc.autoTable({
          head: [['Month', 'Registrations']],
          body: Object.keys(monthlyData).map(month => [month, monthlyData[month]]),
          startY: doc.lastAutoTable.finalY + 20,
          styles: { fontSize: 10 },
          headStyles: {
            fillColor: [111,150,93],
            textColor: [255, 255, 255],
          }
        });
      }

      doc.save("analytics_report.pdf");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (students.length === 0 && enquiries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h1>
          <p className="text-gray-600 mb-6">
            There are no students or enquiries to display. Please check your database connection.
          </p>
          <button
            onClick={fetchData}
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" ref={dashboardRef}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📊 Analytics Dashboard</h1>
          <button 
            onClick={generatePDF}
            className="flex items-center px-4 py-2 bg-[rgb(111,150,93)] text-black rounded hover:bg-green-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Generate Full Report
          </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
            <p className="text-3xl font-bold text-gray-800">{students.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Total Enquiries</h3>
            <p className="text-3xl font-bold text-gray-800">{enquiries.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Male Students</h3>
            <p className="text-3xl font-bold text-gray-800">{genderData.Male}</p>
            {totalGender > 0 && (
              <p className="text-sm text-gray-500">({(genderData.Male / totalGender * 100).toFixed(1)}%)</p>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Female Students</h3>
            <p className="text-3xl font-bold text-gray-800">{genderData.Female}</p>
            {totalGender > 0 && (
              <p className="text-sm text-gray-500">({(genderData.Female / totalGender * 100).toFixed(1)}%)</p>
            )}
          </div>
        </div>

        {/* Additional Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Low Income Students</h3>
            <p className="text-3xl font-bold text-gray-800">{incomeGroups['<2L']}</p>
            {students.length > 0 && (
              <p className="text-sm text-gray-500">({(incomeGroups['<2L'] / students.length * 100).toFixed(1)}%)</p>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Job Seekers</h3>
            <p className="text-3xl font-bold text-gray-800">{jobData['Job Required']}</p>
            {students.length > 0 && (
              <p className="text-sm text-gray-500">({(jobData['Job Required'] / students.length * 100).toFixed(1)}%)</p>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Currently Working</h3>
            <p className="text-3xl font-bold text-gray-800">{workingData['Working']}</p>
            {students.length > 0 && (
              <p className="text-sm text-gray-500">({(workingData['Working'] / students.length * 100).toFixed(1)}%)</p>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Adult Students (18+)</h3>
            <p className="text-3xl font-bold text-gray-800">{ageGroups['18+']}</p>
            {students.length > 0 && (
              <p className="text-sm text-gray-500">({(ageGroups['18+'] / students.length * 100).toFixed(1)}%)</p>
            )}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Student Charts */}
          {students.length > 0 && (
            <>
              <ChartBox
                title="Gender Distribution"
                summary={totalGender > 0 ? 
                  `${genderData.Male} male (${(genderData.Male / totalGender * 100).toFixed(1)}%) • ${genderData.Female} female (${(genderData.Female / totalGender * 100).toFixed(1)}%)` : 
                  "No gender data available"}
                chart={generateGenderChartData() && <Pie data={generateGenderChartData()} options={commonPieOptions} />}
              />
              
              {generateMonthlyChartData() && (
                <ChartBox
                  title="Monthly Registrations"
                  summary={`Peak: ${Object.keys(monthlyData).reduce((a, b) => monthlyData[a] > monthlyData[b] ? a : b)} (${Math.max(...Object.values(monthlyData))} registrations)`}
                  chart={<Bar data={generateMonthlyChartData()} options={commonBarOptions} />}
                />
              )}
              
              {generateCourseChartData() && (
                <ChartBox
                  title="Students Per Course"
                  summary={`Most popular: ${Object.keys(courseData).reduce((a, b) => courseData[a] > courseData[b] ? a : b)} (${Math.max(...Object.values(courseData))} students)`}
                  chart={<Bar data={generateCourseChartData()} options={commonBarOptions} />}
                />
              )}
              
              {generateIncomeChartData() && (
                <ChartBox
                  title="Family Income"
                  summary={`<2L: ${incomeGroups['<2L']} (${(incomeGroups['<2L'] / students.length * 100).toFixed(1)}%) • 2L-4L: ${incomeGroups['2L-4L']} • 4L+: ${incomeGroups['4L+']}`}
                  chart={<Pie data={generateIncomeChartData()} options={commonPieOptions} />}
                />
              )}
              
              {generateAgeChartData() && (
                <ChartBox
                  title="Age Groups"
                  summary={`16+: ${ageGroups['16+']} • 18+: ${ageGroups['18+']} • 22+: ${ageGroups['22+']} • 24+: ${ageGroups['24+']}`}
                  chart={<Bar data={generateAgeChartData()} options={commonBarOptions} />}
                />
              )}
              
              {generateJobChartData() && (
                <ChartBox
                  title="Job Requirement"
                  summary={`Job Required: ${jobData['Job Required']} (${(jobData['Job Required'] / students.length * 100).toFixed(1)}%) • Not Required: ${jobData['Not Required']}`}
                  chart={<Pie data={generateJobChartData()} options={commonPieOptions} />}
                />
              )}
              
              {generateWorkingChartData() && (
                <ChartBox
                  title="Working Status"
                  summary={`Working: ${workingData['Working']} (${(workingData['Working'] / students.length * 100).toFixed(1)}%) • Non-Working: ${workingData['Non-Working']}`}
                  chart={<Pie data={generateWorkingChartData()} options={commonPieOptions} />}
                />
              )}
            </>
          )}

          {/* Enquiry Charts */}
          {enquiries.length > 0 && (
            <ChartBox
              title="Enquiries Overview"
              summary={
                enquiryViewMode === 'daily' ? 'Daily view showing individual days' :
                enquiryViewMode === 'weekly' ? 'Weekly view aggregated by week' :
                'Monthly view aggregated by month'
              }
              chart={<Bar data={generateEnquiryChartData()} options={commonBarOptions} />}
            >
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => setEnquiryViewMode('daily')}
                  className={`px-2 py-1 text-xs rounded ${enquiryViewMode === 'daily' ? 'bg-white text-primary' : 'bg-primary text-white'}`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setEnquiryViewMode('weekly')}
                  className={`px-2 py-1 text-xs rounded ${enquiryViewMode === 'weekly' ? 'bg-white text-primary' : 'bg-primary text-white'}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setEnquiryViewMode('monthly')}
                  className={`px-2 py-1 text-xs rounded ${enquiryViewMode === 'monthly' ? 'bg-white text-primary' : 'bg-primary text-white'}`}
                >
                  Monthly
                </button>
              </div>
            </ChartBox>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;