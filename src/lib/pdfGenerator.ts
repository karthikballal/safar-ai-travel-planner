import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { TripData, Flight, Hotel, DayPlan, Activity } from "@/data/mockTrip";

const formatCurrency = (v: number) =>
  `INR ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(v)}`;

// Safar AI brand colors
const BRAND = {
  primary: [79, 70, 229] as [number, number, number], // indigo-600
  dark: [30, 27, 75] as [number, number, number], // deep indigo
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [203, 213, 225] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  emerald: [16, 185, 129] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
};

interface PDFOptions {
  tripData: TripData;
  selectedOutbound?: Flight;
  selectedInbound?: Flight;
  selectedHotels?: Hotel[];
  travelerName?: string;
}

function addHeader(doc: jsPDF, pageWidth: number) {
  // Background bar
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, pageWidth, 38, "F");

  // Decorative accent line
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 38, pageWidth, 2, "F");

  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("SAFAR", 20, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.primary);
  doc.text("AI", 62, 22);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.lightGray);
  doc.text("Your AI-Powered Travel Companion", 20, 32);

  // Right side — date
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.lightGray);
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Generated: ${dateStr}`, pageWidth - 20, 32, { align: "right" });
}

function addFooter(doc: jsPDF, pageWidth: number, pageNumber: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, pageHeight - 16, pageWidth, 16, "F");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.lightGray);
  doc.text(
    "Safar AI - Intelligent Travel Planning | www.safar.ai",
    20,
    pageHeight - 6
  );
  doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 6, {
    align: "right",
  });
}

function addSectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.dark);
  doc.text(title, 20, y);
  // Underline
  doc.setDrawColor(...BRAND.primary);
  doc.setLineWidth(0.8);
  doc.line(20, y + 2, 80, y + 2);
  return y + 10;
}

function addFlightRow(
  doc: jsPDF,
  y: number,
  label: string,
  flight: Flight,
  pageWidth: number
): number {
  const boxW = pageWidth - 40;
  // Light gray box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, y, boxW, 28, 3, 3, "F");

  // Label badge
  doc.setFillColor(...BRAND.primary);
  doc.roundedRect(24, y + 3, 46, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.white);
  doc.text(label.toUpperCase(), 47, y + 9.5, { align: "center" });

  // Flight info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.dark);
  doc.text(flight.departure.time, 76, y + 10);
  doc.text(flight.arrival.time, 140, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.gray);
  doc.text(`${flight.departure.city} (${flight.departure.code})`, 76, y + 17);
  doc.text(`${flight.arrival.city} (${flight.arrival.code})`, 140, y + 17);

  // Arrow
  doc.setFontSize(9);
  doc.text("->", 123, y + 10);

  // Duration + airline
  doc.setFontSize(7);
  doc.text(`${flight.duration} • ${flight.airline} ${flight.flightNumber}`, 76, y + 23);
  doc.text(flight.layover ? `via ${flight.layover.city}` : "Non-stop", 140, y + 23);

  // Price
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.primary);
  doc.text(formatCurrency(flight.price), pageWidth - 24, y + 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.gray);
  doc.text(flight.class, pageWidth - 24, y + 19, { align: "right" });
  doc.text(flight.departure.date, pageWidth - 24, y + 24, { align: "right" });

  return y + 34;
}

function addHotelRow(
  doc: jsPDF,
  y: number,
  hotel: Hotel,
  index: number | null,
  pageWidth: number
): number {
  const boxW = pageWidth - 40;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, y, boxW, 24, 3, 3, "F");

  let xStart = 24;
  if (index !== null) {
    doc.setFillColor(...BRAND.primary);
    doc.roundedRect(24, y + 3, 26, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.white);
    doc.text(`Stay ${index + 1}`, 37, y + 9.5, { align: "center" });
    xStart = 56;
  }

  // Hotel name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.dark);
  doc.text(hotel.name, xStart, y + 10);

  // Stars
  const stars = "*".repeat(hotel.stars) + ".".repeat(5 - hotel.stars);
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.amber);
  doc.text(stars, xStart, y + 17);

  doc.setTextColor(...BRAND.gray);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${hotel.checkIn} - ${hotel.checkOut} (${hotel.nights} nights)`,
    xStart + 18,
    y + 17
  );

  // Price
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.primary);
  doc.text(formatCurrency(hotel.totalPrice), pageWidth - 24, y + 10, {
    align: "right",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.gray);
  doc.text(`${formatCurrency(hotel.pricePerNight)}/night`, pageWidth - 24, y + 17, {
    align: "right",
  });

  return y + 30;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 25) {
    const pageWidth = doc.internal.pageSize.getWidth();
    addFooter(doc, pageWidth, doc.getNumberOfPages());
    doc.addPage();
    addHeader(doc, pageWidth);
    return 50;
  }
  return y;
}

function formatActivityLine(a: Activity): string {
  const cost = a.cost > 0 ? ` (${formatCurrency(a.cost)})` : "";
  return `${a.time}  ${a.title}${cost}`;
}

export function generateItineraryPDF(options: PDFOptions) {
  const { tripData, selectedOutbound, selectedInbound, selectedHotels, travelerName } =
    options;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // ---- PAGE 1: COVER ----
  addHeader(doc, pageWidth);

  let y = 55;

  // Trip title
  const outFlight = selectedOutbound || tripData.flights.outbound;
  const inFlight = selectedInbound || tripData.flights.inbound;
  const route = tripData.route;

  const destinationTitle = route.isMultiCity
    ? route.cities.map((c) => c.city).join(" > ")
    : `${outFlight.arrival.city}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.dark);
  doc.text(`Trip to ${destinationTitle}`, 20, y);
  y += 10;

  // Date range
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.gray);
  doc.text(
    `${outFlight.departure.date} to ${inFlight.arrival.date}`,
    20,
    y
  );
  y += 5;

  const totalDays = tripData.itinerary.length;
  doc.text(`${totalDays} days • ${route.cities.length} ${route.cities.length > 1 ? "cities" : "city"}`, 20, y);
  y += 3;

  if (travelerName) {
    doc.text(`Prepared for: ${travelerName}`, 20, y);
    y += 3;
  }

  y += 8;

  // ---- FLIGHTS SECTION ----
  y = addSectionTitle(doc, y, "Flights");
  y = addFlightRow(doc, y, "Outbound", outFlight, pageWidth);
  y += 2;
  y = addFlightRow(doc, y, "Return", inFlight, pageWidth);
  y += 8;

  // ---- ACCOMMODATION SECTION ----
  const hotels = selectedHotels || (tripData.hotels.length > 0 ? tripData.hotels : [tripData.hotel]);
  y = checkPageBreak(doc, y, 40);
  y = addSectionTitle(doc, y, "Accommodation");
  hotels.forEach((h, i) => {
    y = checkPageBreak(doc, y, 35);
    y = addHotelRow(doc, y, h, hotels.length > 1 ? i : null, pageWidth);
  });
  y += 8;

  // ---- INTERNAL TRANSPORT (if multi-city) ----
  if (tripData.internalTransport.length > 0) {
    y = checkPageBreak(doc, y, 30);
    y = addSectionTitle(doc, y, "Inter-City Transport");

    const transportRows = tripData.internalTransport.map((t) => [
      t.mode.charAt(0).toUpperCase() + t.mode.slice(1),
      `${t.from.city} -> ${t.to.city}`,
      t.date,
      `${t.departureTime} - ${t.arrivalTime}`,
      t.duration,
      t.operator,
      formatCurrency(t.price),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Mode", "Route", "Date", "Time", "Duration", "Operator", "Price"]],
      body: transportRows,
      margin: { left: 20, right: 20 },
      theme: "striped",
      headStyles: {
        fillColor: BRAND.primary,
        textColor: BRAND.white,
        fontStyle: "bold",
        fontSize: 7,
      },
      bodyStyles: { fontSize: 7, textColor: BRAND.dark },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // ---- VISA INFO ----
  if (tripData.visa.required) {
    y = checkPageBreak(doc, y, 30);
    y = addSectionTitle(doc, y, "Visa Information");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.dark);
    doc.text(`Visa Type: ${tripData.visa.type}`, 24, y);
    y += 5;
    doc.text(`Processing Time: ${tripData.visa.processingTime}`, 24, y);
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Required Documents:", 24, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    tripData.visa.documents.forEach((d) => {
      y = checkPageBreak(doc, y, 8);
      const icon = d.status === "required" ? "[!]" : d.status === "recommended" ? "[~]" : "[ ]";
      doc.setFontSize(7);
      doc.text(`${icon}  ${d.name} - ${d.description}`, 28, y);
      y += 5;
    });
    y += 5;
  }

  // ---- COST SUMMARY ----
  y = checkPageBreak(doc, y, 50);
  y = addSectionTitle(doc, y, "Cost Summary");

  const outPrice = outFlight.price;
  const retPrice = inFlight.price;
  const hotelTotal = hotels.reduce((s, h) => s + h.totalPrice, 0);
  const transportTotal = tripData.internalTransport.reduce(
    (s, t) => s + t.price,
    0
  );
  const activitiesTotal = tripData.itinerary.reduce((sum, day) => {
    const acts = [
      ...day.activities.morning,
      ...day.activities.afternoon,
      ...day.activities.evening,
    ];
    return sum + acts.reduce((s, a) => s + a.cost, 0);
  }, 0);
  const grandTotal = outPrice + retPrice + hotelTotal + transportTotal + activitiesTotal;

  const sumRows = [
    ["Outbound Flight", formatCurrency(outPrice)],
    ["Return Flight", formatCurrency(retPrice)],
    ["Accommodation", formatCurrency(hotelTotal)],
  ];
  if (transportTotal > 0) {
    sumRows.push(["Inter-City Transport", formatCurrency(transportTotal)]);
  }
  sumRows.push(["Activities & Dining", formatCurrency(activitiesTotal)]);
  sumRows.push(["", ""]);
  sumRows.push(["GRAND TOTAL", formatCurrency(grandTotal)]);

  autoTable(doc, {
    startY: y,
    body: sumRows,
    margin: { left: 20, right: 20 },
    theme: "plain",
    columnStyles: {
      0: { fontStyle: "normal", cellWidth: 100 },
      1: { fontStyle: "bold", halign: "right" },
    },
    bodyStyles: { fontSize: 9, textColor: BRAND.dark },
    didParseCell: (data) => {
      // Grand total row styling
      if (data.row.index === sumRows.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 12;
        data.cell.styles.textColor = BRAND.primary as unknown as string;
      }
      // Separator row
      if (data.row.index === sumRows.length - 2) {
        data.cell.styles.minCellHeight = 1;
      }
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  addFooter(doc, pageWidth, 1);

  // ---- DAY-BY-DAY ITINERARY (new pages) ----
  doc.addPage();
  addHeader(doc, pageWidth);
  y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...BRAND.dark);
  doc.text("Day-by-Day Itinerary", 20, y);
  y += 12;

  tripData.itinerary.forEach((day: DayPlan) => {
    y = checkPageBreak(doc, y, 35);

    // Day header
    doc.setFillColor(...BRAND.primary);
    doc.roundedRect(20, y, pageWidth - 40, 12, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text(`Day ${day.day} -- ${day.title}`, 26, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      `${day.date}${day.city ? ` • ${day.city}` : ""}`,
      pageWidth - 26,
      y + 8,
      { align: "right" }
    );
    y += 18;

    // Activities by time slot
    const slots: [string, Activity[]][] = [
      ["Morning", day.activities.morning],
      ["Afternoon", day.activities.afternoon],
      ["Evening", day.activities.evening],
    ];

    slots.forEach(([label, acts]) => {
      if (acts.length === 0) return;
      y = checkPageBreak(doc, y, 12 + acts.length * 8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.primary);
      doc.text(label.toUpperCase(), 24, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.dark);

      acts.forEach((a) => {
        y = checkPageBreak(doc, y, 8);
        const line = formatActivityLine(a);
        // Truncate if too long
        const maxWidth = pageWidth - 48;
        const truncated = doc.splitTextToSize(line, maxWidth)[0];
        doc.text(truncated, 28, y);
        y += 5.5;
      });

      y += 3;
    });

    y += 4;
  });

  // Final footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, pageWidth, i);
  }

  // Save
  const safeDestination = destinationTitle.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-");
  doc.save(`Safar-AI-Itinerary-${safeDestination}.pdf`);
}
