import React, { useState } from "react";
import { saveAs } from "file-saver";
import "./App.css";

const sections = [
  {
    title: "I. Personal and Relationship Details",
    questions: [
      "What is the date of marriage?",
      "What is the current marital status?",
      "What is the duration of the marriage?",
      "Are there any children from the marriage? If yes, provide details."
    ]
  },
  {
    title: "II. Income and Employment Information",
    questions: [
      "Are you currently employed? If yes, provide details.",
      "Do you have any additional sources of income?",
      "Have you filed income tax returns for the past 3 years?",
      "Do you receive any pensions?"
    ]
  },
  {
    title: "III. Assets and Liabilities",
    questions: [
      "List all immovable properties owned.",
      "List movable assets such as vehicles, bank accounts, etc.",
      "Are there any outstanding loans or liabilities?"
    ]
  },
  {
    title: "IV. Monthly Expenses",
    questions: [
      "What are your average monthly living expenses? Provide a breakdown."
    ]
  },
  {
    title: "V. Lifestyle and Standard of Living",
    questions: [
      "What was your standard of living during the marriage?",
      "Did both parties contribute financially to the household?",
      "Did either party support the other's career?"
    ]
  },
  {
    title: "VI. Education, Skills, and Employability",
    questions: [
      "What are your educational qualifications?",
      "Do you have any professional certifications?",
      "Have you been employed in the past? Provide details.",
      "Are you currently capable of earning?"
    ]
  },
  {
    title: "VII. Health and Age",
    questions: [
      "What is your current age?",
      "Do you suffer from any illnesses or disabilities?"
    ]
  },
  {
    title: "VIII. Conduct and Litigation History",
    questions: [
      "Were there any allegations or findings of misconduct?",
      "Have either of the parties contributed to the delay in litigation?"
    ]
  },
  {
    title: "IX. Existing Maintenance or Settlements",
    questions: [
      "Are there any interim maintenance orders in place?",
      "Have there been any prior settlements?",
      "Have you received or paid any previous maintenance?"
    ]
  },
  {
    title: "X. Other Legal Proceedings",
    questions: [
      "Are there any other ongoing legal cases between the parties?",
      "Have any other courts passed conflicting or parallel orders?"
    ]
  }
];

export default function AlimonyFormApp() {
  const [responses, setResponses] = useState({});

  const handleChange = (key, value) => {
    setResponses({ ...responses, [key]: value });
  };

  const handleGenerateText = () => {
    let result = "";
    sections.forEach((section) => {
      result += `\n${section.title}\n`;
      section.questions.forEach((q) => {
        result += `\n${q}\n${responses[q] || ""}\n`;
      });
      result += `\nAdditional Comments:\n${responses[section.title + "_comments"] || ""}\n`;
    });

    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "Alimony_Questionnaire.txt");
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Alimony Questionnaire</h1>
      {sections.map((section, i) => (
        <div key={i} style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>{section.title}</h2>
          {section.questions.map((q, j) => (
            <div key={j} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px' }}>{q}</label>
              <textarea
                rows="3"
                style={{ width: '100%', padding: '8px', borderRadius: '5px', borderColor: '#ccc' }}
                value={responses[q] || ""}
                onChange={(e) => handleChange(q, e.target.value)}
              />
            </div>
          ))}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px' }}>Additional Comments</label>
            <textarea
              rows="3"
              style={{ width: '100%', padding: '8px', borderRadius: '5px', borderColor: '#ccc' }}
              value={responses[section.title + "_comments"] || ""}
              onChange={(e) =>
                handleChange(section.title + "_comments", e.target.value)
              }
            />
          </div>
        </div>
      ))}
      <button
        onClick={handleGenerateText}
        style={{ marginTop: '20px', padding: '10px 20px', fontWeight: 'bold', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
      >
        Generate Text File
      </button>
    </div>
  );
}