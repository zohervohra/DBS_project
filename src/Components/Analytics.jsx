// import { useEffect, useState } from 'react';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
// } from 'chart.js';
// import { Pie, Bar } from 'react-chartjs-2';
// import { supabase } from '../client';

// ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// // Color palette for consistent styling
// const colorPalette = {
//   primary: '#4F46E5',
//   secondary: '#10B981',
//   accent: '#F59E0B',
//   neutral: '#6B7280',
//   info: '#3B82F6',
//   success: '#10B981',
//   warning: '#F59E0B',
//   error: '#EF4444'
// };

// // Common chart options
// const commonPieOptions = {
//   plugins: {
//     legend: {
//       position: 'bottom',
//       labels: {
//         padding: 20,
//         usePointStyle: true,
//         pointStyle: 'circle'
//       }
//     }
//   },
//   maintainAspectRatio: false
// };

// const commonBarOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   scales: {
//     y: {
//       beginAtZero: true,
//       grid: {
//         display: false
//       }
//     },
//     x: {
//       grid: {
//         display: false
//       }
//     }
//   },
//   plugins: {
//     legend: {
//       display: false
//     }
//   }
// };

// const AnalyticsDashboard = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   const fetchStudents = async () => {
//     setLoading(true);
//     const { data, error } = await supabase.from('students').select('*');
//     if (error) console.error(error);
//     else setStudents(data);
//     setLoading(false);
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   // Gender distribution
//   const genderData = students.reduce((acc, student) => {
//     acc[student.gender === 'M' ? 'Male' : 'Female']++;
//     return acc;
//   }, { Male: 0, Female: 0 });

//   const totalGender = genderData.Male + genderData.Female;
//   const genderChartData = {
//     labels: ['Male', 'Female'],
//     datasets: [{
//       data: Object.values(genderData),
//       backgroundColor: [colorPalette.primary, colorPalette.accent],
//       borderColor: ['#fff'],
//       borderWidth: 1
//     }],
//   };

//   // Monthly registrations
//   const getMonthName = (dateString) => {
//     const months = ["January", "February", "March", "April", "May", "June",
//                     "July", "August", "September", "October", "November", "December"];
//     const date = new Date(dateString);
//     return months[date.getMonth()];
//   };

//   const monthlyData = students.reduce((acc, student) => {
//     if (student.date_of_registration) {
//       const monthName = getMonthName(student.date_of_registration);
//       acc[monthName] = (acc[monthName] || 0) + 1;
//     }
//     return acc;
//   }, {});

//   const monthlyChartData = {
//     labels: Object.keys(monthlyData),
//     datasets: [{
//       label: 'Registrations',
//       data: Object.values(monthlyData),
//       backgroundColor: colorPalette.info,
//       borderRadius: 4
//     }],
//   };

//   // Course distribution
//   const courseData = students.reduce((acc, student) => {
//     acc[student.course_name] = (acc[student.course_name] || 0) + 1;
//     return acc;
//   }, {});

//   const courseChartData = {
//     labels: Object.keys(courseData),
//     datasets: [{
//       label: 'Students',
//       data: Object.values(courseData),
//       backgroundColor: colorPalette.secondary,
//       borderRadius: 4
//     }],
//   };

//   // Income groups
//   const incomeGroups = { '<2L': 0, '2L-4L': 0, '4L+': 0 };
//   students.forEach(student => {
//     if (student.family_income < 200000) incomeGroups['<2L']++;
//     else if (student.family_income <= 400000) incomeGroups['2L-4L']++;
//     else incomeGroups['4L+']++;
//   });

//   const incomeChartData = {
//     labels: Object.keys(incomeGroups),
//     datasets: [{
//       data: Object.values(incomeGroups),
//       backgroundColor: [colorPalette.primary, colorPalette.accent, colorPalette.success],
//       borderColor: ['#fff'],
//       borderWidth: 1
//     }],
//   };

//   // Age groups
//   const ageGroups = { '16+': 0, '18+': 0, '22+': 0, '24+': 0 };
//   students.forEach(student => {
//     if (student.age >= 16) ageGroups['16+']++;
//     if (student.age >= 18) ageGroups['18+']++;
//     if (student.age >= 22) ageGroups['22+']++;
//     if (student.age >= 24) ageGroups['24+']++;
//   });

//   const ageChartData = {
//     labels: Object.keys(ageGroups),
//     datasets: [{
//       label: 'Students',
//       data: Object.values(ageGroups),
//       backgroundColor: colorPalette.warning,
//       borderRadius: 4
//     }],
//   };

//   // Job requirements
//   const jobData = students.reduce((acc, student) => {
//     acc[student.job_required ? 'Job Required' : 'Not Required']++;
//     return acc;
//   }, { 'Job Required': 0, 'Not Required': 0 });

//   const jobChartData = {
//     labels: Object.keys(jobData),
//     datasets: [{
//       data: Object.values(jobData),
//       backgroundColor: [colorPalette.error, colorPalette.neutral],
//       borderColor: ['#fff'],
//       borderWidth: 1
//     }],
//   };

//   // Working status
//   const workingData = students.reduce((acc, student) => {
//     acc[student.working_status ? 'Working' : 'Non-Working']++;
//     return acc;
//   }, { 'Working': 0, 'Non-Working': 0 });

//   const workingChartData = {
//     labels: Object.keys(workingData),
//     datasets: [{
//       data: Object.values(workingData),
//       backgroundColor: [colorPalette.success, colorPalette.neutral],
//       borderColor: ['#fff'],
//       borderWidth: 1
//     }],
//   };

//   // Chart + Summary Card Component
//   const ChartBox = ({ title, chart, summary }) => (
//     <div className="rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 bg-white">
//       <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-focus">
//         <h2 className="text-lg font-semibold text-white">{title}</h2>
//       </div>
//       <div className="p-4 bg-white">
//         <div className="h-64">{chart}</div>
//       </div>
//       <div className="p-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
//         {summary}
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8">
//         <h1 className="text-3xl font-bold mb-8 text-gray-800">Student Analytics Dashboard</h1>
        
//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
//             <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
//             <p className="text-3xl font-bold text-primary">{students.length}</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
//             <h3 className="text-gray-500 text-sm font-medium">Male Students</h3>
//             <p className="text-3xl font-bold text-primary">{genderData.Male}</p>
//             <p className="text-sm text-gray-500">({(genderData.Male / totalGender * 100).toFixed(1)}%)</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
//             <h3 className="text-gray-500 text-sm font-medium">Female Students</h3>
//             <p className="text-3xl font-bold text-primary">{genderData.Female}</p>
//             <p className="text-sm text-gray-500">({(genderData.Female / totalGender * 100).toFixed(1)}%)</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
//             <h3 className="text-gray-500 text-sm font-medium">Courses</h3>
//             <p className="text-3xl font-bold text-primary">{Object.keys(courseData).length}</p>
//           </div>
//         </div>

//         {/* Charts Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           <ChartBox
//             title="Gender Distribution"
//             summary={`${genderData.Male} male (${(genderData.Male / totalGender * 100).toFixed(1)}%) • ${genderData.Female} female (${(genderData.Female / totalGender * 100).toFixed(1)}%)`}
//             chart={<Pie data={genderChartData} options={commonPieOptions} />}
//           />
          
//           <ChartBox
//             title="Monthly Registrations"
//             summary={`Peak: ${Object.keys(monthlyData).reduce((a, b) => monthlyData[a] > monthlyData[b] ? a : b)} (${Math.max(...Object.values(monthlyData))} registrations)`}
//             chart={<Bar data={monthlyChartData} options={commonBarOptions} />}
//           />
          
//           <ChartBox
//             title="Students Per Course"
//             summary={`Most popular: ${Object.keys(courseData).reduce((a, b) => courseData[a] > courseData[b] ? a : b)} (${Math.max(...Object.values(courseData))} students)`}
//             chart={<Bar data={courseChartData} options={commonBarOptions} />}
//           />
          
//           <ChartBox
//             title="Family Income"
//             summary={`<2L: ${incomeGroups['<2L']} (${(incomeGroups['<2L'] / students.length * 100).toFixed(1)}%) • 2L-4L: ${incomeGroups['2L-4L']} • 4L+: ${incomeGroups['4L+']}`}
//             chart={<Pie data={incomeChartData} options={commonPieOptions} />}
//           />
          
//           <ChartBox
//             title="Age Groups"
//             summary={`16+: ${ageGroups['16+']} • 18+: ${ageGroups['18+']} • 22+: ${ageGroups['22+']} • 24+: ${ageGroups['24+']}`}
//             chart={<Bar data={ageChartData} options={commonBarOptions} />}
//           />
          
//           <ChartBox
//             title="Job Requirement"
//             summary={`Job Required: ${jobData['Job Required']} (${(jobData['Job Required'] / students.length * 100).toFixed(1)}%) • Not Required: ${jobData['Not Required']}`}
//             chart={<Pie data={jobChartData} options={commonPieOptions} />}
//           />
          
//           <ChartBox
//             title="Working Status"
//             summary={`Working: ${workingData['Working']} (${(workingData['Working'] / students.length * 100).toFixed(1)}%) • Non-Working: ${workingData['Non-Working']}`}
//             chart={<Pie data={workingChartData} options={commonPieOptions} />}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AnalyticsDashboard;
import { useEffect, useState } from 'react';
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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Color palettes for charts
const pieChartPalette = {
  primary: '#336D82',    // Indigo
  secondary: '#B4EBE6',  // Emerald
  accent: '#9FB3DF',     // Amber
  neutral: '#6B7280',    // Gray
  error: '#F8ED8C',      // Red
  info: '#2DAA9E',      // Blue
  purple: '#C8AAAA',     // Purple
  pink: '#FFCFCF'        // Pink
};

const barChartPalette = {
  primary: '#9FB3DF',    // Light Indigo
  secondary: '#48A6A7',  // Light Emerald
  accent: '#E4C087',     // Light Amber
  neutral: '#007074',    // Light Gray
  error: '#98D2C0',      // Light Red
  info: '#E3F0AF',      // Light Blue
  purple: '#66D2CE',     // Light Purple
  pink: '#E5989B'        // Light Pink
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('students').select('*');
    if (error) console.error(error);
    else setStudents(data);
    setLoading(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Gender distribution
  const genderData = students.reduce((acc, student) => {
    acc[student.gender === 'M' ? 'Male' : 'Female']++;
    return acc;
  }, { Male: 0, Female: 0 });

  const totalGender = genderData.Male + genderData.Female;
  const genderChartData = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: Object.values(genderData),
      backgroundColor: [pieChartPalette.primary, pieChartPalette.accent],
      borderColor: ['#fff'],
      borderWidth: 1
    }],
  };

  // Monthly registrations
  const getMonthName = (dateString) => {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    const date = new Date(dateString);
    return months[date.getMonth()];
  };

  const monthlyData = students.reduce((acc, student) => {
    if (student.date_of_registration) {
      const monthName = getMonthName(student.date_of_registration);
      acc[monthName] = (acc[monthName] || 0) + 1;
    }
    return acc;
  }, {});

  const monthlyChartData = {
    labels: Object.keys(monthlyData),
    datasets: [{
      label: 'Registrations',
      data: Object.values(monthlyData),
      backgroundColor: barChartPalette.info,
      borderRadius: 4
    }],
  };

  // Course distribution
  const courseData = students.reduce((acc, student) => {
    acc[student.course_name] = (acc[student.course_name] || 0) + 1;
    return acc;
  }, {});

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

  // Chart + Summary Card Component
  const ChartBox = ({ title, chart, summary }) => (
    <div className="rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 bg-white">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-focus">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="p-4 bg-white">
        <div className="h-64">{chart}</div>
      </div>
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        {summary}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">📊Analytics Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
            <p className="text-3xl font-bold text-primary">{students.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Male Students</h3>
            <p className="text-3xl font-bold text-primary">{genderData.Male}</p>
            <p className="text-sm text-gray-500">({(genderData.Male / totalGender * 100).toFixed(1)}%)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Female Students</h3>
            <p className="text-3xl font-bold text-primary">{genderData.Female}</p>
            <p className="text-sm text-gray-500">({(genderData.Female / totalGender * 100).toFixed(1)}%)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Courses Enrolled</h3>
            <p className="text-3xl font-bold text-primary">{Object.keys(courseData).length}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;