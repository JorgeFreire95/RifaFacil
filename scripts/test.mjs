import puppeteer from 'puppeteer-core';
import * as chromeLauncher from 'chrome-launcher';

(async () => {
  try {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const browser = await puppeteer.connect({
      browserURL: `http://localhost:${chrome.port}`
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    console.log("Navigating to http://localhost:5173...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Wait an extra second just in case
    await new Promise(r => setTimeout(r, 1000));
    
    // Check if #root is empty
    const rootHtml = await page.$eval('#root', el => el.innerHTML);
    console.log("Root HTML length:", rootHtml.length);
    
    // CAPTURE SCREENSHOT
    await page.screenshot({ path: 'c:\\Users\\jorge\\OneDrive\\Escritorio\\Proyectos\\RifaFacil\\screenshot.png' });
    console.log("Screenshot saved to screenshot.png");
    
    await browser.close();
    await chrome.kill();
    console.log("Done");
  } catch (err) {
    console.error("Test script failed:", err);
  }
})();
