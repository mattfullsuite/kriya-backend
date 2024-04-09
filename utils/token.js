// import jwt from "jsonwebtoken";

// const encodeToken = (key, value) => {
//   const token = jwt.sign({ [key]: value }, process.env.SECRET_KEY, {
//     expiresIn: "7d",
//   });
//   return token;
// };
// const decodeToken = (token) => {
//   let decodedToken = null;
//   jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
//     if (err) {
//       console.log(err);
//     } else {
//       decodedToken = decoded;
//     }
//   });
//   return decodedToken;
// };

// export { encodeToken, decodeToken };