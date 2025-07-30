import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun
} from "docx";
import { saveAs as saveWord } from "file-saver";
import questions from "./questions.json";
import logo from "./logo.png";
import "./App.css";

export default function AlimonyFormApp() {
  const [responses, setResponses] = useState({ spouse1: {}, spouse2: {} });
  const [sections, setSections] = useState([]);

  useEffect(() => {
    setSections(questions);
    const link = document.querySelector("link[rel*='icon']") || document.createElement("link");
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = logo;
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  const handleChange = (spouseKey, key, value) => {
    setResponses((prev) => ({
      ...prev,
      [spouseKey]: {
        ...prev[spouseKey],
        [key]: value
      }
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    doc.setFontSize(14);
    doc.text("Alimony calculation Guide (Based on 2024 INSC 961 Guidelines)", 14, 20);
    doc.setFontSize(8);
    doc.text("This utility is just a helper for the contesting parties to collect and be prepared. The final alimony is itself the sole discretion of judges.", 14, 25);
    doc.setFontSize(10);
    doc.text(`Generated on: ${timestamp}`, 14, 32);
    let finalRows = [];

    sections.forEach((section) => {
      finalRows.push([section.title, "", ""]);
      section.questions.forEach((q) => {
        finalRows.push([
          q,
          responses.spouse1[q] || "",
          responses.spouse2[q] || ""
        ]);
      });
      finalRows.push([
        "Additional Comments",
        responses.spouse1[section.title + "_comments"] || "",
        responses.spouse2[section.title + "_comments"] || ""
      ]);
    });

    autoTable(doc, {
      head: [["Question", "Spouse 1", "Spouse 2"]],
      body: finalRows,
      startY: 35
    });

    doc.save("Alimony_Questionnaire.pdf");
  };

  const generateWord = async () => {
    const timestamp = new Date().toLocaleString();

    const rows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("Question")] }),
          new TableCell({ children: [new Paragraph("Spouse 1")] }),
          new TableCell({ children: [new Paragraph("Spouse 2")] })
        ]
      })
    ];

    sections.forEach((section) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(section.title)] }),
            new TableCell({ children: [new Paragraph("")] }),
            new TableCell({ children: [new Paragraph("")] })
          ]
        })
      );
      section.questions.forEach((q) => {
        rows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(q)] }),
              new TableCell({ children: [new Paragraph(responses.spouse1[q] || "")] }),
              new TableCell({ children: [new Paragraph(responses.spouse2[q] || "")] })
            ]
          })
        );
      });
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Additional Comments")] }),
            new TableCell({ children: [new Paragraph(responses.spouse1[section.title + "_comments"] || "")] }),
            new TableCell({ children: [new Paragraph(responses.spouse2[section.title + "_comments"] || "")] })
          ]
        })
      );
    });

    const doc = new Document({
      creator: "Alimony App",
      title: "Alimony calculation Guide (Based on 2024 INSC 961 Guidelines)",
      description: "Generated questionnaire responses",
      sections: [
        {
          children: [
            new Paragraph({ children: [new TextRun("Alimony calculation Guide (Based on 2024 INSC 961 Guidelines)")] }),
            new Paragraph({ children: [new TextRun({ text: "This utility is just a helper for the contesting parties to collect and be prepared. The final alimony is itself the sole discretion of judges.", font: "Arial", size: 16, italics: true })] }),
            new Paragraph({ children: [new TextRun(`Generated on: ${timestamp}`)] }),
            new Table({ rows })
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    saveWord(blob, "Alimony_Questionnaire.docx");
  };


  const generateText = () => {
    const timestamp = new Date().toLocaleString();
    let textOutput = `Alimony calculation Guide (Based on 2024 INSC 961 Guidelines)\nThis utility is just a helper for the contesting parties to collect and be prepared. The final alimony is itself the sole discretion of judges.\nGenerated on: ${timestamp}\n\n`;
    sections.forEach((section) => {
      textOutput += section.title + "\n";
      section.questions.forEach((q) => {
        textOutput += `${q}\nSpouse 1: ${responses.spouse1[q] || ""}\nSpouse 2: ${responses.spouse2[q] || ""}\n`;
      });
      textOutput += `Additional Comments\nSpouse 1: ${responses.spouse1[section.title + "_comments"] || ""}\nSpouse 2: ${responses.spouse2[section.title + "_comments"] || ""}\n\n`;
    });
    const blob = new Blob([textOutput], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "Alimony_Questionnaire.txt");
  };

  const exportToJson = () => {
    const data = JSON.stringify(responses, null, 2);
    // Proper Unicode base64 encoding using Uint8Array
    function uint8ToBase64(uint8Array) {
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      return btoa(binary);
    }
    const uint8Array = new TextEncoder().encode(data);
    const base64Data = uint8ToBase64(uint8Array);
    const blob = new Blob([base64Data], { type: "application/json" });
    saveAs(blob, "Alimony_Questionnaire.json");
  };

  const loadFromJson = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let parsedData = null;
        try {
          // Try base64 decode first
          function base64ToUint8(base64) {
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
          }
          try {
            const uint8Array = base64ToUint8(e.target.result);
            const decoded = new TextDecoder().decode(uint8Array);
            parsedData = JSON.parse(decoded);
          } catch (base64Error) {
            // If base64 fails, try plain JSON
            parsedData = JSON.parse(e.target.result);
          }
          setResponses(parsedData);
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Legal disclaimer note
  const legalNote = "This utility is just a helper for the contesting parties to collect and be prepared. The final alimony is itself the sole discretion of judges.";
  // Feedback link (only for website)
  const feedbackNote = (
    <span>
      If any improvement needs to be done, please <a href="https://github.com/dineshr93/alimony-questionnaire/issues/new" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>suggest improvements</a>.
    </span>
  );

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Alimony calculation Guide (Based on 2024 INSC 961 Guidelines)</h1>
      <div style={{ fontSize: '12px', color: '#555', marginBottom: '10px', fontStyle: 'italic' }}>{legalNote}</div>
      <div style={{ fontSize: '12px', color: '#555', marginBottom: '20px', fontStyle: 'italic' }}>{feedbackNote}</div>
      {sections.map((section, i) => (
        <div key={i} style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>{section.title}</h3>
          {section.questions.map((q, j) => (
            <div key={j} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <label style={{ width: '30%' }}>{q}</label>
              <div style={{ flex: 1 }}>
                <textarea
                  placeholder="Spouse 1"
                  value={responses.spouse1[q] || ""}
                  onChange={(e) => handleChange("spouse1", q, e.target.value)}
                  style={{ width: '100%', minHeight: '38px', resize: 'vertical', overflowY: 'hidden' }}
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  placeholder="Spouse 2"
                  value={responses.spouse2[q] || ""}
                  onChange={(e) => handleChange("spouse2", q, e.target.value)}
                  style={{ width: '100%', minHeight: '38px', resize: 'vertical', overflowY: 'hidden' }}
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <label style={{ width: '30%' }}>Additional Comments</label>
            <textarea
              style={{ flex: 1, minHeight: '38px', resize: 'vertical', overflowY: 'hidden' }}
              placeholder="Spouse 1"
              value={responses.spouse1[section.title + "_comments"] || ""}
              onChange={(e) => handleChange("spouse1", section.title + "_comments", e.target.value)}
              rows={1}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <textarea
              style={{ flex: 1, minHeight: '38px', resize: 'vertical', overflowY: 'hidden' }}
              placeholder="Spouse 2"
              value={responses.spouse2[section.title + "_comments"] || ""}
              onChange={(e) => handleChange("spouse2", section.title + "_comments", e.target.value)}
              rows={1}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
          </div>
        </div>
      ))}
      <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
        <button onClick={generatePDF} style={{ padding: '10px 20px', fontWeight: 'bold' }}>Generate PDF</button>
        <button onClick={generateWord} style={{ padding: '10px 20px', fontWeight: 'bold' }}>Generate Word</button>
        <button onClick={generateText} style={{ padding: '10px 20px', fontWeight: 'bold' }}>Generate Text</button>
        <button onClick={exportToJson} style={{ padding: '10px 20px', fontWeight: 'bold' }}>Export to JSON</button>
        <input type="file" accept=".json" onChange={loadFromJson} style={{ display: 'none' }} id="loadJsonInput" />
        <button onClick={() => document.getElementById('loadJsonInput').click()} style={{ padding: '10px 20px', fontWeight: 'bold' }}>Load from JSON</button>
      </div>
    </div>
  );
}

