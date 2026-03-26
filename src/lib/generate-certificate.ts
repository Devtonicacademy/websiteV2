
export async function drawCertificate(canvas: HTMLCanvasElement, {
    studentName,
    courseName,
    completionDate,
    schoolName,
}: {
    studentName: string;
    courseName: string;
    completionDate: string;
    schoolName: string;
}): Promise<void> {
    const W = 1200;
    const H = 850;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // --- Background ---
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#0f1e3a");
    bgGrad.addColorStop(1, "#1a3566");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // --- Decorative grid lines ---
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // --- Outer golden border ---
    const borderInset = 28;
    const radius = 18;
    roundRect(ctx, borderInset, borderInset, W - borderInset * 2, H - borderInset * 2, radius);
    const borderGrad = ctx.createLinearGradient(0, 0, W, H);
    borderGrad.addColorStop(0, "#f5c842");
    borderGrad.addColorStop(0.5, "#fffbe6");
    borderGrad.addColorStop(1, "#e0a020");
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 4;
    ctx.stroke();

    // --- Inner border ---
    const innerInset = 44;
    roundRect(ctx, innerInset, innerInset, W - innerInset * 2, H - innerInset * 2, 10);
    ctx.strokeStyle = "rgba(245, 200, 66, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // --- Corner ornaments ---
    drawCornerOrnament(ctx, 60, 60, 1);
    drawCornerOrnament(ctx, W - 60, 60, 2);
    drawCornerOrnament(ctx, 60, H - 60, 3);
    drawCornerOrnament(ctx, W - 60, H - 60, 4);

    // --- Top: "CERTIFICATE" badge ---
    ctx.save();
    ctx.font = "bold 13px Arial";
    ctx.letterSpacing = "10px";
    ctx.fillStyle = "#f5c842";
    ctx.textAlign = "center";
    ctx.fillText("⬥  C E R T I F I C A T E  ⬥", W / 2, 115);
    ctx.restore();

    // --- "of Completion" ---
    ctx.font = "italic 34px Georgia, serif";
    ctx.fillStyle = "#fffbe6";
    ctx.textAlign = "center";
    ctx.fillText("of Completion", W / 2, 165);

    // --- Divider line ---
    const divGrad = ctx.createLinearGradient(200, 0, W - 200, 0);
    divGrad.addColorStop(0, "transparent");
    divGrad.addColorStop(0.3, "#f5c842");
    divGrad.addColorStop(0.7, "#f5c842");
    divGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(200, 190);
    ctx.lineTo(W - 200, 190);
    ctx.stroke();

    // --- "This is to certify that" ---
    ctx.font = "18px Georgia, serif";
    ctx.fillStyle = "rgba(255,251,230,0.7)";
    ctx.textAlign = "center";
    ctx.fillText("This is to certify that", W / 2, 250);

    // --- Student Name ---
    ctx.font = "bold 62px Georgia, serif";
    ctx.fillStyle = "#f5c842";
    ctx.textAlign = "center";
    ctx.fillText(studentName, W / 2, 340);

    // --- Name underline ---
    const nameWidth = ctx.measureText(studentName).width;
    ctx.strokeStyle = "rgba(245, 200, 66, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameWidth / 2, 355);
    ctx.lineTo(W / 2 + nameWidth / 2, 355);
    ctx.stroke();

    // --- "has successfully completed the course" ---
    ctx.font = "18px Georgia, serif";
    ctx.fillStyle = "rgba(255,251,230,0.7)";
    ctx.textAlign = "center";
    ctx.fillText("has successfully completed the course", W / 2, 410);

    // --- Course Name ---
    ctx.font = "bold 40px Georgia, serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    wrapText(ctx, courseName, W / 2, 470, W - 240, 48);

    // --- Bottom section divider ---
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 580);
    ctx.lineTo(W - 200, 580);
    ctx.stroke();

    // -- Completion date and issued by columns --
    const colY = 630;

    // School name (left)
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillStyle = "#fffbe6";
    ctx.textAlign = "left";
    ctx.fillText(schoolName, 140, colY);

    // Divider (center vert line)
    ctx.strokeStyle = "rgba(245, 200, 66, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, 595); ctx.lineTo(W / 2, 660); ctx.stroke();

    // Date (right)
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillStyle = "#fffbe6";
    ctx.textAlign = "right";
    ctx.fillText(completionDate, W - 140, colY);

    // Sub labels
    ctx.font = "12px Arial, sans-serif";
    ctx.fillStyle = "rgba(255,251,230,0.5)";
    ctx.textAlign = "left";
    ctx.fillText("ISSUED BY", 140, colY + 22);
    ctx.textAlign = "right";
    ctx.fillText("DATE OF COMPLETION", W - 140, colY + 22);

    // --- Star seal (center bottom) ---
    drawSeal(ctx, W / 2, colY - 10);
}

export async function generateCertificate(data: {
    studentName: string;
    courseName: string;
    completionDate: string;
    schoolName: string;
}): Promise<void> {
    const canvas = document.createElement("canvas");
    await drawCertificate(canvas, data);
    
    // --- Download ---
    const link = document.createElement("a");
    link.download = `Certificate - ${data.courseName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

// ---- Helpers ----

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawCornerOrnament(ctx: CanvasRenderingContext2D, x: number, y: number, corner: 1 | 2 | 3 | 4) {
    ctx.save();
    ctx.translate(x, y);
    const angles: Record<number, number> = { 1: 0, 2: Math.PI / 2, 3: -Math.PI / 2, 4: Math.PI };
    ctx.rotate(angles[corner]);
    ctx.strokeStyle = "#f5c842";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    // Diamond
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 14);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.stroke();
    // Lines
    ctx.beginPath();
    ctx.moveTo(14, -26);
    ctx.lineTo(14, -14);
    ctx.moveTo(14, -26);
    ctx.lineTo(26, -26);
    ctx.stroke();
    ctx.restore();
}

function drawSeal(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.save();
    ctx.translate(cx, cy);
    const spikes = 12;
    const outerR = 36;
    const innerR = 28;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    const sealGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, outerR);
    sealGrad.addColorStop(0, "#f5c842");
    sealGrad.addColorStop(1, "#b8860b");
    ctx.fillStyle = sealGrad;
    ctx.fill();

    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#0f1e3a";
    ctx.fill();

    // Star
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#f5c842";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", 0, 1);
    ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && i > 0) {
            ctx.fillText(line, x, currentY);
            line = words[i] + " ";
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
}
