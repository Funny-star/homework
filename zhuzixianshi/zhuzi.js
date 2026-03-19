function queryStringify(obj) {
    let str = ""
    for (let key in obj) {
        str += `${key}=${obj[key]}&`
    }
    return str.slice(0, -1)
}

function ajax(options) {
    let defaultoptions = {
        url: "",
        method: "GET",
        async: true,
        data: {},
        headers: {},
        success: function () { },
        error: function () { }
    }
    let { url, method, async, data, headers, success, error } = {
        ...defaultoptions,
        ...options
    }

    if (/^get$/i.test(method) && data) url += "?" + queryStringify(data)
    if (/^put|delete|patch/i.test(method) && data) url += "/" + data.id
    console.log(url)

    const xhr = new XMLHttpRequest()
    xhr.open(method, url, async)
    return new Promise((resolve, reject) => {
        xhr.onload = function () {
            if (!(/^2\d{2}$/.test(xhr.status))) {
                reject(`请求失败，状态码${xhr.status}`)
                return
            }
            try {
                let result = JSON.parse(xhr.responseText)
                resolve(result)  // 返回解析后的数据
            } catch (err) {
                reject("数据解析失败")
            }
        }

        xhr.onerror = function () {
            reject("网络请求失败")
        }

        for (let key in headers) xhr.setRequestHeader(key, headers[key])

        if (/^get|delete$/i.test(method)) {
            xhr.send()
        } else {
            xhr.send(JSON.stringify(data || {}))
        }
    })
}

let submit = document.getElementById("submit")
let input = document.getElementById("input")
let length = 0
submit.addEventListener("click", async function () {
    let value = input.value.trim()
    let words = value.split('')
    if (!value) return alert("请输入内容")
    for (let word of words) {
        await ajax({
            url: "http://localhost:3000/words",
            method: "GET",
        }).then( allData => {
            let id = allData.length + 1
            ajax({
                url: "http://localhost:3000/words",
                method: "POST",
                data: { id: `${id}`, word: word },
            })
        }).catch(err => {
            console.error(err)
        })
    }
})

let print = document.getElementById("print")
print.addEventListener("click", () => {
    ajax({
        url: "http://localhost:3000/words",
        method: "GET",
    }).then(allData => {
        let dataLength = allData.length
        let index = 1
        function next() {
            if (index > dataLength) return
            setTimeout(() => {
                ajax({
                    url: `http://localhost:3000/words/${index}`,
                    method: "GET",
                }).then(result => {
                    document.writeln(result.word)
                    index++
                    next()
                }).catch(err => {
                    console.error(err)
                    index++     
                })
            }, 100)
        }

        next()
    }).catch(err => {
        console.error(err)
    })
})
//浏览器的异步请求是单线程的，虽然它们是异步的，但它们仍然在同一个线程上执行。这意味着当你发出多个异步请求时，它们会按照顺序执行，而不会同时进行。这就是为什么在上面的代码中，虽然我们使用了setTimeout来模拟异步请求，但它们仍然会按照顺序执行，确保每个请求都能正确地获取到对应的数据。