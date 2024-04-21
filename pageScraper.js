const PDFDocument = require("pdfkit");
const fs = require("fs");
const sharp = require("sharp");

const getDate = () => {
  let today = new Date();
  let date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let date_time = date + " " + time;
  return date_time;
};

const generateRandomUA = () => {
  // Array of random user agents
  const userAgents = [
    // Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.0.0 Safari/537.36",

    // Mac OS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_16) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_16) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",

    // Linux
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:95.0) Gecko/20100101 Firefox/95.0",
    "Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:95.0) Gecko/20100101 Firefox/95.0",
    "Mozilla/5.0 (X11; CentOS; Linux x86_64; rv:95.0) Gecko/20100101 Firefox/95.0",
    "Mozilla/5.0 (X11; Linux x86_64; rv:95.0) Gecko/20100101 Firefox/95.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  ];
  // Get a random index based on the length of the user agents array
  const randomUAIndex = Math.floor(Math.random() * userAgents.length);
  // Return a random user agent using the index above
  return userAgents[randomUAIndex];
};

const scraperObject = {
  url: "https://komikindo.tv/komik/856668-a-returners-magic-should-be-special/",
  async scraper(browser) {
    console.log("--------SCRAPER KOMIK ONLINE----------");
    console.log("++++++++++++++++++++++++++++++++++++++");
    console.log(`# start scraping ${getDate()}#`);
    let page = await browser.newPage();
    await page.goto(this.url, { waitUntil: "load", timeout: 0 });

    await page.waitForSelector("#chapter_list", { visible: true });
    let title = await page.$eval(".infoanime > .entry-title", (item) => {
      return item.textContent;
    });
    console.log("Target: ", title);

    let chapters = await page.$$eval("#chapter_list ul > li", (list) => {
      list = list.map((el) => el.querySelector("span > a").href);
      return list;
    });

    if (chapters.length == 0) {
      console.log("Result: Tidak Ada Chapter");
      console.log("# end scraping #");
      console.log("++++++++++++++++++++++++++++++++++++++");
      return;
    }

    console.log("Jumlah Chapter: ", chapters.length);
    console.log("> please wait ......");

    // for (let i = 0; i < chapters.length; i++) {
    //   try {
    //     let title = chapters[i];
    //     title = title.split("/");
    //     title = title[title.length - 2];
    //     title = `${title}.pdf`;

    //     console.log("> downloading: " + title);
    //     await page.goto(chapters[i], { waitUntil: "load", timeout: 0 });

    //     await page.waitForSelector(".chapter-content", { visible: true });
    //     await page.waitForSelector("#chimg-auh", { visible: true });
    //     let imgs = await page.$$eval("#chimg-auh > img", (list) => {
    //       list = list.map((el) => el.src);
    //       return list;
    //     });

    //     // console.log(imgs);

    //     let pdf = new PDFDocument({ size: "A1", margin: 0 });
    //     let writeStream = fs.createWriteStream(`./downloaded-pdf/${title}`);
    //     pdf.pipe(writeStream);

    //     const A1_WIDTH = 1683.78; // Ukuran lebar A1 dalam poin
    //     const A1_HEIGHT = 2383.94; // Ukuran tinggi A1 dalam poin

    //     for (let j = 0; j < imgs.length; j++) {
    //       try {
    //         let res = await fetch(imgs[j]);
    //         let buffer = await res.arrayBuffer();
    //         let img = Buffer.from(buffer);
    //         pdf.image(img, {
    //           fit: [A1_WIDTH, A1_HEIGHT], // Skala gambar sesuai ukuran halaman A1
    //           align: "center",
    //           valign: "center",
    //         });

    //         pdf.addPage({ size: "A1", margin: 0 });
    //       } catch (error) {
    //         console.log("err: ", error);
    //         continue;
    //       }
    //     }

    //     pdf.end();
    //     console.log("> downloaded: " + title);
    //   } catch (error) {
    //     console.log("> failed: " + title);
    //     console.log("err: ", error);
    //     continue;
    //   }
    // }

    for (let i = 0; i < chapters.length; i++) {
      try {
        let title = chapters[i];
        title = title.split("/");
        title = title[title.length - 2];
        title = `${title}.pdf`;

        if (fs.existsSync(`./downloaded-pdf/${title}`)) {
          console.log("> exist: " + title);
          continue;
        }
        console.log("> downloading: " + title);

        const customUA = generateRandomUA();
        await page.setUserAgent(customUA);

        await page.goto(chapters[i], { waitUntil: "load", timeout: 0 });

        await page.waitForSelector(".chapter-content", { visible: true });
        await page.waitForSelector("#chimg-auh", { visible: true });

        // Evaluate script to get image URLs directly
        const imgUrls = await page.evaluate(() => {
          const images = document.querySelectorAll("#chimg-auh > img");
          return Array.from(images).map((img) => img.src);
        });

        let pdf = new PDFDocument({ size: "A1", margin: 0 });
        let writeStream = fs.createWriteStream(`./downloaded-pdf/${title}`);
        pdf.pipe(writeStream);

        const A1_WIDTH = 1683.78; // Ukuran lebar A1 dalam poin
        const A1_HEIGHT = 2383.94; // Ukuran tinggi A1 dalam poin

        for (let j = 0; j < imgUrls.length; j++) {
          try {
            let imgBuffer = await page
              .goto(imgUrls[j], {
                waitUntil: "load",
                timeout: 0,
              })
              .then((response) => response.buffer());

            if (imgUrls[j].toLowerCase().endsWith(".webp")) {
              imgBuffer = await sharp(imgBuffer).png().toBuffer();
            }

            if (imgUrls[j].toLowerCase().endsWith(".gif")) {
              imgBuffer = await sharp(imgBuffer).png().toBuffer();
            }

            pdf.image(imgBuffer, {
              fit: [A1_WIDTH, A1_HEIGHT], // Skala gambar sesuai ukuran halaman A1
              align: "center",
              valign: "center",
            });

            pdf.addPage({ size: "A1", margin: 0 });
          } catch (error) {
            console.log("err: ", error);
            if (fs.existsSync(`./downloaded-pdf/${title}`)) {
              fs.rmSync(`./downloaded-pdf/${title}`);
            }
            break;
          }
        }

        if (fs.existsSync(`./downloaded-pdf/${title}`)) {
          pdf.end();
          console.log("> downloaded: " + title);
        }
      } catch (error) {
        console.log("> failed: ");
        console.log("err: ", error);
      }
    }

    console.log("Result: Berhasil");
    console.log(`# end scraping ${getDate()}#`);
    console.log("++++++++++++++++++++++++++++++++++++++");
  },
};

module.exports = scraperObject;
