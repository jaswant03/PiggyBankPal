const tesseract = require('node-tesseract-ocr');
const fs = require('fs');
const { Receipt, ReceiptItem } = require('../models');

function parseReceiptText(rawText) {
    const items = [];
    const lines = rawText.split('\n');
    const itemRegex = /(.+?)\s+(\d+\.\d{2})\s*$/;
    for (const line of lines) {
        const match = line.match(itemRegex);
        if (match) {
            const name = match[1].trim();
            const price = parseFloat(match[2]);
            let category = 'Other';
            const lower = name.toLowerCase();
            if (lower.includes('gas') || lower.includes('fuel')) category = 'Fuel';
            else if (lower.includes('grocery') || lower.includes('milk') || lower.includes('bread')) category = 'Groceries';
            items.push({ name, price, category });
        }
    }
    return items;
}

function runTesseractDocker(filename) {
    const { exec } = require('child_process');
    const path = require('path');
    const uploadsDir = path.resolve('uploads');
    const dockerCommand = `docker run --rm -v "${uploadsDir}":/uploads tesseractshadow/tesseract4re /uploads/${filename} stdout`;
    return new Promise((resolve, reject) => {
        exec(dockerCommand, (error, stdout, stderr) => {
            if (error) return reject(error);
            resolve(stdout);
        });
    });
}

exports.uploadReceipt = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image provided' });
        const rawText = await runTesseractDocker(req.file.filename);
        fs.unlinkSync(req.file.path);
        const items = parseReceiptText(rawText);
        if (items.length === 0) {
            return res.status(400).json({ error: 'No valid items found' });
        }
        const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
        const receipt = await Receipt.create({
            userId: req.user.id,
            totalAmount,
            rawText
        });
        for (const item of items) {
            await ReceiptItem.create({
                receiptId: receipt.id,
                name: item.name,
                price: item.price,
                category: item.category
            });
        }
        res.status(201).json({ receiptId: receipt.id, totalAmount, items });
    } catch (err) {
        console.error("Upload receipt error:", err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getUserReceipts = async (req, res) => {
    try {
        const receipts = await Receipt.findAll({
            where: { userId: req.user.id },
            include: [{ model: ReceiptItem, as: 'items' }]
        });
        res.json(receipts);
    } catch (err) {
        console.error("Get receipts error:", err);
        res.status(500).json({ error: 'Server error' });
    }
};
