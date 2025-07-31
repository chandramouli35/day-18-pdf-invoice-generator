import { useState, useRef } from "react";
import jsPDF from "jspdf";
import SignatureCanvas from "react-signature-canvas";
import QRCode from "react-qr-code";

function InvoiceForm() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    items: [{ description: "", price: "", quantity: 1 }],
    total: 0,
  });
  const sigCanvas = useRef();
  const contentRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index][name] = value;
    setFormData((prev) => ({
      ...prev,
      items: newItems,
      total: newItems.reduce(
        (sum, item) =>
          sum + parseFloat(item.price || 0) * parseInt(item.quantity || 1, 10),
        0
      ),
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", price: "", quantity: 1 }],
    }));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    doc.setFont("Roboto", "normal");
    doc.setFontSize(12);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    // Header
    doc.setFillColor(0, 120, 255); // Blue
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255); // White
    doc.setFontSize(18);
    doc.text("My Company", margin, 20);
    doc.setFontSize(10);
    doc.text(
      `Invoice #${Date.now()} | Date: ${new Date().toLocaleDateString()}`,
      margin,
      25
    );
    doc.setTextColor(0, 0, 0); // Black

    // Customer Info
    doc.setFontSize(12);
    doc.text(`Name: ${formData.name}`, margin, 40);
    doc.text(`Address: ${formData.address}`, margin, 50);

    // Items Table
    doc.setFillColor(240, 240, 240); // Light gray
    doc.rect(margin, 60, pageWidth - 2 * margin, 10, "F");
    doc.text("Description", margin + 2, 66);
    doc.text("Price (₹)", margin + 60, 66);
    doc.text("Qty", margin + 90, 66);
    doc.text("Total (₹)", margin + 110, 66);
    formData.items.forEach((item, index) => {
      const y = 70 + index * 10;
      doc.rect(margin, y, pageWidth - 2 * margin, 10, "S");
      doc.text(item.description || "-", margin + 2, y + 7);
      doc.text(`₹${item.price || 0}`, margin + 60, y + 7);
      doc.text(`${item.quantity || 1}`, margin + 90, y + 7);
      doc.text(
        `₹${(
          parseFloat(item.price || 0) * parseInt(item.quantity || 1, 10)
        ).toFixed(2)}`,
        margin + 110,
        y + 7
      );
    });

    // Total
    doc.setFont("Roboto", "bold");
    doc.text(
      `Total: ₹${formData.total.toFixed(2)}`,
      margin + 110,
      70 + formData.items.length * 10 + 5
    );

    // Signature
    doc.setFont("Roboto", "normal");
    doc.line(
      margin,
      80 + formData.items.length * 10 + 5,
      margin + 60,
      80 + formData.items.length * 10 + 5
    );
    doc.text("Signature:", margin, 85 + formData.items.length * 10 + 5);
    if (!sigCanvas.current.isEmpty()) {
      const sigImg = sigCanvas.current.toDataURL("image/png");
      doc.addImage(
        sigImg,
        "PNG",
        margin,
        90 + formData.items.length * 10 + 5,
        50,
        20
      );
    }

    // QR Code (simulated as text; use doc.addImage with QR image if needed)
    doc.text(
      `Invoice ID: ${Date.now()}`,
      margin,
      110 + formData.items.length * 10 + 5
    );

    // Footer
    doc.setFillColor(220, 220, 220); // Light gray
    doc.rect(0, 280, pageWidth, 20, "F");
    doc.setTextColor(0, 0, 0);
    doc.text("© 2025 My Company | Contact: info@mycompany.com", margin, 290);

    doc.save("invoice.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-lg p-8 border border-gray-200">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Invoice Generator
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="space-y-4">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter Address"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 mt-2">
                  <input
                    name="description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, e)}
                    placeholder="Item Description"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="price"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, e)}
                    placeholder="Price (₹)"
                    className="w-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    placeholder="Qty"
                    className="w-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <button
                onClick={addItem}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Add Item
              </button>
              <p className="mt-4 text-xl font-semibold text-gray-700">
                Total: ₹{formData.total.toFixed(2)}
              </p>
            </div>
          </div>
          <div
            ref={contentRef}
            className="p-6 bg-gray-50 rounded-lg border border-gray-200 print:p-0 print:border-0"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Invoice Preview
            </h2>
            <div className="print:border-t print:border-b print:border-gray-300 print:py-4">
              <h3 className="text-lg font-semibold text-gray-700">Invoice</h3>
              <p className="text-gray-600">Name: {formData.name}</p>
              <p className="text-gray-600">Address: {formData.address}</p>
              <h4 className="mt-2 font-semibold text-gray-700">Items:</h4>
              {formData.items.map((item, index) => (
                <p key={index} className="text-gray-600">
                  {item.description}: ₹{item.price || 0} x {item.quantity || 1}{" "}
                  = ₹
                  {(
                    parseFloat(item.price || 0) *
                    parseInt(item.quantity || 1, 10)
                  ).toFixed(2)}
                </p>
              ))}
              <p className="mt-2 font-bold text-gray-800">
                Total: ₹{formData.total.toFixed(2)}
              </p>
            </div>
            <div className="mt-6">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  className: "w-full h-24 border-2 border-gray-300 rounded-lg",
                }}
              />
            </div>
            <div className="mt-6 flex justify-center">
              <QRCode
                value={`Invoice ID: ${Date.now()}`}
                size={120}
                className="border border-gray-300 p-2 rounded"
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleExportPDF}
          className="mt-8 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
}

export default InvoiceForm;
