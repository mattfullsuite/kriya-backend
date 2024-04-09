// function sanitizeInput(input) {
//     if (typeof input === "string") {
//       return input.replace(/[<>]/g, "");
//     } else {
//       return String(input);
//     }
//   }
  
//   function sanitizeObject(obj) {
//     if (obj && typeof obj === "object") {
//       // Iterate over each property in the object
//       for (const key in obj) {
//         if (obj.hasOwnProperty(key)) {
//           // Sanitize the property value
//           obj[key] = sanitizeInput(obj[key]);
//         }
//       }
//     }
//     return obj;
//   }
  
//   export { sanitizeInput, sanitizeObject };
  