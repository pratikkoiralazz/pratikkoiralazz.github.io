// function declaration
// greetName("John doe");

// function greetName() {
//   console.log("Hello" + name);
// }

// // anomymous function
// const greet = function (name) {
//   console.log("Helllo from greet function ${name}");
// };
// greet("Jane DOe");

 const greetArr = (name) => {
    console.log(`yeti jodda yeti aauxa: ${name}`);
 };
 greetArr("sum");

 // rest paramteter
function sum(...nums){
    let total = 0;
   // for (const num of nums){
      //  total += num;
       for (let i = 0; i < nums.length; i++) {
    total += nums[i];
  }

    
    return total
}
console.log(sum(5, 10, 20, 40, 50)) 