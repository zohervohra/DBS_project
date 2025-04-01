import React, { useEffect, useState } from 'react';
import { supabase } from '../client';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const StudentTable = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('supabase_token');
                if (!token) throw new Error('No token found in local storage');
                
                const { data: user, error: authError } = await supabase.auth.getUser(token);
                if (authError) throw new Error('Invalid token: User not authenticated');
                
                const { data: studentData, error: fetchError } = await supabase
                    .from('students')
                    .select('*');
                
                if (fetchError) throw new Error('Failed to fetch student data');
                
                setStudents(studentData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStudents();
    }, []);

    const filteredStudents = students.filter((student) => {
        const query = searchQuery.toLowerCase();
        return (
            student.full_name.toLowerCase().includes(query) ||
            student.aadhar_no.toLowerCase().includes(query) ||
            student.course_name.toLowerCase().includes(query)
        );
    });

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this student?");
        if (!confirmDelete) return;

        const { error } = await supabase.from('students').delete().match({ id });
        if (!error) setStudents(students.filter(student => student.id !== id));
    };

    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <section className="bg-base-200 min-h-screen p-3 sm:p-5">
            <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                <div className="bg-base-100 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-base-content text-center mb-4">Student Table</h1>
                    <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                        <input
                            type="text"
                            className="w-full md:w-1/2 p-2.5 border rounded-lg"
                            placeholder="Search by name, Aadhar number, or course"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            type="button"
                            className="flex items-center justify-center text-primary-content bg-primary hover:bg-primary/80 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5"
                            onClick={() => navigate('/form')}
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
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-base-200">
                                <tr>
                                    <th className="px-4 py-3">Student Name</th>
                                    <th className="px-4 py-3">Aadhar Number</th>
                                    <th className="px-4 py-3">Course</th>
                                    <th className="px-4 py-3">Age</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b">
                                        <td className="px-4 py-3">{student.full_name}</td>
                                        <td className="px-4 py-3">{student.aadhar_no}</td>
                                        <td className="px-4 py-3">{student.course_name}</td>
                                        <td className="px-4 py-3">{student.age}</td>
                                        <td className="px-4 py-3 flex space-x-6">
                                            <button 
                                                className="text-primary font-semibold hover:underline"
                                                onClick={() => navigate(`/editstudent/${student.id}`)}
                                            >
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(student.id)}>
                                                <Trash2 className="text-red-500 hover:text-red-700" size={18} />
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
