// API配置
const API_BASE = 'http://localhost:3000'

// 搜索管理器类
class SearchManager {
    constructor() {
        this.currentType = 'song' // 当前搜索类型：song, playlist, artist, album, podcast
        this.searchKeyword = ''
        this.searchHistory = this.loadSearchHistory()
        this.page = 1
        this.limit = 20
        this.totalCount = 0
        this.isLoading = false

        this.initElements()
        this.initEventListeners()
        this.loadHotSearch()
        this.renderSearchHistory()
    }

    // 初始化DOM元素
    initElements() {
        this.largeSearchInput = document.getElementById('largeSearchInput')
        this.searchBtn = document.getElementById('searchBtn')
        this.searchResults = document.getElementById('searchResults')
        this.searchTabs = document.querySelectorAll('.search-tab')
        this.historyTags = document.getElementById('historyTags')
        this.hotTags = document.getElementById('hotTags')
        this.clearHistoryBtn = document.getElementById('clearHistory')
        this.searchHistorySection = document.getElementById('searchHistory')
        this.hotSearchSection = document.querySelector('.hot-search')
    }

    // 初始化事件监听
    initEventListeners() {
        // 搜索按钮点击
        this.searchBtn?.addEventListener('click', () => {
            this.performSearch()
        })

        // 输入框回车
        this.largeSearchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch()
            }
        })

        // 分类标签切换
        this.searchTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有active类
                this.searchTabs.forEach(t => t.classList.remove('active'))
                // 添加active类到当前标签
                tab.classList.add('active')
                // 更新搜索类型
                this.currentType = tab.dataset.type
                // 如果有搜索关键词，重新搜索
                if (this.searchKeyword) {
                    this.page = 1
                    this.performSearch(true)
                }
            })
        })

        // 清空历史
        this.clearHistoryBtn?.addEventListener('click', () => {
            this.clearSearchHistory()
        })
    }

    // 执行搜索
    async performSearch(resetPage = true) {
        const keyword = this.largeSearchInput?.value.trim()

        if (!keyword) {
            alert('请输入搜索关键词')
            return
        }

        this.searchKeyword = keyword
        if (resetPage) {
            this.page = 1
        }

        // 保存到搜索历史
        this.saveSearchHistory(keyword)

        // 显示加载状态
        this.showLoading()

        // 隐藏历史区域
        if (this.searchHistorySection) {
            this.searchHistorySection.style.display = 'none'
        }
        if (this.hotSearchSection) {
            this.hotSearchSection.style.display = 'none'
        }

        try {
            const results = await this.fetchSearchResults()
            this.renderSearchResults(results)
        } catch (error) {
            console.error('搜索失败:', error)
            this.showError()
        }
    }

    // 获取搜索结果
    async fetchSearchResults() {
        this.isLoading = true

        // 根据类型选择不同的API
        let apiUrl = ''
        const encodedKeyword = encodeURIComponent(this.searchKeyword)
        const offset = (this.page - 1) * this.limit

        // 网易云音乐搜索API类型：
        // 1: 歌曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
        switch (this.currentType) {
            case 'song':
                apiUrl = `${API_BASE}/search?keywords=${encodedKeyword}&type=1&limit=${this.limit}&offset=${offset}`
                break
            case 'playlist':
                apiUrl = `${API_BASE}/search?keywords=${encodedKeyword}&type=1000&limit=${this.limit}&offset=${offset}`
                break
            case 'artist':
                apiUrl = `${API_BASE}/search?keywords=${encodedKeyword}&type=100&limit=${this.limit}&offset=${offset}`
                break
            case 'album':
                apiUrl = `${API_BASE}/search?keywords=${encodedKeyword}&type=10&limit=${this.limit}&offset=${offset}`
                break
            case 'podcast':
                apiUrl = `${API_BASE}/search?keywords=${encodedKeyword}&type=1009&limit=${this.limit}&offset=${offset}`
                break
            default:
                apiUrl = `${API_BASE}/search?keywords=${encodedKeyword}&limit=${this.limit}&offset=${offset}`
        }

        console.log('请求API:', apiUrl)

        try {
            const response = await fetch(apiUrl)
            const data = await response.json()

            this.isLoading = false

            if (data.code === 200) {
                // 根据不同类型获取总数
                if (data.result) {
                    switch (this.currentType) {
                        case 'song':
                            this.totalCount = data.result.songCount || 0
                            break
                        case 'playlist':
                            this.totalCount = data.result.playlistCount || 0
                            break
                        case 'artist':
                            this.totalCount = data.result.artistCount || 0
                            break
                        case 'album':
                            this.totalCount = data.result.albumCount || 0
                            break
                        case 'podcast':
                            this.totalCount = data.result.djRadiosCount || 0
                            break
                        default:
                            this.totalCount = 0
                    }
                }
                return data.result
            }
            return null
        } catch (error) {
            this.isLoading = false
            throw error
        }
    }

    // 渲染搜索结果
    renderSearchResults(results) {
        if (!results) {
            this.showNoResults()
            return
        }

        let html = ''
        let hasResults = false

        switch (this.currentType) {
            case 'song':
                if (results.songs && results.songs.length > 0) {
                    html = this.renderSongResults(results.songs)
                    hasResults = true
                }
                break
            case 'playlist':
                if (results.playlists && results.playlists.length > 0) {
                    html = this.renderPlaylistResults(results.playlists)
                    hasResults = true
                }
                break
            case 'artist':
                if (results.artists && results.artists.length > 0) {
                    html = this.renderArtistResults(results.artists)
                    hasResults = true
                }
                break
            case 'album':
                if (results.albums && results.albums.length > 0) {
                    html = this.renderAlbumResults(results.albums)
                    hasResults = true
                }
                break
            case 'podcast':
                if (results.djRadios && results.djRadios.length > 0) {
                    html = this.renderPodcastResults(results.djRadios)
                    hasResults = true
                }
                break
        }

        if (!hasResults) {
            this.showNoResults()
            return
        }

        this.searchResults.innerHTML = html

        // 如果有分页，添加加载更多按钮
        if (this.totalCount > this.page * this.limit) {
            this.addLoadMoreButton()
        }

        // 为结果添加点击事件
        this.addResultClickEvents()
    }

    // 渲染歌曲结果 - 删除海报
    renderSongResults(songs) {
        return songs.map(song => {
            // 获取歌手名 - 处理多种字段名
            let artists = ''
            if (song.artists && song.artists.length > 0) {
                artists = song.artists.map(a => a.name).join('/')
            } else if (song.ar && song.ar.length > 0) {
                artists = song.ar.map(a => a.name).join('/')
            } else if (song.artist) {
                artists = song.artist.name || '未知歌手'
            } else {
                artists = '未知歌手'
            }

            // 获取专辑名
            let albumName = ''
            if (song.album) {
                albumName = song.album.name || '未知专辑'
            } else if (song.al) {
                albumName = song.al.name || '未知专辑'
            } else {
                albumName = '未知专辑'
            }

            return `
                <div class="song-result-item" data-id="${song.id}" data-type="song">
                    <div class="song-result-info" style="margin-left: 0;">
                        <div class="song-result-name">${song.name}</div>
                        <div class="song-result-artist">${artists}</div>
                    </div>
                    <div class="song-result-album">${albumName}</div>
                    <div class="song-result-duration">${this.formatTime(song.duration || song.dt || 0)}</div>
                </div>
            `
        }).join('')
    }

    // 渲染歌单结果 - 删除海报
    renderPlaylistResults(playlists) {
        return playlists.map(playlist => {
            return `
                <div class="playlist-result-item" data-id="${playlist.id}" data-type="playlist">
                    <div class="playlist-result-info" style="margin-left: 0;">
                        <div class="playlist-result-name">${playlist.name}</div>
                        <div class="playlist-result-creator">by ${playlist.creator?.nickname || '未知'}</div>
                    </div>
                    <div class="playlist-result-count">${playlist.trackCount || 0}首歌</div>
                </div>
            `
        }).join('')
    }

    // 渲染歌手结果 - 删除头像
    renderArtistResults(artists) {
        return artists.map(artist => {
            return `
                <div class="artist-result-item" data-id="${artist.id}" data-type="artist">
                    <div class="artist-result-info" style="margin-left: 0;">
                        <div class="artist-result-name">${artist.name}</div>
                        <div class="artist-result-album-count">专辑数: ${artist.albumSize || 0}</div>
                    </div>
                </div>
            `
        }).join('')
    }

    // 渲染专辑结果 - 删除海报
    renderAlbumResults(albums) {
        return albums.map(album => {
            // 获取歌手名
            let artistName = ''
            if (album.artist) {
                artistName = album.artist.name || '未知歌手'
            } else if (album.artists && album.artists.length > 0) {
                artistName = album.artists[0].name || '未知歌手'
            } else {
                artistName = '未知歌手'
            }

            return `
                <div class="playlist-result-item" data-id="${album.id}" data-type="album">
                    <div class="playlist-result-info" style="margin-left: 0;">
                        <div class="playlist-result-name">${album.name}</div>
                        <div class="playlist-result-creator">${artistName}</div>
                    </div>
                    <div class="playlist-result-count">${album.size || 0}首歌</div>
                </div>
            `
        }).join('')
    }

    // 渲染播客结果 - 删除海报
    renderPodcastResults(podcasts) {
        return podcasts.map(podcast => {
            return `
                <div class="playlist-result-item" data-id="${podcast.id}" data-type="podcast">
                    <div class="playlist-result-info" style="margin-left: 0;">
                        <div class="playlist-result-name">${podcast.name}</div>
                        <div class="playlist-result-creator">${podcast.dj?.nickname || '主播'}</div>
                    </div>
                    <div class="playlist-result-count">${podcast.programCount || 0}期节目</div>
                </div>
            `
        }).join('')
    }

    // 添加结果点击事件
    addResultClickEvents() {
        document.querySelectorAll('[data-id]').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type
                const id = item.dataset.id

                if (type === 'song') {
                    // 歌曲直接跳转到播放界面
                    window.location.href = `../play/play.html?id=${id}&type=song&from=search`
                } else {
                    // 其他类型跳转到列表页
                    const name = item.querySelector('.playlist-result-name, .artist-result-name')?.textContent || '详情'
                    window.location.href = `../list/list.html?type=${type}&id=${id}&name=${encodeURIComponent(name)}`
                }
            })
        })
    }

    // 添加加载更多按钮
    addLoadMoreButton() {
        const loadMoreDiv = document.createElement('div')
        loadMoreDiv.className = 'load-more'
        loadMoreDiv.innerHTML = '<button class="search-btn">加载更多</button>'
        loadMoreDiv.querySelector('button').addEventListener('click', () => {
            this.page++
            this.performSearch(false)
        })
        this.searchResults.appendChild(loadMoreDiv)
    }

    // 加载热门搜索
    async loadHotSearch() {
        try {
            const response = await fetch(`${API_BASE}/search/hot`)
            const data = await response.json()

            if (data.code === 200) {
                const hotList = data.result.hots || []
                this.renderHotTags(hotList)
            }
        } catch (error) {
            console.error('加载热门搜索失败:', error)
            // 使用模拟数据
            this.renderHotTags([
                { first: '周杰伦' },
                { first: '林俊杰' },
                { first: '陈奕迅' },
                { first: '邓紫棋' },
                { first: '薛之谦' },
                { first: 'Taylor Swift' }
            ])
        }
    }

    // 渲染热门标签
    renderHotTags(hotList) {
        if (!this.hotTags) return

        this.hotTags.innerHTML = hotList.map(item => `
            <span class="hot-tag" data-keyword="${item.first}">${item.first}</span>
        `).join('')

        // 添加点击事件
        this.hotTags.querySelectorAll('.hot-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                this.largeSearchInput.value = tag.dataset.keyword
                this.performSearch()
            })
        })
    }

    // 加载搜索历史
    loadSearchHistory() {
        const history = localStorage.getItem('searchHistory')
        return history ? JSON.parse(history) : []
    }

    // 保存搜索历史
    saveSearchHistory(keyword) {
        // 去重
        this.searchHistory = this.searchHistory.filter(item => item !== keyword)
        // 添加到开头
        this.searchHistory.unshift(keyword)
        // 限制长度
        if (this.searchHistory.length > 10) {
            this.searchHistory.pop()
        }
        // 保存到localStorage
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory))
        // 重新渲染
        this.renderSearchHistory()
    }

    // 清空搜索历史
    clearSearchHistory() {
        this.searchHistory = []
        localStorage.removeItem('searchHistory')
        this.renderSearchHistory()
    }

    // 渲染搜索历史
    renderSearchHistory() {
        if (!this.historyTags) return

        if (this.searchHistory.length === 0) {
            this.historyTags.innerHTML = '<span class="history-tag" style="background: none; cursor: default;">暂无搜索历史</span>'
            return
        }

        this.historyTags.innerHTML = this.searchHistory.map(keyword => `
            <span class="history-tag" data-keyword="${keyword}">${keyword}</span>
        `).join('')

        // 添加点击事件
        this.historyTags.querySelectorAll('.history-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                this.largeSearchInput.value = tag.dataset.keyword
                this.performSearch()
            })
        })
    }

    // 显示加载状态
    showLoading() {
        this.searchResults.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>搜索中...</p>
            </div>
        `
    }

    // 显示无结果
    showNoResults() {
        this.searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>未找到与“${this.searchKeyword}”相关的${this.getTypeName()}</p>
            </div>
        `
    }

    // 显示错误
    showError() {
        this.searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>搜索失败，请稍后重试</p>
            </div>
        `
    }

    // 获取类型名称
    getTypeName() {
        const typeMap = {
            'song': '歌曲',
            'playlist': '歌单',
            'artist': '歌手',
            'album': '专辑',
            'podcast': '播客'
        }
        return typeMap[this.currentType] || '内容'
    }

    // 格式化时间
    formatTime(ms) {
        if (!ms) return '0:00'
        const minutes = Math.floor(ms / 1000 / 60)
        const seconds = Math.floor((ms / 1000) % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new SearchManager()
})