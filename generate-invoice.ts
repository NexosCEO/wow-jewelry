import PDFDocument from 'pdfkit';
import fs from 'fs';

function generateInvoice() {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const invoiceNumber = `INV-${Date.now()}`;
  const invoiceDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Output to file
  doc.pipe(fs.createWriteStream('WOW-Jewelry-Website-Invoice.pdf'));
  
  // Header
  doc.fontSize(28)
     .fillColor('#3a362f')
     .text('INVOICE', 50, 50, { align: 'left' });
  
  doc.fontSize(10)
     .fillColor('#6f6a60')
     .text(`Invoice #: ${invoiceNumber}`, 50, 90)
     .text(`Date: ${invoiceDate}`, 50, 105)
     .text(`Due Date: Upon Receipt`, 50, 120);
  
  // From Section
  doc.fontSize(12)
     .fillColor('#3a362f')
     .text('FROM:', 50, 160);
  
  doc.fontSize(10)
     .fillColor('#6f6a60')
     .text('Titan Innovations LLC', 50, 180)
     .text('Professional Website Development', 50, 195)
     .text('Full-Stack E-Commerce Solutions', 50, 210);
  
  // To Section
  doc.fontSize(12)
     .fillColor('#3a362f')
     .text('BILL TO:', 320, 160);
  
  doc.fontSize(10)
     .fillColor('#6f6a60')
     .text('WOW by Dany', 320, 180)
     .text('Jewelry E-Commerce Store', 320, 195)
     .text('Online Retail Business', 320, 210);
  
  // Line separator
  doc.moveTo(50, 250)
     .lineTo(545, 250)
     .strokeColor('#ece6dc')
     .lineWidth(2)
     .stroke();
  
  // Items header
  const tableTop = 280;
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
  
  // Invoice items
  const items = [
    {
      description: 'Rose-Gold Luxury Theme Design & Implementation',
      details: 'Custom color palette, gradient accents, typography hierarchy',
      qty: 1,
      rate: 75.00
    },
    {
      description: 'Stripe Payment Integration & Security',
      details: 'Payment processing setup, rate limiting, security headers',
      qty: 1,
      rate: 60.00
    },
    {
      description: 'Product Filtering & Sorting System',
      details: 'Dynamic filters by category, price range, and alphabetical sorting',
      qty: 1,
      rate: 40.00
    },
    {
      description: 'Responsive Mobile-First Design',
      details: 'Full mobile optimization, cart system, product cards',
      qty: 1,
      rate: 35.00
    },
    {
      description: 'Architecture Review & Quality Assurance',
      details: 'Accessibility compliance (WCAG AA), code review, testing',
      qty: 1,
      rate: 40.00
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
  const tax = 0; // No tax for this invoice
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
     .text('Payment Terms', 50, notesY);
  
  doc.fontSize(9)
     .fillColor('#6f6a60')
     .font('Helvetica')
     .text('• Payment is due upon receipt of this invoice', 50, notesY + 20)
     .text('• All work has been completed and delivered as of ' + invoiceDate, 50, notesY + 35)
     .text('• Website is fully functional with rose-gold theme and Stripe payments', 50, notesY + 50);
  
  // Payment Methods
  const paymentMethodsY = notesY + 85;
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
  const footerY = 720;
  doc.fontSize(11)
     .fillColor('#3a362f')
     .font('Helvetica-Bold')
     .text('Project Summary', 50, footerY);
  
  doc.fontSize(9)
     .fillColor('#6f6a60')
     .font('Helvetica')
     .text('WOW by Dany - Handmade Jewelry E-Commerce Platform', 50, footerY + 20)
     .text('Fully responsive, secure, and ready for customers', 50, footerY + 35);
  
  // Rose-gold accent bar at bottom
  doc.rect(50, footerY + 65, 495, 3)
     .fillAndStroke('#caa55b', '#caa55b');
  
  doc.fontSize(8)
     .fillColor('#6f6a60')
     .text('Thank you for your business!', 50, footerY + 75, { align: 'center', width: 495 });
  
  // Finalize PDF
  doc.end();
  
  console.log('✅ Invoice generated successfully: WOW-Jewelry-Website-Invoice.pdf');
}

generateInvoice();
