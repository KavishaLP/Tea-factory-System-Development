// pages/dasgboard/DashboardPdf.jsx

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart } from 'chart.js/auto';

/**
 * Generate a comprehensive dashboard report in PDF format
 * 
 * @param {Object} dashboardData - All dashboard metrics and data
 * @param {Object} chartData - Data for chart visualization
 * @param {string} timeRange - Current selected time range
 * @param {Object} teaPriceData - Tea price history data
 * @param {Object} fertilizerData - Fertilizer inventory data
 * @param {Object} teaInventory - Tea packets inventory data
 * @param {string} chartType - Current chart type (bar or line)
 * @param {string} factoryName - Name of the tea factory
 */
export const generateDashboardReport = async (
  dashboardData,
  chartData,
  timeRange,
  teaPriceData,
  fertilizerData,
  teaInventory,
  chartType = 'bar',
  factoryName = 'Tea Factory'
) => {
  const { totalUsers, totalEmployees, totalTeaWeight, selectedDate, teaPrice } = dashboardData;
  
  try {
    // Initialize PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set document properties
    doc.setProperties({
      title: `${factoryName} - Dashboard Report`,
      subject: 'Management Dashboard Summary',
      author: factoryName,
      creator: 'Tea Factory Management System'
    });

    // Get page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    
    // Add header with background
    doc.setFillColor(34, 139, 34); // Forest green
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Add header text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`${factoryName.toUpperCase()} - DASHBOARD REPORT`, pageWidth / 2, 15, { align: 'center' });
    
    // Add report generation info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth - margin, 35, { align: 'right' });

    // Add summary section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(34, 139, 34);
    doc.text('DASHBOARD SUMMARY', margin, 45);
    
    doc.setDrawColor(34, 139, 34);
    doc.line(margin, 47, pageWidth - margin, 47);

    // Add key metrics section with boxes
    const metricsStartY = 55;
    const metricsBoxWidth = (pageWidth - (2 * margin) - 10) / 3; // Width of each metrics box
    const metricsBoxHeight = 30;
    
    // Draw metrics boxes
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    
    // Box 1: Farmers
    doc.roundedRect(margin, metricsStartY, metricsBoxWidth, metricsBoxHeight, 2, 2, 'FD');
    
    // Box 2: Tea Weight
    doc.roundedRect(margin + metricsBoxWidth + 5, metricsStartY, metricsBoxWidth, metricsBoxHeight, 2, 2, 'FD');
    
    // Box 3: Employees
    doc.roundedRect(margin + (2 * metricsBoxWidth) + 10, metricsStartY, metricsBoxWidth, metricsBoxHeight, 2, 2, 'FD');
    
    // Add metrics content
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    
    // Farmers
    doc.text('Total Farmers', margin + (metricsBoxWidth / 2), metricsStartY + 10, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(34, 139, 34);
    doc.text(totalUsers?.toString() || '0', margin + (metricsBoxWidth / 2), metricsStartY + 20, { align: 'center' });
    
    // Tea Weight
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text('Daily Tea Weight', margin + metricsBoxWidth + 5 + (metricsBoxWidth / 2), metricsStartY + 10, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(34, 139, 34);
    doc.text(`${totalTeaWeight || 0} kg`, margin + metricsBoxWidth + 5 + (metricsBoxWidth / 2), metricsStartY + 20, { align: 'center' });
    
    // Employees
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text('Total Employees', margin + (2 * metricsBoxWidth) + 10 + (metricsBoxWidth / 2), metricsStartY + 10, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(34, 139, 34);
    doc.text(totalEmployees?.toString() || '0', margin + (2 * metricsBoxWidth) + 10 + (metricsBoxWidth / 2), metricsStartY + 20, { align: 'center' });
    
    // Add date info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Selected Date: ${selectedDate?.toLocaleDateString() || new Date().toLocaleDateString()}`, margin, metricsStartY + 40);
    
    // Add tea price info
    doc.text(`Current Tea Price: Rs. ${teaPrice?.toFixed(2) || 'N/A'} per kg`, pageWidth - margin, metricsStartY + 40, { align: 'right' });

    // Add chart if data exists
    if (chartData && chartData.labels && chartData.labels.length > 0) {
      // Add chart section title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(34, 139, 34);
      doc.text('TEA COLLECTION HISTORY', margin, metricsStartY + 55);
      
      doc.setDrawColor(34, 139, 34);
      doc.line(margin, metricsStartY + 57, pageWidth - margin, metricsStartY + 57);
      
      // Generate chart image using Chart.js
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      // Create chart on the canvas
      new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: true,
              text: `Tea Collection History (${timeRange})`,
              font: {
                size: 16,
                weight: 'bold',
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Weight (kg)'
              }
            },
            x: {
              title: {
                display: true,
                text: timeRange.charAt(0).toUpperCase() + timeRange.slice(1)
              }
            }
          }
        }
      });
      
      // Convert chart to image and add to PDF
      await new Promise(resolve => setTimeout(resolve, 200)); // Give chart time to render
      const chartImage = canvas.toDataURL('image/png');
      doc.addImage(chartImage, 'PNG', margin, metricsStartY + 65, pageWidth - (2 * margin), 70);
      
      // Add chart description
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`This chart shows the tea collection trend over the selected time period (${timeRange}).`, margin, metricsStartY + 145);
    }

    // Add tea price history if data exists
    if (teaPriceData && teaPriceData.labels && teaPriceData.labels.length > 0) {
      const teaPriceStartY = chartData ? metricsStartY + 155 : metricsStartY + 55;
      
      // Add tea price section title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(34, 139, 34);
      doc.text('TEA PRICE HISTORY', margin, teaPriceStartY);
      
      doc.setDrawColor(34, 139, 34);
      doc.line(margin, teaPriceStartY + 2, pageWidth - margin, teaPriceStartY + 2);
      
      // Generate tea price chart
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      // Create chart on canvas
      new Chart(ctx, {
        type: 'line',
        data: teaPriceData,
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: true,
              text: 'Tea Price History',
              font: {
                size: 16,
                weight: 'bold',
              }
            }
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'Price (Rs)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Month'
              }
            }
          }
        }
      });
      
      // Convert chart to image and add to PDF
      await new Promise(resolve => setTimeout(resolve, 200));
      const priceChartImage = canvas.toDataURL('image/png');
      doc.addImage(priceChartImage, 'PNG', margin, teaPriceStartY + 10, pageWidth - (2 * margin), 70);
    }

    // Add new page for inventory data
    doc.addPage();

    // Add fertilizer inventory table if data exists
    if (fertilizerData && fertilizerData.length > 0) {
      // Add fertilizer inventory title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(34, 139, 34);
      doc.text('FERTILIZER INVENTORY', margin, 30);
      
      doc.setDrawColor(34, 139, 34);
      doc.line(margin, 32, pageWidth - margin, 32);
      
      // Group fertilizer data by type
      const fertilizerTypes = {};
      
      fertilizerData.forEach(item => {
        if (!fertilizerTypes[item.fertilizerType]) {
          fertilizerTypes[item.fertilizerType] = [];
        }
        fertilizerTypes[item.fertilizerType].push({
          packetType: item.packetType,
          price: item.price
        });
      });
      
      // Create a more structured table with nested data
      const fertilizerTableData = [];
      
      Object.keys(fertilizerTypes).forEach(type => {
        // Add fertilizer type as a main row
        fertilizerTableData.push([{
          content: type,
          colSpan: 3,
          styles: {
            fillColor: [240, 247, 240],
            textColor: [34, 139, 34],
            fontStyle: 'bold',
            halign: 'left'
          }
        }]);
        
        // Add header for the packets
        fertilizerTableData.push([
          { content: 'Packet Size', styles: { fontStyle: 'bold' } },
          { content: 'Price (Rs)', styles: { fontStyle: 'bold' } },
          { content: 'Status', styles: { fontStyle: 'bold' } }
        ]);
        
        // Add each packet as a row
        fertilizerTypes[type].forEach(packet => {
          fertilizerTableData.push([
            packet.packetType,
            parseFloat(packet.price).toFixed(2),
            'Available'  // You can modify this based on actual availability data
          ]);
        });
        
        // Add an empty row for spacing between fertilizer types
        fertilizerTableData.push([
          { content: '', colSpan: 3, styles: { cellPadding: 2 } }
        ]);
      });
      
      // Add fertilizer table with improved styling
      autoTable(doc, {
        startY: 40,
        body: fertilizerTableData,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: 'right' },
          2: { cellWidth: 40, halign: 'center' }
        },
        margin: { left: margin, right: margin },
        didParseCell: function(data) {
          // Customize specific cells if needed
          const { row, column, cell } = data;
          if (column.index === 1 && cell.text.length && cell.text[0] !== 'Price') {
            // Format price cells
            cell.text = ['Rs. ' + cell.text[0]];
          }
        }
      });
    }
    
    // Add tea inventory table if data exists
    if (teaInventory && teaInventory.length > 0) {
      const teaInventoryStartY = doc.lastAutoTable?.finalY + 20 || 40;
      
      // Add tea inventory title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(34, 139, 34);
      doc.text('TEA PACKETS INVENTORY', margin, teaInventoryStartY);
      
      doc.setDrawColor(34, 139, 34);
      doc.line(margin, teaInventoryStartY + 2, pageWidth - margin, teaInventoryStartY + 2);
      
      // Group tea inventory by type
      const teaTypes = {};
      
      teaInventory.forEach(item => {
        if (!teaTypes[item.tea_type]) {
          teaTypes[item.tea_type] = {
            packets: [],
            lastUpdated: new Date(item.last_updated)
          };
        }
        
        teaTypes[item.tea_type].packets.push({
          size: item.packet_size,
          count: item.packet_count
        });
        
        // Keep most recent update date
        const itemDate = new Date(item.last_updated);
        if (itemDate > teaTypes[item.tea_type].lastUpdated) {
          teaTypes[item.tea_type].lastUpdated = itemDate;
        }
      });
      
      // Create a structured table with nested data
      const teaInventoryTableData = [];
      
      Object.keys(teaTypes).forEach(type => {
        // Format the last updated date
        const lastUpdated = teaTypes[type].lastUpdated.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        // Add tea type as a main row with last updated date
        teaInventoryTableData.push([{
          content: type,
          colSpan: 2,
          styles: {
            fillColor: [240, 247, 240],
            textColor: [34, 139, 34],
            fontStyle: 'bold',
            halign: 'left'
          }
        }, {
          content: `Last Updated: ${lastUpdated}`,
          styles: {
            fillColor: [240, 247, 240],
            textColor: [100, 100, 100],
            fontSize: 8,
            halign: 'right'
          }
        }]);
        
        // Add header for the packets
        teaInventoryTableData.push([
          { content: 'Packet Size', styles: { fontStyle: 'bold' } },
          { content: 'Count', styles: { fontStyle: 'bold' } },
          { content: 'Stock Status', styles: { fontStyle: 'bold' } }
        ]);
        
        // Add each packet as a row
        teaTypes[type].packets.forEach(packet => {
          // Determine stock status based on count
          let stockStatus = 'Low Stock';
          let statusColor = [255, 87, 34]; // Orange for low stock
          
          if (packet.count > 50) {
            stockStatus = 'In Stock';
            statusColor = [76, 175, 80]; // Green for in stock
          } else if (packet.count > 20) {
            stockStatus = 'Adequate';
            statusColor = [255, 193, 7]; // Amber for adequate
          } else if (packet.count === 0) {
            stockStatus = 'Out of Stock';
            statusColor = [244, 67, 54]; // Red for out of stock
          }
          
          teaInventoryTableData.push([
            packet.size,
            `${packet.count} packets`,
            {
              content: stockStatus,
              styles: {
                textColor: statusColor,
                fontStyle: 'bold'
              }
            }
          ]);
        });
        
        // Add an empty row for spacing between tea types
        teaInventoryTableData.push([
          { content: '', colSpan: 3, styles: { cellPadding: 2 } }
        ]);
      });
      
      // Add tea inventory table with improved styling
      autoTable(doc, {
        startY: teaInventoryStartY + 10,
        body: teaInventoryTableData,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 40 },
          2: { cellWidth: 50, halign: 'center' }
        },
        margin: { left: margin, right: margin }
      });
    }
    
    // Add footer to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`${factoryName} - Management Dashboard Report | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
      doc.text('Confidential: For internal use only', pageWidth / 2, pageHeight - 8, { align: 'center' });
    }
    
    // Download the PDF
    doc.save(`${factoryName}_Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating dashboard PDF:', error);
    return false;
  }
};

export default generateDashboardReport;