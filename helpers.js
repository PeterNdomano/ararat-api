import axios from "axios";
import dotenv from 'dotenv';
import https from 'https';
import btoa from "btoa";

dotenv.config();

export function formatTzPhone(phone) {
  if(phone.length === 10) {
    return '255'+phone.slice(1);
  } else if(phone.length === 9) {
    return '255'+phone;
  } else if(phone.length === 12) {
    return phone;
  } else {
    //invalid phone
    return null;
  }
}

export function sendSms(params) {
  let {
    phone,
    message
  } = params;

  const api_key = process.env.BEEM_API_KEY;
  const secret_key = process.env.BEEM_SECRET_KEY;
  const content_type = "application/json";
  const source_addr ="INFO";


  axios
    .post(
      "https://apisms.beem.africa/v1/send",
      {
        source_addr,
        schedule_time: "",
        encoding: 0,
        message,
        recipients: [
          {
            recipient_id: 1,
            dest_addr: formatTzPhone(phone),
          }
        ],
      },
      {
        headers: {
          "Content-Type": content_type,
          Authorization: "Basic " + btoa(api_key + ":" + secret_key),
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }
    )
    .then((response) => { })
    .catch((error) => { });
}

export function generateRandomSixDigitNumber() {
  // Generate a random number between 100,000 (inclusive) and 999,999 (inclusive)
  const min = 100000;
  const max = 999999;
  const randomSixDigitNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  
  return randomSixDigitNumber;
}

export function getCurrentTimestamp() {
  return Math.round(Date. now() / 1000);
}
