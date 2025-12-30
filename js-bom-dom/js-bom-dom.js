// lv1
// document.addEventListener('DOMContentLoaded', function () {
//     let all = document.getElementById("al")
//     let none = document.getElementById("none")
//     let opp = document.getElementById("opp")
//     let cho = document.getElementsByClassName("choose")
//     // 全选
//     all.onclick = function () {
//         for (let i = 0; i < cho.length; i++) {
//             cho[i].checked = true
//         }
//     }
//     // 全不选
//     none.onclick = function () {
//         for (let i = 0; i < cho.length; i++) {
//             cho[i].checked = false
//         }
//     }
//     // 反选
//     opp.onclick = function () {
//         for (let i = 0; i < cho.length; i++) {
//             if(cho[i].checked === true){
//                 cho[i].checked = false
//             }else{
//                 cho[i].checked = true
//             }
//         }
//     }
// })

// lv2
document.addEventListener('DOMContentLoaded', function () {
    let comment = document.getElementById("comment")
    let inputBox = document.getElementById("inputBox")
    let commentPart = document.getElementById("commentPart")
    comment.onclick = add
})

function add() {
    let textWord = inputBox.value
    if (!textWord) {
        alert("请输入评论")
    }
    let commentPart = document.querySelector("#commentPart")
    let newComment = document.createElement("li")
    let head = document.createElement("img")
    let name = document.createElement("p")
    let commentText = document.createElement("p")
    head.className = "head"
    head.src = "./1.jpg"
    name.className = "name"
    name.innerText = "USER-NAME"
    commentText.className = "commentText"
    commentText.innerText = inputBox.value
    commentPart.appendChild(newComment)
    newComment.appendChild(head)
    newComment.appendChild(name)
    newComment.appendChild(commentText)
    inputBox.value = ""
}





