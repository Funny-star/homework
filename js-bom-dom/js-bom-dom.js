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
let number = 1;

document.addEventListener('DOMContentLoaded', function () {
    let comment = document.getElementById("comment")
    let inputBox = document.getElementById("inputBox")
    let commentPart = document.getElementById("commentPart")
    comment.onclick = add
    
    let contextmenu = document.getElementById("contextmenu")
    
    document.onclick = function() {
        if (contextmenu) {
            contextmenu.style.display = "none"
        }
    }
})

function add() {
    let textWord = inputBox.value
    if (!textWord) {
        alert("请输入评论")
        return;
    }
    let commentPart = document.querySelector("#commentPart")
    let newComment = document.createElement("li")
    let head = document.createElement("img")
    let name = document.createElement("p")
    let commentText = document.createElement("p")
    newComment.className = "comment"
    head.className = "head"
    head.src = "./1.jpg"
    name.className = "name"
    name.innerText = "USER-NAME"
    commentText.className = "commentText"
    commentText.innerText = inputBox.value

     newComment.oncontextmenu = function(item) {
        item.preventDefault()
        console.log("右键点击了评论")
        
        let contextmenu = document.getElementById("contextmenu")
        if (contextmenu) {
            contextmenu.style.display = "block"
            contextmenu.style.left = item.pageX + "px"
            contextmenu.style.top = item.pageY + "px"
            
            let menuItems = contextmenu.querySelectorAll("li")
            menuItems.forEach(function(menuItem) {
                menuItem.onclick = function() {
                    if (this.textContent === "删除评论") {
                        newComment.remove()
                    }
                    if (this.textContent === "举报评论") {
                        alert("已举报该评论")
                    }
                    contextmenu.style.display = "none"
                }
            })
        }
        return false
    }
    commentPart.appendChild(newComment)
    newComment.appendChild(head)
    newComment.appendChild(name)
    newComment.appendChild(commentText)
    inputBox.value = ""
}
window.oncontextmenu = function(item){
    item.preventDefault()
    return false
}
                         
let comment = document.getElementsByClassName("comment")
let contextmenu = document.getElementById("contextmenu")

comment.oncontextmenu = function (item) {
    console.log(1)
}



