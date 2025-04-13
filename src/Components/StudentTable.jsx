import React, { useEffect, useState } from 'react';
import { supabase } from '../client';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Animation

const StudentTable = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('supabase_token');
                if (!token) throw new Error('No token found');

                const { data: user, error: authError } = await supabase.auth.getUser(token);
                if (authError) throw new Error('Invalid token');

                const { data, error: fetchError } = await supabase.from('students').select('*');
                if (fetchError) throw new Error('Failed to fetch students');

                setStudents(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const sortedStudents = [...students].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredStudents = sortedStudents.filter((student) => {
        const query = searchQuery.toLowerCase();
        return (
            student.full_name.toLowerCase().includes(query) ||
            student.aadhar_no.toLowerCase().includes(query) ||
            student.course_name.toLowerCase().includes(query)
        );
    });

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this student?")) return;

        const { error } = await supabase.from('students').delete().match({ id });
        if (!error) setStudents(students.filter(student => student.id !== id));
    };

    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <section className="bg-base-200 min-h-screen p-3 sm:p-5">
            <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                <div className="bg-base-100 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-center mb-4 text-base-content">Student Table</h1>

                    {/* Search and Add */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                        <input
                            type="text"
                            className="w-full md:w-1/2 p-2 border rounded-lg"
                            placeholder="Search by student name,adhaar,course.."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <button
                            onClick={() => navigate('/form')}
                            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-primary-content bg-primary hover:bg-primary/80"
                        >
                            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                            </svg>
                            Add Student
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-base-200">
                                <tr>
                                    <th className="px-4 py-3">S.No</th>
                                    <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('full_name')}>Name</th>
                                    <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('aadhar_no')}>Aadhar</th>
                                    <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('course_name')}>Course</th>
                                    <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('age')}>Age</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
  <AnimatePresence>
    {currentStudents.length > 0 ? (
      currentStudents.map((student, index) => (
        <motion.tr
          key={student.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="border-b"
        >
          <td className="px-4 py-3">{indexOfFirstStudent + index + 1}</td>
          <td className="px-4 py-3">{student.full_name}</td>
          <td className="px-4 py-3">{student.aadhar_no}</td>
          <td className="px-4 py-3">{student.course_name}</td>
          <td className="px-4 py-3">{student.age}</td>
          <td className="px-4 py-3 flex space-x-5">
            <button
              className="text-primary font-semibold hover:underline"
              onClick={() => {
                if (window.confirm("Do you want to edit this student's details?")) {
                  navigate(`/editstudent/${student.id}`);
                }
              }}
              
            >
              Edit
            </button>
            <button onClick={() => handleDelete(student.id)}>
              <Trash2 className="text-red-500 hover:text-red-700" size={18} />
            </button>
          </td>
        </motion.tr>
      ))
    ) : (
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <td colSpan="6" className="text-center py-8 text-gray-500">
          No students found.
        </td>
      </motion.tr>
    )}
  </AnimatePresence>
</tbody>

                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center space-x-2">
                            {Array.from({ length: totalPages }, (_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`px-3 py-1 rounded-lg ${currentPage === idx + 1
                                        ? 'bg-primary text-white'
                                        : 'bg-base-300 hover:bg-base-400'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StudentTable;
