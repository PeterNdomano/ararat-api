import axios from "axios";
import dotenv from 'dotenv';
import { generateRandomSixDigitNumber, getCurrentTimestamp, sendSms } from "../helpers.js";
import bcrypt from 'bcrypt';

dotenv.config();

export default class User {
  constructor(params) {
    let {
      id,
      database,
    } = params;

    this.id = id;
    this.database = database;
  }

  getData = () => {
    return User.getData({ database: this.database, id: this.id });
  }

  authCheck = (params) => {
    return new Promise(async (resolve, reject) => {
      let {
        userToken
      } = params;

      const userData = await this.getData();

      if(userToken && userData) {
        if(userToken === userData.token) {
          resolve(userData);
        } else {
          reject("Taarifa sio sahihi");
        }
      } else {
        reject("Server error #8876");
      }
    })
  }

  sendOtp = () => {
    //sends otp to this user's phone
    return new Promise(async (resolve, reject) => {
      const userData = await this.getData();

      if(userData) {
        //create otp
        const otp = generateRandomSixDigitNumber();
        const otpExpiry = getCurrentTimestamp() + (10 * 60); //expire in 10 minutes

        //update it on database and set expiry
        await this.database.execute(
          "UPDATE users SET otp = ?, otpExpiry = ? WHERE id = ?",
          [ otp, otpExpiry, this.id ]
        ).then(() => {
          //send sms with otp
          sendSms({
            phone: userData.phone,
            message: `Tumia ${otp} kama OTP kuingia kwenye app ya Ararat Food & Shopping.`,
          });
          resolve(true);

        }).catch(error => {
          reject("Server error #5445");
        })
      } else {
        reject("Invalid user #45678");
      }

    })
  }

  static phoneLogin = (params) => {
    return new Promise(async (resolve, reject) => {
      let {
        phone,
        database
      } = params;

      const testData = await this.getDataByPhone({ database, phone });

      let user = null;

      if(testData) {
        //phone number already registered
        user = new User({ database, id:testData.id })
      } else {
        //phone not registered so register it and create user
        const token = await bcrypt.hash(String(phone), 10);
        await database.execute(
          "INSERT INTO users (phone, token) VALUES ( ?, ? )",
          [ String(phone), token ]
        ).then(([ rows, fields ]) => {
          user = new User({ database, id: rows.insertId });
        }).catch(error => {
          reject("Server error...");
        })
      }

      if(user) {
        //send otp
        //user.sendOtp();
        resolve(true);

      } else {
        reject("Server error #654");
      }

    })
  }

  static otpLogin = (params) => {
    return new Promise(async (resolve, reject) => {
      let {
        phone,
        database,
        otp,
      } = params;

      const testData = await this.getDataByPhone({ database, phone });

      let user = null;

      if(testData) {
        //phone number already registered
        user = new User({ database, id:testData.id })
        if(user) {
          
          const userData = await user.getData();
          if(Number(userData.otpExpiry) >= getCurrentTimestamp()) {
            if(Number(otp) === userData.otp) {
              resolve(userData);
            } else {
              reject("OTP sio sahihi");
            }
          } else {
            reject("OTP imekwisha muda wake, tafadhali anza upya");
          }
  
        } else {
          reject("Server error #654");
        }

      } else {
        reject("Namba hii haijasajiliwa, tafadhali jisajili");
      }

      

    })
  }

  static getData = (params) => {
    return new Promise(async (resolve, reject) => {
      let {
        id,
        database,
      } = params;

      await database.execute(
        "SELECT * FROM users WHERE id = ?",
        [ id ]
      ).then(([rows, fields]) => {
        if(rows && rows.length === 1) {
          resolve(rows[0])
        } else {
          resolve(null);
        }
      }).catch(error => {
        reject("Server error");
      })

    })
  }

  static getDataByPhone = (params) => {
    return new Promise(async (resolve, reject) => {
      let {
        phone,
        database,
      } = params;

      await database.execute(
        "SELECT * FROM users WHERE phone = ?",
        [ String(phone) ]
      ).then(([rows, fields]) => {
        if(rows && rows.length === 1) {
          resolve(rows[0])
        } else {
          resolve(null);
        }
      }).catch(error => {
        reject("Server error");
      })

    })
  }
}