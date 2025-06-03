const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();


app.use(cors({
  origin: 'http://localhost:5173', // <-- Allow your frontend origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

const PORT=process.env.PORT

const upload = multer({ dest: 'uploads/' });

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
        user: 'write your email',
        pass: 'jwrite your pass',
      },
    });

    const emailTemplate = ({ name, company }) => `
         Hi ${name},
        
         I’m a full-stack developer with expertise in modern technologies like React, Node.js, Python, and cloud platforms (AWS/Docker). I’ve been following ${company} and admire the work you’re doing—I’d love to contribute.

         Here’s why we should talk:

         I build fast, scalable, and clean applications.

         I stay updated with the latest tech trends.

         I’m eager to solve real-world problems with your team.

         Attached is my resume. Let’s chat about how I can add value to ${company}.

         Warm regards,  
         Sagar
    `;
    

    for (const row of data) {
      const email = row.Email || row.email;
      if (!email) continue;

      const [namePart, domainPart] = email.split('@');
      const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const company = domainPart.split('.')[0]; // e.g., gmail -> Gmail

      const mailText = emailTemplate({
        name,
        company,
        triggerEvent: row.TriggerEvent || 'something amazing',
        similarCompany: row.SimilarCompany || 'a similar client',
        benefit: row.Benefit || 'improving efficiency',
        specificTime: row.SpecificTime || 'this Friday at 2 PM',
      });

      await transporter.sendMail({
        from: 'write your email',
        to: email,
        subject: `Full-Stack Developer Interested in Joining ${company}`,
        text: mailText,
        attachments: [
          {
            filename: 'Resume.pdf',
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

app.listen(PORT, () => console.log(`Backend running on ${PORT}`));