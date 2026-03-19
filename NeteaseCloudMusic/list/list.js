// API配置
const API_BASE = 'http://localhost:3000'

// 格式化时间
function formatTime(ms) {
    const minutes = Math.floor(ms / 1000 / 60)
    const seconds = Math.floor((ms / 1000) % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 格式化数量
function formatCount(count) {
    if (count > 100000000) {
        return (count / 100000000).toFixed(1) + '亿'
    } else if (count > 10000) {
        return (count / 10000).toFixed(1) + '万'
    }
    return count
}

// 获取URL参数
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search)
    return {
        type: urlParams.get('type') || 'playlist',
        id: urlParams.get('id') || '3779629',
        name: urlParams.get('name') || '新歌榜'
    }
}

// 播放器管理器
class PlayerManager {
    constructor() {
        this.currentSong = null
        this.isPlaying = false
        this.audio = new Audio()
        this.currentRow = null
        this.prevSongId = null
        this.nextSongId = null
        this.detailManager = null
        this.initElements()
        this.bindEvents()
    }

    initElements() {
        this.cover = document.getElementById('currentSongCover')
        this.nameEl = document.getElementById('currentSongName')
        this.artistEl = document.getElementById('currentSongArtist')
        this.playBtn = document.querySelector('.fa-play-circle')
        this.prevBtn = document.querySelector('.fa-step-backward')
        this.nextBtn = document.querySelector('.fa-step-forward')
        this.currentTimeEl = document.getElementById('currentTime')
        this.totalTimeEl = document.getElementById('totalTime')
        this.progressFill = document.querySelector('.progress-fill')
        this.progressBar = document.querySelector('.progress-bar-bg')
    }

    bindEvents() {
        // 播放/暂停按钮
        this.playBtn?.addEventListener('click', () => this.togglePlay())

        // 上一首按钮
        this.prevBtn?.addEventListener('click', () => this.playPrev())

        // 下一首按钮
        this.nextBtn?.addEventListener('click', () => this.playNext())

        // 音频时间更新
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress()
        })

        // 音频元数据加载完成
        this.audio.addEventListener('loadedmetadata', () => {
            this.totalTimeEl.textContent = formatTime(this.audio.duration)
        })

        // 点击进度条跳转
        this.progressBar?.addEventListener('click', (e) => {
            const rect = this.progressBar.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            this.audio.currentTime = percent * this.audio.duration
        })

        // 歌曲结束时自动播放下一首
        this.audio.addEventListener('ended', () => {
            this.playNext()
        })
    }

    // 设置详情页管理器引用
    setDetailManager(manager) {
        this.detailManager = manager
    }

    // 设置当前播放的行，保存上下首ID
    setCurrentRow(row) {
        this.currentRow = row
        this.prevSongId = row.dataset.prevId || null
        this.nextSongId = row.dataset.nextId || null

        // 更新按钮状态
        this.updateButtonState()

        // 移除所有行的高亮
        document.querySelectorAll('.song-row').forEach(r => {
            r.classList.remove('playing')
        })
        // 给当前行添加高亮
        row.classList.add('playing')
    }

    // 更新按钮状态
    updateButtonState() {
        if (this.prevBtn) {
            if (!this.prevSongId) {
                this.prevBtn.style.opacity = '0.5'
                this.prevBtn.style.pointerEvents = 'none'
                this.prevBtn.title = '没有上一首'
            } else {
                this.prevBtn.style.opacity = '1'
                this.prevBtn.style.pointerEvents = 'auto'
                this.prevBtn.title = '上一首'
            }
        }

        if (this.nextBtn) {
            if (!this.nextSongId) {
                this.nextBtn.style.opacity = '0.5'
                this.nextBtn.style.pointerEvents = 'none'
                this.nextBtn.title = '没有下一首'
            } else {
                this.nextBtn.style.opacity = '1'
                this.nextBtn.style.pointerEvents = 'auto'
                this.nextBtn.title = '下一首'
            }
        }
    }

    // 播放上一首
    async playPrev() {
        if (!this.prevSongId || !this.detailManager) return

        // 获取上一首的歌曲数据
        const songs = this.detailManager.currentSongs || []
        const prevSong = songs.find(s => s.id == this.prevSongId)

        if (!prevSong) return

        // 获取播放URL
        const url = await this.detailManager.getSongUrl(this.prevSongId)
        if (url) {
            prevSong.url = url
            this.play(prevSong)

            // 找到上一首对应的行，更新currentRow
            const prevRow = document.querySelector(`.song-row[data-id="${this.prevSongId}"]`)
            if (prevRow) {
                this.setCurrentRow(prevRow)
            }
        }
    }

    // 播放下一首
    async playNext() {
        if (!this.nextSongId || !this.detailManager) return

        const songs = this.detailManager.currentSongs || []
        const nextSong = songs.find(s => s.id == this.nextSongId)

        if (!nextSong) return

        const url = await this.detailManager.getSongUrl(this.nextSongId)
        if (url) {
            nextSong.url = url
            this.play(nextSong)

            const nextRow = document.querySelector(`.song-row[data-id="${this.nextSongId}"]`)
            if (nextRow) {
                this.setCurrentRow(nextRow)
            }
        }
    }

    // 播放歌曲
    play(song) {
        this.currentSong = song
        this.nameEl.textContent = song.name
        this.artistEl.textContent = song.ar.map(a => a.name).join('/')
        this.cover.src = song.al.picUrl || ''

        if (song.url) {
            this.audio.src = song.url
            this.audio.play()
            this.isPlaying = true
            this.playBtn.className = 'fas fa-pause-circle'
        }
    }

    // 切换播放/暂停
    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause()
            this.playBtn.className = 'fas fa-play-circle'
        } else {
            this.audio.play()
            this.playBtn.className = 'fas fa-pause-circle'
        }
        this.isPlaying = !this.isPlaying
    }

    // 更新进度条
    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100 || 0
        this.progressFill.style.width = `${percent}%`
        this.currentTimeEl.textContent = formatTime(this.audio.currentTime * 1000)
    }
}

// 详情页管理器
class DetailPageManager {
    constructor() {
        this.params = getUrlParams()
        this.player = new PlayerManager()
        this.player.setDetailManager(this) // 设置引用
        this.currentPage = 1
        this.pageSize = 20
        this.totalSongs = 0
        this.currentSongs = [] // 保存当前页的歌曲列表
    }

    async init() {
        await this.loadDetail()
        await this.loadSongs()
        this.updateTitle()
    }

    updateTitle() {
        document.title = `${this.params.name} - 网易云音乐`
    }

    async loadDetail() {
        const headerEl = document.getElementById('detailHeader')
        if (!headerEl) return

        let detailData = null

        switch (this.params.type) {
            case 'playlist':
                detailData = await this.getPlaylistDetail()
                break
            case 'toplist':
                detailData = await this.getToplistDetail()
                break
            case 'podcast':
                detailData = await this.getPodcastDetail()
                break
            case 'activity':
                detailData = await this.getActivityDetail()
                break
            default:
                detailData = await this.getPlaylistDetail()
        }

        this.renderHeader(headerEl, detailData)
    }

    async getPlaylistDetail() {
        try {
            const response = await fetch(`${API_BASE}/playlist/detail?id=${this.params.id}`)
            const data = await response.json()
            if (data.code === 200) {
                this.totalSongs = data.playlist.trackCount
                return {
                    type: '歌单',
                    name: data.playlist.name,
                    cover: data.playlist.coverImgUrl,
                    creator: {
                        avatar: data.playlist.creator?.avatarUrl,
                        name: data.playlist.creator?.nickname || '未知'
                    },
                    stats: [
                        { label: '歌曲数', value: data.playlist.trackCount },
                        { label: '播放数', value: formatCount(data.playlist.playCount) },
                        { label: '收藏数', value: formatCount(data.playlist.subscribedCount) }
                    ],
                    description: data.playlist.description || '暂无描述'
                }
            }
        } catch (error) {
            console.error('获取歌单详情失败:', error)
        }
        return null
    }

    async getToplistDetail() {
        try {
            const response = await fetch(`${API_BASE}/top/list?id=${this.params.id}`)
            const data = await response.json()
            if (data.code === 200) {
                this.totalSongs = data.playlist.trackCount
                return {
                    type: '榜单',
                    name: data.playlist.name,
                    cover: data.playlist.coverImgUrl,
                    creator: {
                        avatar: null,
                        name: '网易云音乐'
                    },
                    stats: [
                        { label: '歌曲数', value: data.playlist.trackCount },
                        { label: '播放数', value: formatCount(data.playlist.playCount) },
                        { label: '更新频率', value: '每日更新' }
                    ],
                    description: data.playlist.description || `${data.playlist.name}，每日更新热门歌曲`
                }
            }
        } catch (error) {
            console.error('获取榜单详情失败:', error)
        }
        return null
    }

    async getPodcastDetail() {
        try {
            const response = await fetch(`${API_BASE}/dj/detail?rid=${this.params.id}`)
            const data = await response.json()
            if (data.code === 200) {
                return {
                    type: '播客',
                    name: data.data.name,
                    cover: data.data.picUrl,
                    creator: {
                        avatar: data.data.dj?.avatarUrl,
                        name: data.data.dj?.nickname || '主播'
                    },
                    stats: [
                        { label: '节目数', value: data.data.programCount },
                        { label: '订阅数', value: formatCount(data.data.subCount) },
                        { label: '播放数', value: formatCount(data.data.playCount) }
                    ],
                    description: data.data.description || '暂无描述'
                }
            }
        } catch (error) {
            console.error('获取播客详情失败:', error)
        }
        return null
    }

    async getActivityDetail() {
        try {
            const response = await fetch(`${API_BASE}/banner?type=2`)
            const data = await response.json()
            if (data.code === 200) {
                const banner = data.banners?.find(b => b.targetId == this.params.id)
                if (banner) {
                    return {
                        type: '活动',
                        name: banner.typeTitle || this.params.name,
                        cover: banner.imageUrl,
                        creator: {
                            avatar: null,
                            name: '官方'
                        },
                        stats: [
                            { label: '参与人数', value: '火热进行中' },
                            { label: '活动时间', value: '近期' },
                            { label: '活动地点', value: '线上' }
                        ],
                        description: '热门活动，快来参加吧！'
                    }
                }
            }
        } catch (error) {
            console.error('获取活动详情失败:', error)
        }
        return null
    }

    renderHeader(container, data) {
        if (!data) {
            container.innerHTML = '<div class="error-message">加载失败，请稍后重试</div>'
            return
        }

        const creatorHtml = data.creator ? `
            <div class="detail-creator">
                ${data.creator.avatar ? `<img src="${data.creator.avatar}" alt="${data.creator.name}" class="creator-avatar">` : ''}
                <span class="creator-name">${data.creator.name}</span>
            </div>
        ` : ''

        container.innerHTML = `
            <img src="${data.cover}" alt="${data.name}" class="detail-cover">
            <div class="detail-info">
                <span class="detail-type">${data.type}</span>
                <h1 class="detail-title">${data.name}</h1>
                ${creatorHtml}
                <div class="detail-stats">
                    ${data.stats.map(stat => `
                        <div class="stat-item">
                            <span class="stat-label">${stat.label}</span>
                            <span class="stat-value">${stat.value}</span>
                        </div>
                    `).join('')}
                </div>
                <p class="detail-description">${data.description}</p>
                <div class="action-buttons">
                    <button class="btn btn-primary" id="playAllBtn">
                        <i class="fas fa-play"></i> 播放全部
                    </button>
                    <button class="btn btn-secondary" id="subscribeBtn">
                        <i class="far fa-heart"></i> 收藏
                    </button>
                </div>
            </div>
        `

        document.getElementById('playAllBtn')?.addEventListener('click', () => {
            this.playAll()
        })
    }

    async loadSongs() {
        const container = document.getElementById('songListContainer')
        const countEl = document.getElementById('songCount')
        if (!container) return

        let songs = []

        switch (this.params.type) {
            case 'playlist':
            case 'toplist':
                songs = await this.getPlaylistSongs()
                break
            case 'podcast':
                songs = await this.getPodcastPrograms()
                break
            default:
                songs = []
        }

        this.currentSongs = songs
        countEl.textContent = `${this.totalSongs}首歌`
        this.renderSongs(container, songs)
        this.renderPagination()
    }

    async getPlaylistSongs() {
        try {
            const response = await fetch(
                `${API_BASE}/playlist/track/all?id=${this.params.id}&limit=${this.pageSize}&offset=${(this.currentPage - 1) * this.pageSize}`
            )
            const data = await response.json()
            if (data.code === 200) {
                return data.songs || []
            }
        } catch (error) {
            console.error('获取歌曲列表失败:', error)
        }
        return []
    }

    async getPodcastPrograms() {
        try {
            const response = await fetch(
                `${API_BASE}/dj/program?rid=${this.params.id}&limit=${this.pageSize}&offset=${(this.currentPage - 1) * this.pageSize}`
            )
            const data = await response.json()
            if (data.code === 200) {
                return (data.programs || []).map(program => ({
                    id: program.id,
                    name: program.name,
                    ar: [{ name: program.dj?.nickname || '主播' }],
                    al: {
                        name: program.radio?.name || '播客',
                        picUrl: program.coverUrl
                    },
                    dt: program.duration,
                    url: program.mainSong?.url
                }))
            }
        } catch (error) {
            console.error('获取节目列表失败:', error)
        }
        return []
    }

    renderSongs(container, songs) {
        if (songs.length === 0) {
            container.innerHTML = '<div class="song-row" style="justify-content: center; padding: 40px;">暂无歌曲</div>'
            return
        }

        // 先生成HTML
        container.innerHTML = songs.map((song, index) => {
            const songIndex = (this.currentPage - 1) * this.pageSize + index + 1
            const artists = song.ar.map(a => a.name).join('/')
            const duration = formatTime(song.dt)

            return `
            <div class="song-row" data-id="${song.id}" data-index="${songIndex}">
                <div class="song-index">${songIndex}</div>
                <div class="song-info">
                    <span class="song-name">${song.name}</span>
                    <span class="song-artist">${artists}</span>
                </div>
                <div class="song-album">${song.al.name}</div>
                <div class="song-duration">${duration}</div>
                <div class="song-actions">
                    <i class="fas fa-play" title="播放"></i>
                    <i class="fas fa-heart" title="收藏"></i>
                    <i class="fas fa-download" title="下载"></i>
                    <i class="fas fa-share-alt" title="分享"></i>
                </div>
            </div>
        `
        }).join('')

        // 再为每行添加上下首ID和事件监听
        container.querySelectorAll('.song-row').forEach((row, index) => {
            const songId = row.dataset.id
            const playBtn = row.querySelector('.fa-play')

            // 获取上一首和下一首的歌曲ID
            const prevRow = row.previousElementSibling
            const nextRow = row.nextElementSibling

            // 保存上下首ID到dataset
            row.dataset.prevId = prevRow && prevRow.classList.contains('song-row') ? prevRow.dataset.id : ''
            row.dataset.nextId = nextRow && nextRow.classList.contains('song-row') ? nextRow.dataset.id : ''

            // 点击行跳转到播放界面
            row.addEventListener('click', (e) => {
                // 如果点击的是操作按钮区域，不触发跳转
                if (e.target.closest('.song-actions')) return

                const song = songs.find(s => s.id == songId)
                if (song) {
                    // 判断当前是歌单还是单曲
                    if (this.params.type === 'playlist' || this.params.type === 'toplist') {
                        // 如果是歌单或榜单，传入整个歌单ID
                        window.location.href = `../play/play.html?id=${this.params.id}&type=playlist&from=list&name=${encodeURIComponent(this.params.name)}`
                    } else {
                        // 如果是单曲，直接传入歌曲ID
                        window.location.href = `../play/play.html?id=${songId}&type=song&from=list&name=${encodeURIComponent(song.name)}`
                    }
                }
            })

            // 播放按钮点击 - 也跳转到播放界面
            playBtn?.addEventListener('click', (e) => {
                e.stopPropagation() // 阻止事件冒泡到行

                const song = songs.find(s => s.id == songId)
                if (song) {
                    if (this.params.type === 'playlist' || this.params.type === 'toplist') {
                        window.location.href = `../play/play.html?id=${this.params.id}&type=playlist&from=list&name=${encodeURIComponent(this.params.name)}`
                    } else {
                        window.location.href = `../play/play.html?id=${songId}&type=song&from=list&name=${encodeURIComponent(song.name)}`
                    }
                }
            })

            // 收藏按钮点击
            const heartBtn = row.querySelector('.fa-heart')
            heartBtn?.addEventListener('click', (e) => {
                e.stopPropagation()
                // 这里可以添加收藏功能
                console.log('收藏歌曲:', songId)
                heartBtn.classList.toggle('fas')
                heartBtn.classList.toggle('far')
            })

            // 下载按钮点击
            const downloadBtn = row.querySelector('.fa-download')
            downloadBtn?.addEventListener('click', (e) => {
                e.stopPropagation()
                console.log('下载歌曲:', songId)
                alert('下载功能开发中')
            })

            // 分享按钮点击
            const shareBtn = row.querySelector('.fa-share-alt')
            shareBtn?.addEventListener('click', (e) => {
                e.stopPropagation()
                console.log('分享歌曲:', songId)
                alert('分享功能开发中')
            })
        })
    }

    async getSongUrl(songId) {
        try {
            const response = await fetch(`${API_BASE}/song/url?id=${songId}&br=320000`)
            const data = await response.json()
            if (data.code === 200 && data.data[0]?.url) {
                return data.data[0].url
            }
        } catch (error) {
            console.error('获取歌曲URL失败:', error)
        }
        return null
    }

    renderPagination() {
        const container = document.getElementById('pagination')
        if (!container) return

        const totalPages = Math.ceil(this.totalSongs / this.pageSize)
        if (totalPages <= 1) {
            container.innerHTML = ''
            return
        }

        let html = ''

        // 上一页
        html += `
            <div class="page-item ${this.currentPage === 1 ? 'disabled' : ''}" data-page="${this.currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
            </div>
        `

        // 页码
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            html += `
                <div class="page-item ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </div>
            `
        }

        if (totalPages > 5) {
            html += `<div class="page-item disabled">...</div>`
            html += `
                <div class="page-item" data-page="${totalPages}">
                    ${totalPages}
                </div>
            `
        }

        // 下一页
        html += `
            <div class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}" data-page="${this.currentPage + 1}">
                <i class="fas fa-chevron-right"></i>
            </div>
        `

        container.innerHTML = html

        // 添加分页点击事件
        container.querySelectorAll('.page-item:not(.disabled)').forEach(item => {
            item.addEventListener('click', () => {
                const page = parseInt(item.dataset.page)
                if (page && page !== this.currentPage) {
                    this.currentPage = page
                    this.loadSongs()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
            })
        })
    }

    async playAll() {
        try {
            const response = await fetch(
                `${API_BASE}/playlist/track/all?id=${this.params.id}&limit=20`
            )
            const data = await response.json()
            if (data.code === 200 && data.songs?.length > 0) {
                const firstSong = data.songs[0]
                const url = await this.getSongUrl(firstSong.id)
                if (url) {
                    firstSong.url = url
                    this.player.play(firstSong)

                    // 找到第一行并设置
                    const firstRow = document.querySelector('.song-row')
                    if (firstRow) {
                        this.player.setCurrentRow(firstRow)
                    }
                }
            }
        } catch (error) {
            console.error('播放全部失败:', error)
        }
    }
}

// 评论管理器
class CommentManager {
    constructor() {
        this.currentPage = 1
        this.pageSize = 20
    }

    async loadComments(type, id) {
        const container = document.getElementById('commentsList')
        if (!container) return

        try {
            let commentType
            switch (type) {
                case 'playlist':
                    commentType = 2
                    break
                case 'podcast':
                    commentType = 4
                    break
                default:
                    commentType = 2
            }

            const response = await fetch(
                `${API_BASE}/comment/new?type=${commentType}&id=${id}&pageNo=${this.currentPage}&pageSize=${this.pageSize}`
            )
            const data = await response.json()

            if (data.code === 200) {
                this.renderComments(container, data.comments || [])
            }
        } catch (error) {
            console.error('加载评论失败:', error)
            container.innerHTML = '<div class="comment-item" style="justify-content: center;">暂无评论</div>'
        }
    }

    renderComments(container, comments) {
        if (comments.length === 0) {
            container.innerHTML = '<div class="comment-item" style="justify-content: center;">暂无评论</div>'
            return
        }

        container.innerHTML = comments.map(comment => {
            const time = new Date(comment.time).toLocaleString()
            return `
                <div class="comment-it+
                em">
                    <img src="${comment.user.avatarUrl}" alt="${comment.user.nickname}" class="comment-avatar">
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-user">${comment.user.nickname}</span>
                            <span class="comment-time">${time}</span>
                        </div>
                        <div class="comment-text">${comment.content}</div>
                        <div class="comment-actions">
                            <span><i class="far fa-thumbs-up"></i> ${comment.likedCount || 0}</span>
                            <span><i class="far fa-comment"></i> 回复</span>
                            <span><i class="far fa-share-square"></i> 分享</span>
                        </div>
                    </div>
                </div>
            `
        }).join('')
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', async () => {
    const params = getUrlParams()

    // 初始化详情页
    const detailPage = new DetailPageManager()
    window.detailManager = detailPage // 保存到全局，方便PlayerManager访问
    await detailPage.init()

    // 初始化评论
    const commentManager = new CommentManager()
    await commentManager.loadComments(params.type, params.id)

    console.log('列表页初始化完成', params)
})