


import { useState } from 'react';
import { supabase } from '../client';

const Assessments = () => {
  const [formData, setFormData] = useState({
    candidate_name: '',
    contact_details: '',
    enrolled_course: '',
    result: '',
    grade_marks: '',
    certificate_issue_date: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('assessments').insert([formData]);
    if (error) {
      setMessage('Failed to submit. Please try again.');
      console.error(error);
    } else {
      setMessage('Assessment submitted successfully!');
      setFormData({
        candidate_name: '',
        contact_details: '',
        enrolled_course: '',
        result: '',
        grade_marks: '',
        certificate_issue_date: ''
      });
    }
  };

  const handleReset = () => {
    setFormData({
      candidate_name: '',
      contact_details: '',
      enrolled_course: '',
      result: '',
      grade_marks: '',
      certificate_issue_date: ''
    });
    setMessage('');
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Assessment & Certification</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="candidate_name"
          type="text"
          placeholder="Candidate Name"
          value={formData.candidate_name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          name="contact_details"
          type="text"
          placeholder="Contact Details"
          value={formData.contact_details}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          name="enrolled_course"
          type="text"
          placeholder="Enrolled Course"
          value={formData.enrolled_course}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <select
          name="result"
          value={formData.result}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Result</option>
          <option value="Pass">Pass</option>
          <option value="Fail">Fail</option>
        </select>
        <input
          name="grade_marks"
          type="text"
          placeholder="Grade/Marks"
          value={formData.grade_marks}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          name="certificate_issue_date"
          type="date"
          value={formData.certificate_issue_date}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <div className="flex space-x-4">
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Submit Assessment
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
          >
            Reset
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
};

export default Assessments;
