import PDFDocument from 'pdfkit';
import fs from 'fs';

function generateMaintenanceInvoice() {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const invoiceNumber = `INV-${Date.now()}`;
  const invoiceDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Get current month and year for the service period
  const currentDate = new Date();
  const servicePeriod = currentDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long'
  });
  
  // Output to file
  doc.pipe(fs.createWriteStream('WOW-Monthly-Maintenance-Invoice.pdf'));
  
  // Header
  doc.fontSize(28)
     .fillColor('#3a362f')
     .text('INVOICE', 50, 50, { align: 'left' });
  
  doc.fontSize(10)
     .fillColor('#6f6a60')
     .text(`Invoice #: ${invoiceNumber}`, 50, 90)
     .text(`Date: ${invoiceDate}`, 50, 105)
     .text(`Service Period: ${servicePeriod}`, 50, 120)
     .text(`Due Date: Upon Receipt`, 50, 135);
  
  // From Section
  doc.fontSize(12)
     .fillColor('#3a362f')
     .text('FROM:', 50, 175);
  
  doc.fontSize(10)
     .fillColor('#6f6a60')
     .text('Titan Innovations LLC', 50, 195)
     .text('Professional Website Development', 50, 210)
     .text('Full-Stack E-Commerce Solutions', 50, 225);
  
  // To Section
  doc.fontSize(12)
     .fillColor('#3a362f')
     .text('BILL TO:', 320, 175);
  
  doc.fontSize(10)
     .fillColor('#6f6a60')
     .text('WOW by Dany', 320, 195)
     .text('Jewelry E-Commerce Store', 320, 210)
     .text('wowbydany.com', 320, 225);
  
  // Line separator
  doc.moveTo(50, 265)
     .lineTo(545, 265)
     .strokeColor('#ece6dc')
     .lineWidth(2)
     .stroke();
  
  // Items header
  const tableTop = 295;
  doc.fontSize(10)
     .fillColor('#3a362f')
     .font('Helvetica-Bold')
     .text('DESCRIPTION', 50, tableTop)
     .text('QTY', 350, tableTop)
     .text('RATE', 410, tableTop)
     .text('AMOUNT', 480, tableTop, { align: 'right' });
  
  // Items header line
  doc.moveTo(50, tableTop + 15)
     .lineTo(545, tableTop + 15)
     .strokeColor('#ece6dc')
     .lineWidth(1)
     .stroke();
  
  // Invoice items for monthly maintenance
  const items = [
    {
      description: 'Monthly Website Hosting & Maintenance',
      details: 'Server hosting, uptime monitoring, daily backups, security patches',
      qty: 1,
      rate: 25.00
    },
    {
      description: 'Product Management Support',
      details: 'Inventory updates, product additions, price adjustments assistance',
      qty: 1,
      rate: 15.00
    },
    {
      description: 'Technical Support & Updates',
      details: '24/7 error monitoring, bug fixes, performance optimization',
      qty: 1,
      rate: 20.00
    },
    {
      description: 'Payment Processing Maintenance',
      details: 'Stripe integration monitoring, transaction support, tax compliance',
      qty: 1,
      rate: 10.00
    },
    {
      description: 'Security & Compliance',
      details: 'SSL certificate, HTTPS enforcement, data protection, PCI compliance',
      qty: 1,
      rate: 10.00
    }
  ];
  
  let yPosition = tableTop + 30;
  doc.font('Helvetica');
  
  items.forEach((item, index) => {
    const amount = item.qty * item.rate;
    
    // Main description
    doc.fontSize(10)
       .fillColor('#3a362f')
       .font('Helvetica-Bold')
       .text(item.description, 50, yPosition, { width: 290 });
    
    // Details
    doc.fontSize(8)
       .fillColor('#6f6a60')
       .font('Helvetica')
       .text(item.details, 50, yPosition + 13, { width: 290 });
    
    // Quantity, Rate, Amount
    doc.fontSize(10)
       .fillColor('#3a362f')
       .text(item.qty.toString(), 350, yPosition)
       .text(`$${item.rate.toFixed(2)}`, 410, yPosition)
       .text(`$${amount.toFixed(2)}`, 480, yPosition, { align: 'right', width: 65 });
    
    yPosition += 45;
    
    // Separator line between items
    if (index < items.length - 1) {
      doc.moveTo(50, yPosition - 5)
         .lineTo(545, yPosition - 5)
         .strokeColor('#ece6dc')
         .lineWidth(0.5)
         .stroke();
    }
  });
  
  // Totals section
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const tax = 0; // No tax for services
  const total = subtotal + tax;
  
  const totalsY = yPosition + 20;
  
  // Subtotal line separator
  doc.moveTo(50, totalsY - 10)
     .lineTo(545, totalsY - 10)
     .strokeColor('#ece6dc')
     .lineWidth(1)
     .stroke();
  
  doc.fontSize(10)
     .fillColor('#6f6a60')
     .text('Subtotal:', 380, totalsY)
     .text(`$${subtotal.toFixed(2)}`, 480, totalsY, { align: 'right', width: 65 });
  
  // Total (highlighted)
  doc.fontSize(14)
     .fillColor('#3a362f')
     .font('Helvetica-Bold')
     .text('TOTAL:', 380, totalsY + 30)
     .text(`$${total.toFixed(2)}`, 480, totalsY + 30, { align: 'right', width: 65 });
  
  // Total line
  doc.moveTo(375, totalsY + 50)
     .lineTo(545, totalsY + 50)
     .strokeColor('#caa55b')
     .lineWidth(2)
     .stroke();
  
  // Payment terms and notes
  const notesY = totalsY + 80;
  doc.fontSize(11)
     .fillColor('#3a362f')
     .font('Helvetica-Bold')
     .text('Services Included', 50, notesY);
  
  doc.fontSize(9)
     .fillColor('#6f6a60')
     .font('Helvetica')
     .text('• 99.9% uptime guarantee with monitoring', 50, notesY + 20)
     .text('• Daily automated backups and recovery', 50, notesY + 35)
     .text('• Priority technical support response', 50, notesY + 50)
     .text('• Monthly performance reports', 50, notesY + 65)
     .text('• Free minor updates and improvements', 50, notesY + 80);
  
  // Payment Methods
  const paymentMethodsY = notesY + 105;
  doc.fontSize(11)
     .fillColor('#3a362f')
     .font('Helvetica-Bold')
     .text('Payment Methods Accepted', 50, paymentMethodsY);
  
  doc.fontSize(9)
     .fillColor('#6f6a60')
     .font('Helvetica')
     .text('• Zelle', 50, paymentMethodsY + 20)
     .text('• Cash', 50, paymentMethodsY + 35)
     .text('• Apple Pay', 50, paymentMethodsY + 50)
     .text('• Credit/Debit Card', 50, paymentMethodsY + 65)
     .text('• Bank Transfer', 50, paymentMethodsY + 80);
  
  // Footer
  const footerY = 680;
  doc.fontSize(11)
     .fillColor('#3a362f')
     .font('Helvetica-Bold')
     .text('Service Notes', 50, footerY);
  
  doc.fontSize(9)
     .fillColor('#6f6a60')
     .font('Helvetica')
     .text('Your website at wowbydany.com is fully maintained and monitored', 50, footerY + 20)
     .text('All services are performed remotely with no downtime required', 50, footerY + 35)
     .text('For support, contact us anytime', 50, footerY + 50);
  
  // Rose-gold accent bar at bottom
  doc.rect(50, footerY + 75, 495, 3)
     .fillAndStroke('#caa55b', '#caa55b');
  
  doc.fontSize(8)
     .fillColor('#6f6a60')
     .text('Thank you for your continued business!', 50, footerY + 85, { align: 'center', width: 495 });
  
  // Finalize PDF
  doc.end();
  
  console.log('✅ Monthly Maintenance Invoice generated successfully: WOW-Monthly-Maintenance-Invoice.pdf');
}

generateMaintenanceInvoice();