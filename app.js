const express = require("express");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const app = express();
const PORT = 5000;
// Serve static files from the 'public' directory
app.use("/public", express.static(path.join(__dirname, "public")));
// Route to render EJS template in browser for testing
app.get("/test", async (req, res) => {
  try {
    const formattedData = {
      name: "Shyam",
      course: "Test Course",
      date: "2022-2-2",
    };

    // Format the date if provided
    const data = {
      ...formattedData,
      date: new Date(formattedData.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
    const html = await ejs.renderFile(
      path.join(__dirname, "views/template.ejs"),
      data
    );
    res.send(html);
  } catch (error) {
    console.error("Error rendering template for testing:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Route to render the PDF
app.get("/download-pdf", async (req, res) => {
  try {
    // Dynamic data to be passed to the EJS template

    const formattedData = {
      name: "Shyam",
      course: "Test Course",
      date: "2022-2-2",
    };

    // Format the date if provided
    const data = {
      ...formattedData,
      date: new Date(formattedData.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    // Render the EJS template to HTML with dynamic data
    const html = await ejs.renderFile(
      path.join(__dirname, "views/template.ejs"),
      data
    );
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    // Log console messages and network requests from the page
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("request", (request) => console.log("Request:", request.url()));
    page.on("requestfailed", (request) => {
      console.log(
        `Request failed: ${request.url()} ${request.failure().errorText}`
      );
    });
    // Set the HTML content and wait for the network to be idle
    const serverUrl = `http://localhost:${PORT}`;
    await page.goto(`${serverUrl}/test`, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    // Generate the PDF
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    // Close Puppeteer
    await browser.close();
    // Set the response headers to trigger download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=document.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// const formattedData = {
//   name: "Shyam",
//   course: "Test Course",
//   date: "2022-2-2",
// };

// // Format the date if provided
// const data = {
//   ...formattedData,
//   date: new Date(formattedData.date).toLocaleDateString(undefined, {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   }),
// };
