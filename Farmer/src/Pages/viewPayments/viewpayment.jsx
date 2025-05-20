import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './viewpayment.css';
import { 
  FaEye, FaTimes, FaCalendarAlt, 
  FaLeaf, FaPlus, FaMinus, FaMoneyBillWave,
  FaSpinner, FaExclamationTriangle,
  FaFilePdf
} from 'react-icons/fa';
// IMPORTANT: Fixed imports for jsPDF and autotable
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function ViewPayment({ userId }) {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/farmer/payments/${userId}`, {
          withCredentials: true,
        });
        setPayments(response.data);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError(err.response?.data?.message || 'Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [userId]);

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
  };

  const closeModal = () => {
    setSelectedPayment(null);
  };

  // Format currency with commas and 2 decimal places
  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculate total deductions for a payment
  const calculateTotalDeductions = (payment) => {
    return (
      parseFloat(payment.advances || 0) +
      parseFloat(payment.teaPackets || 0) +
      parseFloat(payment.fertilizer || 0)
    );
  };

  // Format date in a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate PDF with professional styling
  const generatePDF = () => {
    if (!selectedPayment) return;
    
    setIsPdfGenerating(true);
    
    setTimeout(() => {
      try {
        // Create new PDF document
        const doc = new jsPDF();
        
        // Get page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        
        // Set document properties
        doc.setProperties({
          title: `Payment Receipt ${selectedPayment?.id || ''}`,
          subject: 'Tea Factory Payment Receipt',
          author: 'Tea Factory',
          creator: 'Tea Factory Management System'
        });
        
        // Add header with background
        doc.setFillColor(34, 139, 34); // Forest green
        doc.rect(0, 0, pageWidth, 20, 'F');
        
        // Add header text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('TEA FACTORY PAYMENT RECEIPT', pageWidth / 2, 12, { align: 'center' });
        
        // Add receipt details
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Receipt No: ${selectedPayment?.id || 'N/A'}`, margin, 30);
        doc.text(`Date: ${formatDate(selectedPayment?.created_at || new Date())}`, pageWidth - margin, 30, { align: 'right' });
        
        // Add farmer info section
        doc.setFontSize(11);
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(margin, 35, pageWidth - 2 * margin, 15, 3, 3, 'FD');
        
        doc.setFont('helvetica', 'bold');
        doc.text('Farmer ID:', margin + 5, 42);
        doc.setFont('helvetica', 'normal');
        doc.text(`${selectedPayment?.userId || 'N/A'}`, margin + 30, 42);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Period:', margin + 60, 42);
        doc.setFont('helvetica', 'normal');
        const paymentDate = selectedPayment?.created_at ? 
          new Date(selectedPayment.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 
          'N/A';
        doc.text(paymentDate, margin + 100, 42);
        
        // Tea Collection Details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(34, 139, 34);
        doc.text('Tea Collection Details', margin, 60);
        
        // Tea collection table
        autoTable(doc, {
          startY: 65,
          head: [['Description', 'Amount']],
          body: [
            ['Tea Weight', `${formatCurrency(selectedPayment?.finalTeaKilos || 0)} kg`],
            ['Rate per Kilogram', `Rs. ${formatCurrency(selectedPayment?.paymentPerKilo || 0)}`],
            ['Payment for Tea', `Rs. ${formatCurrency(selectedPayment?.paymentForFinalTeaKilos || 0)}`]
          ],
          theme: 'grid',
          headStyles: { 
            fillColor: [34, 139, 34],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          margin: { left: margin, right: margin },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { halign: 'right' }
          }
        });
        
        // Get ending Y position of first table
        const tableEndY = doc.lastAutoTable.finalY;
        
        // Additional Payments
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(34, 139, 34);
        doc.text('Additional Payments', margin, tableEndY + 10);
        
        autoTable(doc, {
          startY: tableEndY + 15,
          body: [
            ['Transport Allowance', `Rs. ${formatCurrency(selectedPayment?.transport || 0)}`],
            ['Direct Payments', `Rs. ${formatCurrency(selectedPayment?.directPayments || 0)}`],
            ['Other Additions', `Rs. ${formatCurrency(selectedPayment?.additionalPayments || 0)}`],
            ['Gross Amount', `Rs. ${formatCurrency(selectedPayment?.finalAmount || 0)}`]
          ],
          theme: 'grid',
          margin: { left: margin, right: margin },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { halign: 'right' }
          }
        });
        
        // Get ending Y position of second table
        const additionalEndY = doc.lastAutoTable.finalY;
        
        // Deductions
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(34, 139, 34);
        doc.text('Deductions', margin, additionalEndY + 10);
        
        const totalDeductions = calculateTotalDeductions(selectedPayment || {});
        
        autoTable(doc, {
          startY: additionalEndY + 15,
          body: [
            ['Advances', `Rs. ${formatCurrency(selectedPayment?.advances || 0)}`],
            ['Tea Packets', `Rs. ${formatCurrency(selectedPayment?.teaPackets || 0)}`],
            ['Fertilizer', `Rs. ${formatCurrency(selectedPayment?.fertilizer || 0)}`],
            ['Total Deductions', `Rs. ${formatCurrency(totalDeductions)}`]
          ],
          theme: 'grid',
          margin: { left: margin, right: margin },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { halign: 'right' }
          },
          didDrawCell: function(data) {
            // Highlight the total deductions row
            if (data.section === 'body' && data.row.index === 3) {
              doc.setFillColor(253, 237, 237);
            }
          }
        });
        
        // Get ending Y position of third table
        const deductionsEndY = doc.lastAutoTable.finalY;
        
        // Net Payment
        const finalY = deductionsEndY + 20;
        
        doc.setFillColor(229, 246, 230);
        doc.roundedRect(pageWidth / 2 - 50, finalY, 100, 20, 3, 3, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(34, 139, 34);
        doc.text('NET PAYMENT AMOUNT', pageWidth / 2, finalY + 8, { align: 'center' });
        
        doc.setFontSize(16);
        doc.text(`Rs. ${formatCurrency(selectedPayment?.finalPayment || 0)}`, pageWidth / 2, finalY + 15, { align: 'center' });
        
        // Footer
        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('This is a computer generated receipt. No signature required.', pageWidth / 2, footerY, { align: 'center' });
        
        // Save the PDF
        doc.save(`Payment_Receipt_${selectedPayment?.id || 'unknown'}.pdf`);
        console.log("PDF generated successfully");
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again later.');
      } finally {
        setIsPdfGenerating(false);
      }
    }, 100); // Small timeout to ensure UI updates before heavy processing
  };

  return (
    <div className="view-payments-container">
      <div className="page-header">
        <h2>Payment History</h2>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <FaSpinner className="spinner-icon" />
          <p>Loading payment records...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <FaExclamationTriangle className="error-icon" />
          <p>{error}</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="no-records">
          <p>No payment records found</p>
        </div>
      ) : (
        <div className="content-box">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Payment Rate</th>
                <th>Tea Weight</th>
                <th>Gross Amount</th>
                <th>Deductions</th>
                <th>Net Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const date = new Date(payment.created_at);
                const totalDeductions = calculateTotalDeductions(payment);
                const statusClass = payment.status ? payment.status.toLowerCase() : 'pending';
                
                return (
                  <tr key={payment.id} className={statusClass + '-row'}>
                    <td>{date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                    <td>Rs. {formatCurrency(payment.paymentPerKilo)}</td>
                    <td>{formatCurrency(payment.finalTeaKilos)} kg</td>
                    <td>Rs. {formatCurrency(payment.finalAmount)}</td>
                    <td>Rs. {formatCurrency(totalDeductions)}</td>
                    <td>Rs. {formatCurrency(payment.finalPayment)}</td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>
                        {payment.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewDetails(payment)}
                      >
                        <FaEye className="btn-icon" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed Payment Modal */}
      {selectedPayment && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content payment-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment Details</h3>
              <span className={`status-badge large ${selectedPayment.status ? selectedPayment.status.toLowerCase() : 'pending'}`}>
                {selectedPayment.status || 'Pending'}
              </span>
            </div>
            
            <div className="modal-body">
              <div className="payment-period">
                <div className="icon-label">
                  <FaCalendarAlt className="section-icon" />
                  <span>Payment Period:</span>
                </div>
                <strong>{new Date(selectedPayment.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric'
                })}</strong>
              </div>
              
              <div className="payment-section">
                <h4><FaLeaf className="section-icon" /> Tea Collection Summary</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Tea Weight</div>
                    <div className="detail-value">{formatCurrency(selectedPayment.finalTeaKilos)} kg</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Rate per Kilogram</div>
                    <div className="detail-value">Rs. {formatCurrency(selectedPayment.paymentPerKilo)}</div>
                  </div>
                  <div className="detail-item highlight">
                    <div className="detail-label">Payment for Tea</div>
                    <div className="detail-value">Rs. {formatCurrency(selectedPayment.paymentForFinalTeaKilos)}</div>
                  </div>
                </div>
              </div>
              
              <div className="payment-section">
                <h4><FaPlus className="section-icon" /> Additional Payments</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Transport Allowance</div>
                    <div className="detail-value">Rs. {formatCurrency(selectedPayment.transport)}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Direct Payments</div>
                    <div className="detail-value">Rs. {formatCurrency(selectedPayment.directPayments)}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Other Additions</div>
                    <div className="detail-value">Rs. {formatCurrency(selectedPayment.additionalPayments)}</div>
                  </div>
                  <div className="detail-item highlight">
                    <div className="detail-label">Gross Amount</div>
                    <div className="detail-value">Rs. {formatCurrency(selectedPayment.finalAmount)}</div>
                  </div>
                </div>
              </div>
              
              <div className="payment-section">
                <h4><FaMinus className="section-icon" /> Deductions</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Advances</div>
                    <div className="detail-value deduction">- Rs. {formatCurrency(selectedPayment.advances)}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Tea Packets</div>
                    <div className="detail-value deduction">- Rs. {formatCurrency(selectedPayment.teaPackets)}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Fertilizer</div>
                    <div className="detail-value deduction">- Rs. {formatCurrency(selectedPayment.fertilizer)}</div>
                  </div>
                  <div className="detail-item highlight">
                    <div className="detail-label">Total Deductions</div>
                    <div className="detail-value deduction">- Rs. {formatCurrency(calculateTotalDeductions(selectedPayment))}</div>
                  </div>
                </div>
              </div>
              
              <div className="net-payment-section">
                <div className="net-payment-label">
                  <FaMoneyBillWave className="section-icon" /> Net Payment Amount
                </div>
                <div className="net-payment-value">Rs. {formatCurrency(selectedPayment.finalPayment)}</div>
                <div className="payment-date">Payment Date: {formatDate(selectedPayment.created_at)}</div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="download-btn" onClick={generatePDF} disabled={isPdfGenerating}>
                {isPdfGenerating ? (
                  <>
                    <FaSpinner className="spinner-icon-small" /> Generating...
                  </>
                ) : (
                  <>
                    <FaFilePdf className="btn-icon" /> Download PDF
                  </>
                )}
              </button>
              <button className="close-modal-btn" onClick={closeModal}>
                <FaTimes className="btn-icon" /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewPayment;