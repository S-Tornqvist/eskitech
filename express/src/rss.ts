import { Request, Response } from "express";
import fs from "fs";
import csv from "csv-parser";
import xml from "xmlbuilder";

const CSV_PATH = process.env.PRODUCTS_CSV || "/dev/null";

if (!process.env.PRODUCTS_CSV) {
  console.warn("warning: PRODUCTS_CSV is unset in env. using " + CSV_PATH);
}

// Ensure log if csv path is misconfigured
readCsv(CSV_PATH)
  .then(makeRss)
  .catch((reason) => console.error("FAILED TO READ CSV PATH: ", reason));

export function rss(req: Request, res: Response) {
  readCsv(CSV_PATH)
    .then((products) => {
      const rss = makeRss(products);
      res.send(rss.end({ pretty: true }));
    })
    .catch((reason) => {
      console.error(`ERROR parsing ${CSV_PATH}: `, reason);
      res.sendStatus(500);
    });
}

/**
 * https://support.google.com/merchants/answer/7052112?hl=en
 */
type ProductElement = {
  "g:id": string;
  "g:title": string;
  "g:description": string;
  "g:link": string;
  "g:image_link": string;
  "g:availability": "in_stock" | "out_of_stock"; // | "pre_order" | "backorder";
  "g:price": string;
  "g:shipping": {
    "g:country": string;
    "g:price": string;
  };
  "g:gtin": string;
  "g:brand": string;
};

function assertString(item: unknown, message?: string): asserts item is string {
  if (typeof item !== "string") {
    throw new Error(
      `Type error, expected string but got ${typeof item}` +
        (message ? ": " + message : "")
    );
  }
}

function csvRowToRssElement(data: any): ProductElement {
  for (const key of [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "price",
    "shipping_country",
    "shipping_price",
    "gtin",
    "brand",
  ]) {
    assertString(data[key]);
  }
  return {
    "g:id": data.id,
    "g:title": data.title,
    "g:description": data.description,
    "g:link": data.link,
    "g:image_link": data.image_link,
    "g:availability": data.availability,
    "g:price": data.price,
    "g:shipping": {
      "g:country": data.shipping_country,
      "g:price": data.shipping_price,
    },
    "g:gtin": data.gtin,
    "g:brand": data.brand,
  };
}

function readCsv(csvPath: string): Promise<ProductElement[]> {
  return new Promise((resolve, reject) => {
    try {
      const result = [] as ProductElement[];
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on("data", (data) => result.push(csvRowToRssElement(data)))
        .on("end", () => {
          resolve(result);
        });
    } catch (err) {
      reject(`Failed to parse csv to products from ${csvPath}: ${err}`);
    }
  });
}

function makeRss(products: ProductElement[]) {
  return xml.create({
    rss: {
      "@xmlns:g": "http://base.google.com/ns/1.0",
      "@version": "2.0",
      channel: {
        title: "Eskitech products",
        link: "https://simon-tornqvist.se/eskitech",
        description:
          "This RSS feed is intended for retailers, price comparisons and the Eskitech client",
        item: products,
      },
    },
  });
}
