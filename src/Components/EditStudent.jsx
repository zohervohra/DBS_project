
import { useState, useEffect } from 'react';
import { supabase } from '../client'; // Supabase client
import { useNavigate, useParams } from 'react-router-dom';
import MultiStepForm from './Form'; // Import the form component

const EditStudent = () => {
  const { id } = useParams(); // Get the student ID from the URL parameter
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch student data based on the ID
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw new Error(fetchError.message);
        if (!data) throw new Error('Student not found');

        setStudentData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!studentData) {
    return <p className="text-center text-red-500">Student not found</p>;
  }

  return (
    <MultiStepForm
      initialData={studentData} // Pass the fetched data to the form
      isEditMode={true} // Indicate that this is an edit form
      studentId={id} // Pass the student ID for updating
    />
  );
};

export default EditStudent;