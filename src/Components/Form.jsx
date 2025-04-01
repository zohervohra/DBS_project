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
            // Default values for new student
            full_name: 'Rohan Sharma',
            email: 'rohan.sharma@example.com',
            mobile_no: '9876543210',
            aadhar_no: '123456789012',
            gender: 'M',
            date_of_birth: '2000-05-15',  // YYYY-MM-DD format
            age: 24,

            // Step 2: Registration Details
            date_of_registration: '2025-03-10',  // YYYY-MM-DD format
            mode_of_registration: 'Online',
            qualification: 'B.Tech',
            working_status: true,
            family_income: 500000,
            purpose: 'Skill Development',
            job_required: true,
            interest_field: 'Web Development',
            center_name: 'VTC Vithalwadi',

            // Step 3: Course & Payment Details
            course_name: 'FullStack ',
            total_course_fee: 50000,
            nsdc_certificate_fees: 5000,
            amount_paid_1: 15000,
            amount_paid_2: 10000,
            amount_paid_3: 5000,
            amount_paid_4: 5000,
            fee_outstanding: 15000,
            receipt_number: 'REC123456',
            bank_utr_1: 'UTR987654321',
            fee_receipt_date_1: '2025-03-01',
            bank_utr_2: 'UTR123456789',
            fee_receipt_date_2: '2025-03-05',
            bank_utr_3: 'UTR567891234',
            fee_receipt_date_3: '2025-03-10',
            bank_utr_4: 'UTR234567890',
            fee_receipt_date_4: '2025-03-12',
        }
    );



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
    
        // Automatically update fee_outstanding if relevant fields change
        if (
            name === 'total_course_fee' ||
            name.startsWith('amount_paid_')
        ) {
            // Recalculate the fee_outstanding
            const totalPaid = 
                (parseFloat(formData.amount_paid_1) || 0) +
                (parseFloat(formData.amount_paid_2) || 0) +
                (parseFloat(formData.amount_paid_3) || 0) +
                (parseFloat(formData.amount_paid_4) || 0);
    
            const totalFee = parseFloat(updatedFormData.total_course_fee) || 0;
    
            const feeOutstanding = totalFee - totalPaid;
    
            updatedFormData.fee_outstanding = feeOutstanding >= 0 ? feeOutstanding : 0; // Ensure fee_outstanding is never negative
        }
    
        setFormData(updatedFormData);
    };
    

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!user) throw new Error('User is not authenticated.');

            if (isEditMode) {
                // Update existing student
                const { data, error: updateError } = await supabase
                    .from('students')
                    .update({ ...formData })
                    .eq('id', studentId);

                if (updateError) throw new Error(updateError.message);

                console.log('Student updated successfully:', data);
                alert('Student updated successfully!');
            } else {
                // Insert new student
                const { data, error: insertError } = await supabase
                    .from('students')
                    .insert([{ ...formData }]);

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

    let centers = [
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
    ]
    


    return (
        // ... (existing JSX)
        <section className="bg-base-300 min-h-screen flex items-center justify-center">
            <div className="my-10 w-full max-w-2xl bg-base-100 rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-base-content text-center mb-4">
                    Student Registration {step === 1 ? ' (Step 1)' : step === 2 ? ' (Step 2)' : ' (Step 3)'}
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
                                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-base-content mb-1">Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} required
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Family Income</label>
                                    <input type="text" name="family_income" value={formData.family_income} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Purpose</label>
                                    <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                <div>
                                    <label className="block text-sm font-medium text-base-content mb-1">Interest Field</label>
                                    <input type="text" name="interest_field" value={formData.interest_field} onChange={handleChange} required
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 text-base-content" />
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
                                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg">Submit</button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </section>
    );
};

export default MultiStepForm;




