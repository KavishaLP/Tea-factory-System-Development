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
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

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

    // Fetch user details when a user is selected
    const fetchUserDetails = async (userId) => {
        try {
            const response = await axios.post(
                'http://localhost:8081/api/manager/get-details-related-to-user',
                { userId },
                { withCredentials: true }
            );

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

    // Calculate derived values whenever dependent fields change
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
        if (paymentForFinalTeaKilos || additionalPayments || transport || directPayments) {
            const finalAmount =
                (parseFloat(paymentForFinalTeaKilos) || 0) +
                (parseFloat(additionalPayments) || 0) +
                (parseFloat(transport) || 0) +
                (parseFloat(directPayments) || 0);

            setFormData(prevData => ({
                ...prevData,
                finalAmount: finalAmount.toFixed(2),
            }));
        }
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

        // Validate all numeric fields
        if (
            !positiveNumberPattern.test(formData.finalTeaKilos) ||
            !positiveNumberPattern.test(formData.paymentPerKilo) ||
            !positiveNumberPattern.test(formData.additionalPayments) ||
            !positiveNumberPattern.test(formData.transport) ||
            !positiveNumberPattern.test(formData.directPayments) ||
            !positiveNumberPattern.test(formData.advances) ||
            !positiveNumberPattern.test(formData.teaPackets) ||
            !positiveNumberPattern.test(formData.fertilizer)
        ) {
            setError("Please enter valid positive numbers for all payment fields.");
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
                alert("Payment added successfully!");
                // Reset form
                setFormData({
                    userId: "",
                    finalTeaKilos: "",
                    paymentPerKilo: "",
                    paymentForFinalTeaKilos: "",
                    additionalPayments: "",
                    directPayments: "",
                    finalPayment: "",
                    advances: "",
                    teaPackets: "",
                    fertilizer: "",
                    transport: "",
                    finalAmount: "",
                });
            } else {
                setError(response.data.Error || 'Failed to add payment. Please try again.');
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || 'Server error. Please try again.');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            {error && <p className="error-message">{error}</p>}

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