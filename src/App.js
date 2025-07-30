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
import logo from "./logo.svg";
import "./App.css";

export default function AlimonyFormApp() {
  const [responses, setResponses] = useState({ spouse1: {}, spouse2: {} });
  const [sections, setSections] = useState([]);

  useEffect(() => {
    setSections(questions);
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
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

  const getSuggestions = (key) => {
    const values = new Set();
    [responses.spouse1[key], responses.spouse2[key]].forEach((v) => {
      if (v && v.trim() !== "") values.add(v.trim());
    });
    return Array.from(values);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    doc.setFontSize(14);
    doc.text("Alimony Questionnaire", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${timestamp}`, 14, 27);
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
      title: "Alimony Questionnaire",
      description: "Generated questionnaire responses",
      sections: [
        {
          children: [
            new Paragraph({ children: [new TextRun("Alimony Questionnaire")] }),
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
    let textOutput = `Alimony Questionnaire\nGenerated on: ${timestamp}\n\n`;
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

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Alimony Questionnaire</h1>
      {sections.map((section, i) => (
        <div key={i} style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>{section.title}</h3>
          {section.questions.map((q, j) => (
            <div key={j} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <label style={{ width: '30%' }}>{q}</label>
              <div style={{ flex: 1 }}>
                <input
                  list={`spouse1-${q}`}
                  placeholder="Spouse 1"
                  value={responses.spouse1[q] || ""}
                  onChange={(e) => handleChange("spouse1", q, e.target.value)}
                  style={{ width: '100%' }}
                />
                <datalist id={`spouse1-${q}`}>
                  {getSuggestions(q).map((val, idx) => (
                    <option key={idx} value={val} />
                  ))}
                </datalist>
              </div>
              <div style={{ flex: 1 }}>
                <input
                  list={`spouse2-${q}`}
                  placeholder="Spouse 2"
                  value={responses.spouse2[q] || ""}
                  onChange={(e) => handleChange("spouse2", q, e.target.value)}
                  style={{ width: '100%' }}
                />
                <datalist id={`spouse2-${q}`}>
                  {getSuggestions(q).map((val, idx) => (
                    <option key={idx} value={val} />
                  ))}
                </datalist>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <label style={{ width: '30%' }}>Additional Comments</label>
            <input
              list={`spouse1-${section.title}-comments`}
              style={{ flex: 1 }}
              placeholder="Spouse 1"
              value={responses.spouse1[section.title + "_comments"] || ""}
              onChange={(e) => handleChange("spouse1", section.title + "_comments", e.target.value)}
            />
            <datalist id={`spouse1-${section.title}-comments`}>
              {getSuggestions(section.title + "_comments").map((val, idx) => (
                <option key={idx} value={val} />
              ))}
            </datalist>
            <input
              list={`spouse2-${section.title}-comments`}
              style={{ flex: 1 }}
              placeholder="Spouse 2"
              value={responses.spouse2[section.title + "_comments"] || ""}
              onChange={(e) => handleChange("spouse2", section.title + "_comments", e.target.value)}
            />
            <datalist id={`spouse2-${section.title}-comments`}>
              {getSuggestions(section.title + "_comments").map((val, idx) => (
                <option key={idx} value={val} />
              ))}
            </datalist>
          </div>
        </div>
      ))}
      <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
        <button onClick={generatePDF} style={{ padding: '10px 20px', fontWeight: 'bold' }}>Generate PDF</button>
        <button onClick={generateWord} style={{ padding: '10px 20px', fontWeight: 'bold' }}>Generate Word</button>
        <button onClick={generateText} style={{ padding: '10px 20px', fontWeight: 'bold' }}>Generate Text</button>
      </div>
    </div>
  );
}
