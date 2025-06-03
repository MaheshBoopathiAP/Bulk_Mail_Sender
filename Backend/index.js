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
I’m a full-stack developer with expertise in modern technologies like React, Node.js, Python, and cloud platforms (AWS/Docker). I’ve been following ${company} and admire the work you’re doing—I’d love to contribute.

Here’s why we should talk:

- I build fast, scalable, and clean applications.
- I stay updated with the latest tech trends.
- I’m eager to solve real-world problems with your team.

Attached is my resume. Let’s chat about how I can add value to ${company}.

Warm regards,  
Mahesh Boopathi A P
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
