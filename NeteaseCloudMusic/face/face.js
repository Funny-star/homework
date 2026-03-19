// API配置
const API_BASE = 'http://localhost:3000'

// 获取基础路径（到 NeteaseCloudMusic 目录）
const basePath = window.location.pathname.substring(0, window.location.pathname.indexOf('/face/') + 1)
const listPath = basePath + 'list/list.html'

// 分页函数
function page(dataArr, page) {
    return dataArr.slice(4 * (page - 1), 4 * page)
}

// 获取推荐歌单并设置图片
async function loadPlaylists(htmlId, pageNum) {
    try {
        // 调用接口获取数据
        const response = await fetch(`${API_BASE}/personalized?limit=28`)
        const datas = await response.json()

        // 先判断接口返回状态
        if (datas.code !== 200) {
            throw new Error('获取失败')
        }

        // 再截取对应页的数据
        let pageData = page(datas.result, pageNum)

        // 获取所有卡片
        const cards = document.querySelectorAll(htmlId)

        // 遍历设置图片
        cards.forEach((card, index) => {
            if (index < pageData.length) {
                const playlist = pageData[index]
                const img = card.querySelector('img')
                if (img) {
                    // 注意字段名：可能是 picUrl 或 coverImgUrl
                    img.src = playlist.picUrl || playlist.coverImgUrl
                    img.alt = playlist.name
                }

                // 更新播放量
                const playCount = card.querySelector('.play-count')
                if (playCount) {
                    const count = playlist.playCount > 10000
                        ? (playlist.playCount / 10000).toFixed(1) + '万'
                        : playlist.playCount
                    playCount.innerHTML = `<i class="fas fa-play"></i> ${count}`
                }

                // 更新标题
                const title = card.querySelector('.card-title')
                if (title) {
                    title.textContent = playlist.name
                }

                // 保存歌单ID并添加点击事件
                card.dataset.id = playlist.id
                card.onclick = () => {
                    window.location.href = `${listPath}?type=playlist&id=${playlist.id}&name=${encodeURIComponent(playlist.name)}`
                }
            }
        })

        console.log(`第${pageNum}页加载成功`, pageData)
    } catch (error) {
        console.error('加载失败:', error)
    }
}

// 获取推荐播客并设置图片 - 只更新现有卡片
async function loadPodcasts(htmlId, pageNum) {
    try {
        // 获取推荐播客
        const response = await fetch(`${API_BASE}/dj/recommend?limit=28`)
        const datas = await response.json()

        // 判断接口返回状态
        if (datas.code !== 200) {
            throw new Error('获取失败')
        }

        // 截取对应页的数据（播客数据在 djRadios 中）
        const podcasts = datas.djRadios || []
        let pageData = page(podcasts, pageNum)

        // 获取所有现有播客卡片
        const cards = document.querySelectorAll(htmlId)

        // 遍历现有卡片，只更新内容
        cards.forEach((card, index) => {
            if (index < pageData.length) {
                const podcast = pageData[index]

                // 更新图片
                const img = card.querySelector('img')
                if (img) {
                    img.src = podcast.picUrl || podcast.coverImgUrl || podcast.avatarUrl
                    img.alt = podcast.name
                }

                // 更新播放量/订阅数
                const playCount = card.querySelector('.play-count')
                if (playCount) {
                    const count = (podcast.playCount || podcast.subCount || 0) > 10000
                        ? ((podcast.playCount || podcast.subCount || 0) / 10000).toFixed(1) + '万'
                        : (podcast.playCount || podcast.subCount || 0)
                    playCount.innerHTML = `<i class="fas fa-headphones"></i> ${count}`
                }

                // 更新标题
                const title = card.querySelector('.card-title')
                if (title) {
                    title.textContent = podcast.name
                }

                // 更新副标题（主播名）
                const subtitle = card.querySelector('.card-subtitle')
                if (subtitle) {
                    subtitle.textContent = podcast.dj?.nickname || podcast.creator || '主播'
                }

                // 保存播客ID并添加点击事件
                card.dataset.id = podcast.id
                card.onclick = () => {
                    window.location.href = `${listPath}?type=podcast&id=${podcast.id}&name=${encodeURIComponent(podcast.name)}`
                }
            }
        })

        console.log(`第${pageNum}页播客加载成功，更新了${pageData.length}个卡片`)
    } catch (error) {
        console.error('播客加载失败:', error)
    }
}

// 热门活动轮播图类
class ActivityCarousel {
    constructor() {
        this.currentIndex = 0
        this.activities = []
        this.track = document.getElementById('activityCarousel')
        this.dotsContainer = document.getElementById('activityDots')
        this.autoPlayInterval = null
    }

    // 初始化轮播图
    async init() {
        await this.loadActivities()
        this.render()
        this.bindEvents()
        this.startAutoPlay()
    }

    // 使用你的 loadHotActivities 函数
    async loadActivities() {
        try {
            const response = await fetch(`${API_BASE}/personalized?limit=28`)
            const datas = await response.json()

            if (datas.code !== 200) {
                throw new Error("获取失败")
            }

            // 将歌单数据转换为活动数据格式
            this.activities = (datas.result || []).slice(0, 5).map((item, index) => ({
                id: item.id || index + 1,
                name: item.name || "热门活动",
                coverUrl: item.picUrl || item.coverImgUrl,
                startTime: "进行中",
                location: "线上活动"
            }))

            console.log('活动加载成功:', this.activities)
        } catch (error) {
            console.error("热门活动加载失败", error)
            this.activities = []
        }
    }

    // 渲染轮播图
    render() {
        if (!this.track) return

        this.track.innerHTML = ''

        this.activities.forEach((activity, index) => {
            const item = document.createElement('div')
            item.className = 'carousel-item'

            const img = document.createElement('img')
            img.src = activity.coverUrl
            img.alt = activity.name
            img.style.width = '100%'
            img.style.height = '100%'
            img.style.objectFit = 'cover'

            const content = document.createElement('div')
            content.className = 'carousel-item-content'
            content.innerHTML = `
                <div class="carousel-item-title">${activity.name}</div>
                <div class="carousel-item-subtitle">
                    ${activity.startTime} · ${activity.location}
                </div>
            `

            item.appendChild(img)
            item.appendChild(content)

            item.addEventListener('click', () => {
                window.location.href = `${listPath}?type=activity&id=${activity.id}&name=${encodeURIComponent(activity.name)}`
            })

            this.track.appendChild(item)
        })

        this.renderDots()
        this.updateCarousel()
    }

    // 渲染指示点
    renderDots() {
        if (!this.dotsContainer) return

        this.dotsContainer.innerHTML = ''

        this.activities.forEach((_, index) => {
            const dot = document.createElement('span')
            dot.className = `dot ${index === this.currentIndex ? 'active' : ''}`
            dot.addEventListener('click', () => this.goTo(index))
            this.dotsContainer.appendChild(dot)
        })
    }

    // 绑定事件
    bindEvents() {
        const prevBtn = document.getElementById('prevActivity')
        const nextBtn = document.getElementById('nextActivity')

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.prev()
            })
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.next()
            })
        }

        const container = document.querySelector('.carousel-container')
        if (container) {
            container.addEventListener('mouseenter', () => this.stopAutoPlay())
            container.addEventListener('mouseleave', () => this.startAutoPlay())
        }
    }

    // 上一张
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.activities.length) % this.activities.length
        this.updateCarousel()
    }

    // 下一张
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.activities.length
        this.updateCarousel()
    }

    // 跳转到指定索引
    goTo(index) {
        this.currentIndex = index
        this.updateCarousel()
    }

    // 更新轮播图
    updateCarousel() {
        if (this.track) {
            this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`
        }

        const dots = document.querySelectorAll('.dot')
        dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('active')
            } else {
                dot.classList.remove('active')
            }
        })
    }

    // 开始自动播放
    startAutoPlay() {
        if (this.autoPlayInterval) return
        this.autoPlayInterval = setInterval(() => this.next(), 5000)
    }

    // 停止自动播放
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval)
            this.autoPlayInterval = null
        }
    }
}

// 歌单类
class playList {
    constructor() {
        this.API_BASE = 'http://localhost:3000'
    }

    // 获取精品歌单
    async getTopPlaylists(category = '全部', pageNum = 1, limit = 10) {
        try {
            const offset = (pageNum - 1) * limit
            const response = await fetch(
                `${this.API_BASE}/top/playlist?cat=${encodeURIComponent(category)}&limit=${limit}&offset=${offset}`
            )
            const data = await response.json()

            if (data.code === 200) {
                console.log(`精品歌单 (${category}):`, data.playlists)
                return data.playlists
            } else {
                throw new Error('获取失败')
            }
        } catch (error) {
            console.error('获取精品歌单失败:', error)
            return []
        }
    }

    // 获取所有榜单列表
    async getAllToplists() {
        try {
            const response = await fetch(`${this.API_BASE}/toplist`)
            const data = await response.json()

            if (data.code === 200) {
                console.log('所有榜单:', data.list)
                return data.list
            }
        } catch (error) {
            console.error('获取榜单列表失败:', error)
        }
    }

    // 获取榜单详情
    async getToplistDetail() {
        try {
            const response = await fetch(`${this.API_BASE}/toplist/detail`)
            const data = await response.json()

            if (data.code === 200) {
                console.log('榜单详情:', data.list)
                return data.list
            }
        } catch (error) {
            console.error('获取榜单详情失败:', error)
        }
    }

    // 获取指定榜单的歌曲
    async getToplistSongs(toplistId, pageNum = 1, limit = 20) {
        try {
            const offset = (pageNum - 1) * limit
            const response = await fetch(`${this.API_BASE}/top/list?id=${toplistId}&limit=${limit}&offset=${offset}`)
            const data = await response.json()

            if (data.code === 200) {
                console.log(`榜单歌曲 (第${pageNum}页):`, data.playlist.tracks)
                return {
                    songs: data.playlist.tracks,
                    total: data.playlist.trackCount,
                    name: data.playlist.name,
                    coverImgUrl: data.playlist.coverImgUrl,
                    updateTime: data.playlist.updateTime
                }
            }
        } catch (error) {
            console.error('获取榜单歌曲失败:', error)
        }
    }

    // 获取特色榜单（用于页面展示）
    async getFeaturedToplists() {
        try {
            // 特色榜单ID
            const featuredIds = [
                { id: '19723756', name: '飙升榜' },
                { id: '3779629', name: '新歌榜' },
                { id: '3778678', name: '热歌榜' },
                { id: '2884035', name: '原创榜' }
            ]

            // 并发请求所有榜单
            const promises = featuredIds.map(async (item) => {
                const response = await fetch(`${this.API_BASE}/top/list?id=${item.id}&limit=3`)
                const data = await response.json()

                if (data.code === 200) {
                    return {
                        id: item.id,
                        name: data.playlist.name,
                        coverImgUrl: data.playlist.coverImgUrl,
                        tracks: data.playlist.tracks.slice(0, 3) // 只取前3首
                    }
                }
                return null
            })

            const results = await Promise.all(promises)
            return results.filter(item => item !== null)

        } catch (error) {
            console.error('获取特色榜单失败:', error)
            return []
        }
    }

    // 渲染特色榜单到页面
    async renderFeaturedToplists(containerId = '#chartsContainer') {
        try {
            const container = document.querySelector(containerId)
            if (!container) return

            // 获取特色榜单数据
            const toplists = await this.getFeaturedToplists()

            // 清空容器
            container.innerHTML = ''

            // 渲染每个榜单卡片
            toplists.forEach((toplist) => {
                const card = document.createElement('div')
                card.className = 'chart-card'
                card.dataset.id = toplist.id

                // 生成歌曲列表HTML
                const songsHtml = toplist.tracks.map((song, i) => {
                    const artists = song.ar.map(a => a.name).join('/')
                    return `<li><span class="rank">${i + 1}</span> ${song.name} - ${artists}</li>`
                }).join('')

                card.innerHTML = `
                    <img src="${toplist.coverImgUrl}" alt="${toplist.name}" class="chart-cover">
                    <div class="chart-info">
                        <h3>${toplist.name}</h3>
                        <ul class="song-list">
                            ${songsHtml}
                        </ul>
                    </div>
                `

                // 添加点击事件
                card.addEventListener('click', () => {
                    window.location.href = `${listPath}?type=toplist&id=${toplist.id}&name=${encodeURIComponent(toplist.name)}`
                })

                container.appendChild(card)
            })

            console.log('特色榜单渲染成功:', toplists)
        } catch (error) {
            console.error('渲染特色榜单失败:', error)
        }
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    const playlist = new playList()

    loadPlaylists('#recommendPlaylists .card', 1)  // 第一页歌单
    loadPodcasts('#recommendPodcasts .card', 1)    // 第1页播客
    
    if (document.getElementById('activityCarousel')) {
        const activityCarousel = new ActivityCarousel()
        activityCarousel.init()
    }

    // 渲染特色榜单
    playlist.renderFeaturedToplists('#chartsContainer')
})

// 添加搜索框跳转功能
document.addEventListener('DOMContentLoaded', () => {
    // 原有的初始化代码...
    
    // 搜索框跳转
    const searchBox = document.querySelector('.search-box')
    const searchInput = document.querySelector('.search-box input')
    
    if (searchBox) {
        searchBox.addEventListener('click', (e) => {
            // 如果点击的是输入框本身，也跳转
            window.location.href = '../search/search.html'
        })
    }
    
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            window.location.href = '../search/search.html'
        })
        
        // 阻止输入（因为会跳转）
        searchInput.addEventListener('keydown', (e) => {
            e.preventDefault()
        })
    }
})