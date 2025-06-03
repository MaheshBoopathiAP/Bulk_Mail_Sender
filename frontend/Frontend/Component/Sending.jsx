import React, { useState } from "react";

const EmailSender = () => {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    setStatus("Sending emails...");

    try {
      const res = await fetch("https://bulk-mail-sender-a46g.onrender.com/send-emails", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      setStatus(text);
    } catch (err) {
      console.error(err);
      setStatus("Failed to send emails.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Upload Excel & PDF to Send Emails</h2>
      <form onSubmit={handleSubmit}>
        <label>Select Excel File (.xlsx):</label><br />
        <input type="file" name="excel" accept=".xlsx" required /><br /><br />

        <label>Select PDF File:</label><br />
        <input type="file" name="pdf" accept=".pdf" required /><br /><br />

        <button type="submit">Send Emails</button>
      </form>

      <p>{status}</p>
    </div>
  );
};

export default EmailSender;
