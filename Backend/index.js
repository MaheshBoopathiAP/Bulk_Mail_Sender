const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Enable CORS for all origins (you can restrict this later)
app.use(cors({ origin: '*' }));

const PORT = process.env.PORT || 5000;

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Email content template (no company name)
const emailTemplate = ({ name }) => `
Hi ${name},

I'm Mahesh Boopathi, a Full-Stack Developer with hands-on experience in building scalable web applications using
Spring Boot, React.js, and PostgreSQL.

I currently work on enterprise-scale software solutions, where I’ve designed and deployed Spring Boot microservices
processing over 100K transactions per hour, optimized PostgreSQL queries for performance, and developed
React dashboards to enhance user experience and data visualization.

I’m passionate about backend and frontend engineering, cloud deployment on AWS, and building impactful
full-stack applications that solve real-world problems.

I’ve attached my resume for your reference and would love the opportunity to connect and discuss potential roles
that align with my skills.

Warm regards,  
Mahesh Boopathi  
Email: maheoffi@gmail.com  
LinkedIn: https://www.linkedin.com/in/mahesh-boopathi-a-p/
`;

// API Endpoint: Upload Excel + PDF and send emails
app.post('/send-emails', upload.fields([{ name: 'excel' }, { name: 'pdf' }]), async (req, res) => {
  try {
    const excelFile = req.files?.excel?.[0];
    const pdfFile = req.files?.pdf?.[0];

    if (!excelFile || !pdfFile) {
      return res.status(400).send('Both Excel and PDF files are required.');
    }

    // Read Excel file
    const workbook = xlsx.readFile(excelFile.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Read PDF file as buffer
    const pdfBuffer = fs.readFileSync(pdfFile.path);

    // Setup email transporter (using environment variables)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let sentCount = 0;
    let skippedCount = 0;

    // Loop through each email address in Excel
    for (const row of data) {
      const email = (row.Email || row.email || '').trim();

      // Skip empty or invalid emails
      if (!email || !email.includes('@')) {
        console.warn('⚠️ Skipping invalid email:', email);
        skippedCount++;
        continue;
      }

      const [namePart] = email.split('@');
      const name =
        namePart && namePart.length > 0
          ? namePart.charAt(0).toUpperCase() + namePart.slice(1)
          : 'there';

      const mailText = emailTemplate({ name });

      console.log(`📧 Sending email to: ${email}`);

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: `Full-Stack Developer — Application`,
          text: mailText,
          attachments: [
            {
              filename: 'Mahesh_Boopathi_CV.pdf',
              content: pdfBuffer,
            },
          ],
        });

        sentCount++;
      } catch (mailErr) {
        console.error(`❌ Failed to send to ${email}:`, mailErr.message);
        skippedCount++;
      }
    }

    // Clean up uploaded files
    fs.unlinkSync(excelFile.path);
    fs.unlinkSync(pdfFile.path);

    res.send(`✅ Emails sent: ${sentCount} | ⚠️ Skipped: ${skippedCount}`);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('❌ Error sending emails.');
  }
});

// Start the backend server
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
