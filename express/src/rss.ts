import { Request, RequestHandler, Response } from "express";
import fs from "fs";
import csv from "csv-parser";
import xml from "xmlbuilder";

const FALLBACK_HOST = "https://simon-tornqvist.se/eskitech";

/**
 * Create a rss feed route that feeds data from csv file.
 *
 * https://en.wikipedia.org/wiki/RSS
 */
export function rssFromCsv(csvPath: string): RequestHandler {

  // Parse csv once on server boot
  let products: ProductElement[] | null = null;
  readCsv(csvPath)
    .then((res) => {
      products = res;
    })
    .catch((error) => {
      console.error(`ERROR parsing ${csvPath}: `, error);
      products = null;
    });

  // Preprocess parsed csv on request
  function rssRequestHandler(req: Request, res: Response) {
    if (products === null) {
      res.sendStatus(503); // Service unavailable
    } else {
      const rss = makeRss(
        products.map((element) => postProcess(element, req.get("host")))
      );
      res.set("Content-Type", "text/xml").send(rss.end({ pretty: true }));
    }
  }
  return rssRequestHandler;
}

/**
 * Postprocess product element by replacing links
 */
function postProcess(element: ProductElement, host?: string): ProductElement {
  const { link, imageLink } = productLinks(element["g:id"], host);
  return {
    ...element,
    "g:link": link,
    "g:image_link": imageLink,
  };
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

function productLinks(
  id: string,
  host?: string
): { link: string; imageLink: string } {
  const origin = `http://${host ?? FALLBACK_HOST}`;
  return {
    link: origin,
    imageLink: `${origin}/product_images/${id}.jpg`,
  };
}

function csvRowToRssElement(data: any): ProductElement {
  for (const key of [
    "id",
    "title",
    "description",
    "availability",
    "price",
    "shipping_country",
    "shipping_price",
    "gtin",
    "brand",
  ]) {
    assertString(data[key]);
  }

  // Use fallback host. Replaced at request phase, if x-host passed.
  const {link, imageLink} = productLinks(data.id);

  return {
    "g:id": data.id,
    "g:title": data.title,
    "g:description": data.description,
    "g:link": link,
    "g:image_link": imageLink,
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
