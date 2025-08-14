const express = require("express");
const multer = require("multer");
const cors = require("cors");
const docxToPDF = require("docx-pdf");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors({
  origin: 'https://wordtopdf-one.vercel.app', // your frontend domain
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// settting up the file storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "/tmp");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send("Backend is running on Render.");
});

app.post("/convertFile", upload.single("file"), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file  uploaded",
            });
        }
        // Input file path in /tmp
        const inputPath = req.file.path;
        // Defining outout file path
        let outoutPath = path.join("/tmp", `${req.file.originalname}.pdf`);

        docxToPDF(inputPath, outoutPath, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Error converting docx to pdf",
                });
            }
            res.download(outoutPath, (err) => {
        if (err) console.error("Error sending file:", err);
        console.log("File converted and sent successfully");
      });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});