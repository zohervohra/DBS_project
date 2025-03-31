import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { supabase } from '../client'; // Import the Supabase client

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AnalyticsDashboard = () => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchStudents();
    }, []);table

    const fetchStudents = async () => {
        let { data, error } = await supabase.from('students').select('*');
        if (error) console.error(error);
        else setStudents(data);
    };

    // Gender Distribution
    const genderData = students.reduce((acc, student) => {
        acc[student.gender === 'M' ? 'Male' : 'Female']++;
        return acc;
    }, { Male: 0, Female: 0 });

    const genderChartData = {
        labels: ['Male', 'Female'],
        datasets: [{ data: Object.values(genderData), backgroundColor: ['#4B00CF', '#FF00D3'] }]
    };

    // Helper function to get month name from date
    const getMonthName = (dateString) => {
        const months = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
        const date = new Date(dateString);  
        return months[date.getMonth()]; // Extract month name
    };

    // Monthly Registrations
    const monthlyData = students.reduce((acc, student) => {
        if (student.date_of_registration) {
            const monthName = getMonthName(student.date_of_registration);
            acc[monthName] = (acc[monthName] || 0) + 1;
        }
        return acc;
    }, {});

    const monthlyChartData = {
        labels: Object.keys(monthlyData),
        datasets: [{ data: Object.values(monthlyData), backgroundColor: '#00D7C0' }]
    };

    // Students Per Course
    const courseData = students.reduce((acc, student) => {
        acc[student.course_name] = (acc[student.course_name] || 0) + 1;
        return acc;
    }, {});

    const courseChartData = {
        labels: Object.keys(courseData),
        datasets: [{ data: Object.values(courseData), backgroundColor: '#6E975F' }]
    };

    // Family Income Segregation
    const incomeGroups = { '<2L': 0, '2L-4L': 0, '4L+': 0 };
    students.forEach(student => {
        if (student.family_income < 200000) incomeGroups['<2L']++;
        else if (student.family_income <= 400000) incomeGroups['2L-4L']++;
        else incomeGroups['4L+']++;
    });

    const incomeChartData = {
        labels: Object.keys(incomeGroups),
        datasets: [{ data: Object.values(incomeGroups), backgroundColor: ['#FF00D3', '#00D7C0', '#6E975F'] }]
    };

    // Age Group Segregation
    const ageGroups = { '16+': 0, '18+': 0, '22+': 0, '24+': 0 };
    students.forEach(student => {
        if (student.age >= 16) ageGroups['16+']++;
        if (student.age >= 18) ageGroups['18+']++;
        if (student.age >= 22) ageGroups['22+']++;
        if (student.age >= 24) ageGroups['24+']++;
    });

    const ageChartData = {
        labels: Object.keys(ageGroups),
        datasets: [{ data: Object.values(ageGroups), backgroundColor: '#4B00CF' }]
    };

    // Job Requirement Analysis
    const jobData = students.reduce((acc, student) => {
        acc[student.job_required ? 'Job Required' : 'Not Required']++;
        return acc;
    }, { 'Job Required': 0, 'Not Required': 0 });

    const jobChartData = {
        labels: Object.keys(jobData),
        datasets: [{ data: Object.values(jobData), backgroundColor: ['#FF00D3', '#6E975F'] }]
    };

    // Working vs Non-Working
    const workingData = students.reduce((acc, student) => {
        acc[student.working_status ? 'Working' : 'Non-Working']++;
        return acc;
    }, { 'Working': 0, 'Non-Working': 0 });

    const workingChartData = {
        labels: Object.keys(workingData),
        datasets: [{ data: Object.values(workingData), backgroundColor: ['#00D7C0', '#4B00CF'] }]
    };

    return (
        <div className="p-6 bg-base-200 text-base-content">
            <h1 className="text-3xl font-bold mb-6 text-primary-content">Analytics Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-white rounded-lg shadow-lg"><Pie data={genderChartData} /><h2 className="text-center mt-2">Gender Distribution</h2></div>
                <div className="p-4 bg-white rounded-lg shadow-lg"><Bar data={monthlyChartData} /><h2 className="text-center mt-2">Monthly Registrations</h2></div>
                <div className="p-4 bg-white rounded-lg shadow-lg"><Bar data={courseChartData} /><h2 className="text-center mt-2">Students Per Course</h2></div>
                <div className="p-4 bg-white rounded-lg shadow-lg"><Pie data={incomeChartData} /><h2 className="text-center mt-2">Family Income</h2></div>
                <div className="p-4 bg-white rounded-lg shadow-lg"><Bar data={ageChartData} /><h2 className="text-center mt-2">Age Groups</h2></div>
                <div className="p-4 bg-white rounded-lg shadow-lg"><Pie data={jobChartData} /><h2 className="text-center mt-2">Job Requirement</h2></div>
                <div className="p-4 bg-white rounded-lg shadow-lg"><Pie data={workingChartData} /><h2 className="text-center mt-2">Working Status</h2></div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
