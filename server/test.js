const test=async()=> {
const res=await fetch("http://localhost:5000/api/tokens/symptoms", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(
   {"name":"test234","age":"22","gender":"male","phone":"9999999999","symptoms":["chest"],"priority":"normal","triageLevel":9}
  )
})
const data=await res.json();
console.log(data);
}
test().catch(console.error);