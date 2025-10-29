// DataExport utility for handling various export formats
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

class DataExport {
  
  // Copy data to clipboard with proper field mapping
  static async copyToClipboard(data, headers = []) {
    try {
      const headerRow = headers.length > 0 ? headers.join('\t') : 'Name\tCategory\tPrice\tStock\tStatus\tSales\tRating';
      const dataText = data.map(item => {
        if (typeof item === 'object') {
          // Handle customer data structure
          if (item.email) {
            return `${item.name || ''}\t${item.email || ''}\t${item.phone || ''}\t${item.totalOrders || 0}\t${item.totalSpent || 0}\t${item.lastOrder || ''}\t${item.status || ''}\t${item.rating || 0}`;
          }
          // Handle inventory data structure
          if (item.sku) {
            return `${item.name || ''}\t${item.sku || ''}\t${item.category || ''}\t${item.stock || 0}\t${item.sales || 0}\t₱${item.price || 0}\t₱${item.rating || 0}\t${item.status || ''}`;
          }
          // Handle product data structure
          return `${item.name || ''}\t${item.category || ''}\t₱${item.price || 0}\t${item.stock || 0}\t${item.status || ''}\t${item.sales || 0}\t${item.rating || 0}`;
        }
        return item;
      }).join('\n');
      
      const fullText = `${headerRow}\n${dataText}`;
      await navigator.clipboard.writeText(fullText);
      return { success: true, message: 'Data copied to clipboard successfully!' };
    } catch (err) {
      return { success: false, message: 'Failed to copy data to clipboard' };
    }
  }

  // Export to CSV format
  static exportCSV(data, filename = 'export', headers = []) {
    try {
      const csvContent = this.convertToCSV(data, headers);
      this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
      return { success: true, message: 'CSV exported successfully!' };
    } catch (err) {
      return { success: false, message: 'Failed to export CSV' };
    }
  }

  // Export to Excel format using xlsx library (proper .xlsx format)
  static exportExcel(data, filename = 'export', headers = []) {
    try {
      // Prepare data for Excel
      const headerRow = headers.length > 0 
        ? headers 
        : ['Name', 'Category', 'Price', 'Stock', 'Status', 'Sales', 'Rating'];
      
      // Map data to rows - handle customer, inventory, and product structures
      const excelData = data.map(item => {
        if (item.email) {
          // Customer data structure
          return [
            item.name || '',
            item.email || '',
            item.phone || '',
            item.totalOrders || 0,
            item.totalSpent || 0,
            item.lastOrder || '',
            item.status || '',
            item.rating || 0
          ];
        }
        if (item.sku) {
          // Inventory data structure
          return [
            item.name || '',
            item.sku || '',
            item.category || '',
            item.stock || 0,
            item.sales || 0,
            item.price || 0,
            item.rating || 0,
            item.status || ''
          ];
        }
        // Product data structure
        return [
          item.name || '',
          item.category || '',
          item.price || 0,
          item.stock || 0,
          item.status || '',
          item.sales || 0,
          item.rating || 0
        ];
      });
      
      // Add headers at the beginning
      const worksheetData = [headerRow, ...excelData];
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // Name
        { wch: 20 }, // Category
        { wch: 12 }, // Price
        { wch: 10 }, // Stock
        { wch: 12 }, // Status
        { wch: 10 }, // Sales
        { wch: 10 }  // Rating
      ];
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Products');
      
      // Generate Excel file and download
      XLSX.writeFile(wb, `${filename}.xlsx`);
      
      return { success: true, message: 'Excel file exported successfully!' };
    } catch (err) {
      console.error('Excel export error:', err);
      return { success: false, message: 'Failed to export Excel file: ' + err.message };
    }
  }

  // Export to PDF format using jsPDF (direct download, no print dialog)
  static exportPDF(data, filename = 'export', headers = [], options = {}) {
    try {
      const title = options.title || 'Products Report';
      const companyName = options.companyName || 'Sagnay to Everyone Hub';
      
      // Create PDF document
      const doc = new jsPDF();
      
      // Add company name
      doc.setFontSize(18);
      doc.setTextColor(46, 125, 50); // Green color
      doc.text(companyName, 105, 20, { align: 'center' });
      
      // Add title
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 51);
      doc.text(title, 105, 30, { align: 'center' });
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      const dateStr = `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
      doc.text(dateStr, 105, 38, { align: 'center' });
      
      // Prepare table data
      const headerRow = headers.length > 0 
        ? headers 
        : ['Name', 'Category', 'Price', 'Stock', 'Status', 'Sales', 'Rating'];
      
      const tableData = data.map(item => {
        if (item.sku) {
          // Inventory data structure
          return [
            item.name || '',
            item.sku || '',
            item.category || '',
            item.stock || 0,
            item.sales || 0,
            `₱${item.price ? item.price.toFixed(2) : '0.00'}`,
            `₱${item.rating ? item.rating.toFixed(2) : '0.00'}`,
            item.status || ''
          ];
        }
        // Product data structure
        return [
          item.name || '',
          item.category || '',
          `₱${item.price ? item.price.toFixed(2) : '0.00'}`,
          item.stock || 0,
          item.status || '',
          item.sales || 0,
          item.rating || 0
        ];
      });
      
      // Add table using autoTable (as a function)
      autoTable(doc, {
        head: [headerRow],
        body: tableData,
        startY: 45,
        theme: 'grid',
        headStyles: {
          fillColor: [46, 125, 50], // Green color
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [51, 51, 51]
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { cellWidth: 40 }, // Name
          1: { cellWidth: 30 }, // Category
          2: { cellWidth: 25 }, // Price
          3: { cellWidth: 20 }, // Stock
          4: { cellWidth: 20 }, // Status
          5: { cellWidth: 20 }, // Sales
          6: { cellWidth: 20 }  // Rating
        },
        margin: { top: 45, left: 14, right: 14 }
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        const footerText = `Report generated by ${companyName} | Total records: ${data.length} | Page ${i} of ${pageCount}`;
        doc.text(footerText, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      }
      
      // Download PDF file directly
      doc.save(`${filename}.pdf`);
      
      return { success: true, message: 'PDF file downloaded successfully!' };
    } catch (err) {
      console.error('PDF export error:', err);
      return { success: false, message: 'Failed to export PDF: ' + err.message };
    }
  }

  // Alternative PDF export using canvas and image generation
  static async exportPDFAdvanced(data, filename = 'export', headers = [], options = {}) {
    try {
      // Create a temporary container with the table
      const container = document.createElement('div');
      container.innerHTML = this.generateTableHTML(data, headers, options);
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.background = 'white';
      container.style.padding = '20px';
      container.style.fontFamily = 'Arial, sans-serif';
      document.body.appendChild(container);

      // Use html2canvas if available, otherwise fallback to simple method
      if (typeof html2canvas !== 'undefined') {
        const canvas = await html2canvas(container);
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF with image
        if (typeof jsPDF !== 'undefined') {
          const pdf = new jsPDF();
          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save(`${filename}.pdf`);
          document.body.removeChild(container);
          return { success: true, message: 'PDF exported successfully!' };
        }
      }

      // Fallback: Generate downloadable PDF-like content
      document.body.removeChild(container);
      this.generateSimplePDF(data, filename, headers, options);
      return { success: true, message: 'PDF file generated and downloaded!' };
    } catch (err) {
      return { success: false, message: 'Failed to export PDF: ' + err.message };
    }
  }

  // Print data with proper product field mapping
  static print(data, headers = [], title = 'Report') {
    try {
      const printContent = this.generatePrintHTML(data, headers, title);
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      });
      
      return { success: true, message: 'Print dialog opened successfully!' };
    } catch (err) {
      return { success: false, message: 'Failed to open print dialog: ' + err.message };
    }
  }

  // Convert data to CSV format with proper field mapping
  static convertToCSV(data, headers = []) {
    if (!data || data.length === 0) return '';
    
    const csvRows = [];
    
    // Add headers
    if (headers.length > 0) {
      csvRows.push(headers.map(h => `"${h}"`).join(','));
    } else {
      csvRows.push('"Name","Category","Price","Stock","Status","Sales","Rating"');
    }
    
    // Add data rows with proper field mapping
    data.forEach(item => {
      if (typeof item === 'object') {
        let row;
        if (item.sku) {
          // Inventory data structure
          row = [
            `"${item.name || ''}"`,
            `"${item.sku || ''}"`,
            `"${item.category || ''}"`,
            `"${item.stock || 0}"`,
            `"${item.sales || 0}"`,
            `"₱${item.price || 0}"`,
            `"₱${item.rating || 0}"`,
            `"${item.status || ''}"`
          ];
        } else {
          // Product data structure
          row = [
            `"${item.name || ''}"`,
            `"${item.category || ''}"`,
            `"₱${item.price || 0}"`,
            `"${item.stock || 0}"`,
            `"${item.status || ''}"`,
            `"${item.sales || 0}"`,
            `"${item.rating || 0}"`
          ];
        }
        csvRows.push(row.join(','));
      }
    });
    
    return csvRows.join('\n');
  }

  // Convert data to Excel-compatible CSV (with BOM for proper encoding)
  static convertToExcelCSV(data, headers = []) {
    const csvContent = this.convertToCSV(data, headers);
    // Add BOM for proper Excel UTF-8 handling
    return '\uFEFF' + csvContent;
  }

  // Convert data to Excel-compatible HTML format
  static convertToExcelHTML(data, headers = []) {
    if (!data || data.length === 0) return '';
    
    const headerRow = headers.length > 0 
      ? headers 
      : ['Name', 'Category', 'Price', 'Stock', 'Status', 'Sales', 'Rating'];
    
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Products</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #2e7d32; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          .number { mso-number-format: "0.00"; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headerRow.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add data rows with proper field mapping
    data.forEach(item => {
      html += '<tr>';
      html += `<td>${item.name || ''}</td>`;
      html += `<td>${item.category || ''}</td>`;
      html += `<td class="number">${item.price || 0}</td>`;
      html += `<td>${item.stock || 0}</td>`;
      html += `<td>${item.status || ''}</td>`;
      html += `<td>${item.sales || 0}</td>`;
      html += `<td class="number">${item.rating || 0}</td>`;
      html += '</tr>';
    });
    
    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    return html;
  }

  // Generate and download PDF file directly (no print dialog)
  static generateAndDownloadPDF(data, filename, headers = [], options = {}) {
    // Create a basic PDF document using simple PDF format
    const pdfContent = this.createBasicPDF(data, headers, options, filename);
    
    // Create blob and download directly
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Create a basic but functional PDF document
  static createBasicPDF(data, headers = [], options = {}, filename = 'report') {
    const title = options.title || 'Report';
    const companyName = options.companyName || 'Sagnay to Everyone Hub';
    const now = new Date();
    
    // Simple PDF structure that browsers can handle
    const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
/F2 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
>>
>>
>>
endobj

4 0 obj
<<
/Length ${this.calculateContentLength(data, headers, title, companyName)}
>>
stream
BT
/F2 16 Tf
50 720 Td
(${companyName}) Tj
0 -25 Td
/F2 14 Tf
(${title}) Tj
0 -20 Td
/F1 10 Tf
(Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}) Tj
0 -30 Td
${this.generatePDFDataContent(data, headers)}
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000400 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${800 + this.calculateContentLength(data, headers, title, companyName)}
%%EOF`;

    return pdfHeader;
  }

  // Calculate content length for PDF
  static calculateContentLength(data, headers, title, companyName) {
    let length = 200; // Base content
    length += (companyName.length + title.length) * 2;
    length += headers.length * 15;
    length += data.length * 50; // Approximate per row
    return length;
  }

  // Generate PDF data content with proper product data mapping
  static generatePDFDataContent(data, headers) {
    let content = '';
    let yPos = 20;
    
    // Add headers
    if (headers.length > 0) {
      content += '/F2 9 Tf\n';
      const headerPositions = [50, 120, 180, 230, 280, 330, 380];
      headers.forEach((header, index) => {
        if (index < headerPositions.length) {
          const xPos = headerPositions[index];
          content += `${xPos} ${640 - yPos} Td (${header.substring(0, 8)}) Tj\n`;
        }
      });
      yPos += 20;
    }
    
    // Add data rows with proper field mapping
    content += '/F1 8 Tf\n';
    data.slice(0, 20).forEach((item, rowIndex) => {
      const rowData = [
        (item.name || '').substring(0, 12),
        (item.category || '').substring(0, 10),
        `P${item.price || 0}`,
        String(item.stock || 0),
        (item.status || '').substring(0, 6),
        String(item.sales || 0),
        String(item.rating || 0)
      ];
      
      const positions = [50, 120, 180, 230, 280, 330, 380];
      rowData.forEach((value, colIndex) => {
        if (colIndex < positions.length) {
          const xPos = positions[colIndex];
          const cleanValue = String(value).replace(/[()\\]/g, '');
          content += `${xPos} ${640 - yPos} Td (${cleanValue}) Tj\n`;
        }
      });
      yPos += 15;
      
      // Check if we need new page
      if (yPos > 500) {
        content += 'ET\nBT\n/F1 8 Tf\n';
        yPos = 50;
      }
    });
    
    return content;
  }

  // Generate simple PDF by creating a downloadable file using modern approach (backup method)
  static generateSimplePDF(data, filename, headers = [], options = {}) {
    // Create a comprehensive HTML document for PDF conversion
    const htmlContent = this.generateCompletePDFHTML(data, headers, options);
    
    // Method 1: Try using browser's built-in PDF generation
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Add print styles and auto-download
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        // Set filename for download
        printWindow.document.title = filename;
        printWindow.print();
        
        // Close window after printing
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    });
  }

  // Generate complete HTML document optimized for PDF conversion
  static generateCompletePDFHTML(data, headers = [], options = {}) {
    const title = options.title || 'Report';
    const companyName = options.companyName || 'Sagnay to Everyone Hub';
    
    const headerRow = headers.length > 0 
      ? headers 
      : ['Name', 'Category', 'Price', 'Stock', 'Status', 'Sales', 'Rating'];
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            @media print {
              body { 
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                font-size: 10px;
                line-height: 1.3;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .no-print { display: none !important; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              font-size: 10px;
              line-height: 1.3;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #2e7d32;
              padding-bottom: 15px;
            }
            .company-name {
              font-size: 20px;
              font-weight: bold;
              color: #2e7d32;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 16px;
              color: #333;
              margin-bottom: 8px;
            }
            .report-date {
              font-size: 10px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 9px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px 4px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #2e7d32;
              font-size: 9px;
            }
            .status-active { color: #2e7d32; font-weight: bold; }
            .status-pending { color: #f57c00; font-weight: bold; }
            .status-inactive { color: #f44336; font-weight: bold; }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 8px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companyName}</div>
            <div class="report-title">${title}</div>
            <div class="report-date">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                ${headerRow.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  <td>${item.name || ''}</td>
                  <td>${item.category || ''}</td>
                  <td>₱${item.price ? item.price.toFixed(2) : '0.00'}</td>
                  <td>${item.stock || 0}</td>
                  <td class="status-${item.status || ''}">${item.status || ''}</td>
                  <td>${item.sales || 0}</td>
                  <td>${item.rating || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Report generated by ${companyName} | Total records: ${data.length} | ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
          
          <script>
            // Auto-trigger print dialog
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.print();
              }, 1000);
            });
          </script>
        </body>
      </html>
    `;
  }

  // Generate PDF content optimized for download
  static generatePDFContentForDownload(data, headers = [], options = {}) {
    const title = options.title || 'Report';
    const companyName = options.companyName || 'Sagnay to Everyone Hub';
    
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj

4 0 obj
<<
/Length 1000
>>
stream
BT
/F1 18 Tf
50 750 Td
(${companyName}) Tj
0 -30 Td
/F1 14 Tf
(${title}) Tj
0 -20 Td
/F1 10 Tf
(Generated: ${new Date().toLocaleDateString()}) Tj
0 -40 Td
${this.generatePDFTableContent(data, headers)}
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000300 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
1400
%%EOF`;
  }

  // Generate table content for PDF
  static generatePDFTableContent(data, headers) {
    let content = '';
    let yPos = 0;
    
    // Add headers
    if (headers.length > 0) {
      headers.forEach((header, index) => {
        content += `(${header}) Tj ${50 + (index * 80)} ${680 - yPos} Td `;
      });
      yPos += 15;
    }
    
    // Add data rows
    data.slice(0, 20).forEach((item, rowIndex) => { // Limit to 20 rows for simple PDF
      const values = Object.values(item);
      values.forEach((value, colIndex) => {
        const cleanValue = String(value).replace(/[()]/g, '');
        content += `(${cleanValue}) Tj ${50 + (colIndex * 80)} ${680 - yPos} Td `;
      });
      yPos += 12;
    });
    
    return content;
  }

  // Generate table HTML for PDF conversion
  static generateTableHTML(data, headers = [], options = {}) {
    const title = options.title || 'Report';
    const companyName = options.companyName || 'Sagnay to Everyone Hub';
    
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2e7d32; padding-bottom: 20px;">
          <h1 style="color: #2e7d32; margin-bottom: 5px; font-size: 24px;">${companyName}</h1>
          <h2 style="color: #333; margin-bottom: 10px; font-size: 18px;">${title}</h2>
          <p style="color: #666; font-size: 12px;">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              ${(headers.length > 0 ? headers : Object.keys(data[0] || {})).map(header => 
                `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f8f9fa; font-weight: bold; color: #2e7d32; font-size: 11px;">${header}</th>`
              ).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                ${Object.values(item).map(value => {
                  let cellStyle = 'border: 1px solid #ddd; padding: 8px; font-size: 11px;';
                  if (typeof value === 'string' && value.includes('active')) cellStyle += ' color: #2e7d32; font-weight: bold;';
                  if (typeof value === 'string' && value.includes('inactive')) cellStyle += ' color: #f44336; font-weight: bold;';
                  return `<td style="${cellStyle}">${value}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
          Report generated by ${companyName} | Total records: ${data.length}
        </div>
      </div>
    `;
  }

  // Generate enhanced PDF content for print
  static generatePDFContent(data, headers = [], options = {}) {
    const title = options.title || 'Report';
    const companyName = options.companyName || 'Sagnay to Everyone Hub';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: A4;
              margin: 1in;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2e7d32;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #2e7d32;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              color: #333;
              margin-bottom: 10px;
            }
            .report-date {
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 11px;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #2e7d32;
            }
            .status-active { color: #2e7d32; font-weight: bold; }
            .status-inactive { color: #f44336; font-weight: bold; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companyName}</div>
            <div class="report-title">${title}</div>
            <div class="report-date">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                ${(headers.length > 0 ? headers : Object.keys(data[0] || {})).map(header => 
                  `<th>${header}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  ${Object.values(item).map(value => {
                    let cellClass = '';
                    if (typeof value === 'string' && value.includes('active')) cellClass = 'status-active';
                    if (typeof value === 'string' && value.includes('inactive')) cellClass = 'status-inactive';
                    return `<td class="${cellClass}">${value}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Report generated by ${companyName} | Total records: ${data.length}
          </div>
        </body>
      </html>
    `;
  }

  // Generate HTML for printing with proper product field mapping
  static generatePrintHTML(data, headers = [], title = 'Report') {
    const companyName = 'Sagnay to Everyone Hub';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: A4;
              margin: 1in;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2e7d32;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #2e7d32;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              color: #333;
              margin-bottom: 10px;
            }
            .report-date {
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 11px;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #2e7d32;
            }
            .status-active { color: #2e7d32; font-weight: bold; }
            .status-pending { color: #f44336; font-weight: bold; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companyName}</div>
            <div class="report-title">${title}</div>
            <div class="report-date">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => {
                if (item.sku) {
                  // Inventory data structure
                  return `
                    <tr>
                      <td>${item.name || ''}</td>
                      <td>${item.sku || ''}</td>
                      <td>${item.category || ''}</td>
                      <td>${item.stock || 0}</td>
                      <td>${item.sales || 0}</td>
                      <td>₱${item.price || 0}</td>
                      <td>₱${item.rating || 0}</td>
                      <td class="status-${item.status || ''}">${item.status || ''}</td>
                    </tr>
                  `;
                }
                // Product data structure
                return `
                  <tr>
                    <td>${item.name || ''}</td>
                    <td>${item.category || ''}</td>
                    <td>₱${item.price || 0}</td>
                    <td>${item.stock || 0}</td>
                    <td class="status-${item.status || ''}">${item.status || ''}</td>
                    <td>${item.sales || 0}</td>
                    <td>${item.rating || 0}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Report generated by ${companyName} | Total records: ${data.length} | ${new Date().toISOString()}
          </div>
        </body>
      </html>
    `;
  }

  // Generate PDF using jsPDF (if available)
  static generatePDFWithjsPDF(pdf, data, headers = [], options = {}) {
    const title = options.title || 'Report';
    
    // Add title
    pdf.setFontSize(20);
    pdf.text(title, 20, 30);
    
    // Add date
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Add table (basic implementation)
    let yPosition = 60;
    const cellHeight = 10;
    const cellWidth = 30;
    
    // Headers
    if (headers.length > 0) {
      headers.forEach((header, index) => {
        pdf.text(header, 20 + (index * cellWidth), yPosition);
      });
      yPosition += cellHeight;
    }
    
    // Data rows
    data.forEach((item, rowIndex) => {
      const values = Object.values(item);
      values.forEach((value, colIndex) => {
        pdf.text(String(value), 20 + (colIndex * cellWidth), yPosition);
      });
      yPosition += cellHeight;
      
      // Add new page if needed
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
    });
  }

  // Download file utility
  static downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default DataExport;