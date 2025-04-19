'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../client'; // Supabase client
import { useNavigate } from 'react-router-dom';

const MultiStepForm = ({ initialData, isEditMode, studentId }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState(
        initialData || {
            // Step 1: Personal Details
            full_name: '',
            email: '',
            mobile_no: '',
            aadhar_no: '',
            gender: '',
            date_of_birth: '',
            age: '',
            address: '',
            religion: '',

            // Step 2: Registration Details
            date_of_registration: '',
            mode_of_registration: '',
            qualification: '',
            working_status: false,
            family_income: '',
            purpose: '',
            prior_experience: '',
            job_required: false,
            interest_field: '',
            center_name: '',
            heard_about: '',
            occupation: '',

            // Step 3: Course & Payment Details
            course_name: '',
            total_course_fee: '',
            nsdc_certificate_fees: '',
            amount_paid_1: '',
            amount_paid_2: '',
            amount_paid_3: '',
            amount_paid_4: '',
            fee_outstanding: '',
            receipt_number: '',
            bank_utr_1: '',
            fee_receipt_date_1: '',
            bank_utr_2: '',
            fee_receipt_date_2: '',
            bank_utr_3: '',
            fee_receipt_date_3: '',
            bank_utr_4: '',
            fee_receipt_date_4: '',
            batch_start_date: '',
            batch_end_date: '',
        }
    );

    // Function to calculate age from date of birth
    const calculateAge = (dateString) => {
        if (!dateString) return '';
        
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age.toString();
    };

    // Check if the user is logged in on component mount
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/login'); // Redirect to login if not authenticated
            } else {
                setUser(user);
                if (!isEditMode) {
                    // Pre-fill email for new students
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        email: user.email,
                    }));
                }
            }
        };

        checkUser();
    }, [navigate, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Handle updating the form data
        const updatedFormData = { ...formData, [name]: value };
    
        // If date_of_birth changes, calculate and update age
        if (name === 'date_of_birth') {
            updatedFormData.age = calculateAge(value);
        }
    
        // Automatically update fee_outstanding if relevant fields change
        if (
            name === 'total_course_fee' ||
            name.startsWith('amount_paid_')
        ) {
            // Recalculate the fee_outstanding using the UPDATED values
            const totalPaid = 
                (parseFloat(updatedFormData.amount_paid_1) || 0) +
                (parseFloat(updatedFormData.amount_paid_2) || 0) +
                (parseFloat(updatedFormData.amount_paid_3) || 0) +
                (parseFloat(updatedFormData.amount_paid_4) || 0);
    
            const totalFee = parseFloat(updatedFormData.total_course_fee) || 0;
    
            const feeOutstanding = totalFee - totalPaid;
    
            updatedFormData.fee_outstanding = feeOutstanding >= 0 ? feeOutstanding.toFixed(2) : 0; // Ensure fee_outstanding is never negative
        }
    
        setFormData(updatedFormData);
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    const goToStep = (stepNumber) => setStep(stepNumber);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!user) throw new Error('User is not authenticated.');

            // Prepare data with numeric fields converted from empty strings to null
            const submissionData = {
                ...formData,
                total_course_fee: formData.total_course_fee || null,
                nsdc_certificate_fees: formData.nsdc_certificate_fees || null,
                amount_paid_1: formData.amount_paid_1 || null,
                amount_paid_2: formData.amount_paid_2 || null,
                amount_paid_3: formData.amount_paid_3 || null,
                amount_paid_4: formData.amount_paid_4 || null,
                fee_outstanding: formData.fee_outstanding || null,
                family_income: formData.family_income || null,
                age: formData.age || null
            };

            if (isEditMode) {
                // Update existing student
                const { data, error: updateError } = await supabase
                    .from('students')
                    .update(submissionData)
                    .eq('id', studentId);

                if (updateError) throw new Error(updateError.message);

                console.log('Student updated successfully:', data);
                alert('Student updated successfully!');
            } else {
                // Insert new student
                const { data, error: insertError } = await supabase
                    .from('students')
                    .insert([submissionData]);

                if (insertError) throw new Error(insertError.message);

                console.log('Student added successfully:', data);
                alert('Student added successfully!');
            }

            navigate('/table'); // Redirect to dashboard
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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

    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
    };

    const formatBoolean = (value) => {
        return value ? 'Yes' : 'No';
    };

    const experienceLabels = {
        none: "No prior experience",
        beginner: "Beginner (Less than 1 year)",
        intermediate: "Intermediate (1-3 years)",
        advanced: "Advanced (3+ years)",
        professional: "Professional (Working in this field)"
    };

    const renderReviewSection = () => {
        return (
            <div className="space-y-6">
                <div className="bg-base-200 p-4 rounded-lg relative">
                    <h3 className="font-bold text-lg mb-3">Personal Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                            <p>{formData.full_name || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p>{formData.email || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Mobile No</p>
                            <p>{formData.mobile_no || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Aadhar No</p>
                            <p>{formData.aadhar_no || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Gender</p>
                            <p>
                                {formData.gender === 'M' ? 'Male' : 
                                 formData.gender === 'F' ? 'Female' : 
                                 formData.gender === 'O' ? 'Other' : 'Not provided'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                            <p>{formatDate(formData.date_of_birth)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Age</p>
                            <p>{formData.age ? `${formData.age} years` : 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p>{formData.address || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Religion</p>
                            <p>{formData.religion || 'Not provided'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => goToStep(1)}
                        className="absolute bottom-4 right-4 text-primary hover:text-primary/80"
                        title="Edit Personal Details"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>

                <div className="bg-base-200 p-4 rounded-lg relative">
                    <h3 className="font-bold text-lg mb-3">Registration Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Date of Registration</p>
                            <p>{formatDate(formData.date_of_registration)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Mode of Registration</p>
                            <p>{formData.mode_of_registration || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Qualification</p>
                            <p>{formData.qualification || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Working Status</p>
                            <p>{formatBoolean(formData.working_status)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Family Income</p>
                            <p>{formData.family_income || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Purpose</p>
                            <p>{formData.purpose || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Prior Experience in Field</p>
                            <p>{experienceLabels[formData.prior_experience] || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Job Required</p>
                            <p>{formatBoolean(formData.job_required)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Interest Field</p>
                            <p>{formData.interest_field || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Center Name</p>
                            <p>{formData.center_name || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">How heard about us</p>
                            <p>{formData.heard_about || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Occupation</p>
                            <p>{formData.occupation || 'Not provided'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => goToStep(2)}
                        className="absolute bottom-4 right-4 text-primary hover:text-primary/80"
                        title="Edit Registration Details"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>

                <div className="bg-base-200 p-4 rounded-lg relative">
                    <h3 className="font-bold text-lg mb-3">Course & Payment Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Course Name</p>
                            <p>{formData.course_name || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Course Fee</p>
                            <p>{formData.total_course_fee || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">NSDC Certificate Fees</p>
                            <p>{formData.nsdc_certificate_fees || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Fee Outstanding</p>
                            <p>{formData.fee_outstanding || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Receipt Number</p>
                            <p>{formData.receipt_number || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Batch Start Date</p>
                            <p>{formatDate(formData.batch_start_date)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Batch End Date</p>
                            <p>{formatDate(formData.batch_end_date)}</p>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <h4 className="font-medium mb-2">Payment Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((num) => (
                                (formData[`amount_paid_${num}`] || formData[`bank_utr_${num}`] || formData[`fee_receipt_date_${num}`]) && (
                                    <div key={num} className="bg-base-100 p-3 rounded-lg">
                                        <p className="font-medium">Payment {num}</p>
                                        <p>Amount: {formData[`amount_paid_${num}`] || '0'}</p>
                                        <p>Bank UTR: {formData[`bank_utr_${num}`] || 'Not provided'}</p>
                                        <p>Date: {formatDate(formData[`fee_receipt_date_${num}`])}</p>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => goToStep(3)}
                        className="absolute bottom-4 right-4 text-primary hover:text-primary/80"
                        title="Edit Course & Payment Details"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="text-red-500 text-sm mt-2">{error}</div>
                )}

                <div className="flex justify-between pt-4">
                    <button 
                        type="button" 
                        onClick={prevStep}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                        Back
                    </button>
                    <button 
                        type="submit" 
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <section className="bg-base-300 min-h-screen flex items-center justify-center">
            <div className="my-10 w-full max-w-2xl bg-base-100 rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-base-content text-center mb-4">
                    {step <= 3 ? `Student Registration (Step ${step})` : 'Review Your Application'}
                </h1>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {step === 1 && (
                        <>
                            {/* Step 1: Personal Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Full Name</label>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Mobile No</label>
                                    <input type="text" name="mobile_no" value={formData.mobile_no} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Aadhar No</label>
                                    <input type="text" name="aadhar_no" value={formData.aadhar_no} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content">
                                        <option value="">Select</option>
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                        <option value="O">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        name="date_of_birth" 
                                        value={formData.date_of_birth} 
                                        onChange={handleChange} 
                                        required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Age</label>
                                    <input 
                                        type="Age" 
                                        name="Age" 
                                        value={formData.age} 
                                        onChange={handleChange} 
                                        required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Religion</label>
                                    <select 
                                        name="religion" 
                                        value={formData.religion} 
                                        onChange={handleChange} 
                                        required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content"
                                    >
                                        <option value="">Select</option>
                                        <option value="Hindu">Hindu</option>
                                        <option value="Muslim">Muslim</option>
                                        <option value="Christian">Christian</option>
                                        <option value="Sikh">Sikh</option>
                                        <option value="Buddhist">Buddhist</option>
                                        <option value="Jain">Jain</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-base-content mb-1">Address</label>
                                <textarea 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleChange} 
                                    required
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content"
                                    rows="3"
                                />
                            </div>

                            <button type="button" onClick={nextStep}
                                className="w-full bg-primary text-white hover:bg-primary/95 font-medium rounded-lg text-sm px-5 py-2.5">
                                Next
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* Step 2: Registration Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Date of Registration</label>
                                    <input type="date" name="date_of_registration" value={formData.date_of_registration} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Mode of Registration</label>
                                    <input type="text" name="mode_of_registration" value={formData.mode_of_registration} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Qualification</label>
                                    <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Occupation</label>
                                    <input 
                                        type="text" 
                                        name="occupation" 
                                        value={formData.occupation} 
                                        onChange={handleChange} 
                                        required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Working Status</label>
                                    <select
                                        name="working_status"
                                        value={formData.working_status}
                                        onChange={(e) => setFormData({ ...formData, working_status: e.target.value === 'true' })}
                                        required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content"
                                    >
                                        <option value="">Select</option>
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Family Income</label>
                                    <input type="text" name="family_income" value={formData.family_income} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Purpose</label>
                                    <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Job Required</label>
                                    <select
                                        name="job_required"
                                        value={formData.job_required}
                                        onChange={(e) => setFormData({ ...formData, job_required: e.target.value === 'true' })}
                                        required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content"
                                    >
                                        <option value="">Select</option>
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Interest Field</label>
                                    <input type="text" name="interest_field" value={formData.interest_field} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Prior Experience in Field</label>
                                    <select
                                        name="prior_experience"
                                        value={formData.prior_experience}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content"
                                    >
                                        <option value="">Select Option</option>
                                        <option value="none">No prior experience</option>
                                        <option value="beginner">Beginner (Less than 1 year)</option>
                                        <option value="intermediate">Intermediate (1-3 years)</option>
                                        <option value="advanced">Advanced (3+ years)</option>
                                        <option value="professional">Professional (Working in this field)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-base-content mb-1">Center Name</label>
                                <select
                                    name="center_name"
                                    value={formData.center_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content"
                                >
                                    <option value="" disabled>Select a Center</option>
                                    {centers.map((center, index) => (
                                        <option key={index} value={center}>{center}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">How did you hear about Vedanta Foundation?</label>
                                    <select
                                        name="heard_about"
                                        value={formData.heard_about}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content"
                                    >
                                        <option value="">Select</option>
                                        <option value="Friend/Family">Friend/Family</option>
                                        <option value="Social Media">Social Media</option>
                                        <option value="Newspaper">Newspaper</option>
                                        <option value="Poster/Banner">Poster/Banner</option>
                                        <option value="Center Visit">Center Visit</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                            <div className="flex justify-between">
                                <button type="button" onClick={prevStep} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Back</button>
                                <button type="button" onClick={nextStep} className="bg-primary text-white px-4 py-2 rounded-lg">Next</button>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            {/* Step 3: Course & Payment Details */}
                            <div>
                                <label className="block text-sm font-medium text-base-content mb-1">Course Name</label>
                                <input type="text" name="course_name" value={formData.course_name} onChange={handleChange} required
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Total Course Fee</label>
                                    <input type="text" name="total_course_fee" value={formData.total_course_fee} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">NSDC Certificate Fees</label>
                                    <input type="text" name="nsdc_certificate_fees" value={formData.nsdc_certificate_fees} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((num) => (
                                    <div key={num}>
                                        <label className="block text-sm font-medium text-base-content mb-1">Amount Paid {num}</label>
                                        <input type="text" name={`amount_paid_${num}`} value={formData[`amount_paid_${num}`]} onChange={handleChange} required
                                            className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-base-content mb-1">Fee Outstanding</label>
                                <input type="text" name="fee_outstanding" value={formData.fee_outstanding} onChange={handleChange} required
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-base-content mb-1">Reciept Number</label>
                                <input type="text" name="receipt_number" value={formData.receipt_number} onChange={handleChange} required
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Batch Start Date</label>
                                    <input 
                                        type="date" 
                                        name="batch_start_date" 
                                        value={formData.batch_start_date} 
                                        onChange={handleChange} 
                                        required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Batch End Date</label>
                                    <input 
                                        type="date" 
                                        name="batch_end_date" 
                                        value={formData.batch_end_date} 
                                        onChange={handleChange} 
                                        required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {[1, 2, 3, 4].map((num) => (
                                    <div key={num} className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-base-content mb-1">Bank UTR {num}</label>
                                            <input
                                                type="text"
                                                name={`bank_utr_${num}`}
                                                value={formData[`bank_utr_${num}`]}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-base-content mb-1">Fee Receipt Date {num}</label>
                                            <input
                                                type="date"
                                                name={`fee_receipt_date_${num}`}
                                                value={formData[`fee_receipt_date_${num}`]}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between">
                                <button type="button" onClick={prevStep} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Back</button>
                                <button type="button" onClick={nextStep} className="bg-primary text-white px-4 py-2 rounded-lg">Review Application</button>
                            </div>
                        </>
                    )}

                    {step === 4 && renderReviewSection()}
                </form>
            </div>
        </section>
    );
};

export default MultiStepForm;