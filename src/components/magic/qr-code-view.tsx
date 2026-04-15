"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeViewProps {
  value: string;
  size?: number;
  fileName?: string;
}

export function QRCodeView({ value, size = 200, fileName = "qr-code" }: QRCodeViewProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadPng = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Set canvas dimensions
    canvas.width = size * 2; // High DPI
    canvas.height = size * 2;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `${fileName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-sm border inline-block">
        <QRCode value={value} size={size} level="H" />
      </div>
      
      <Button onClick={downloadPng} variant="outline" className="w-full gap-2">
        <Download className="w-4 h-4" />
        Download QR Code (PNG)
      </Button>
    </div>
  );
}
