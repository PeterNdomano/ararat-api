import User from "./classes/User.js"

export function phoneLogin(input, database) {
  return new Promise(async resolve => {

    if(input.phone) {
      //..
      await User.phoneLogin({
        ...input,
        database,
      }).then(result => {
        resolve({
          status: 1,
          msg: 'successful',
        })
      }).catch(error => {
        resolve({
          status: 0,
          msg: error,
        })
      })
      //..
    } else {
      resolve({
        status: 0,
        msg: "Invalid input data",
      })
    }
  })
}

export function otpLogin(input, database) {
  return new Promise(async resolve => {

    if(
      input.phone &&
      input.otp
    ) {
      //..
      await User.otpLogin({
        ...input,
        database,
      }).then(result => {
        resolve({
          status: 1,
          msg: 'successful',
          userId: result.id,
          userToken: result.token,
        })
      }).catch(error => {
        resolve({
          status: 0,
          msg: error,
        })
      })
      //..
    } else {
      resolve({
        status: 0,
        msg: "Invalid input data",
      })
    }

    
  })
}

export function authCheck(input, database) {
  return new Promise(async resolve => {

    if(
      input.userId &&
      input.userToken
    ) {
      //..
      const user = new User({
        id: input.userId,
        database
      });

      await user.authCheck({
        ...input,
        database,
      }).then(result => {
        resolve({
          status: 1,
          msg: 'successful',
          userData: result,
          
        })
      }).catch(error => {
        resolve({
          status: 0,
          msg: error,
        })
      })
      //..
    } else {
      resolve({
        status: 0,
        msg: "Invalid input data",
      })
    }

    
  })
}

export function getUserData(input, database) {
  return new Promise(async resolve => {

    if(
      input.userId &&
      input.userToken
    ) {
      //..
      const user = new User({
        id: input.userId,
        database
      });

      await user.getData().then(result => {
        resolve({
          status: 1,
          msg: 'successful',
          userData: result,
          
        })
      }).catch(error => {
        resolve({
          status: 0,
          msg: error,
        })
      })
      //..
    } else {
      resolve({
        status: 0,
        msg: "Invalid input data",
      })
    }

    
  })
}