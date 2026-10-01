document.addEventListener('DOMContentLoaded', function () {
    // 轮播图基本手动 + 自动 (实现轮播图要求)
    const container = document.getElementById('carouselContainer');
    const dots = document.querySelectorAll('.carousel-dot');
    const leftBtn = document.getElementById('carouselLeft');
    const rightBtn = document.getElementById('carouselRight');
    if (container && dots.length && leftBtn && rightBtn) {
        let index = 0;
        const totalSlides = document.querySelectorAll('.carousel-slide').length;

        function updateSlide(newIndex) {
            if (newIndex < 0) newIndex = totalSlides - 1;
            if (newIndex >= totalSlides) newIndex = 0;
            index = newIndex;
            container.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        leftBtn.addEventListener('click', () => updateSlide(index - 1));
        rightBtn.addEventListener('click', () => updateSlide(index + 1));
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => updateSlide(i));
        });

        // 自动轮播
        setInterval(() => updateSlide(index + 1), 4000);
    }

    // 分类筛选模拟 (点击切换active)
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', function () {
            filterTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // 实际应重新请求歌单数据，此处仅做演示
        });
    });

    // 歌曲点击模拟播放 (配合上一首下一首 示意)
    const songRows = document.querySelectorAll('.song-table tr');
    const playBtn = document.querySelector('.control-buttons .fa-play-circle');
    songRows.forEach(row => {
        row.addEventListener('click', function () {
            // 模拟更新播放栏信息
            const cells = this.querySelectorAll('td');
            if (cells.length >= 3) {
                const songName = cells[1]?.innerText || '未知歌曲';
                const artist = cells[2]?.innerText || '未知歌手';
                document.querySelector('.song-name').innerText = songName;
                document.querySelector('.artist').innerText = artist;
                // 模拟歌词预览
                const lyric = songName.includes('Rhapsody') ? 'Is this the real life?' : '歌词滚动示例';
                document.querySelector('.lyric-preview').innerText = lyric;
            }
            // 切换播放图标 (模拟正在播放)
            if (playBtn) {
                playBtn.classList.remove('fa-play-circle');
                playBtn.classList.add('fa-pause-circle');
            }
        });
    });

    // 播放控制: 暂停/播放切换
    if (playBtn) {
        playBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (this.classList.contains('fa-play-circle')) {
                this.classList.remove('fa-play-circle');
                this.classList.add('fa-pause-circle');
            } else {
                this.classList.remove('fa-pause-circle');
                this.classList.add('fa-play-circle');
            }
        });
    }

    // 上一首下一首简单模拟 (随机更新歌曲)
    const prevBtn = document.querySelector('.fa-step-backward');
    const nextBtn = document.querySelector('.fa-step-forward');
    const mockSongs = [
        { name: 'Kashmir', artist: 'Led Zeppelin', lyric: 'Oh let the sun beat down...' },
        { name: '不要停止我的音乐', artist: '痛仰', lyric: '不要停止我的音乐...' },
        { name: '秦皇岛', artist: '万能青年旅店', lyric: '站在能看到灯光的河边' }
    ];
    let mockIdx = 0;
    function changeSong(delta) {
        mockIdx = (mockIdx + delta + mockSongs.length) % mockSongs.length;
        const s = mockSongs[mockIdx];
        document.querySelector('.song-name').innerText = s.name;
        document.querySelector('.artist').innerText = s.artist;
        document.querySelector('.lyric-preview').innerText = s.lyric;
    }
    if (prevBtn) prevBtn.addEventListener('click', () => changeSong(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeSong(1));

    // 进度条拖拽模拟 (点击progress-bar调整进度)
    const progressBar = document.querySelector('.progress-bar');
    const progressCurrent = document.querySelector('.progress-current');
    if (progressBar) {
        progressBar.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            progressCurrent.style.width = percent * 100 + '%';
            // 时间简单联动
            const totalTime = 355; // 秒 5:55
            const current = Math.floor(totalTime * percent);
            const min = Math.floor(current / 60);
            const sec = current % 60;
            document.querySelectorAll('.time')[0].innerText = `${min}:${sec < 10 ? '0' + sec : sec}`;
        });
    }

    // 音量控制模拟
    const volumeBar = document.querySelector('.volume-bar');
    const volumeFill = document.querySelector('.volume-fill');
    if (volumeBar) {
        volumeBar.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            volumeFill.style.width = percent * 100 + '%';
        });
    }
    // 播放控制函数
    function togglePlay() {
        const playBtn = document.getElementById('playBtn');
        if (playBtn.classList.contains('fa-play-circle')) {
            playBtn.classList.remove('fa-play-circle');
            playBtn.classList.add('fa-pause-circle');
        } else {
            playBtn.classList.remove('fa-pause-circle');
            playBtn.classList.add('fa-play-circle');
        }
    }

    function changeSong(delta) {
        const mockSongs = [
            { name: 'Kashmir', artist: 'Led Zeppelin', lyric: 'Oh let the sun beat down...' },
            { name: '不要停止我的音乐', artist: '痛仰', lyric: '不要停止我的音乐...' },
            { name: '秦皇岛', artist: '万能青年旅店', lyric: '站在能看到灯光的河边' }
        ];
        let mockIdx = 0;

        // 简单实现，实际应该从全局变量获取
        const songNameEl = document.querySelector('.song-name');
        const artistEl = document.querySelector('.artist');
        const lyricEl = document.querySelector('.lyric-preview');

        if (songNameEl.innerText === 'Bohemian Rhapsody') mockIdx = 0;
        else if (songNameEl.innerText === 'Kashmir') mockIdx = 1;
        else if (songNameEl.innerText === '不要停止我的音乐') mockIdx = 2;

        mockIdx = (mockIdx + delta + mockSongs.length) % mockSongs.length;
        const s = mockSongs[mockIdx];

        songNameEl.innerText = s.name;
        artistEl.innerText = s.artist;
        lyricEl.innerText = s.lyric;
    }

    function updateProgress(e) {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const progressCurrent = document.querySelector('.progress-current');
        progressCurrent.style.width = percent * 100 + '%';

        const totalTime = 355;
        const current = Math.floor(totalTime * percent);
        const min = Math.floor(current / 60);
        const sec = current % 60;
        const timeEls = document.querySelectorAll('.time');
        timeEls[0].innerText = `${min}:${sec < 10 ? '0' + sec : sec}`;
    }

    function updateVolume(e) {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const volumeFill = document.querySelector('.volume-fill');
        volumeFill.style.width = percent * 100 + '%';
    }
});