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
import html2canvas from 'html2canvas';

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
  const dashboardRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await fetchStudents();
    await fetchEnquiries();
    setLoading(false);
  };

  const fetchStudents = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('admin, center_name')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error("User fetch error:", userError);
      return;
    }

    let query = supabase.from('students').select('*');
    if (!userData.admin) {
      query = query.eq('center_name', userData.center_name);
    }

    const { data: studentsData, error: studentError } = await query;
    if (studentError) {
      console.error("Student fetch error:", studentError);
    } else {
      setStudents(studentsData);
    }
  };

  const fetchEnquiries = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('admin, center_name')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error("User fetch error:", userError);
      return;
    }

    let query = supabase.from('enquiry_desk').select('*');
    if (!userData.admin) {
      query = query.eq('center_name', userData.center_name);
    }

    const { data: enquiriesData, error: enquiryError } = await query;
    if (enquiryError) {
      console.error("Enquiry fetch error:", enquiryError);
    } else {
      setEnquiries(enquiriesData);
    }
  };

  // Helper functions
  const getMonthName = (dateString) => {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    const date = new Date(dateString);
    return months[date.getMonth()];
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Data calculations for students
  const calculateGenderData = () => {
    return students.reduce((acc, student) => {
      acc[student.gender === 'M' ? 'Male' : 'Female']++;
      return acc;
    }, { Male: 0, Female: 0 });
  };

  const calculateCourseData = () => {
    return students.reduce((acc, student) => {
      acc[student.course_name] = (acc[student.course_name] || 0) + 1;
      return acc;
    }, {});
  };

  // Data calculations for enquiries
  const calculateDailyEnquiries = () => {
    return enquiries.reduce((acc, enquiry) => {
      if (enquiry.created_at) {
        const date = new Date(enquiry.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});
  };

  const calculateWeeklyEnquiries = () => {
    return enquiries.reduce((acc, enquiry) => {
      if (enquiry.created_at) {
        const date = new Date(enquiry.created_at);
        const weekNumber = getWeekNumber(date);
        const weekKey = `Week ${weekNumber}`;
        acc[weekKey] = (acc[weekKey] || 0) + 1;
      }
      return acc;
    }, {});
  };

  const calculateMonthlyEnquiries = () => {
    return enquiries.reduce((acc, enquiry) => {
      if (enquiry.created_at) {
        const monthName = getMonthName(enquiry.created_at);
        acc[monthName] = (acc[monthName] || 0) + 1;
      }
      return acc;
    }, {});
  };

  // Student data
  const genderData = calculateGenderData();
  const totalGender = genderData.Male + genderData.Female;
  const courseData = calculateCourseData();

  const monthlyData = students.reduce((acc, student) => {
    if (student.date_of_registration) {
      const monthName = getMonthName(student.date_of_registration);
      acc[monthName] = (acc[monthName] || 0) + 1;
    }
    return acc;
  }, {});

  // Enquiry data
  const dailyEnquiryData = calculateDailyEnquiries();
  const weeklyEnquiryData = calculateWeeklyEnquiries();
  const monthlyEnquiryData = calculateMonthlyEnquiries();

  // Chart data for students
  const genderChartData = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: Object.values(genderData),
      backgroundColor: [pieChartPalette.primary, pieChartPalette.accent],
      borderColor: ['#fff'],
      borderWidth: 1
    }],
  };

  const monthlyChartData = {
    labels: Object.keys(monthlyData),
    datasets: [{
      label: 'Registrations',
      data: Object.values(monthlyData),
      backgroundColor: barChartPalette.info,
      borderRadius: 4
    }],
  };

  const courseChartData = {
    labels: Object.keys(courseData),
    datasets: [{
      label: 'Students',
      data: Object.values(courseData),
      backgroundColor: barChartPalette.secondary,
      borderRadius: 4
    }],
  };

  // Income groups
  const incomeGroups = { '<2L': 0, '2L-4L': 0, '4L+': 0 };
  students.forEach(student => {
    if (student.family_income < 200000) incomeGroups['<2L']++;
    else if (student.family_income <= 400000) incomeGroups['2L-4L']++;
    else incomeGroups['4L+']++;
  });

  const incomeChartData = {
    labels: Object.keys(incomeGroups),
    datasets: [{
      data: Object.values(incomeGroups),
      backgroundColor: [pieChartPalette.primary, pieChartPalette.accent, pieChartPalette.secondary],
      borderColor: ['#fff'],
      borderWidth: 1
    }],
  };

  // Age groups
  const ageGroups = { '16+': 0, '18+': 0, '22+': 0, '24+': 0 };
  students.forEach(student => {
    if (student.age >= 16) ageGroups['16+']++;
    if (student.age >= 18) ageGroups['18+']++;
    if (student.age >= 22) ageGroups['22+']++;
    if (student.age >= 24) ageGroups['24+']++;
  });

  const ageChartData = {
    labels: Object.keys(ageGroups),
    datasets: [{
      label: 'Students',
      data: Object.values(ageGroups),
      backgroundColor: barChartPalette.accent,
      borderRadius: 4
    }],
  };

  // Job requirements
  const jobData = students.reduce((acc, student) => {
    acc[student.job_required ? 'Job Required' : 'Not Required']++;
    return acc;
  }, { 'Job Required': 0, 'Not Required': 0 });

  const jobChartData = {
    labels: Object.keys(jobData),
    datasets: [{
      data: Object.values(jobData),
      backgroundColor: [pieChartPalette.error, pieChartPalette.neutral],
      borderColor: ['#fff'],
      borderWidth: 1
    }],
  };

  // Working status
  const workingData = students.reduce((acc, student) => {
    acc[student.working_status ? 'Working' : 'Non-Working']++;
    return acc;
  }, { 'Working': 0, 'Non-Working': 0 });

  const workingChartData = {
    labels: Object.keys(workingData),
    datasets: [{
      data: Object.values(workingData),
      backgroundColor: [pieChartPalette.pink, pieChartPalette.purple],
      borderColor: ['#fff'],
      borderWidth: 1
    }],
  };

  // Chart data for enquiries
  const dailyEnquiryChartData = {
    labels: Object.keys(dailyEnquiryData),
    datasets: [{
      label: 'Daily Enquiries',
      data: Object.values(dailyEnquiryData),
      backgroundColor: barChartPalette.primary,
      borderRadius: 4
    }],
  };

  const weeklyEnquiryChartData = {
    labels: Object.keys(weeklyEnquiryData),
    datasets: [{
      label: 'Weekly Enquiries',
      data: Object.values(weeklyEnquiryData),
      backgroundColor: barChartPalette.secondary,
      borderRadius: 4
    }],
  };

  const monthlyEnquiryChartData = {
    labels: Object.keys(monthlyEnquiryData),
    datasets: [{
      label: 'Monthly Enquiries',
      data: Object.values(monthlyEnquiryData),
      backgroundColor: barChartPalette.accent,
      borderRadius: 4
    }],
  };

  // Chart + Summary Card Component
  const ChartBox = ({ title, chart, summary }) => (
    <div className="rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 bg-white">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-focus">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="p-4 bg-white chart-container">
        <div className="h-64">{chart}</div>
      </div>
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        {summary}
      </div>
    </div>
  );

  // Generate PDF report
  const generatePDF = async () => {
    try {
      if (students.length === 0 && enquiries.length === 0) {
        alert("No data available!");
        return;
      }

      const doc = new jsPDF('p', 'pt', 'a4');
      doc.setFont('helvetica', 'normal');
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

      // Enquiry Summary Table
      doc.autoTable({
        head: [['Time Period', 'Number of Enquiries']],
        body: [
          ['Today', dailyEnquiryData[Object.keys(dailyEnquiryData).pop()] || 0],
          ['This Week', weeklyEnquiryData[Object.keys(weeklyEnquiryData).pop()] || 0],
          ['This Month', monthlyEnquiryData[Object.keys(monthlyEnquiryData).pop()] || 0],
        ],
        startY: doc.lastAutoTable.finalY + 20,
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [111,150,93],
          textColor: [255, 255, 255],
        }
      });

      // Course Distribution Table
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

      // Income Groups Table
      doc.autoTable({
        head: [['Income Group', 'Number of Students']],
        body: Object.keys(incomeGroups).map(group => [group, incomeGroups[group]]),
        startY: doc.lastAutoTable.finalY + 20,
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [111,150,93],
          textColor: [255, 255, 255],
        }
      });

      // Age Groups Table
      doc.autoTable({
        head: [['Age Group', 'Number of Students']],
        body: Object.keys(ageGroups).map(group => [group, ageGroups[group]]),
        startY: doc.lastAutoTable.finalY + 20,
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [111,150,93],
          textColor: [255, 255, 255],
        }
      });

      // Job Requirement Table
      doc.autoTable({
        head: [['Job Requirement', 'Number of Students']],
        body: Object.keys(jobData).map(job => [job, jobData[job]]),
        startY: doc.lastAutoTable.finalY + 20,
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [111,150,93],
          textColor: [255, 255, 255],
        }
      });

      // Working Status Table
      doc.autoTable({
        head: [['Working Status', 'Number of Students']],
        body: Object.keys(workingData).map(status => [status, workingData[status]]),
        startY: doc.lastAutoTable.finalY + 20,
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [111,150,93],
          textColor: [255, 255, 255],
        }
      });

      doc.save("analytics_report.pdf");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert(`Failed: ${error.message}`);
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

  if (students.length === 0 && enquiries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">No data available.</h1>
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
            <p className="text-sm text-gray-500">({(genderData.Male / totalGender * 100).toFixed(1)}%)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Female Students</h3>
            <p className="text-3xl font-bold text-gray-800">{genderData.Female}</p>
            <p className="text-sm text-gray-500">({(genderData.Female / totalGender * 100).toFixed(1)}%)</p>
          </div>
        </div>

        {/* Additional Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Low Income Students</h3>
            <p className="text-3xl font-bold text-gray-800">{incomeGroups['<2L']}</p>
            <p className="text-sm text-gray-500">({(incomeGroups['<2L'] / students.length * 100).toFixed(1)}%)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Job Seekers</h3>
            <p className="text-3xl font-bold text-gray-800">{jobData['Job Required']}</p>
            <p className="text-sm text-gray-500">({(jobData['Job Required'] / students.length * 100).toFixed(1)}%)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Currently Working</h3>
            <p className="text-3xl font-bold text-gray-800">{workingData['Working']}</p>
            <p className="text-sm text-gray-500">({(workingData['Working'] / students.length * 100).toFixed(1)}%)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Adult Students (18+)</h3>
            <p className="text-3xl font-bold text-gray-800">{ageGroups['18+']}</p>
            <p className="text-sm text-gray-500">({(ageGroups['18+'] / students.length * 100).toFixed(1)}%)</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Student Charts */}
          {students.length > 0 && (
            <>
              <ChartBox
                title="Gender Distribution"
                summary={`${genderData.Male} male (${(genderData.Male / totalGender * 100).toFixed(1)}%) • ${genderData.Female} female (${(genderData.Female / totalGender * 100).toFixed(1)}%)`}
                chart={<Pie data={genderChartData} options={commonPieOptions} />}
              />
              
              <ChartBox
                title="Monthly Registrations"
                summary={`Peak: ${Object.keys(monthlyData).reduce((a, b) => monthlyData[a] > monthlyData[b] ? a : b)} (${Math.max(...Object.values(monthlyData))} registrations)`}
                chart={<Bar data={monthlyChartData} options={commonBarOptions} />}
              />
              
              <ChartBox
                title="Students Per Course"
                summary={`Most popular: ${Object.keys(courseData).reduce((a, b) => courseData[a] > courseData[b] ? a : b)} (${Math.max(...Object.values(courseData))} students)`}
                chart={<Bar data={courseChartData} options={commonBarOptions} />}
              />
              
              <ChartBox
                title="Family Income"
                summary={`<2L: ${incomeGroups['<2L']} (${(incomeGroups['<2L'] / students.length * 100).toFixed(1)}%) • 2L-4L: ${incomeGroups['2L-4L']} • 4L+: ${incomeGroups['4L+']}`}
                chart={<Pie data={incomeChartData} options={commonPieOptions} />}
              />
              
              <ChartBox
                title="Age Groups"
                summary={`16+: ${ageGroups['16+']} • 18+: ${ageGroups['18+']} • 22+: ${ageGroups['22+']} • 24+: ${ageGroups['24+']}`}
                chart={<Bar data={ageChartData} options={commonBarOptions} />}
              />
              
              <ChartBox
                title="Job Requirement"
                summary={`Job Required: ${jobData['Job Required']} (${(jobData['Job Required'] / students.length * 100).toFixed(1)}%) • Not Required: ${jobData['Not Required']}`}
                chart={<Pie data={jobChartData} options={commonPieOptions} />}
              />
              
              <ChartBox
                title="Working Status"
                summary={`Working: ${workingData['Working']} (${(workingData['Working'] / students.length * 100).toFixed(1)}%) • Non-Working: ${workingData['Non-Working']}`}
                chart={<Pie data={workingChartData} options={commonPieOptions} />}
              />
            </>
          )}

          {/* Enquiry Charts */}
          {enquiries.length > 0 && (
            <>
              <ChartBox
                title="Daily Enquiries"
                summary={`Latest: ${Object.keys(dailyEnquiryData).pop()} (${Object.values(dailyEnquiryData).pop() || 0} enquiries)`}
                chart={<Bar data={dailyEnquiryChartData} options={commonBarOptions} />}
              />
              
              <ChartBox
                title="Weekly Enquiries"
                summary={`Current Week: ${Object.keys(weeklyEnquiryData).pop()} (${Object.values(weeklyEnquiryData).pop() || 0} enquiries)`}
                chart={<Bar data={weeklyEnquiryChartData} options={commonBarOptions} />}
              />
              
              <ChartBox
                title="Monthly Enquiries"
                summary={`Current Month: ${Object.keys(monthlyEnquiryData).pop()} (${Object.values(monthlyEnquiryData).pop() || 0} enquiries)`}
                chart={<Bar data={monthlyEnquiryChartData} options={commonBarOptions} />}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;