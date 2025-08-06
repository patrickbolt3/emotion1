import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import { Button } from './ui/Button';

interface PDFGeneratorProps {
  assessmentData: {
    user: {
      firstName: string;
      lastName: string;
      email?: string;
    };
    dominantState: {
      name: string;
      description: string;
      color: string;
      coaching_tips?: string;
    };
    totalScore: number;
    completionDate: string;
    responses: Array<{
      question: string;
      score: number;
      state: string;
      stateColor: string;
    }>;
    stateBreakdown: Array<{
      name: string;
      score: number;
      color: string;
      percentage: number;
    }>;
    aiInsight?: string;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ 
  assessmentData, 
  variant = 'outline',
  size = 'sm'
}) => {
  const [generating, setGenerating] = React.useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return lines.length * (fontSize * 0.35); // Return height used
      };

      // Header with logo and title
      pdf.setFillColor(79, 70, 229); // Blue gradient start
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Emotional Dynamics Indicator™', margin, 20);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Assessment Results Report', margin, 26);

      yPosition = 45;

      // User Information Section
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Assessment Summary', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${assessmentData.user.firstName} ${assessmentData.user.lastName}`, margin, yPosition);
      yPosition += 6;
      
      if (assessmentData.user.email) {
        pdf.text(`Email: ${assessmentData.user.email}`, margin, yPosition);
        yPosition += 6;
      }
      
      pdf.text(`Completion Date: ${new Date(assessmentData.completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, margin, yPosition);
      yPosition += 6;
      
      pdf.text(`Total Questions Answered: ${assessmentData.responses.length}`, margin, yPosition);
      yPosition += 15;

      // Dominant State Section
      checkPageBreak(40);
      
      // Convert hex color to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ] : [107, 114, 128]; // Default gray
      };

      const [r, g, b] = hexToRgb(assessmentData.dominantState.color);
      
      // Dominant state header with colored background
      pdf.setFillColor(r, g, b);
      pdf.rect(margin, yPosition - 5, contentWidth, 15, 'F');
      
      // Determine text color based on background
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      pdf.setTextColor(luminance > 0.5 ? 0 : 255, luminance > 0.5 ? 0 : 255, luminance > 0.5 ? 0 : 255);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Your Dominant Harmonic State', margin + 5, yPosition + 5);
      yPosition += 20;

      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // State name and score
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${assessmentData.dominantState.name} (Score: ${assessmentData.totalScore})`, margin, yPosition);
      yPosition += 15;

      // State description
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const descriptionHeight = addWrappedText(
        assessmentData.dominantState.description, 
        margin, 
        yPosition, 
        contentWidth
      );
      yPosition += descriptionHeight + 10;

      // AI Insight Section
      if (assessmentData.aiInsight) {
        checkPageBreak(30);
        
        pdf.setFillColor(59, 130, 246); // Blue
        pdf.rect(margin, yPosition - 5, contentWidth, 12, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI Coaching Insight', margin + 5, yPosition + 3);
        yPosition += 15;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const insightHeight = addWrappedText(
          assessmentData.aiInsight,
          margin,
          yPosition,
          contentWidth,
          11
        );
        yPosition += insightHeight + 15;
      }

      // Coaching Tips Section
      if (assessmentData.dominantState.coaching_tips) {
        checkPageBreak(30);
        
        pdf.setFillColor(34, 197, 94); // Green
        pdf.rect(margin, yPosition - 5, contentWidth, 12, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Coaching Recommendations', margin + 5, yPosition + 3);
        yPosition += 15;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const tipsHeight = addWrappedText(
          assessmentData.dominantState.coaching_tips,
          margin,
          yPosition,
          contentWidth,
          11
        );
        yPosition += tipsHeight + 15;
      }

      // State Breakdown Section
      checkPageBreak(60);
      
      pdf.setFillColor(147, 51, 234); // Purple
      pdf.rect(margin, yPosition - 5, contentWidth, 12, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Harmonic State Breakdown', margin + 5, yPosition + 3);
      yPosition += 15;

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      // Table headers
      pdf.setFont('helvetica', 'bold');
      pdf.text('State', margin, yPosition);
      pdf.text('Score', margin + 80, yPosition);
      pdf.text('Percentage', margin + 120, yPosition);
      yPosition += 8;

      // Draw line under headers
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition - 2, margin + contentWidth, yPosition - 2);
      yPosition += 3;

      // State breakdown data
      pdf.setFont('helvetica', 'normal');
      assessmentData.stateBreakdown.forEach((state, index) => {
        if (index > 0 && index % 25 === 0) {
          checkPageBreak(8);
        }
        
        const [stateR, stateG, stateB] = hexToRgb(state.color);
        
        // Color indicator
        pdf.setFillColor(stateR, stateG, stateB);
        pdf.circle(margin + 2, yPosition - 1, 1.5, 'F');
        
        pdf.setTextColor(0, 0, 0);
        pdf.text(state.name, margin + 8, yPosition);
        pdf.text(state.score.toString(), margin + 80, yPosition);
        pdf.text(`${state.percentage.toFixed(1)}%`, margin + 120, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Detailed Question Responses
      pdf.addPage();
      yPosition = margin;

      pdf.setFillColor(168, 85, 247); // Purple
      pdf.rect(margin, yPosition - 5, contentWidth, 12, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detailed Question Responses', margin + 5, yPosition + 3);
      yPosition += 20;

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);

      // Group responses by state for better organization
      const responsesByState = assessmentData.responses.reduce((acc, response) => {
        if (!acc[response.state]) {
          acc[response.state] = [];
        }
        acc[response.state].push(response);
        return acc;
      }, {} as Record<string, typeof assessmentData.responses>);

      Object.entries(responsesByState).forEach(([stateName, responses]) => {
        checkPageBreak(20);
        
        // State section header
        const stateColor = responses[0]?.stateColor || '#6B7280';
        const [stateR, stateG, stateB] = hexToRgb(stateColor);
        
        pdf.setFillColor(stateR, stateG, stateB);
        pdf.rect(margin, yPosition - 3, contentWidth, 8, 'F');
        
        const stateLuminance = (0.299 * stateR + 0.587 * stateG + 0.114 * stateB) / 255;
        pdf.setTextColor(stateLuminance > 0.5 ? 0 : 255, stateLuminance > 0.5 ? 0 : 255, stateLuminance > 0.5 ? 0 : 255);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${stateName} Questions`, margin + 3, yPosition + 2);
        yPosition += 12;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');

        responses.forEach((response, index) => {
          checkPageBreak(15);
          
          // Question number and score
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Q${index + 1}:`, margin, yPosition);
          
          // Score circle
          pdf.setFillColor(stateR, stateG, stateB);
          pdf.circle(margin + contentWidth - 10, yPosition - 1, 3, 'F');
          pdf.setTextColor(stateLuminance > 0.5 ? 0 : 255, stateLuminance > 0.5 ? 0 : 255, stateLuminance > 0.5 ? 0 : 255);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text(response.score.toString(), margin + contentWidth - 12, yPosition + 1);
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          
          // Question text
          const questionHeight = addWrappedText(
            response.question,
            margin + 15,
            yPosition,
            contentWidth - 30,
            9
          );
          yPosition += Math.max(questionHeight, 6) + 3;
        });
        
        yPosition += 5;
      });

      // Footer on last page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Emotional Dynamics Indicator™ - Generated on ${new Date().toLocaleDateString()}`,
          margin,
          pageHeight - 15
        );
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin - 25,
          pageHeight - 15
        );
      }

      // Save the PDF
      const fileName = `EDI-Results-${assessmentData.user.firstName}-${assessmentData.user.lastName}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={generatePDF}
      disabled={generating}
    >
      <Download className="h-4 w-4 mr-2" />
      {generating ? 'Generating PDF...' : 'Save as PDF'}
    </Button>
  );
};

export default PDFGenerator;