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
    stateDetails?: {
      theme: string;
      coreBeliefs: string[];
      behaviorPatterns: string[];
      communicationPatterns: string[];
      coachingNotes: string[];
      connection: string[];
      reality: string[];
      understanding: string[];
      change: string[];
      responsibility: string[];
      help: string[];
      work: string[];
      emotionalDriver: {
        title: string;
        description: string;
      };
    };
    totalScore: number;
    completionDate: string;
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

      // Comprehensive State Analysis Section
      if (assessmentData.stateDetails) {
        checkPageBreak(40);
        
        // Theme section
        pdf.setFillColor(r, g, b);
        pdf.rect(margin, yPosition - 5, contentWidth, 15, 'F');
        
        pdf.setTextColor(luminance > 0.5 ? 0 : 255, luminance > 0.5 ? 0 : 255, luminance > 0.5 ? 0 : 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Understanding Your ${assessmentData.dominantState.name}`, margin + 5, yPosition + 5);
        yPosition += 20;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'italic');
        const themeHeight = addWrappedText(
          `Theme: ${assessmentData.stateDetails.theme}`,
          margin,
          yPosition,
          contentWidth,
          12
        );
        yPosition += themeHeight + 15;

        // 12 detailed aspects
        const aspects = [
          { title: '💭 Core Beliefs', items: assessmentData.stateDetails.coreBeliefs },
          { title: '🎭 Behavior Patterns', items: assessmentData.stateDetails.behaviorPatterns },
          { title: '💬 Communication Patterns', items: assessmentData.stateDetails.communicationPatterns },
          { title: '🎯 Coaching Notes', items: assessmentData.stateDetails.coachingNotes },
          { title: '🤝 Connection', items: assessmentData.stateDetails.connection },
          { title: '🌍 Reality', items: assessmentData.stateDetails.reality },
          { title: '🧠 Understanding', items: assessmentData.stateDetails.understanding },
          { title: '🔄 Change', items: assessmentData.stateDetails.change },
          { title: '⚖️ Responsibility', items: assessmentData.stateDetails.responsibility },
          { title: '🤲 Help', items: assessmentData.stateDetails.help },
          { title: '💼 Work', items: assessmentData.stateDetails.work }
        ];

        aspects.forEach((aspect, aspectIndex) => {
          checkPageBreak(25);
          
          // Section header
          pdf.setFillColor(240, 240, 240); // Light gray
          pdf.rect(margin, yPosition - 3, contentWidth, 10, 'F');
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(aspect.title, margin + 3, yPosition + 3);
          yPosition += 12;

          // Items
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          
          aspect.items.forEach((item, itemIndex) => {
            checkPageBreak(8);
            
            // Bullet point
            pdf.setFillColor(r, g, b);
            pdf.circle(margin + 3, yPosition - 1, 1, 'F');
            
            // Item text
            const itemHeight = addWrappedText(
              item,
              margin + 8,
              yPosition,
              contentWidth - 15,
              10
            );
            yPosition += Math.max(itemHeight, 5) + 2;
          });
          
          yPosition += 5; // Space between sections
        });

        // Emotional Driver - Special section
        if (assessmentData.stateDetails.emotionalDriver) {
          checkPageBreak(25);
          
          pdf.setFillColor(50, 50, 50); // Dark gray
          pdf.rect(margin, yPosition - 5, contentWidth, 15, 'F');
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('⚡ Emotional Driver', margin + 5, yPosition + 5);
          yPosition += 20;

          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          const driverTitleHeight = addWrappedText(
            assessmentData.stateDetails.emotionalDriver.title,
            margin,
            yPosition,
            contentWidth,
            12
          );
          yPosition += driverTitleHeight + 5;

          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          const driverDescHeight = addWrappedText(
            assessmentData.stateDetails.emotionalDriver.description,
            margin,
            yPosition,
            contentWidth,
            11
          );
          yPosition += driverDescHeight + 10;
        }
      }

      // AI Insight Section (if available)
      if (assessmentData.aiInsight) {
        checkPageBreak(30);
        
        pdf.setFillColor(59, 130, 246); // Blue
        pdf.rect(margin, yPosition - 5, contentWidth, 12, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Personalized Insights', margin + 5, yPosition + 3);
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