// lv0
// let obj1 = new Object();
// obj1.name = 'wxy';
// obj1.age = 19;
// console.log(obj1);



// let obj2 = {
//     name: 'wxy',
//     age: '19',
// }


// console.log(obj2);
// function Person(){
//     this.name = 'wxy';
//     this.age = 19;
// }
// let p = new Person();
// console.log (p);


//lv1
// let obj = {
//     name:"wxy",
//     age:19,
// };

// function copy(obj){
//     let newObj = {};

//     for(let i in obj){
//     newObj[i] = obj[i];
//     }
//     return newObj;
// }

// let obj1 = copy(obj);
// let obj2 = copy(obj);
// let obj3 = copy(obj);

// let arr = [];

// arr.push(obj1,obj2,obj3);

// console.table(arr);

// lv2

let arr = [[1, [2, 3], 4], [5, [6, 7], 8, 9]];
function sum(array){
    const a = array.reduce((newArry1 = [] , present1) => {
        return newArry1.concat(present1)
    }, [])
    const b = a.reduce((newArry2 = [] , present2) => {
        if(Array.isArray(present2)){
              const flattened = present2.reduce((innerArr, innerItem) => {
                return innerArr.concat(innerItem);
            }, []);
            return newArry2.concat(flattened);
        } else {
            return newArry2.concat(present2);
        }
        
    }, [])
    return b;
}
console.log(sum(arr));

