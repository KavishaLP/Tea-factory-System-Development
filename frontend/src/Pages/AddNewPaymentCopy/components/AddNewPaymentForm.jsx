import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddNewPaymentForm() {
    const [formData, setFormData] = useState({
        userId: "",
        paymentPerKilo: "",
        finalTeaKilos: "",
        paymentForFinalTeaKilos: "",
        additionalPayments: "",
        transport: "",
        directPayments: "",
        finalAmount: "",
        advances: "",
        teaPackets: "",
        fertilizer: "",
        finalPayment: "",
        month: new Date().getMonth() + 1, // Current month (1-12)
        year: new Date().getFullYear()    // Current year
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState("");
    const [confirmationType, setConfirmationType] = useState("");

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Fetch user suggestions from backend
    const fetchUserSuggestions = async (query) => {
        try {
            const response = await axios.post(
                'http://localhost:8081/api/manager/search-farmers-indb',
                { query },
                { withCredentials: true }
            );

            if (response.data.Status === 'Success') {
                setUserSuggestions(response.data.farmers.map(farmer => farmer.id));
            } else {
                setUserSuggestions([]);
            }
        } catch (error) {
            console.error('Error fetching user suggestions:', error);
            setUserSuggestions([]);
        }
    };

    // Fetch user details with month/year when a user is selected
    const fetchUserDetails = async (userId) => {
        console.log(userId)
        try {
            const response = await axios.post(
                'http://localhost:8081/api/manager/get-farmer-paymemts',
                { 
                    userId,
                    month: formData.month,
                    year: formData.year
                },
                { withCredentials: true }
            );
            console.log(response, formData.month, formData.year)
            if (response.data.Status === 'Success') {
                setFormData(prev => ({
                    ...prev,
                    finalTeaKilos: response.data.finalTeaKilos || "0",
                    transport: response.data.transport || "0",
                    advances: response.data.advances || "0"
                }));
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError('Failed to fetch details for this user');
        }
    };

    // Handle month navigation
    const navigateMonth = (direction) => {
        setFormData(prev => {
            let newMonth = prev.month;
            let newYear = prev.year;

            if (direction === "prev") {
                if (newMonth === 1) {
                    newMonth = 12;
                    newYear -= 1;
                } else {
                    newMonth -= 1;
                }
            } else {
                if (newMonth === 12) {
                    newMonth = 1;
                    newYear += 1;
                } else {
                    newMonth += 1;
                }
            }

            return { ...prev, month: newMonth, year: newYear };
        });
    };

    // Handle user ID input changes
    const handleUserIdChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, userId: value }));

        if (value.length >= 2) {
            fetchUserSuggestions(value);
            setShowSuggestions(true);
        } else {
            setUserSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Handle suggestion selection
    const handleSuggestionClick = (userId) => {
        setFormData(prev => ({ ...prev, userId }));
        setUserSuggestions([]);
        setShowSuggestions(false);
        fetchUserDetails(userId);
    };

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        const positiveNumberPattern = /^\d*\.?\d*$/;

        if (name !== "userId" && value !== "" && !positiveNumberPattern.test(value)) {
            setError("Please enter a valid positive number");
            return;
        } else {
            setError("");
        }

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Calculate derived values
    useEffect(() => {
        const { paymentPerKilo, finalTeaKilos } = formData;
        if (paymentPerKilo && finalTeaKilos) {
            const paymentForFinalTeaKilos = parseFloat(paymentPerKilo) * parseFloat(finalTeaKilos);
            setFormData(prevData => ({
                ...prevData,
                paymentForFinalTeaKilos: paymentForFinalTeaKilos,
            }));
        }
    }, [formData.paymentPerKilo, formData.finalTeaKilos]);

    useEffect(() => {
        const { paymentForFinalTeaKilos, additionalPayments, transport, directPayments } = formData;
        const finalAmount =
            (parseFloat(paymentForFinalTeaKilos) || 0) +
            (parseFloat(additionalPayments) || 0) +
            (parseFloat(transport) || 0) +
            (parseFloat(directPayments) || 0);

        setFormData(prevData => ({
            ...prevData,
            finalAmount: finalAmount.toFixed(2),
        }));
    }, [formData.paymentForFinalTeaKilos, formData.additionalPayments, formData.transport, formData.directPayments]);

    useEffect(() => {
        const { finalAmount, advances, teaPackets, fertilizer } = formData;
        const totalDeductions =
            (parseFloat(advances) || 0) +
            (parseFloat(teaPackets) || 0) +
            (parseFloat(fertilizer) || 0);

        const finalPayment = (parseFloat(finalAmount) || 0) - totalDeductions;

        setFormData(prevData => ({
            ...prevData,
            finalPayment: finalPayment.toFixed(2),
        }));
    }, [formData.finalAmount, formData.advances, formData.teaPackets, formData.fertilizer]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const positiveNumberPattern = /^\d+(\.\d+)?$/;

        // Validate required fields
        if (
            !positiveNumberPattern.test(formData.finalTeaKilos) ||
            !positiveNumberPattern.test(formData.paymentPerKilo)
        ) {
            setError("Please enter valid positive numbers for required fields.");
            return;
        }

        // Validate optional fields (must be positive if not empty)
        const optionalFields = [
            'additionalPayments',
            'transport',
            'directPayments',
            'advances',
            'teaPackets',
            'fertilizer'
        ];

        const invalidOptionalFields = optionalFields.filter(field => {
            return formData[field] && !positiveNumberPattern.test(formData[field]);
        });

        if (invalidOptionalFields.length > 0) {
            setError("Optional fields must contain valid positive numbers or be empty.");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:8081/api/manager/add-Farmer-Payment',
                formData,
                { withCredentials: true }
            );

            if (response.data && response.data.Status === "Success") {
                setConfirmationMessage("Payment added successfully!");
                setConfirmationType("success");
                // Reset form
                setFormData({
                    userId: "",
                    paymentPerKilo: "",
                    finalTeaKilos: "",
                    paymentForFinalTeaKilos: "",
                    additionalPayments: "",
                    transport: "",
                    directPayments: "",
                    finalAmount: "",
                    advances: "",
                    teaPackets: "",
                    fertilizer: "",
                    finalPayment: "",
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear()
                });
            } else {
                setConfirmationMessage(response.data.Error || 'Failed to add payment. Please try again.');
                setConfirmationType("error");
            }
        } catch (error) {
            setConfirmationMessage(
                error.response?.data?.message || 'An error occurred. Please try again.'
            );
            setConfirmationType("error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            {error && <div className="error-message">{error}</div>}
            {confirmationMessage && (
                <div className={`confirmation-message ${confirmationType}`}>
                    {confirmationMessage}
                </div>
            )}

            {/* Month Navigation */}
            <div className="month-navigation">
                <button type="button" onClick={() => navigateMonth("prev")}>
                    &lt; Previous
                </button>
                <h3>
                    {monthNames[formData.month - 1]} {formData.year}
                </h3>
                <button type="button" onClick={() => navigateMonth("next")}>
                    Next &gt;
                </button>
            </div>

            <div className="input-group">
                <label>User ID</label>
                <input
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleUserIdChange}
                    required
                    placeholder="Start typing to search user IDs"
                    autoComplete="off"
                />
                {showSuggestions && userSuggestions.length > 0 && (
                    <ul className="suggestions-dropdown">
                        {userSuggestions.map((userId, index) => (
                            <li key={index} onClick={() => handleSuggestionClick(userId)}>
                                {userId}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="input-group">
                <label>Final Tea Kilos</label>
                <input
                    type="text"
                    name="finalTeaKilos"
                    value={formData.finalTeaKilos}
                    onChange={handleChange}
                    required
                    placeholder="Enter final tea kilos"
                    readOnly
                />
            </div>

            <div className="input-group">
                <label>Payment For 1 Kilo</label>
                <input
                    type="text"
                    name="paymentPerKilo"
                    value={formData.paymentPerKilo}
                    onChange={handleChange}
                    required
                    placeholder="Enter payment per kilo"
                />
            </div>

            <div className="input-group">
                <label>Payment For Final Tea Kilos</label>
                <input
                    type="text"
                    name="paymentForFinalTeaKilos"
                    value={formData.paymentForFinalTeaKilos}
                    onChange={handleChange}
                    placeholder="Payment for final tea kilos"
                    readOnly
                />
            </div>

            <div className="input-group">
                <label>Additional Payments</label>
                <div className="deduction-fields">
                    <input
                        type="text"
                        name="additionalPayments"
                        value={formData.additionalPayments}
                        onChange={handleChange}
                        placeholder="Additional"
                    />
                    <input
                        type="text"
                        name="transport"
                        value={formData.transport}
                        onChange={handleChange}
                        placeholder="Transport"
                        readOnly
                    />
                </div>
            </div>

            <div className="input-group">
                <label>Direct Payments</label>
                <input
                    type="text"
                    name="directPayments"
                    value={formData.directPayments}
                    onChange={handleChange}
                    placeholder="Enter direct payments"
                />
            </div>

            <div className="input-group">
                <label>Final Amount</label>
                <input
                    type="text"
                    name="finalAmount"
                    value={formData.finalAmount}
                    onChange={handleChange}
                    placeholder="Enter final amount"
                    readOnly
                />
            </div>

            <div className="input-group">
                <label>Deductions</label>
                <div className="deduction-fields">
                    <input
                        type="text"
                        name="advances"
                        value={formData.advances}
                        onChange={handleChange}
                        placeholder="Advances"
                        readOnly
                    />
                    <input
                        type="text"
                        name="teaPackets"
                        value={formData.teaPackets}
                        onChange={handleChange}
                        placeholder="Tea Packets"
                        readOnly
                    />
                    <input
                        type="text"
                        name="fertilizer"
                        value={formData.fertilizer}
                        onChange={handleChange}
                        placeholder="Fertilizer"
                        readOnly
                    />
                </div>
            </div>

            <div className="input-group">
                <label>Final Payment</label>
                <input
                    type="text"
                    name="finalPayment"
                    value={formData.finalPayment}
                    onChange={handleChange}
                    placeholder="Final Payment"
                    readOnly
                />
            </div>

            <button type="submit" disabled={isLoading} className="submit-button">
                {isLoading ? "Adding Payment..." : "Add Payment"}
            </button>
        </form>
    );
}

export default AddNewPaymentForm;