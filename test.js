<script>
  import BScroll from '@better-scroll/core'
  import InfinityScroll from '@better-scroll/infinity'
  import message from './data/message.json'

  BScroll.use(InfinityScroll)

  const NUM_AVATARS = 4
  const NUM_IMAGES = 77
  const INIT_TIME = new Date().getTime()

  function getItem(id) {
    function pickRandom(a) {
      return a[Math.floor(Math.random() * a.length)]
    }

    return new Promise(function (resolve) {
      let item = {
        id: id,
        avatar: Math.floor(Math.random() * NUM_AVATARS),
        self: Math.random() < 0.1,
        image: Math.random() < 1.0 / 20 ? Math.floor(Math.random() * NUM_IMAGES) : '',
        time: new Date(Math.floor(INIT_TIME + id * 20 * 1000 + Math.random() * 20 * 1000)),
        message: pickRandom(message)
      }
      if (item.image === '') {
        resolve(item)
      } else {
        let image = new Image()
        image.src = require(`./image/image${item.image}.jpg`)
        image.addEventListener('load', function () {
          item.image = image
          resolve(item)
        })
        image.addEventListener('error', function () {
          item.image = ''
          resolve(item)
        })
      }
    })
  }

  export default {
    name: 'infinity',
    created() {
      this.nextItem = 0
      this.pageNum = 0
    },
    mounted() {
      this.createInfinityScroll()
    },
    methods: {
      createInfinityScroll() {
        this.scroll = new BScroll(this.$refs.chat, {
          infinity: {
            render: (item, div) => {
              div = div || this.$refs.message.cloneNode(true)
              div.dataset.id = item.id
              div.querySelector('.infinity-avatar').src = require(`./image/avatar${item.avatar}.jpg`)
              div.querySelector('.infinity-bubble p').textContent = item.id + '  ' + item.message
              div.querySelector('.infinity-bubble .infinity-posted-date').textContent = item.time.toString()

              let img = div.querySelector('.infinity-bubble img')
              if (item.image !== '') {
                img.style.display = ''
                img.src = item.image.src
                img.width = item.image.width
                img.height = item.image.height
              } else {
                img.src = ''
                img.style.display = 'none'
              }

              if (item.self) {
                div.classList.add('infinity-from-me')
              } else {
                div.classList.remove('infinity-from-me')
              }
              return div
            },
            createTombstone: () => {
              return this.$refs.tombstone.cloneNode(true)
            },
            fetch: (count) => {
              // Fetch at least 30 or count more objects for display.
              count = Math.max(30, count)
              return new Promise((resolve, reject) => {
                // Assume 50 ms per item.
                setTimeout(() => {
                  if (++this.pageNum > 20) {
                    resolve(false)
                  } else {
                    console.log('pageNum', this.pageNum)
                    let items = []
                    for (let i = 0; i < Math.abs(count); i++) {
                      items[i] = getItem(this.nextItem++)
                    }
                    resolve(Promise.all(items))
                  }
                }, 500)
              })
            }
          }
        })
        this.scroll.on('scroll', () => {
          console.log('is scrolling')
        })
        this.scroll.on('scrollEnd', () => {
          console.log('scrollEnd')
        })
      }
    }
  }
</script>