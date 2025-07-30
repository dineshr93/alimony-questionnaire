import React, { useState } from "react";
import { saveAs } from "file-saver";
import "./App.css";

const sections = [
  {
    title: "1. Marriage and Family Details",
    questions: [
      "Date of marriage:",
      "Current marital status (e.g., separated, divorced):",
      "Duration of the marriage (in years):",
      "Number of children from this marriage:",
      "Current custody arrangement (if applicable):"
    ]
  },
  {
    title: "2. Personal Background",
    questions: [
      "Full name:",
      "Date of birth and age:",
      "Educational qualifications:",
      "Any professional certifications or licenses:",
      "Do you have any physical or mental health conditions affecting your ability to work?"
    ]
  },
  {
    title: "3. Employment and Income",
    questions: [
      "Current employment status (employed/unemployed/self-employed):",
      "Occupation and job title (if employed):",
      "Name of employer/business (optional):",
      "Monthly income from employment or business:",
      "Other income sources (e.g., rent, dividends, family support):",
      "Have you filed income tax returns for the last 3 years?"
    ]
  },
  {
    title: "4. Financial Assets and Liabilities",
    questions: [
      "List of immovable property owned (location, type, current value):",
      "List of movable assets (vehicles, electronics, jewelry, etc.):",
      "Details of bank accounts and balances (optional):",
      "Investments held (FDs, stocks, mutual funds, etc.):",
      "Outstanding loans or liabilities (type, lender, amount due):",
      "Any previous lump sum settlements or asset transfers between parties:"
    ]
  },
  {
    title: "5. Monthly Expenses",
    questions: [
      "Monthly housing cost (rent/mortgage):",
      "Monthly utility and grocery expenses:",
      "Medical and insurance expenses:",
      "Educational expenses (self/children):",
      "Transport and communication expenses:",
      "Any other recurring monthly costs:"
    ]
  },
  {
    title: "6. Marital Conduct and Litigation History",
    questions: [
      "Were there any allegations of cruelty, abuse, or misconduct?",
      "Any prior or ongoing litigation (maintenance, DV, child custody, etc.):",
      "Has either spouse contributed to litigation delay?",
      "Have there been any overlapping maintenance claims in other courts?"
    ]
  },
  {
    title: "7. Standard of Living and Needs",
    questions: [
      "Describe the standard of living enjoyed during the marriage:",
      "What is your current standard of living compared to during the marriage?",
      "Do you have any special or reasonable monthly needs (medical, dietary, etc.)?",
      "Do you require financial support to maintain a comparable lifestyle?"
    ]
  }
];


export default function AlimonyFormApp() {
  const [responses, setResponses] = useState({ spouse1: {}, spouse2: {} });

  const handleChange = (spouseKey, key, value) => {
    setResponses({
      ...responses,
      [spouseKey]: {
        ...responses[spouseKey],
        [key]: value
      }
    });
  };

  const handleGenerateText = () => {
    let result = "";
    ["spouse1", "spouse2"].forEach((spouseKey, index) => {
      const label = spouseKey === "spouse1" ? "Spouse 1" : "Spouse 2";
      result += `\n=============================\n${label} Responses\n=============================\n`;
      sections.forEach((section) => {
        result += `\n${section.title}\n`;
        section.questions.forEach((q) => {
          result += `\n${q}\n${responses[spouseKey][q] || ""}\n`;
        });
        result += `\nAdditional Comments:\n${responses[spouseKey][section.title + "_comments"] || ""}\n`;
      });
    });

    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "Alimony_Questionnaire.txt");
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Alimony Questionnaire</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        {["spouse1", "spouse2"].map((spouseKey, idx) => (
          <div key={spouseKey} style={{ flex: '1 1 500px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '10px' }}>
              {spouseKey === "spouse1" ? "Spouse 1" : "Spouse 2"}
            </h2>
            {sections.map((section, i) => (
              <div key={i} style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>{section.title}</h3>
                {section.questions.map((q, j) => (
                  <div key={j} style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px' }}>{q}</label>
                    <textarea
                      rows="3"
                      style={{ width: '100%', padding: '8px', borderRadius: '5px', borderColor: '#ccc' }}
                      value={responses[spouseKey][q] || ""}
                      onChange={(e) => handleChange(spouseKey, q, e.target.value)}
                    />
                  </div>
                ))}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '5px' }}>Additional Comments</label>
                  <textarea
                    rows="3"
                    style={{ width: '100%', padding: '8px', borderRadius: '5px', borderColor: '#ccc' }}
                    value={responses[spouseKey][section.title + "_comments"] || ""}
                    onChange={(e) => handleChange(spouseKey, section.title + "_comments", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        onClick={handleGenerateText}
        style={{ marginTop: '30px', padding: '10px 20px', fontWeight: 'bold', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
      >
        Generate Text File
      </button>
    </div>
  );
}
