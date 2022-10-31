export const formatTimestamp = (timestamp)=>{
  const unixTimestamp = timestamp

const milliseconds = 1575909015 * 1000 // 1575909015000

const dateObject = new Date(milliseconds)

const humanDateFormat = dateObject.toLocaleString() //2019-12-9 10:30:15

return dateObject.toLocaleString("es-MX", {timeZoneName: "short"}) // 12/9/2019, 10:30:15 AM CST
}
