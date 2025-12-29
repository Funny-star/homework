// lv0
// const person = {
//     name: '小明',
//     age: 18,
//     address: {
//         city: 'ChongQing',
//         area: 'RedRock'
//     },
//     title: ['student', { year: 2025, title: 'GoodStudent' }]
// }

// const { name, age, address: { city, mountain }, title: [title1, { year, title2 }] } = person;

// console.log(name) // 小明
// console.log(year) // 18
// console.log(city) // ChongQing
// console.log(mountain) // RedRock
// console.log(title1) // student
// console.log(title2) // GoodStudent

// lv1

// function factorial(n) {
//     let result = 1;
//     for (let i = n; i > 0; i--) {
//         result *= i;
//     }
//     return result;
// }
// console.log(factorial(9));


// lv2

// var name = 'window'
// function Person(name) { //构造函数
//     this.name = name
//     this.foo1 = function () {
//         console.log(this.name)//foo1中的this指向调用者输出person1
//     }
//     this.foo2 = () => console.log(this.name)//foo2中的this指向定义者输出person1
//     this.foo3 = function () {//返回一个函数
//         return function () {
//             console.log(this.name)
//         }
//     }
//     this.foo4 = function () {
//         return () => {
//             console.log(this.name)
//         }
//     }
// }

// var person1 = new Person('person1')
// var person2 = new Person('person2')

// person1.foo1()
// person1.foo1.call(person2) //call从新绑定使得this指向person2

// person1.foo2()
// person1.foo2.call(person2) //箭头函数不会被call改变this指向，输出person1

// person1.foo3()() //返回的函数被调用使用全局变量，输出window
// person1.foo3.call(person2)() //用call从新绑定foo3的this指向person2，但不影响返回的函数，依旧输出window
// person1.foo3().call(person2) //用call把返回函数中的this指向person2，输出person2

// person1.foo4()() //箭头函数继承了foo4的this指向，输出person1
// person1.foo4.call(person2)() //用call从新绑定foo4的this指向person2，箭头函数继承了person2的this指向，输出person2
// person1.foo4().call(person2)//箭头函数不会被call改变this指向，输出person1

// lv3
const a = {//课件写错了是不应该不是b吧。
  val: 1,
  b: { x: 10 },
  arr: [1, 2, 3]
};

const copy = structuredClone(a);
// 这里使用深拷贝方法 structuredClone 来创建对象 a 的深拷贝
// 与浅拷贝不同，此时在堆区中从新分配了内存给嵌套对象和数组，因此在修改原来的嵌套对象和数组时，拷贝对象不会受到影响

console.log(copy === a);//内存区域不同返回false
console.log(copy.val === a.val); // true —— 基本类型值相等
console.log(copy.b === a.b); //嵌套对象不再是同一引用，内存区域不同返回false
console.log(copy.arr === a.arr); //嵌套数组也不再是同一引用，内存区域不同返回false

// 与浅拷贝不同，此时在堆区中从新分配了内存给嵌套对象和数组，因此在修改原来的嵌套对象和数组时，拷贝对象不会受到影响
copy.b.x = 99;
copy.arr.push(4);

console.log(a.b.x); // 10 —— 原对象未被修改
console.log(a.arr);      // [1, 2, 3] —— 原数组未被修改
console.log(copy.b.x); // 99
console.log(copy.arr);      // [1, 2, 3, 4]

// 深拷贝与浅拷贝的主要区别是，当拷贝内容存在嵌套数组或对象时，浅拷贝只会复制引用，
// 也就是其在堆区中的内存地址，所以在改变该内存地址中的内容时，原对象和拷贝对象都会受到影响；
// 而深拷贝会创建新的嵌套对象或数组，从而避免了对原对象的修改影响到拷贝对象的问题。