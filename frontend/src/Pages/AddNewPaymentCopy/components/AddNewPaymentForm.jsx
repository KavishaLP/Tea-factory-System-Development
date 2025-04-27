import React, { useState } from 'react';

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

    // User suggestion functions
    const handleUserIdChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, userId: value }));

        if (value.length >= 2) {
            // In a real app, this would fetch suggestions from backend
            setUserSuggestions([]);
            setShowSuggestions(true);
        } else {
            setUserSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Calculation effects
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

        // Recalculate dependent fields
        if (name === "paymentPerKilo" || name === "finalTeaKilos") {
            const paymentForFinalTeaKilos = parseFloat(formData.paymentPerKilo || 0) * parseFloat(formData.finalTeaKilos || 0);
            setFormData(prevData => ({
                ...prevData,
                paymentForFinalTeaKilos: paymentForFinalTeaKilos,
            }));
        }

        if (name === "paymentForFinalTeaKilos" || name === "additionalPayments" || name === "transport" || name === "directPayments") {
            const finalAmount =
                (parseFloat(formData.paymentForFinalTeaKilos) || 0) +
                (parseFloat(formData.additionalPayments) || 0) +
                (parseFloat(formData.transport) || 0) +
                (parseFloat(formData.directPayments) || 0);
            setFormData(prevData => ({
                ...prevData,
                finalAmount: finalAmount.toFixed(2),
            }));
        }

        if (name === "finalAmount" || name === "advances" || name === "teaPackets" || name === "fertilizer") {
            const totalDeductions =
                (parseFloat(formData.advances) || 0) +
                (parseFloat(formData.teaPackets) || 0) +
                (parseFloat(formData.fertilizer) || 0);
            const finalPayment = (parseFloat(formData.finalAmount) || 0) - totalDeductions;
            setFormData(prevData => ({
                ...prevData,
                finalPayment: finalPayment.toFixed(2),
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const positiveNumberPattern = /^\d+(\.\d+)?$/;

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

        // In a real app, this would submit to backend
        console.log("Form would be submitted:", formData);
        setTimeout(() => {
            setIsLoading(false);
            alert("Payment added successfully (demo)!");
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
        }, 1000);
    };

    const handleSuggestionClick = (userId) => {
        setFormData(prev => ({ ...prev, userId }));
        setUserSuggestions([]);
        setShowSuggestions(false);
        // In a real app, this would fetch user details
        setFormData(prev => ({
            ...prev,
            finalTeaKilos: "0",
            transport: "0",
            advances: "0"
        }));
    };

    return (
        <form onSubmit={handleSubmit}>
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
                    placeholder="Direct"
                />
            </div>

            <div className="input-group">
                <label>Advances</label>
                <div className="deduction-fields">
                    <input
                        type="text"
                        name="advances"
                        value={formData.advances}
                        onChange={handleChange}
                        placeholder="Advances"
                    />
                    <input
                        type="text"
                        name="teaPackets"
                        value={formData.teaPackets}
                        onChange={handleChange}
                        placeholder="Tea Packets"
                    />
                    <input
                        type="text"
                        name="fertilizer"
                        value={formData.fertilizer}
                        onChange={handleChange}
                        placeholder="Fertilizer"
                    />
                </div>
            </div>

            <div className="input-group">
                <label>Final Amount</label>
                <input
                    type="text"
                    name="finalAmount"
                    value={formData.finalAmount}
                    onChange={handleChange}
                    placeholder="Final Amount"
                    readOnly
                />
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

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Adding Payment..." : "Add Payment"}
            </button>
        </form>
    );
}

export default AddNewPaymentForm;
