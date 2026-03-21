import re from "node:test";

const regex = /(\d+\/\d+|\+?%\d+(?:\.\d+)?|\d+x|\d+\+? saat|\d+ dakika|\d+\+?)/i;
const text = "7/24 Yapay Zeka yanıt sistemi ile potansiyel müvekkil dönüşüm oranında +%250 artış (%10'dan %35'e)";

const match = text.match(regex);
console.log("MATCH:", match ? match[0] : "null");

const text2 = "7 / 24 Yapay Zeka";
const match2 = text2.match(regex);
console.log("MATCH 2:", match2 ? match2[0] : "null");
