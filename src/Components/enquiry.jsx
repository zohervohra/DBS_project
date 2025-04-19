import React, { useState } from 'react';
import { supabase } from '../client'; // Import the Supabase client

const Enquiry = () => {
  const [formData, setFormData] = useState({
    candidateName: '',
    reason: '',
    course: '',
    location: '',
    contact: '',
    placementInterest: 'No',
    date: '', // Added date field
  });

  const centers = [
    "AI Zone, Kanpur",
    "Agastya Tech Zone Computer Institute, Myorpur, Duddhi, Sonbhadra",
    "Algavadi Village Panchayat",
    "Bhadohi Girls Intermediate School ,Near Post Office, Bhadohi",
    "Bicholim Village Panchayat",
    "Cuncolim Education Society",
    "DDB Tutorials - Pandeypur, Varanasi",
    "Danisara Foundation - Tailoring",
    "GIST",
    "Hireguntoor Computer  centre",
    "Hireguntoor Tailoring  centre",
    "Hirekenwadi Villae Panchayat",
    "IPDP",
    "K.V Computer Education, 1 DevnathPur ,Bhadohi",
    "Karntaka Skills Centre",
    "MB Computer Institute, Narayanpur, Mirzapur.",
    "Maharudra Association Society - II, Siripur, Mirzapur",
    "Maharudra Association Society, Suklaha, Mirzapur",
    "Mallphanatti Village Panchayat",
    "Malviya Classes - Sona Talab, Panchkoshi, Varanasi",
    "Mayem Village Panchayat",
    "Meghally Village Panchayat",
    "Mh Skill Centres ( Computer/Tailoring/Beautician)",
    "Muttudooru Village Panchayat",
    "Navelim Village Panchayat",
    "New Tailorng centre",
    "R.K Computer Education, Manda, Prayagraj",
    "R.R.COLONY ( Jharsuguda)",
    "RRC Centre - HZL - Zawar Mines , Udaipur",
    "Righ to Live Computer/Tailoring Centre",
    "S&G Computer Education Centre - Hathua Market,Varanasi",
    "Sesa technical Schools",
    "Sirigere Village Panchayat",
    "Solver Solutions, Naveen Market, Mirzapur",
    "Super Tech Computer Institute, Gopiganj, Bhadohi ",
    "Super Tech Computer Institute, Gyanpur, Bhadohi",
    "TSPL - RAIPUR",
    "VIT Classes Bardah ,Azamgarh",
    "VTC  Jalna Ambad",
    "VTC  Jalna Ankushnagar",
    "VTC  Jalna Barawale",
    "VTC  Jalna Tirthpuri",
    "VTC Vithalwadi",
    "Vedanta Girls PG College - Ringas",
    "Vidyaprabhodini College"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('enquiry_desk')
        .insert([
          {
            candidate_name: formData.candidateName,
            reason_for_enquiry: formData.reason,
            interested_course: formData.course,
            location: formData.location,
            contact_details: formData.contact,
            interest_in_placement: formData.placementInterest,
            enquiry_date: formData.date, // Send the date to the database
          },
        ]);

      if (error) {
        throw new Error(error.message);
      }

      console.log('Enquiry Submitted:', data);
      alert('Enquiry submitted successfully!');

      setFormData({
        candidateName: '',
        reason: '',
        course: '',
        location: '',
        contact: '',
        placementInterest: 'No',
        date: '', // Reset the date field
      });
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert(`Error submitting enquiry: ${error.message}`);
    }
  };

  const handleReset = () => {
    setFormData({
      candidateName: '',
      reason: '',
      course: '',
      location: '',
      contact: '',
      placementInterest: 'No',
      date: '', // Reset the date field
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Enquiry Form
        </h2>

        {/* Candidate Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Candidate Name</label>
          <input
            type="text"
            name="candidateName"
            value={formData.candidateName}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Reason for Enquiry */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Reason for Enquiry</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
          ></textarea>
        </div>

        {/* Interested Course */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Interested Course</label>
          <input
            type="text"
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Location Dropdown */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Location</label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select a location</option>
            {centers.map((center, index) => (
              <option key={index} value={center}>{center}</option>
            ))}
          </select>
        </div>

        {/* Contact Details */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Contact Details</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Interest in Placement */}
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">Interest in Placement?</label>
          <select
            name="placementInterest"
            value={formData.placementInterest}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* Date */}
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">Enquiry Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-x-4 justify-between">
          <button
            type="submit"
            className="w-1/2 bg-green-600 text-white py-3 rounded hover:bg-green-700 transition font-medium"
          >
            Submit Enquiry
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-1/2 bg-gray-600 text-white py-3 rounded hover:bg-gray-700 transition font-medium"
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default Enquiry;
