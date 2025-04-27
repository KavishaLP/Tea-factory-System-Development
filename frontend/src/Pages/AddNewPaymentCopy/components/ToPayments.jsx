import React, { useState, useEffect } from 'react';

function ToPayments() {
    const [paymentsHistory, setPaymentsHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [toPaymentsFilters, setToPaymentsFilters] = useState({
        year: "",
        month: "",
    });

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        // Fetch payments history (mock data for now)
        setHistoryLoading(true);
        setTimeout(() => {
            const mockPayments = [
                { userId: '123', finalTeaKilos: 100, paymentPerKilo: 5, finalAmount: 500, advances: 50, finalPayment: 450, created_at: new Date() },
                { userId: '456', finalTeaKilos: 120, paymentPerKilo: 5, finalAmount: 600, advances: 60, finalPayment: 540, created_at: new Date() },
            ];
            setPaymentsHistory(mockPayments);
            setHistoryLoading(false);
        }, 500);
    }, []);

    const navigateToPaymentsMonth = (direction) => {
        setToPaymentsFilters((prevFilters) => {
            let newMonth = prevFilters.month ? parseInt(prevFilters.month) : currentMonth + 1;
            let newYear = prevFilters.year ? parseInt(prevFilters.year) : currentYear;

            if (direction === "prev") {
                if (newMonth === 1) {
                    newMonth = 12;
                    newYear -= 1;
                } else {
                    newMonth -= 1;
                }
            } else if (direction === "next") {
                if (newMonth === 12) {
                    newMonth = 1;
                    newYear += 1;
                } else {
                    newMonth += 1;
                }
            }

            return {
                year: newYear.toString(),
                month: newMonth.toString(),
            };
        });
    };

    return (
        <div className="payment-history">
            <div className="filter-buttons">
                <button >Refresh to Payments</button>
            </div>
            <div className="month-navigation">
                <button onClick={() => navigateToPaymentsMonth("prev")}>&lt; Previous</button>
                <h3>
                    {monthNames[toPaymentsFilters.month ? parseInt(toPaymentsFilters.month) - 1 : currentMonth]}{" "}
                    {toPaymentsFilters.year || currentYear}
                </h3>
                <button onClick={() => navigateToPaymentsMonth("next")}>Next &gt;</button>
            </div>

            {historyLoading ? (
                <p>Loading...</p>
            ) : paymentsHistory.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Final Tea Kilos</th>
                            <th>Payment Per Kilo</th>
                            <th>Final Amount</th>
                            <th>Advances</th>
                            <th>Final Payment</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentsHistory.map((payment, index) => (
                            <tr key={index}>
                                <td>{payment.userId}</td>
                                <td>{payment.finalTeaKilos}</td>
                                <td>{payment.paymentPerKilo}</td>
                                <td>{payment.finalAmount}</td>
                                <td>{payment.advances}</td>
                                <td>{payment.finalPayment}</td>
                                <td>{new Date(payment.created_at).toLocaleDateString("en-US")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No payment records found for {monthNames[currentMonth]} {currentYear}.</p>
            )}
        </div>
    );
}

export default ToPayments;
