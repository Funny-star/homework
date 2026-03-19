// API配置
const API_BASE = 'http://localhost:3000'

// 格式化时间
function formatTime(ms) {
    if (!ms) return '0:00'
    const minutes = Math.floor(ms / 1000 / 60)
    const seconds = Math.floor((ms / 1000) % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 获取URL参数
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search)
    return {
        id: urlParams.get('id'),
        type: urlParams.get('type') || 'song',
        from: urlParams.get('from') || 'list'
    }
}

// 播放器类
class PlayManager {
    constructor() {
        this.params = getUrlParams()
        this.songData = null
        this.isPlaying = false
        this.isLiked = false
        this.isLooping = false
        this.audio = new Audio()
        this.playlist = [] // 播放列表
        this.currentIndex = 0
        
        this.initElements()
        this.bindEvents()
        this.loadSongData()
    }

    initElements() {
        this.albumCover = document.getElementById('albumCover')
        this.songTitle = document.getElementById('songTitle')
        this.songArtist = document.getElementById('songArtist')
        this.songAlbum = document.getElementById('songAlbum')
        this.playPauseBtn = document.getElementById('playPauseBtn')
        this.prevBtn = document.getElementById('prevBtn')
        this.nextBtn = document.getElementById('nextBtn')
        this.likeBtn = document.getElementById('likeBtn')
        this.loopBtn = document.getElementById('loopBtn')
        this.currentTimeEl = document.getElementById('currentTime')
        this.totalTimeEl = document.getElementById('totalTime')
        this.progressFill = document.getElementById('progressFill')
        this.progressBar = document.getElementById('progressBar')
        this.lyricsContent = document.getElementById('lyricsContent')
        this.recommendList = document.getElementById('recommendList')
        this.searchBox = document.getElementById('searchBox')
    }

    bindEvents() {
        // 播放/暂停
        this.playPauseBtn?.addEventListener('click', () => this.togglePlay())
        
        // 上一首
        this.prevBtn?.addEventListener('click', () => this.playPrev())
        
        // 下一首
        this.nextBtn?.addEventListener('click', () => this.playNext())
        
        // 喜欢
        this.likeBtn?.addEventListener('click', () => this.toggleLike())
        
        // 循环模式
        this.loopBtn?.addEventListener('click', () => this.toggleLoop())
        
        // 音频事件
        this.audio.addEventListener('timeupdate', () => this.updateProgress())
        this.audio.addEventListener('loadedmetadata', () => {
            this.totalTimeEl.textContent = formatTime(this.audio.duration * 1000)
        })
        this.audio.addEventListener('ended', () => {
            if (this.isLooping) {
                // 单曲循环
                this.audio.currentTime = 0
                this.audio.play()
            } else {
                // 自动下一首
                this.playNext()
            }
        })
        
        // 点击进度条跳转
        this.progressBar?.addEventListener('click', (e) => {
            const rect = this.progressBar.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            this.audio.currentTime = percent * this.audio.duration
        })
        
        // 搜索框点击跳转
        this.searchBox?.addEventListener('click', () => {
            window.location.href = 'search.html'
        })
    }

    // 加载歌曲数据
    async loadSongData() {
        try {
            // 根据类型加载数据
            if (this.params.type === 'song') {
                await this.loadSongDetail()
            } else if (this.params.type === 'playlist') {
                await this.loadPlaylistSongs()
            } else {
                await this.loadSongDetail()
            }
        } catch (error) {
            console.error('加载歌曲失败:', error)
        }
    }

    // 加载单曲详情
    async loadSongDetail() {
        try {
            // 获取歌曲详情
            const response = await fetch(`${API_BASE}/song/detail?ids=${this.params.id}`)
            const data = await response.json()
            
            if (data.code === 200 && data.songs && data.songs.length > 0) {
                this.songData = data.songs[0]
                this.renderSongInfo()
                await this.loadSongUrl()
                await this.loadLyrics()
                this.loadRecommendations()
            }
        } catch (error) {
            console.error('获取歌曲详情失败:', error)
        }
    }

    // 加载歌单歌曲
    async loadPlaylistSongs() {
        try {
            // 获取歌单详情
            const response = await fetch(`${API_BASE}/playlist/detail?id=${this.params.id}`)
            const data = await response.json()
            
            if (data.code === 200 && data.playlist && data.playlist.tracks.length > 0) {
                this.playlist = data.playlist.tracks
                this.currentIndex = 0
                this.songData = this.playlist[0]
                this.renderSongInfo()
                await this.loadSongUrl()
                await this.loadLyrics()
                this.renderPlaylist()
            }
        } catch (error) {
            console.error('获取歌单失败:', error)
        }
    }

    // 加载歌曲URL
    async loadSongUrl() {
        try {
            const response = await fetch(`${API_BASE}/song/url?id=${this.songData.id}&br=320000`)
            const data = await response.json()
            
            if (data.code === 200 && data.data[0]?.url) {
                this.audio.src = data.data[0].url
                // 自动播放
                this.audio.play()
                this.isPlaying = true
                this.updatePlayButton()
            }
        } catch (error) {
            console.error('获取歌曲URL失败:', error)
        }
    }

    // 加载歌词
    async loadLyrics() {
        try {
            const response = await fetch(`${API_BASE}/lyric?id=${this.songData.id}`)
            const data = await response.json()
            
            if (data.code === 200 && data.lrc && data.lrc.lyric) {
                this.renderLyrics(data.lrc.lyric)
            } else {
                this.lyricsContent.innerHTML = '<p class="lyric-line">暂无歌词</p>'
            }
        } catch (error) {
            console.error('获取歌词失败:', error)
            this.lyricsContent.innerHTML = '<p class="lyric-line">暂无歌词</p>'
        }
    }

    // 加载推荐歌曲
    async loadRecommendations() {
        try {
            // 获取相似歌曲
            const response = await fetch(`${API_BASE}/simi/song?id=${this.songData.id}`)
            const data = await response.json()
            
            if (data.code === 200 && data.songs) {
                this.renderRecommendations(data.songs)
            }
        } catch (error) {
            console.error('获取推荐失败:', error)
        }
    }

    // 渲染歌曲信息
    renderSongInfo() {
        this.songTitle.textContent = this.songData.name
        this.songArtist.textContent = this.songData.ar.map(a => a.name).join('/')
        this.songAlbum.textContent = this.songData.al.name
        this.albumCover.src = this.songData.al.picUrl || 'https://via.placeholder.com/300x300'
        document.title = `${this.songData.name} - 网易云音乐`
    }

    // 渲染歌词
    renderLyrics(lyricStr) {
        const lines = lyricStr.split('\n')
        let html = ''
        
        lines.forEach(line => {
            // 简单处理，去掉时间戳
            const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim()
            if (text) {
                html += `<p class="lyric-line">${text}</p>`
            }
        })
        
        this.lyricsContent.innerHTML = html || '<p class="lyric-line">暂无歌词</p>'
    }

    // 渲染推荐
    renderRecommendations(songs) {
        this.recommendList.innerHTML = songs.map(song => `
            <div class="recommend-item" data-id="${song.id}" data-type="song">
                <img src="${song.album.picUrl || 'https://via.placeholder.com/50x50'}" alt="${song.name}" class="recommend-item-cover">
                <div class="recommend-item-info">
                    <div class="recommend-item-name">${song.name}</div>
                    <div class="recommend-item-artist">${song.artists.map(a => a.name).join('/')}</div>
                </div>
            </div>
        `).join('')

        // 添加点击事件
        this.recommendList.querySelectorAll('.recommend-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id
                window.location.href = `play.html?id=${id}&type=song&from=recommend`
            })
        })
    }

    // 渲染播放列表
    renderPlaylist() {
        this.recommendList.innerHTML = this.playlist.map((song, index) => `
            <div class="recommend-item ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <img src="${song.al.picUrl || 'https://via.placeholder.com/50x50'}" alt="${song.name}" class="recommend-item-cover">
                <div class="recommend-item-info">
                    <div class="recommend-item-name">${song.name}</div>
                    <div class="recommend-item-artist">${song.ar.map(a => a.name).join('/')}</div>
                </div>
            </div>
        `).join('')

        // 添加点击事件
        this.recommendList.querySelectorAll('.recommend-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index)
                this.playByIndex(index)
            })
        })
    }

    // 按索引播放
    async playByIndex(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentIndex = index
            this.songData = this.playlist[index]
            this.renderSongInfo()
            await this.loadSongUrl()
            await this.loadLyrics()
            
            // 更新高亮
            this.recommendList.querySelectorAll('.recommend-item').forEach((item, i) => {
                if (i === index) {
                    item.classList.add('active')
                } else {
                    item.classList.remove('active')
                }
            })
        }
    }

    // 切换播放/暂停
    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause()
        } else {
            this.audio.play()
        }
        this.isPlaying = !this.isPlaying
        this.updatePlayButton()
    }

    // 更新播放按钮
    updatePlayButton() {
        const icon = this.playPauseBtn.querySelector('i')
        if (this.isPlaying) {
            icon.className = 'fas fa-pause-circle'
        } else {
            icon.className = 'fas fa-play-circle'
        }
    }

    // 播放上一首
    playPrev() {
        if (this.playlist.length > 0) {
            const prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length
            this.playByIndex(prevIndex)
        }
    }

    // 播放下一首
    playNext() {
        if (this.playlist.length > 0) {
            const nextIndex = (this.currentIndex + 1) % this.playlist.length
            this.playByIndex(nextIndex)
        }
    }

    // 切换喜欢
    toggleLike() {
        this.isLiked = !this.isLiked
        const icon = this.likeBtn.querySelector('i')
        if (this.isLiked) {
            icon.className = 'fas fa-heart'
            this.likeBtn.classList.add('active')
        } else {
            icon.className = 'far fa-heart'
            this.likeBtn.classList.remove('active')
        }
    }

    // 切换循环模式
    toggleLoop() {
        this.isLooping = !this.isLooping
        const icon = this.loopBtn.querySelector('i')
        if (this.isLooping) {
            icon.className = 'fas fa-redo-alt'
            this.loopBtn.classList.add('active')
        } else {
            icon.className = 'fas fa-redo-alt'
            this.loopBtn.classList.remove('active')
        }
    }

    // 更新进度条
    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100 || 0
        this.progressFill.style.width = `${percent}%`
        this.currentTimeEl.textContent = formatTime(this.audio.currentTime * 1000)
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new PlayManager()
})