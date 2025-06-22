const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Enable CORS for all origins (you can restrict it later if needed)
app.use(cors({ origin: '*' }));

const PORT = process.env.PORT || 5000;

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// API Endpoint
app.post('/send-emails', upload.fields([{ name: 'excel' }, { name: 'pdf' }]), async (req, res) => {
  try {
    const excelFile = req.files.excel[0];
    const pdfFile = req.files.pdf[0];

    const workbook = xlsx.readFile(excelFile.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const pdfBuffer = fs.readFileSync(pdfFile.path);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'maheoffi@gmail.com',
        pass: 'uhprddwtmfooonuc',
      },
    });

    const emailTemplate = ({ name, company }) => `
      Hi ${name},

      I'm Mahesh Boopathi, a full-stack developer with hands-on experience in technologies like React, Spring Boot, PostgreSQL, and AWS.

      I've been following ${company} and really admire the work your team is doing. I’d love the opportunity to contribute and grow alongside you.

      Here’s why I believe we should connect:
      - I build fast, scalable, and maintainable full-stack applications.
      - I stay up to date with the latest trends in web development.
      - I’m passionate about solving real-world problems through clean code and collaboration.

      I've attached my resume for your reference. I’d be thrilled to connect and explore how I can bring value to ${company}.

      Looking forward to hearing from you.

      Warm regards,  
      Mahesh Boopathi
      `;


    for (const row of data) {
      const email = row.Email || row.email;
      if (!email) continue;

      const [namePart, domainPart] = email.split('@');
      const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const company = domainPart.split('.')[0];

      const mailText = emailTemplate({ name, company });

      console.log(`Sending email to: ${email}`);

      await transporter.sendMail({
        from: 'maheoffi@gmail.com',
        to: email,
        subject: `Full-Stack Developer Interested in Joining ${company}`,
        text: mailText,
        attachments: [
          {
            filename: 'Mahesh___CV (4).pdf',
            content: pdfBuffer,
          },
        ],
      });
    }

    fs.unlinkSync(excelFile.path);
    fs.unlinkSync(pdfFile.path);

    res.send('Emails sent successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending emails');
  }
});

// Start server
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
