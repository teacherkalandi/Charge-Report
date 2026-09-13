import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Printer, Download, Eye, Edit3, FileText } from 'lucide-react';

function numberToWords(numStr: string): string {
  const cleanNum = numStr.toString().replace(/[^0-9.]/g, '').trim();
  if (!cleanNum || isNaN(Number(cleanNum))) return '';
  const num = parseFloat(cleanNum);
  if (num === 0) return 'Zero';

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertDigits(n: string) {
    if (n.length > 9) return '';
    const nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArray) return '';
    let str = '';
    str += (nArray[1] != '00') ? (a[Number(nArray[1])] || b[Number(nArray[1][0])] + ' ' + a[Number(nArray[1][1])]) + ' Crore ' : '';
    str += (nArray[2] != '00') ? (a[Number(nArray[2])] || b[Number(nArray[2][0])] + ' ' + a[Number(nArray[2][1])]) + ' Lakh ' : '';
    str += (nArray[3] != '00') ? (a[Number(nArray[3])] || b[Number(nArray[3][0])] + ' ' + a[Number(nArray[3][1])]) + ' Thousand ' : '';
    str += (nArray[4] != '0') ? (a[Number(nArray[4])] || b[Number(nArray[4][0])] + ' ' + a[Number(nArray[4][1])]) + ' Hundred ' : '';
    str += (nArray[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[Number(nArray[5][0])] + ' ' + a[Number(nArray[5][1])]) : '';
    return str.trim();
  }

  const parts = cleanNum.split('.');
  let words = convertDigits(parts[0]);
  if (parts[1] && parseInt(parts[1]) > 0) {
    const paise = parseInt(parts[1].substring(0, 2).padEnd(2, '0'));
    words += (words ? ' and ' : '') + convertDigits(paise.toString()) + ' Paise';
  }
  
  words = words.replace(/\s+/g, ' ').trim();
  return words ? `(Rupees ${words} Only)` : '';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSharing, setIsSharing] = useState(false);
  const [formData, setFormData] = useState({
    reportType: 'handover', // 'handover' | 'assumption'
    chargeAction: 'assumed', // 'assumed' | 'relinquished'
    staffName: 'Sri Kalandi Charan Sahoo',
    office: 'SPM, Dhenkanal RS SO',
    relievedStaff: 'Shri Bibhuti Bhusan Naik',
    relievingStaff: 'Shri Kalandi Charan Sahoo',
    transferDate: '07.10.2024',
    timeOfDay: 'forenoon',
    place: 'Dhenkanal',
    memoNo: 'B12/1-ChV',
    memoPlace: 'Dhenkanal',
    memoDate: '13.02.2020',
    authority: 'Superintendent of Post Offices, Dhenkanal Division, Dhenkanal',
    copyToDivision: 'Supdt. of Post offices, Dhenkanal Division, Dhenkanal.',
    copyToHeadOffice: 'The Postmaster, Dhenkanal HO.',
    copyTo1: '',
    copyTo2: '',
    copyTo3: '',
    copyTo4: '',
    copyTo5: '',
    valCash: '',
    valStamp: '',
    valRevenue: '',
  });

  const reportRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    if (!element) return;

    const opt = {
      margin: [0.3, 0.4, 0.3, 0.4],
      filename: 'Charge_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, scrollY: 0 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all' },
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleWhatsAppShare = () => {
    const element = reportRef.current;
    if (!element) return;
    
    setIsSharing(true);

    const opt = {
      margin: [0.3, 0.4, 0.3, 0.4],
      filename: 'Charge_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, scrollY: 0 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all' },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .output('blob')
      .then((pdfBlob: Blob) => {
        const file = new File([pdfBlob], 'Charge_Report.pdf', { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            title: 'Charge Report',
            files: [file]
          }).catch((err: Error) => {
            console.error('Error sharing:', err);
          });
        } else {
          alert('Direct file sharing is not supported on this browser. Please download the PDF and share it manually.');
        }
      })
      .finally(() => {
        setIsSharing(false);
      });
  };

  const handleDownloadDoc = () => {
    let htmlContent = '';

    if (formData.reportType === 'handover') {
      htmlContent = `
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 15px; line-height: 1.6; color: black;">
          <h2 style="text-align: center; font-weight: bold; font-size: 24px; letter-spacing: 1px; margin-bottom: 25px;">CHARGE REPORT</h2>
          
          <p style="text-align: justify; text-indent: 50px; margin-bottom: 35px;">
            Certified that the charge of the office of <b>${formData.office}</b> was made over by <b>${formData.relievedStaff}</b> to <b>${formData.relievingStaff}</b> on <b>${formData.transferDate}</b> <b>${formData.timeOfDay}</b> at <b>${formData.place}</b> in accordance with Memo no: <b>${formData.memoNo}</b> Dated at <b>${formData.memoPlace}</b> the <b>${formData.memoDate}</b> from <b>${formData.authority}</b>.
          </p>

          <table style="width: 100%; margin-bottom: 30px; font-weight: bold; border: none;">
            <tr>
              <td style="text-align: left; border: none;">Relieved Officer</td>
              <td style="text-align: right; border: none;">Relieving Officer</td>
            </tr>
          </table>

          <div style="margin-bottom: 30px;">
            <p style="font-weight: bold; margin-bottom: 15px; text-align: justify;">
              *Certified that the balances as detailed below were handed over to me by the Relieved Officer and I accept the responsibility for the same.
            </p>

            <table style="width: 90%; margin-left: 10%; margin-bottom: 15px; border: none; border-collapse: collapse;">
              <tr>
                <td style="width: 100px; font-weight: bold; border: none; padding-bottom: 8px;">a) Cash</td>
                <td style="width: 50px; font-weight: bold; border: none; padding-bottom: 8px;">: Rs.</td>
                <td style="width: 120px; text-align: right; font-family: monospace; font-size: 15px; border: none; padding-bottom: 8px;">${formData.valCash}</td>
                <td style="padding-left: 20px; font-style: italic; border: none; padding-bottom: 8px;">${numberToWords(formData.valCash)}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; border: none; padding-bottom: 8px;">b) Stamp</td>
                <td style="font-weight: bold; border: none; padding-bottom: 8px;">: Rs.</td>
                <td style="text-align: right; font-family: monospace; font-size: 15px; border: none; padding-bottom: 8px;">${formData.valStamp}</td>
                <td style="padding-left: 20px; font-style: italic; border: none; padding-bottom: 8px;">${numberToWords(formData.valStamp)}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; border: none; padding-bottom: 8px;">c) Revenue</td>
                <td style="font-weight: bold; border: none; padding-bottom: 8px;">: Rs.</td>
                <td style="text-align: right; font-family: monospace; font-size: 15px; border: none; padding-bottom: 8px;">${formData.valRevenue}</td>
                <td style="padding-left: 20px; font-style: italic; border: none; padding-bottom: 8px;">${numberToWords(formData.valRevenue)}</td>
              </tr>
            </table>
          </div>

          <table style="width: 100%; margin-bottom: 30px; font-weight: bold; border: none;">
            <tr>
              <td style="text-align: left; border: none;">Relieved Officer</td>
              <td style="text-align: right; border: none;">Relieving Officer</td>
            </tr>
          </table>

          <div style="margin-top: 40px;">
            <div style="font-weight: bold;">Copy to:-</div>
            <p style="margin-top: 5px; line-height: 1.6; margin-left: 0;">
              1. The ${formData.copyToDivision}<br>
              2. ${formData.copyToHeadOffice}<br>
              3. Office Copy<br>
              4. Official concerned.
            </p>
          </div>
        </div>
      `;
    } else if (formData.reportType === 'common_handover') {
      htmlContent = `
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 16px; line-height: 1.8; color: black;">
          <h2 style="text-align: center; font-weight: bold; font-size: 24px; letter-spacing: 1px; margin-bottom: 30px;">CHARGE REPORT</h2>
          
          <p style="text-align: justify; text-indent: 50px; margin-bottom: 50px;">
            Certified that the charge of the office of <b>${formData.office}</b> was made over by <b>${formData.relievedStaff}</b> to <b>${formData.relievingStaff}</b> on <b>${formData.transferDate}</b> <b>${formData.timeOfDay}</b> at <b>${formData.place}</b> in accordance with Memo no: <b>${formData.memoNo}</b> Dated at <b>${formData.memoPlace}</b> the <b>${formData.memoDate}</b> from <b>${formData.authority}</b>.
          </p>

          <table style="width: 100%; margin-bottom: 40px; font-weight: bold; border: none;">
            <tr>
              <td style="text-align: left; border: none;">Relieved Officer</td>
              <td style="text-align: right; border: none;">Relieving Officer</td>
            </tr>
          </table>

          <div style="margin-top: 40px;">
            <div style="font-weight: bold;">Copy to:-</div>
            <p style="margin-top: 5px; line-height: 1.6; margin-left: 0;">
              ${[formData.copyTo1, formData.copyTo2, formData.copyTo3, formData.copyTo4, formData.copyTo5].filter(Boolean).map((text, i) => `${i + 1}. ${text}<br>`).join('')}
            </p>
          </div>
        </div>
      `;
    } else if (formData.reportType === 'common_assumption') {
      htmlContent = `
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 16px; line-height: 1.8; color: black;">
          <h2 style="text-align: center; font-weight: bold; font-size: 24px; letter-spacing: 1px; margin-bottom: 30px;">CHARGE REPORT</h2>
          
          <p style="text-align: justify; text-indent: 50px; margin-bottom: 50px;">
            Certified that the charge of the office of <b>${formData.office}</b> was <span>${formData.chargeAction}</span> by <b>${formData.staffName}</b> at <b>${formData.place}</b> on date <b>${formData.transferDate}</b> <span>${formData.timeOfDay}</span> in accordance with Memo no: <span>${formData.memoNo}</span> Dated at <span>${formData.memoPlace}</span> the <span>${formData.memoDate}</span> from <span>${formData.authority}</span>.
          </p>

          <table style="width: 100%; margin-bottom: 40px; font-weight: bold; border: none;">
            <tr>
              <td style="text-align: left; border: none;">Relieved Officer</td>
              <td style="text-align: right; border: none;">Relieving Officer</td>
            </tr>
          </table>

          <div style="margin-top: 40px;">
            <div style="font-weight: bold;">Copy to:-</div>
            <p style="margin-top: 5px; line-height: 1.6; margin-left: 0;">
              ${[formData.copyTo1, formData.copyTo2, formData.copyTo3, formData.copyTo4, formData.copyTo5].filter(Boolean).map((text, i) => `${i + 1}. ${text}<br>`).join('')}
            </p>
          </div>
        </div>
      `;
    } else {
      const spmCopy = formData.office.includes(',') ? formData.office.split(',')[1].trim() : formData.office;
      htmlContent = `
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 16px; line-height: 1.8; color: black;">
          <h2 style="text-align: center; font-weight: bold; font-size: 24px; letter-spacing: 1px; margin-bottom: 30px;">CHARGE REPORT</h2>
          
          <p style="text-align: justify; text-indent: 50px; margin-bottom: 50px;">
            Certified that the charge of the office of <b>${formData.office}</b> was <span>${formData.chargeAction}</span> by <b>${formData.staffName}</b> at <b>${formData.place}</b> on date <b>${formData.transferDate}</b> <span>${formData.timeOfDay}</span> in accordance with Memo no: <span>${formData.memoNo}</span> Dated at <span>${formData.memoPlace}</span> the <span>${formData.memoDate}</span> from <span>${formData.authority}</span>.
          </p>

          <table style="width: 100%; margin-bottom: 40px; font-weight: bold; border: none;">
            <tr>
              <td style="text-align: left; border: none;">Relieved Officer</td>
              <td style="text-align: right; border: none;">Relieving Officer</td>
            </tr>
          </table>

          <div style="margin-top: 40px;">
            <div style="font-weight: bold;">Copy to-</div>
            <p style="margin-top: 5px; line-height: 1.6; margin-left: 0;">
              1) The ${formData.copyToDivision}<br>
              2) ${formData.copyToHeadOffice}<br>
              3) SPM ${spmCopy}<br>
              4) Official Concerned<br>
              5) PF of the Official
            </p>
          </div>
        </div>
      `;
    }

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Charge Report</title></head><body>";
    const footer = "</body></html>";
    const html = header + htmlContent + footer;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Charge_Report.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-8 sm:px-4 print:py-0 print:px-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header / India Post Branding */}
        <div className="flex flex-col items-center justify-center space-y-4 print:hidden">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 bg-red-600 rounded-full flex items-center justify-center">
              <div className="h-6 w-6 sm:h-8 sm:w-8 border-4 border-yellow-400 rotate-45 transform"></div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-700 uppercase tracking-wide text-center leading-tight">Charge Report Generator</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:space-x-2 bg-white rounded-2xl sm:rounded-full p-1 shadow-sm border border-gray-200">
            <button 
              onClick={() => setActiveTab('edit')}
              className={`flex justify-center items-center space-x-2 px-4 py-2 sm:px-6 rounded-xl sm:rounded-full font-semibold transition-colors ${activeTab === 'edit' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Edit3 size={18} />
              <span>Edit Details</span>
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`flex justify-center items-center space-x-2 px-4 py-2 sm:px-6 rounded-xl sm:rounded-full font-semibold transition-colors ${activeTab === 'preview' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Eye size={18} />
              <span>Preview & Print</span>
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className={`bg-white p-4 sm:p-6 rounded-xl shadow-md border-t-4 border-red-600 print:hidden ${activeTab === 'edit' ? 'block' : 'hidden'}`}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Charge Report Details</h2>
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <select
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                className="w-full md:w-auto px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="handover">Hand Over Report (with Balances)</option>
                <option value="assumption">Assumption/Relinquishment Report</option>
                <option value="common_handover">Common Type: Hand Over</option>
                <option value="common_assumption">Common Type: Assume/Relinquish</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['assumption', 'common_assumption'].includes(formData.reportType) && (
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-700">Charge Action:</label>
                <select
                  name="chargeAction"
                  value={formData.chargeAction}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="assumed">Assumed</option>
                  <option value="relinquished">Relinquished</option>
                </select>
              </div>
            )}
            
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-700">Designation & Office Name:</label>
              <input
                type="text"
                name="office"
                value={formData.office}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            {['handover', 'common_handover'].includes(formData.reportType) ? (
              <>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Relieved Staff (Made over by):</label>
                  <input
                    type="text"
                    name="relievedStaff"
                    value={formData.relievedStaff}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Relieving Staff (To):</label>
                  <input
                    type="text"
                    name="relievingStaff"
                    value={formData.relievingStaff}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-700">Staff Name (with Prefix):</label>
                <input
                  type="text"
                  name="staffName"
                  value={formData.staffName}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            )}

            <div className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                {['handover', 'common_handover'].includes(formData.reportType) ? 'Date of Transfer:' : 'Date:'}
              </label>
              <input
                type="text"
                name="transferDate"
                value={formData.transferDate}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-700">Time of Day:</label>
              <select
                name="timeOfDay"
                value={formData.timeOfDay}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="forenoon">forenoon</option>
                <option value="afternoon">afternoon</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-700">Place / Location:</label>
              <input
                type="text"
                name="place"
                value={formData.place}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-700">Memo Number:</label>
              <input
                type="text"
                name="memoNo"
                value={formData.memoNo}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-700">Memo Issued Place:</label>
              <input
                type="text"
                name="memoPlace"
                value={formData.memoPlace}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-700">Memo Date:</label>
              <input
                type="text"
                name="memoDate"
                value={formData.memoDate}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-700">Memo Issued Authority:</label>
              <input
                type="text"
                name="authority"
                value={formData.authority}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">Copy To section</h3>
          {['common_handover', 'common_assumption'].includes(formData.reportType) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">{num}. Copy To:</label>
                  <input
                    type="text"
                    name={`copyTo${num}`}
                    value={(formData as any)[`copyTo${num}`]}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-700">1. Division Name:</label>
                <input
                  type="text"
                  name="copyToDivision"
                  value={formData.copyToDivision}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-700">2. Head Office Name:</label>
                <input
                  type="text"
                  name="copyToHeadOffice"
                  value={formData.copyToHeadOffice}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>
          )}

          {formData.reportType === 'handover' && (
            <>
              <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">Balance Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">a) Cash Balance:</label>
                  <input
                    type="text"
                    name="valCash"
                    value={formData.valCash}
                    onChange={handleChange}
                    placeholder="e.g. 5,000/-"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">b) Stamp Balance:</label>
                  <input
                    type="text"
                    name="valStamp"
                    value={formData.valStamp}
                    onChange={handleChange}
                    placeholder="e.g. 12,500/-"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">c) Revenue Balance:</label>
                  <input
                    type="text"
                    name="valRevenue"
                    value={formData.valRevenue}
                    onChange={handleChange}
                    placeholder="e.g. 1,200/-"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="w-full sm:w-auto justify-center flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 sm:py-2.5 rounded-md font-semibold transition-colors"
            >
              <Eye size={18} />
              <span>Continue to Preview</span>
            </button>
          </div>
        </div>

        {/* Report Preview Paper */}
        <div className={`bg-white rounded-md shadow-lg print:shadow-none overflow-hidden ${activeTab === 'preview' ? 'block' : 'hidden'} print:block`}>
          {/* Header styling for the report preview itself */}
          <div className="bg-gray-200 text-center py-3 px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500 font-mono print:hidden">
            <span>A4 Document Preview</span>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleDownloadDoc}
                className="flex items-center space-x-1 bg-white text-gray-700 hover:text-red-600 px-3 py-1.5 rounded border border-gray-300 transition-colors"
              >
                <FileText size={14} />
                <span>DOC</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex items-center space-x-1 bg-white text-gray-700 hover:text-red-600 px-3 py-1.5 rounded border border-gray-300 transition-colors"
              >
                <Download size={14} />
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center space-x-1 bg-white text-gray-700 hover:text-red-600 px-3 py-1.5 rounded border border-gray-300 transition-colors"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                disabled={isSharing}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded border transition-colors ${
                  isSharing 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'bg-[#25D366] text-white hover:bg-[#20b858] border-[#25D366]'
                }`}
              >
                {isSharing ? (
                  <div className="h-3.5 w-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                )}
                <span>Share PDF</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto print:overflow-visible">
            <div 
              ref={reportRef} 
              className="p-6 sm:p-10 md:p-12 lg:p-16 bg-white text-black print:p-0 min-w-[700px] md:min-w-0 mx-auto"
              style={{ 
                fontFamily: "'Times New Roman', Times, serif", 
                fontSize: formData.reportType === 'handover' ? "15px" : "16px", 
                lineHeight: formData.reportType === 'handover' ? 1.6 : 1.8 
              }}
            >
            {formData.reportType === 'handover' ? (
              <>
                <div className="text-center text-2xl font-bold tracking-wide mb-8">
                  CHARGE REPORT
                </div>
                
                <div className="text-justify mb-10" style={{ textIndent: "50px" }}>
                  Certified that the charge of the office of <b>{formData.office}</b> was made over by <b>{formData.relievedStaff}</b> to <b>{formData.relievingStaff}</b> on <b>{formData.transferDate}</b> <b>{formData.timeOfDay}</b> at <b>{formData.place}</b> in accordance with Memo no: <b>{formData.memoNo}</b> Dated at <b>{formData.memoPlace}</b> the <b>{formData.memoDate}</b> from <b>{formData.authority}</b>.
                </div>

                <div className="flex justify-between font-bold mb-10 px-4">
                  <div>Relieved Officer</div>
                  <div>Relieving Officer</div>
                </div>

                <div className="mb-10">
                  <div className="font-bold mb-4 text-justify">
                    *Certified that the balances as detailed below were handed over to me by the Relieved Officer and I accept the responsibility for the same.
                  </div>

                  <div className="ml-12 md:ml-16 w-full pr-12">
                    <div className="flex items-end mb-3">
                      <div className="font-bold w-24 shrink-0">a) Cash</div>
                      <div className="font-bold shrink-0 mr-4">: Rs.</div>
                      <div className="w-28 shrink-0 text-right min-h-[24px] font-mono tabular-nums text-[15px] tracking-widest">
                        {formData.valCash}
                      </div>
                      <div className="ml-6 flex-grow italic tracking-tight">
                        {numberToWords(formData.valCash)}
                      </div>
                    </div>
                    <div className="flex items-end mb-3">
                      <div className="font-bold w-24 shrink-0">b) Stamp</div>
                      <div className="font-bold shrink-0 mr-4">: Rs.</div>
                      <div className="w-28 shrink-0 text-right min-h-[24px] font-mono tabular-nums text-[15px] tracking-widest">
                        {formData.valStamp}
                      </div>
                      <div className="ml-6 flex-grow italic tracking-tight">
                        {numberToWords(formData.valStamp)}
                      </div>
                    </div>
                    <div className="flex items-end mb-3">
                      <div className="font-bold w-24 shrink-0">c) Revenue</div>
                      <div className="font-bold shrink-0 mr-4">: Rs.</div>
                      <div className="w-28 shrink-0 text-right min-h-[24px] font-mono tabular-nums text-[15px] tracking-widest">
                        {formData.valRevenue}
                      </div>
                      <div className="ml-6 flex-grow italic tracking-tight">
                        {numberToWords(formData.valRevenue)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between font-bold mb-10 px-4">
                  <div>Relieved Officer</div>
                  <div>Relieving Officer</div>
                </div>

                <div className="leading-relaxed mt-12">
                  <div className="font-bold">Copy to:-</div>
                  <ol className="list-none pl-0 mt-2 space-y-1">
                    <li>1. The {formData.copyToDivision}</li>
                    <li>2. {formData.copyToHeadOffice}</li>
                    <li>3. Office Copy</li>
                    <li>4. Official concerned.</li>
                  </ol>
                </div>
              </>
            ) : formData.reportType === 'common_handover' ? (
              <>
                <div className="text-center text-2xl font-bold tracking-wide mb-8">
                  CHARGE REPORT
                </div>
                
                <div className="text-justify mb-10" style={{ textIndent: "50px" }}>
                  Certified that the charge of the office of <b>{formData.office}</b> was made over by <b>{formData.relievedStaff}</b> to <b>{formData.relievingStaff}</b> on <b>{formData.transferDate}</b> <b>{formData.timeOfDay}</b> at <b>{formData.place}</b> in accordance with Memo no: <b>{formData.memoNo}</b> Dated at <b>{formData.memoPlace}</b> the <b>{formData.memoDate}</b> from <b>{formData.authority}</b>.
                </div>

                <div className="flex justify-between font-bold mb-10 px-4">
                  <div>Relieved Officer</div>
                  <div>Relieving Officer</div>
                </div>

                <div className="leading-relaxed mt-12">
                  <div className="font-bold">Copy to:-</div>
                  <ol className="list-none pl-0 mt-2 space-y-1">
                    {[formData.copyTo1, formData.copyTo2, formData.copyTo3, formData.copyTo4, formData.copyTo5].filter(Boolean).map((text, i) => (
                      <li key={i}>{i + 1}. {text}</li>
                    ))}
                  </ol>
                </div>
              </>
            ) : formData.reportType === 'common_assumption' ? (
              <>
                <div className="text-center text-2xl font-bold tracking-wide mb-8">
                  CHARGE REPORT
                </div>
                
                <div className="text-justify mb-10" style={{ textIndent: "50px" }}>
                  Certified that the charge of the office of <b>{formData.office}</b> was <span>{formData.chargeAction}</span> by <b>{formData.staffName}</b> at <b>{formData.place}</b> on date <b>{formData.transferDate}</b> <span>{formData.timeOfDay}</span> in accordance with Memo no: <span>{formData.memoNo}</span> Dated at <span>{formData.memoPlace}</span> the <span>{formData.memoDate}</span> from <span>{formData.authority}</span>.
                </div>

                <div className="flex justify-between font-bold mb-10 px-4">
                  <div>Relieved Officer</div>
                  <div>Relieving Officer</div>
                </div>

                <div className="leading-relaxed mt-12">
                  <div className="font-bold">Copy to:-</div>
                  <ol className="list-none pl-0 mt-2 space-y-1">
                    {[formData.copyTo1, formData.copyTo2, formData.copyTo3, formData.copyTo4, formData.copyTo5].filter(Boolean).map((text, i) => (
                      <li key={i}>{i + 1}. {text}</li>
                    ))}
                  </ol>
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-2xl font-bold tracking-wide mb-10">
                  CHARGE REPORT
                </div>
                
                <div className="text-justify mb-14" style={{ textIndent: "50px" }}>
                  Certified that the charge of the office of <b>{formData.office}</b> was <span>{formData.chargeAction}</span> by <b>{formData.staffName}</b> at <b>{formData.place}</b> on date <b>{formData.transferDate}</b> <span>{formData.timeOfDay}</span> in accordance with Memo no: <span>{formData.memoNo}</span> Dated at <span>{formData.memoPlace}</span> the <span>{formData.memoDate}</span> from <span>{formData.authority}</span>.
                </div>

                <div className="flex justify-between font-bold mb-12 px-4">
                  <div>Relieved Officer</div>
                  <div>Relieving Officer</div>
                </div>

                <div className="leading-relaxed mt-10">
                  <div className="font-bold mb-2">Copy to-</div>
                  <ol className="list-none pl-0 space-y-1">
                    <li>1) The {formData.copyToDivision}</li>
                    <li>2) {formData.copyToHeadOffice}</li>
                    <li>3) SPM {formData.office.includes(',') ? formData.office.split(',')[1].trim() : formData.office}</li>
                    <li>4) Official Concerned</li>
                    <li>5) PF of the Official</li>
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  </div>
  );
}

