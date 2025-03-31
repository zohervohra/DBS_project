import React, { useEffect, useState } from 'react';
import { supabase } from '../client'; // Import the Supabase client
import { useNavigate } from 'react-router-dom';

const StudentTable = () => {
    const [students, setStudents] = useState([]); // State to store student data
    const [loading, setLoading] = useState(true); // State to handle loading
    const [error, setError] = useState(''); // State to handle errors
    const [searchQuery, setSearchQuery] = useState(''); // State to store search query
    const navigate = useNavigate();
    useEffect(() => {
        // Function to fetch student data
        const fetchStudents = async () => {
            try {
                // Step 1: Retrieve the token from local storage
                const token = localStorage.getItem('supabase_token');

                if (!token) {
                    throw new Error('No token found in local storage');
                }

                // Step 2: Verify the user's token
                const { data: user, error: authError } = await supabase.auth.getUser(token);

                if (authError) {
                    throw new Error('Invalid token: User not authenticated');
                }

                // Step 3: Fetch data from the students table
                const { data: studentData, error: fetchError } = await supabase
                    .from('students') // Replace 'students' with your table name
                    .select('*'); // Fetch all columns

                if (fetchError) {
                    throw new Error('Failed to fetch student data');
                }

                // Step 4: Log the data and update state
                console.log('Fetched student data:', studentData);
                setStudents(studentData);
            } catch (err) {
                console.error('Error fetching student data:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents(); // Call the function to fetch data
    }, []);

    // Function to filter students based on search query
    const filteredStudents = students.filter((student) => {
        const query = searchQuery.toLowerCase();
        return (
            student.full_name.toLowerCase().includes(query) ||
            student.aadhar_no.toLowerCase().includes(query) ||
            student.course_name.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return <p className="text-center">Loading...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }


    const handleDelete = async (id) => {
        const { error } = await supabase
            .from('students')
            .delete()
            .match({ id });

        if (error) {
            alert('Error deleting student');
        } else {
            setStudents(students.filter(student => student.id !== id));
        }
    };

    return (
        <section className="bg-base-200 min-h-screen p-3 sm:p-5">
            <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                <div className="bg-base-100 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-base-content text-center mb-4">
                        Student Table
                    </h1>

                    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 mb-4">
                        <div className="w-full md:w-1/2">
                            <form
                                className="flex items-center"
                                onSubmit={(e) => e.preventDefault()} // Prevent form submission
                            >
                                <label htmlFor="simple-search" className="sr-only">
                                    Search
                                </label>
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg
                                            aria-hidden="true"
                                            className="w-5 h-5 text-base-content"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="simple-search"
                                        className="w-full p-2.5 pl-10 border rounded-lg bg-base-200 text-base-content focus:ring-primary focus:border-primary"
                                        placeholder="Search by name, Aadhar number, or course"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)} // Update search query
                                        required
                                    />
                                </div>
                            </form>
                        </div>
                        <button
                            type="button"
                            className="flex items-center justify-center text-primary-content bg-primary hover:bg-primary/80 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5"
                        >
                            <svg
                                className="h-3.5 w-3.5 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    clipRule="evenodd"
                                    fillRule="evenodd"
                                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                />
                            </svg>
                            Add Student
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-base-content">
                            <thead className="text-xs text-base-content uppercase bg-base-200">
                                <tr>
                                    <th scope="col" className="px-4 py-3">
                                        Student Name
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Aadhar Number
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Course
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Age
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b border-neutral">
                                        <th
                                            scope="row"
                                            className="px-4 py-3 font-medium text-base-content whitespace-nowrap"
                                        >
                                            {student.full_name}
                                        </th>
                                        <td className="px-4 py-3">{student.aadhar_no}</td>
                                        <td className="px-4 py-3">{student.course_name}</td>
                                        <td className="px-4 py-3">{student.age}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                className="text-primary hover:underline"
                                                onClick={() => navigate(`/editstudent/${student.id}`)} // Navigate to edit route
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="ml-2 text-primary hover:underline"
                                                onClick={() => handleDelete(student.id)}                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StudentTable;