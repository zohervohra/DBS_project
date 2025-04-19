import React, { useEffect, useState } from 'react';
import { supabase } from '../client';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RecordsTable = () => {
    const [students, setStudents] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const [view, setView] = useState('students');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                setLoading(true);
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) throw new Error('Authentication failed');

                const { data: userData, error: userFetchError } = await supabase
                    .from('users')
                    .select('admin, center_name')
                    .eq('id', user.id)
                    .single();

                if (userFetchError) throw new Error('Failed to fetch user info');

                let query;
                if (view === 'students') {
                    query = supabase.from('students').select('*');
                    if (!userData.admin) query = query.eq('center_name', userData.center_name);
                } else if (view === 'enquiries') {
                    query = supabase.from('enquiry_desk').select('*');
                    if (!userData.admin) query = query.eq('center_name', userData.center_name);
                } else {
                    query = supabase.from('assessments').select('*');
                    if (!userData.admin) query = query.eq('center_name', userData.center_name);
                }

                const { data, error } = await query;
                if (error) throw new Error(`Failed to fetch ${view}`);

                if (view === 'students') setStudents(data);
                else if (view === 'enquiries') setEnquiries(data);
                else setCertifications(data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [view]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const sortedRecords = [...(view === 'students' ? students : view === 'enquiries' ? enquiries : certifications)].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredRecords = sortedRecords.filter(record => {
        const query = searchQuery.toLowerCase();
        if (view === 'students') {
            return record.full_name?.toLowerCase().includes(query) ||
                   record.aadhar_no?.toLowerCase().includes(query) ||
                   record.course_name?.toLowerCase().includes(query);
        } else if (view === 'enquiries') {
            return record.candidate_name?.toLowerCase().includes(query) ||
                   record.reason_for_enquiry?.toLowerCase().includes(query) ||
                   record.interested_course?.toLowerCase().includes(query);
        } else {
            return record.candidate_name?.toLowerCase().includes(query) ||
                   record.enrolled_course?.toLowerCase().includes(query) ||
                   record.grade?.toLowerCase().includes(query);
        }
    });

    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record?")) return;
        const table = view === 'students' ? 'students' : view === 'enquiries' ? 'enquiry_desk' : 'assessments';
        const { error } = await supabase.from(table).delete().match({ id });
        if (!error) {
            if (view === 'students') setStudents(students.filter(s => s.id !== id));
            else if (view === 'enquiries') setEnquiries(enquiries.filter(e => e.id !== id));
            else setCertifications(certifications.filter(c => c.id !== id));
        }
    };

    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <section className="bg-base-200 min-h-screen p-3 sm:p-5">
            <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                <div className="bg-base-100 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-center mb-4 text-base-content">
                        {view === 'students' ? 'Student Records' : view === 'enquiries' ? 'Enquiry Records' : 'Certifications'}
                    </h1>

                    <div className="flex gap-3 mb-4 justify-center">
                        <button onClick={() => setView('students')} className={`px-4 py-2 text-sm font-medium rounded-lg ${view === 'students' ? 'bg-primary text-white' : 'bg-base-300'}`}>
                            Students
                        </button>
                        <button onClick={() => setView('enquiries')} className={`px-4 py-2 text-sm font-medium rounded-lg ${view === 'enquiries' ? 'bg-primary text-white' : 'bg-base-300'}`}>
                            Enquiries
                        </button>
                        <button onClick={() => setView('certifications')} className={`px-4 py-2 text-sm font-medium rounded-lg ${view === 'certifications' ? 'bg-primary text-white' : 'bg-base-300'}`}>
                            Certifications
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                        <input
                            type="text"
                            className="w-full md:w-1/2 p-2 border rounded-lg"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        {view === 'students' && (
                            <button
                                onClick={() => navigate('/form')}
                                className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-primary-content bg-primary hover:bg-primary/80"
                            >
                                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                                </svg>
                                Add Student
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-base-200">
                                <tr>
                                    <th className="px-4 py-3">S.No</th>
                                    {view === 'students' && (
                                        <>
                                            <th className="px-4 py-3" onClick={() => handleSort('full_name')}>Name</th>
                                            <th className="px-4 py-3" onClick={() => handleSort('aadhar_no')}>Aadhar</th>
                                            <th className="px-4 py-3" onClick={() => handleSort('course_name')}>Course</th>
                                            <th className="px-4 py-3" onClick={() => handleSort('age')}>Age</th>
                                            <th className="px-4 py-3">Actions</th>
                                        </>
                                    )}
                                    {view === 'enquiries' && (
                                        <>
                                            <th className="px-4 py-3">Candidate</th>
                                            <th className="px-4 py-3">Reason</th>
                                            <th className="px-4 py-3">Course</th>
                                            <th className="px-4 py-3">Location</th>
                                            <th className="px-4 py-3">Contact</th>
                                            <th className="px-4 py-3">Placement</th>
                                            <th className="px-4 py-3">Enquiry Date</th>
                                            <th className="px-4 py-3">Actions</th>
                                        </>
                                    )}
                                    {view === 'certifications' && (
    <>
        <th className="px-4 py-3">Candidate</th>
        <th className="px-4 py-3">Course</th>
        <th className="px-4 py-3">Result</th>
        <th className="px-4 py-3">Grade Marks</th>
        
        <th className="px-4 py-3">Certificate Date</th>
        <th className="px-4 py-3">Actions</th>
    </>
)}

                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {currentRecords.length > 0 ? currentRecords.map((record, index) => (
                                        <motion.tr
                                            key={record.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-b"
                                        >
                                            <td className="px-4 py-3">{indexOfFirst + index + 1}</td>
                                            {view === 'students' && (
                                                <>
                                                    <td className="px-4 py-3">{record.full_name}</td>
                                                    <td className="px-4 py-3">{record.aadhar_no}</td>
                                                    <td className="px-4 py-3">{record.course_name}</td>
                                                    <td className="px-4 py-3">{record.age}</td>
                                                    <td className="px-4 py-3 flex gap-2">
                                                        <button onClick={() => navigate(`/form?id=${record.id}`)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                                                        <button onClick={() => handleDelete(record.id)}>
                                                            <Trash2 className="text-red-500 hover:text-red-700" size={18} />
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                            {view === 'enquiries' && (
                                                <>
                                                    <td className="px-4 py-3">{record.candidate_name}</td>
                                                    <td className="px-4 py-3">{record.reason_for_enquiry}</td>
                                                    <td className="px-4 py-3">{record.interested_course}</td>
                                                    <td className="px-4 py-3">{record.location}</td>
                                                    <td className="px-4 py-3">{record.contact_details}</td>
                                                    <td className="px-4 py-3">{record.interest_in_placement ? 'Yes' : 'No'}</td>
                                                    <td className="px-4 py-3">{record.enquiry_date}</td>
                                                    <td className="px-4 py-3">
                                                        <button onClick={() => handleDelete(record.id)}>
                                                            <Trash2 className="text-red-500 hover:text-red-700" size={18} />
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                            {view === 'certifications' && (
    <>
        <td className="px-4 py-3">{record.candidate_name}</td>
        <td className="px-4 py-3">{record.enrolled_course}</td>
        <td className="px-4 py-3">{record.result}</td>
        <td className="px-4 py-3">{record.grade_marks}</td> {/* 👈 grade points shown here */}
        
        <td className="px-4 py-3">{record.certificate_issue_date}</td>
        <td className="px-4 py-3">
            <button onClick={() => handleDelete(record.id)}>
                <Trash2 className="text-red-500 hover:text-red-700" size={18} />
            </button>
        </td>
    </>
)}

                                        </motion.tr>
                                    )) : (
                                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <td colSpan="8" className="text-center py-8 text-gray-500">
                                                No {view} found.
                                            </td>
                                        </motion.tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center mt-6">
                        <div className="flex items-center space-x-2">
                            {Array.from({ length: totalPages }, (_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`px-3 py-1 rounded-lg ${currentPage === idx + 1 ? 'bg-primary text-white' : 'bg-base-300 hover:bg-base-400'}`}
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

export default RecordsTable;
