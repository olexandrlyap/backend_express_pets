const sendEmail = require('./sendEmail')

const sendResetPassswordEmail = async ({ username, email, token, origin }) => {
  const resetURL = `${origin}/user/obnoveni-hesla?token=${token}&email=${email}`
  const message = `<p>Please reset password by clicking on the following link : 
  <a href="${resetURL}">Reset Password</a></p>`

  return sendEmail({
    to: email,
    subject: 'Reset Password',
    html: `<h4>Hello, ${username}</h4>
   ${message}
   `,
  })
}

module.exports = sendResetPassswordEmail
